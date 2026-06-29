/**
 * Chroma 向量数据库管理器
 *
 * 架构：通过 HTTP 连接 Docker 容器中运行的 Chroma 服务（默认 localhost:8000）
 * 数据持久化：Docker volume 挂载到 Express-node/data/chroma_data/
 *
 * 核心概念：
 * - 每个知识库对应一个 Chroma collection（通过 collectionName 隔离）
 * - 使用自定义 dashscopeEmbedding 函数（包装 DashScope text-embedding-v3）
 * - collectionCache 缓存已打开的 collection 实例，避免重复创建
 *
 * 导出接口：
 * - getCollection(name)        获取/创建 collection
 * - deleteCollection(name)     删除整个 collection
 * - addDocuments(docs, name)   添加文档（自动向量化）
 * - deleteByMetadata(filter, name)  按 metadata 过滤删除
 * - similaritySearch(query, k, name)  相似度检索
 */
const { ChromaClient } = require("chromadb");
const { getEmbeddingModel } = require("../embeddings/embedding");

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const DEFAULT_COLLECTION = "knowledge_base";

let client = null;
// collection 实例缓存，key 为 collectionName
const collectionCache = new Map();

/**
 * 自定义 Embedding Function
 * Chroma 要求 embedding function 按其接口格式提供 generate() 方法
 * 这里包装了 DashScope 的 text-embedding-v3 模型
 */
const dashscopeEmbedding = {
  generate: async function (texts) {
    const model = getEmbeddingModel();
    return model.embedDocuments(texts);
  },
};

/**
 * 获取 Chroma 客户端（单例，连接 Docker 服务）
 */
function getClient() {
  if (!client) {
    client = new ChromaClient({ path: CHROMA_URL });
  }
  return client;
}

/**
 * 获取或创建指定 collection
 * @param {string} [name] - collection 名称，默认 knowledge_base
 * @returns {Promise<Collection>} Chroma collection 实例
 */
async function getCollection(name) {
  const collectionName = name || DEFAULT_COLLECTION;
  if (!collectionCache.has(collectionName)) {
    const c = getClient();
    const col = await c.getOrCreateCollection({
      name: collectionName,
      embeddingFunction: dashscopeEmbedding,
    });
    collectionCache.set(collectionName, col);
  }
  return collectionCache.get(collectionName);
}

/**
 * 删除整个 collection（用于删除知识库时清理向量数据）
 * @param {string} name
 */
async function deleteCollection(name) {
  const c = getClient();
  try {
    await c.deleteCollection({ name });
  } catch (err) {
    // collection 不存在时忽略，避免空知识库删除报错
    if (err.name !== "ChromaNotFoundError") throw err;
  }
  collectionCache.delete(name);
}

/**
 * 添加文档到向量库
 * Chroma 会自动调用 dashscopeEmbedding.generate() 将文本转为向量
 *
 * @param {Array<{pageContent: string, metadata: object}>} docs - LangChain Document 格式
 * @param {string} [collectionName] - 目标 collection
 * @returns {Promise<string[]>} 生成的文档 ID 列表
 */
async function addDocuments(docs, collectionName) {
  const col = await getCollection(collectionName);
  const texts = docs.map((d) => d.pageContent);
  // Chroma metadata 只支持 string/number/bool
  // Date 和 ObjectId 等特殊对象 JSON.stringify 会丢失信息，需特殊处理
  const metadatas = docs.map((d) => {
    const m = d.metadata || {};
    const safe = {};
    for (const [k, v] of Object.entries(m)) {
      if (v == null) continue;
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        safe[k] = v;
      } else if (v instanceof Date) {
        safe[k] = v.toISOString();
      } else {
        // ObjectId、Buffer 等：用 toString() 而非 JSON.stringify（后者对 ObjectId 返回 "{}"）
        safe[k] = typeof v.toString === "function" ? v.toString() : String(v);
      }
    }
    return safe;
  });
  const ids = docs.map((_, i) => `doc_${Date.now()}_${i}`);

  await col.add({ ids, documents: texts, metadatas });
  return ids;
}

/**
 * 按 metadata 过滤删除（用于删除某文档的所有向量分块）
 * @param {object} filter - Chroma where 过滤条件，如 { docId: "xxx" }
 * @param {string} [collectionName]
 */
async function deleteByMetadata(filter, collectionName) {
  const col = await getCollection(collectionName);
  await col.delete({ where: filter });
}

/**
 * 相似度检索
 * Chroma 内部调用 dashscopeEmbedding 将 query 转为向量，然后计算余弦距离
 *
 * @param {string} query - 用户查询文本
 * @param {number} k - 返回最相似的 Top-K 条结果
 * @param {string} [collectionName] - 检索的 collection
 * @returns {Promise<Array<{content: string, metadata: object, score: number}>>}
 *   score 为 Chroma 返回的距离值（越小越相似）
 */
async function similaritySearch(query, k = 4, collectionName) {
  const col = await getCollection(collectionName);

  const results = await col.query({
    queryTexts: [query],
    nResults: k,
  });

  // Chroma 返回嵌套数组 [[result1, result2, ...]]，取 [0]
  const items = [];
  if (results.documents && results.documents[0]) {
    for (let i = 0; i < results.documents[0].length; i++) {
      items.push({
        content: results.documents[0][i],
        metadata: results.metadatas[0][i] || {},
        score: results.distances[0][i] || 0,
      });
    }
  }
  return items;
}

/**
 * 检查 ChromaDB 服务是否可达
 * @returns {Promise<{ok: boolean, message: string}>}
 */
async function healthCheck() {
  try {
    const res = await fetch(`${CHROMA_URL}/api/v2/heartbeat`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
    await res.json();
    return { ok: true, message: "连接正常" };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

module.exports = {
  getCollection,
  deleteCollection,
  addDocuments,
  deleteByMetadata,
  similaritySearch,
  healthCheck,
};
