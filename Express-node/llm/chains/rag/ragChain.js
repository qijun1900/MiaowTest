/**
 * RAG（Retrieval-Augmented Generation）检索增强生成链
 *
 * 工作流程：
 *   1. 用户问题 → Chroma 向量相似度检索 → 获取 Top-K 相关文档片段
 *   2. 将检索结果拼接为 context 参考内容
 *   3. context + 用户问题 → LLM 生成基于知识库的回答
 *   4. 返回 answer（LLM 回答）+ sources（引用来源，含相似度分数）
 *
 * 使用 LCEL（LangChain Expression Language）管道语法：
 *   prompt.pipe(model).pipe(outputParser)
 */
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const ModelFactory = require("../../models/factory");
const { similaritySearch } = require("../../vectorstores/stores/chromaManager");

/** RAG 系统提示词，指导 LLM 基于参考内容回答，避免编造 */
const RAG_SYSTEM_PROMPT = `你是一个专业的知识问答助手。请根据以下参考内容回答用户的问题。
如果参考内容中没有相关信息，请如实说明你不确定，不要编造答案。

参考内容：
{context}`;

/**
 * 执行 RAG 检索增强问答
 *
 * @param {string} question - 用户问题
 * @param {object} [options]
 * @param {number} [options.topK=4] - 从向量库检索的文档片段数量
 * @param {string} [options.modelName="qwen-plus"] - LLM 模型名称
 * @param {string} [options.collectionName] - 指定 Chroma collection（对应知识库）
 * @returns {Promise<{answer: string, sources: Array<{content, metadata, score}>}>}
 */
async function runRAGChain(question, options = {}) {
  const topK = options.topK || 4;
  const modelName = options.modelName || "qwen-plus";
  const collectionName = options.collectionName;

  // 1. 向量检索：从 Chroma 中找到与问题最相似的 Top-K 文档片段
  const results = await similaritySearch(question, topK, collectionName);

  if (!results.length) {
    return {
      answer: "未在知识库中找到相关内容，请尝试上传相关文档后再提问。",
      sources: [],
    };
  }

  // 2. 拼接 context：将检索结果格式化为带编号的参考内容
  const context = results
    .map((r, i) => `[${i + 1}] ${r.content}`)
    .join("\n\n");

  // 3. LLM 生成：使用 LCEL 管道 prompt → model → outputParser
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", RAG_SYSTEM_PROMPT],
    ["human", "{question}"],
  ]);

  const model = ModelFactory.getModel(modelName);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const answer = await chain.invoke({ context, question });

  // 4. 返回结果 + 引用来源（含相似度分数，用于前端展示）
  const sources = results.map((r) => ({
    content: r.content,
    metadata: r.metadata,
    score: r.score,
  }));

  return { answer, sources };
}

module.exports = { runRAGChain };
