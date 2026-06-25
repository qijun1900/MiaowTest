/**
 * Embedding 模型封装
 * 使用阿里云 DashScope 的 text-embedding-v4 模型将文本转为向量
 * 通过 OpenAI 兼容接口调用，复用项目已有的 DASHSCOPE_API_KEY
 *
 * 注意：DashScope embedding API 单次最多处理 10 条文本（batchSize: 10），
 * OpenAIEmbeddings 会自动分批发送
 */
const { OpenAIEmbeddings } = require("@langchain/openai");

/**
 * 获取 Embedding 模型实例
 * @param {string} [modelName] - 模型名称，默认 text-embedding-v4（1024 维向量）
 * @returns {OpenAIEmbeddings} LangChain 兼容的 Embedding 实例
 */
function getEmbeddingModel(modelName) {
  return new OpenAIEmbeddings({
    modelName: modelName || "text-embedding-v4",
    apiKey: process.env.DASHSCOPE_API_KEY,
    batchSize: 10, // DashScope embedding API 单次最多 10 条
    configuration: {
      baseURL:
        process.env.DASHSCOPE_BASE_URL ||
        "https://dashscope.aliyuncs.com/compatible-mode/v1",
    },
  });
}

module.exports = { getEmbeddingModel };
