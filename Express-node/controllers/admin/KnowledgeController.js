/**
 * 知识库控制器层
 * 处理 HTTP 请求，提取参数，调用 KnowledgeService，返回标准响应格式
 * 响应格式：{ ActionType: "OK"/"ERROR", code: 200/500, data?: ... }
 */
const mongoose = require("mongoose");
const KnowledgeService = require("../../services/admin/KnowledgeService");

const KnowledgeController = {
  // ==================== 知识库 ====================

  /** 创建知识库 */
  createKnowledgeBase: async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).send({ ActionType: "ERROR", code: 400, message: "请输入知识库名称" });
      }
      const result = await KnowledgeService.createKnowledgeBase({
        name,
        description,
        creator: req.body.creator || "",
      });
      res.status(200).send({ ActionType: "OK", code: 200, data: result });
    } catch (error) {
      console.error("[KnowledgeController] createKnowledgeBase error:", error);
      res.status(500).send({ ActionType: "ERROR", code: 500, message: error.message });
    }
  },

  /** 更新知识库名称和描述 */
  updateKnowledgeBase: async (req, res) => {
    try {
      const { _id, name, description } = req.body;
      if (!_id) {
        return res.status(400).send({ ActionType: "ERROR", code: 400, message: "缺少参数 _id" });
      }
      if (!name && description === undefined) {
        return res.status(400).send({ ActionType: "ERROR", code: 400, message: "请提供要更新的内容" });
      }
      await KnowledgeService.updateKnowledgeBase(_id, { name, description });
      res.status(200).send({ ActionType: "OK", code: 200 });
    } catch (error) {
      console.error("[KnowledgeController] updateKnowledgeBase error:", error);
      res.status(500).send({ ActionType: "ERROR", code: 500, message: error.message });
    }
  },

  /** 获取知识库列表（含文档数量） */
  getKnowledgeBaseList: async (req, res) => {
    try {
      const result = await KnowledgeService.listKnowledgeBases();
      res.status(200).send({ ActionType: "OK", code: 200, data: result });
    } catch (error) {
      console.error("[KnowledgeController] getKnowledgeBaseList error:", error);
      res.status(500).send({ ActionType: "ERROR", code: 500, message: error.message });
    }
  },

  /** 删除知识库（同步清理 Chroma collection 和关联文档） */
  deleteKnowledgeBase: async (req, res) => {
    try {
      const { _id } = req.body;
      if (!_id) {
        return res.status(400).send({ ActionType: "ERROR", code: 400, message: "缺少参数 _id" });
      }
      await KnowledgeService.deleteKnowledgeBase(_id);
      res.status(200).send({ ActionType: "OK", code: 200 });
    } catch (error) {
      console.error("[KnowledgeController] deleteKnowledgeBase error:", error);
      res.status(500).send({ ActionType: "ERROR", code: 500, message: error.message });
    }
  },

  // ==================== 文档 ====================

  /**
   * 上传文档
   * 文件通过 multer 中间件上传到 OSS，knowledgeBaseIds 以 JSON 字符串传递（FormData 限制）
   */
  addDocument: async (req, res) => {
    try {
      const { title, knowledgeBaseIds } = req.body;
      const file = req.file;
      if (!file) {
        return res.status(400).send({ ActionType: "ERROR", code: 400, message: "请上传文件" });
      }
      // file.ossUrl 由 uploadToOSS 中间件注入，如果 OSS 未配置则用本地路径
      const fileUrl = file.ossUrl || `/knowledge/${file.filename}`;
      const originalName = Buffer.from(file.originalname, "latin1").toString("utf8");
      const fileType = originalName.split(".").pop().toLowerCase();
      const creator = req.body.creator || "";

      const result = await KnowledgeService.addDocument({
        title: title || originalName,
        originalName,
        fileUrl,
        fileType,
        fileSize: file.size,
        creator,
        // FormData 中数组需 JSON.stringify 传输，这里反解析
        knowledgeBaseIds: (() => {
          try { return knowledgeBaseIds ? JSON.parse(knowledgeBaseIds) : []; }
          catch (_) { throw new Error("knowledgeBaseIds 格式无效"); }
        })(),
      });

      res.status(200).send({ ActionType: "OK", code: 200, data: result });
    } catch (error) {
      console.error("[KnowledgeController] addDocument error:", error);
      res.status(500).send({ ActionType: "ERROR", code: 500, message: error.message });
    }
  },

  /** 将已有文档添加到新知识库（重新解析入库） */
  addDocToKnowledgeBase: async (req, res) => {
    try {
      const { docId, kbId } = req.body;
      if (!docId || !kbId) {
        return res.status(400).send({ ActionType: "ERROR", code: 400, message: "缺少参数 docId 或 kbId" });
      }
      const result = await KnowledgeService.addDocToKnowledgeBase(docId, kbId);
      res.status(200).send({ ActionType: "OK", code: 200, data: result });
    } catch (error) {
      console.error("[KnowledgeController] addDocToKnowledgeBase error:", error);
      res.status(500).send({ ActionType: "ERROR", code: 500, message: error.message });
    }
  },

  /** 从指定知识库移除文档（不删除文档本身） */
  removeDocFromKnowledgeBase: async (req, res) => {
    try {
      const { docId, kbId } = req.body;
      if (!docId || !kbId) {
        return res.status(400).send({ ActionType: "ERROR", code: 400, message: "缺少参数 docId 或 kbId" });
      }
      const result = await KnowledgeService.removeDocFromKnowledgeBase(docId, kbId);
      res.status(200).send({ ActionType: "OK", code: 200, data: result });
    } catch (error) {
      console.error("[KnowledgeController] removeDocFromKnowledgeBase error:", error);
      res.status(500).send({ ActionType: "ERROR", code: 500, message: error.message });
    }
  },

  /**
   * 触发文档处理（下载→解析→切分→向量化入库）
   * 异步执行：立即返回 200，后台处理完成后通过文档 status 字段反映结果
   * 原因：LlamaParse 解析可能耗时数分钟，同步等待会导致 HTTP 超时
   */
  processDocument: async (req, res) => {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).send({ ActionType: "ERROR", code: 400, message: "缺少参数 _id" });
    }
    // fire-and-forget：不 await，立即返回
    KnowledgeService.processDocument(_id).catch((err) => {
      console.error("[KnowledgeController] processDocument background error:", err);
    });
    res.status(200).send({ ActionType: "OK", code: 200, message: "文档处理已开始，请稍后刷新查看状态" });
  },

  /** 分页查询文档列表 */
  getDocumentList: async (req, res) => {
    try {
      const { page = 1, size = 20, keyword, knowledgeBaseId } = req.query;
      const result = await KnowledgeService.listDocuments({
        page: Number(page),
        size: Number(size),
        keyword,
        knowledgeBaseId,
      });
      res.status(200).send({ ActionType: "OK", code: 200, data: result });
    } catch (error) {
      console.error("[KnowledgeController] getDocumentList error:", error);
      res.status(500).send({ ActionType: "ERROR", code: 500, message: error.message });
    }
  },

  /** 完全删除文档（清理向量 + OSS 文件 + MongoDB 记录） */
  deleteDocument: async (req, res) => {
    try {
      const { _id } = req.body;
      if (!_id) {
        return res.status(400).send({ ActionType: "ERROR", code: 400, message: "缺少参数 _id" });
      }
      await KnowledgeService.deleteDocument(_id);
      res.status(200).send({ ActionType: "OK", code: 200 });
    } catch (error) {
      console.error("[KnowledgeController] deleteDocument error:", error);
      res.status(500).send({ ActionType: "ERROR", code: 500, message: error.message });
    }
  },

  // ==================== 调试工具 ====================

  /** 查看指定知识库中的所有 chunks（用于检查拆分效果） */
  getChunks: async (req, res) => {
    try {
      const { knowledgeBaseId, limit = 50 } = req.query;
      if (!knowledgeBaseId) {
        return res.status(400).send({ ActionType: "ERROR", code: 400, message: "缺少参数 knowledgeBaseId" });
      }
      const result = await KnowledgeService.getChunksByKB(knowledgeBaseId, Number(limit));
      res.status(200).send({ ActionType: "OK", code: 200, data: result });
    } catch (error) {
      console.error("[KnowledgeController] getChunks error:", error);
      res.status(500).send({ ActionType: "ERROR", code: 500, message: error.message });
    }
  },

  /** 测试检索效果：输入查询文本，返回 Top-K 结果及相似度分数 */
  testRetrieval: async (req, res) => {
    try {
      const { question, knowledgeBaseId, topK = 4 } = req.body;
      if (!question) {
        return res.status(400).send({ ActionType: "ERROR", code: 400, message: "请输入查询文本" });
      }
      const result = await KnowledgeService.testRetrieval(question, { knowledgeBaseId, topK });
      res.status(200).send({ ActionType: "OK", code: 200, data: result });
    } catch (error) {
      console.error("[KnowledgeController] testRetrieval error:", error);
      res.status(500).send({ ActionType: "ERROR", code: 500, message: error.message });
    }
  },

  /** 获取向量库统计信息 */
  getVectorStats: async (req, res) => {
    try {
      const result = await KnowledgeService.getVectorStats();
      res.status(200).send({ ActionType: "OK", code: 200, data: result });
    } catch (error) {
      console.error("[KnowledgeController] getVectorStats error:", error);
      res.status(500).send({ ActionType: "ERROR", code: 500, message: error.message });
    }
  },

  /** RAG 检索增强问答 */
  ragQuery: async (req, res) => {
    try {
      const { question, topK, modelName, knowledgeBaseId } = req.body;
      if (!question) {
        return res.status(400).send({ ActionType: "ERROR", code: 400, message: "请输入问题" });
      }
      // 校验 knowledgeBaseId 格式，防止 MongoDB CastError
      const validKBId = knowledgeBaseId && mongoose.Types.ObjectId.isValid(knowledgeBaseId) ? knowledgeBaseId : undefined;
      const result = await KnowledgeService.queryRAG(question, { topK, modelName, knowledgeBaseId: validKBId });
      res.status(200).send({ ActionType: "OK", code: 200, data: result });
    } catch (error) {
      console.error("[KnowledgeController] ragQuery error:", error);
      res.status(500).send({ ActionType: "ERROR", code: 500, message: error.message });
    }
  },
};

module.exports = KnowledgeController;
