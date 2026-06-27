/**
 * 知识库业务服务层
 *
 * 职责：
 * 1. 知识库 CRUD（创建/列表/删除）
 * 2. 文档 CRUD（上传/列表/处理/删除）
 * 3. 文档-知识库关联管理（添加到/移除出知识库）
 * 4. RAG 问答
 *
 * 数据流：
 *   上传文档 → OSS 存储 → MongoDB 记录元数据
 *   处理文档 → 下载 OSS 文件 → LlamaParse 解析 → TextSplitter 切分 → DashScope embedding → Chroma 存储
 *   RAG 问答 → 用户问题 → Chroma 相似度检索 → 拼接 context → LLM 生成回答
 *
 * 多知识库支持：
 *   一个文档可关联多个知识库（many-to-many），处理时向量化入库到所有关联的 Chroma collection
 */
const path = require("path");
const os = require("os");
const fs = require("fs");
const axios = require("axios");
const { Document } = require("@langchain/core/documents");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const KnowledgeBaseModel = require("../../models/KnowledgeBaseModel");
const KnowledgeDocModel = require("../../models/KnowledgeDocModel");
const mongoose = require("mongoose");
const { parseDocument } = require("../../llm/parser/llamaParseWrapper");
const { addDocuments, deleteByMetadata, deleteCollection, getCollection } = require("../../llm/vectorstores/stores/chromaManager");
const { deleteFileByUrl } = require("../../helpers/ossHelper");
const { runRAGChain } = require("../../llm/chains/rag/ragChain");

const KnowledgeService = {
  // ==================== 知识库 CRUD ====================

  /**
   * 创建知识库
   * 自动生成唯一的 collectionName 用于 Chroma 隔离
   */
  async createKnowledgeBase({ name, description, creator }) {
    const collectionName = `kb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return KnowledgeBaseModel.create({ name, description, collectionName, creator });
  },

  /**
   * 获取知识库列表（含每个知识库的文档数量）
   * 使用 MongoDB aggregate 从 KnowledgeDocModel 动态统计，避免数据不一致
   */
  /**
   * 更新知识库名称和描述
   */
  async updateKnowledgeBase(kbId, { name, description }) {
    const kb = await KnowledgeBaseModel.findById(kbId);
    if (!kb) throw new Error("知识库不存在");
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    return KnowledgeBaseModel.updateOne({ _id: kbId }, update);
  },

  async listKnowledgeBases() {
    const bases = await KnowledgeBaseModel.find({}).sort({ createTime: -1 }).lean();
    // $unwind 展开 knowledgeBaseIds 数组，按 _id 分组计数
    const counts = await KnowledgeDocModel.aggregate([
      { $unwind: "$knowledgeBaseIds" },
      { $group: { _id: "$knowledgeBaseIds", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));
    return bases.map((b) => ({
      ...b,
      docCount: countMap.get(b._id.toString()) || 0,
    }));
  },

  /**
   * 删除知识库
   * 1. 删除 Chroma collection（向量数据）
   * 2. 从所有文档中移除此知识库关联（$pull）
   * 3. 清理不再关联任何知识库的文档记录
   * 4. 删除知识库本身
   */
  async deleteKnowledgeBase(kbId) {
    const kb = await KnowledgeBaseModel.findById(kbId);
    if (!kb) throw new Error("知识库不存在");

    await deleteCollection(kb.collectionName);

    await KnowledgeDocModel.updateMany(
      { knowledgeBaseIds: kbId },
      { $pull: { knowledgeBaseIds: kbId } },
    );

    // 删除已无任何知识库关联的"孤儿"文档
    await KnowledgeDocModel.deleteMany({ knowledgeBaseIds: { $size: 0 } });

    return KnowledgeBaseModel.deleteOne({ _id: kbId });
  },

  // ==================== 文档 CRUD ====================

  /**
   * 添加文档记录（仅入库元数据，不处理文件）
   * 文件已通过 multer + uploadToOSS 中间件上传到阿里云 OSS
   */
  async addDocument({ title, originalName, fileUrl, fileType, fileSize, creator, knowledgeBaseIds }) {
    return KnowledgeDocModel.create({
      title,
      knowledgeBaseIds: knowledgeBaseIds || [],
      originalName,
      fileUrl,
      fileType,
      fileSize,
      creator,
      status: 0,
      createTime: new Date(),
    });
  },

  /**
   * 分页查询文档列表
   * 支持按标题模糊搜索和按知识库 ID 筛选
   */
  async listDocuments({ page, size, keyword, knowledgeBaseId }) {
    const skip = (page - 1) * size;
    const filter = {};
    if (keyword) {
      filter.title = { $regex: keyword, $options: "i" };
    }
    // MongoDB 会自动匹配数组中包含该 ID 的文档
    if (knowledgeBaseId && mongoose.Types.ObjectId.isValid(knowledgeBaseId)) {
      filter.knowledgeBaseIds = knowledgeBaseId;
    }
    const [data, total] = await Promise.all([
      KnowledgeDocModel.find(filter).sort({ createTime: -1 }).skip(skip).limit(size),
      KnowledgeDocModel.countDocuments(filter),
    ]);
    return { data, total };
  },

  /**
   * 处理文档的核心流程：
   * 1. 从 OSS 下载文件到临时目录
   * 2. LlamaParse 解析为结构化 Markdown（支持表格/图片/图表）
   * 3. RecursiveCharacterTextSplitter 切分为 500 字符的片段（50 字符重叠）
   * 4. DashScope text-embedding-v3 向量化
   * 5. 入库到所有关联知识库的 Chroma collection
   * 6. 更新 MongoDB 状态
   * 7. 清理临时文件
   */
  async processDocument(docId) {
    const doc = await KnowledgeDocModel.findById(docId);
    if (!doc) throw new Error("文档不存在");

    const kbIds = doc.knowledgeBaseIds || [];
    if (kbIds.length === 0) throw new Error("文档未关联任何知识库");

    // 获取所有关联知识库的 Chroma collection 名称
    const kbs = await KnowledgeBaseModel.find({ _id: { $in: kbIds } });
    const collectionNames = kbs.map((kb) => kb.collectionName);

    // 标记为处理中
    await KnowledgeDocModel.updateOne({ _id: docId }, { status: 1, errorMessage: "" });

    let tempFilePath = null;
    try {
      // 从 OSS 下载到临时目录
      tempFilePath = path.join(os.tmpdir(), `knowledge_${docId}_${Date.now()}.${doc.fileType}`);
      const response = await axios({
        method: "get",
        url: doc.fileUrl,
        responseType: "arraybuffer",
        timeout: 60000,
      });
      fs.writeFileSync(tempFilePath, response.data);

      // LlamaParse 云端解析 → 结构化 Markdown
      const markdown = await parseDocument(tempFilePath);
      if (!markdown || !markdown.trim()) {
        throw new Error("文档解析结果为空");
      }

      // 包装为 LangChain Document 格式
      const langchainDoc = new Document({
        pageContent: markdown,
        metadata: {
          docId: doc._id.toString(),
          title: doc.title,
          originalName: doc.originalName,
        },
      });

      // 文本切分：500 字符/块，50 字符重叠，保证上下文连贯
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
      });
      const chunks = await splitter.splitDocuments([langchainDoc]);

      // [调试] 打印拆分结果
      console.log(`\n========== 文档拆分结果: ${doc.title} ==========`);
      console.log(`总 chunk 数: ${chunks.length}`);
      chunks.forEach((c, i) => {
        console.log(`\n--- Chunk ${i + 1} (长度: ${c.pageContent.length}) ---`);
        console.log(c.pageContent.substring(0, 200) + (c.pageContent.length > 200 ? "..." : ""));
      });
      console.log("========== 拆分结果结束 ==========\n");

      // 为每个 chunk 附加 docId，用于后续按文档删除
      chunks.forEach((chunk) => {
        chunk.metadata.docId = doc._id.toString();
      });

      // 向量化入库到所有关联的知识库
      for (const collectionName of collectionNames) {
        await addDocuments(chunks, collectionName);
      }

      // 更新为完成状态
      await KnowledgeDocModel.updateOne(
        { _id: docId },
        { status: 2, chunkCount: chunks.length, editTime: new Date() },
      );

      return { chunkCount: chunks.length, knowledgeBases: collectionNames.length };
    } catch (error) {
      // 更新为失败状态，记录错误信息
      await KnowledgeDocModel.updateOne(
        { _id: docId },
        { status: 3, errorMessage: error.message },
      );
      throw error;
    } finally {
      // 无论成功失败，都清理临时文件
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  },

  /**
   * 将已处理的文档添加到新的知识库
   * 需要重新下载并解析文件（因为原始解析结果未缓存），然后向量化入库到新 collection
   */
  async addDocToKnowledgeBase(docId, kbId) {
    const doc = await KnowledgeDocModel.findById(docId);
    if (!doc) throw new Error("文档不存在");
    if (doc.status !== 2) throw new Error("文档尚未处理完成，无法添加到知识库");

    const kb = await KnowledgeBaseModel.findById(kbId);
    if (!kb) throw new Error("知识库不存在");

    // 防止重复关联
    const alreadyLinked = doc.knowledgeBaseIds.some((id) => id.toString() === kbId);
    if (alreadyLinked) throw new Error("文档已在此知识库中");

    let tempFilePath = null;
    try {
      // 重新下载并解析
      tempFilePath = path.join(os.tmpdir(), `knowledge_add_${docId}_${Date.now()}.${doc.fileType}`);
      const response = await axios({
        method: "get",
        url: doc.fileUrl,
        responseType: "arraybuffer",
        timeout: 60000,
      });
      fs.writeFileSync(tempFilePath, response.data);

      const markdown = await parseDocument(tempFilePath);
      const langchainDoc = new Document({
        pageContent: markdown,
        metadata: { docId: doc._id.toString(), title: doc.title, originalName: doc.originalName },
      });

      const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
      const chunks = await splitter.splitDocuments([langchainDoc]);
      chunks.forEach((chunk) => { chunk.metadata.docId = doc._id.toString(); });

      // 入库到新知识库的 Chroma collection
      await addDocuments(chunks, kb.collectionName);

      // $addToSet 防止重复添加
      await KnowledgeDocModel.updateOne(
        { _id: docId },
        { $addToSet: { knowledgeBaseIds: kbId } },
      );

      return { chunkCount: chunks.length };
    } catch (error) {
      // 最佳努力回滚：尝试清理刚插入的向量
      try {
        await deleteByMetadata({ docId: doc._id.toString() }, kb.collectionName);
      } catch (_) {}
      throw error;
    } finally {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  },

  /**
   * 从指定知识库移除文档（不删除文档本身）
   * 只清理该知识库 collection 中的向量，并移除关联关系
   */
  async removeDocFromKnowledgeBase(docId, kbId) {
    const doc = await KnowledgeDocModel.findById(docId);
    if (!doc) throw new Error("文档不存在");

    const kb = await KnowledgeBaseModel.findById(kbId);
    if (!kb) throw new Error("知识库不存在");

    // 仅删除该 collection 中此文档的向量
    await deleteByMetadata({ docId }, kb.collectionName);

    // 从关联数组中移除
    await KnowledgeDocModel.updateOne(
      { _id: docId },
      { $pull: { knowledgeBaseIds: kbId } },
    );

    return KnowledgeDocModel.findById(docId);
  },

  /**
   * 完全删除文档
   * 1. 从所有关联知识库的 Chroma collection 中删除向量
   * 2. 删除阿里云 OSS 上的源文件
   * 3. 删除 MongoDB 记录
   */
  async deleteDocument(docId) {
    const doc = await KnowledgeDocModel.findById(docId);
    if (!doc) throw new Error("文档不存在");

    // 从所有关联知识库中删除向量
    const kbs = await KnowledgeBaseModel.find({ _id: { $in: doc.knowledgeBaseIds || [] } });
    for (const kb of kbs) {
      await deleteByMetadata({ docId }, kb.collectionName);
    }

    // 删除阿里云 OSS 上的源文件（失败不阻塞主流程）
    if (doc.fileUrl) {
      try {
        await deleteFileByUrl(doc.fileUrl);
      } catch (err) {
        console.warn("[KnowledgeService] OSS 文件删除失败（继续删除记录）:", err.message);
      }
    }

    return KnowledgeDocModel.deleteOne({ _id: docId });
  },

  // ==================== 调试工具 ====================

  /**
   * 查看指定知识库中的所有 chunks
   * 通过 Chroma API 获取 collection 中的文档、元数据和 ID
   */
  async getChunksByKB(kbId, limit = 50) {
    const kb = await KnowledgeBaseModel.findById(kbId);
    if (!kb) throw new Error("知识库不存在");

    const col = await getCollection(kb.collectionName);
    const count = await col.count();

    // Chroma 的 get 方法返回所有文档（不经过 embedding）
    const results = await col.get({
      limit,
      include: ["documents", "metadatas"],
    });

    const chunks = (results.documents || []).map((content, i) => ({
      id: results.ids[i],
      content,
      metadata: results.metadatas[i] || {},
      length: content.length,
    }));

    return {
      knowledgeBase: { name: kb.name, collectionName: kb.collectionName },
      totalChunks: count,
      returnedChunks: chunks.length,
      chunks,
    };
  },

  /**
   * 测试检索效果：输入查询，返回 Top-K 结果及相似度
   * 可用于验证检索质量，调整 chunkSize / topK 等参数
   */
  async testRetrieval(question, options = {}) {
    let collectionName;
    if (options.knowledgeBaseId) {
      const kb = await KnowledgeBaseModel.findById(options.knowledgeBaseId);
      if (!kb) throw new Error("指定的知识库不存在");
      collectionName = kb.collectionName;
    }

    const { similaritySearch, getCollection: getCol } = require("../../llm/vectorstores/stores/chromaManager");
    const results = await similaritySearch(question, options.topK || 4, collectionName);

    // 计算相似度百分比（Chroma 返回余弦距离，越小越相似）
    // 相似度 = 1 - distance（distance 范围通常是 0~2）
    const formatted = results.map((r, i) => ({
      rank: i + 1,
      similarity: Math.max(0, (1 - r.score) * 100).toFixed(1) + "%",
      distance: r.score.toFixed(4),
      content: r.content,
      contentLength: r.content.length,
      metadata: r.metadata,
    }));

    return {
      query: question,
      topK: options.topK || 4,
      collectionName: collectionName || "default",
      results: formatted,
    };
  },

  /**
   * 获取所有向量库统计信息
   */
  async getVectorStats() {
    const kbs = await KnowledgeBaseModel.find({}).lean();
    const stats = [];

    for (const kb of kbs) {
      try {
        const col = await getCollection(kb.collectionName);
        const count = await col.count();
        stats.push({
          name: kb.name,
          collectionName: kb.collectionName,
          vectorCount: count,
          status: "ok",
        });
      } catch (err) {
        stats.push({
          name: kb.name,
          collectionName: kb.collectionName,
          vectorCount: 0,
          status: "error",
          error: err.message,
        });
      }
    }

    return stats;
  },

  // ==================== RAG 问答 ====================

  /**
   * RAG 检索增强问答
   * 如果指定了 knowledgeBaseId，只从该知识库检索；否则使用默认 collection
   */
  async queryRAG(question, options = {}) {
    if (options.knowledgeBaseId) {
      const kb = await KnowledgeBaseModel.findById(options.knowledgeBaseId);
      if (!kb) throw new Error("指定的知识库不存在");
      options.collectionName = kb.collectionName;
    }
    return runRAGChain(question, options);
  },
};

module.exports = KnowledgeService;
