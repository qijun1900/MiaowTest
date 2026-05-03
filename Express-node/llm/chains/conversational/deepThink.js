const { ChatPromptTemplate } = require("@langchain/core/prompts");
const ModelFactory = require("../../models/factory");

/**
 * 深度思考对话链 — 使用支持推理能力的模型（如 DeepSeek-R1 / QwQ）
 *
 * 与普通对话链的区别：
 *  - 使用推理模型，模型会在回答前进行深度思考
 *  - 返回结果包含 reasoning（思考过程）和 answer（最终回答）两个字段
 *  - 降低 temperature 使推理更加稳定
 *  - 支持流式输出，通过回调函数实时获取内容
 *
 * @param {string} message - 用户输入的消息
 * @param {string} modelName - 推理模型名称，默认 deepseek-r1
 * @param {object} [options] - 额外选项
 * @param {'low'|'medium'|'high'} [options.reasoningEffort] - 推理力度（仅 o 系列模型支持）
 * @param {Function} [options.onReasoning] - 接收推理内容的回调函数 (chunk: string) => void
 * @param {Function} [options.onAnswer] - 接收回答内容的回调函数 (chunk: string) => void
 * @param {Function} [options.onComplete] - 完成时的回调函数 (result: {reasoning, answer}) => void
 * @returns {Promise<{reasoning: string, answer: string}>}
 */
async function useDeepThink(message, modelName = "deepseek-r1", options = {}) {
  // 1. 获取模型实例（推理模型使用较低温度，保证思考稳定性）
  const model = ModelFactory.getModel(modelName, 0.6, true);

  // 若传入了 reasoningEffort 且模型支持（OpenAI o 系列），注入配置
  if (options.reasoningEffort) {
    model.reasoningEffort = options.reasoningEffort;
  }

  // 2. 构建提示模板 — 引导模型进行深度分析
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "你是一个擅长深度思考的 AI 助手。请仔细分析问题，从多个角度进行推理，" +
      "给出详尽且有深度的回答。如果问题涉及复杂推理，请逐步展开思考过程。",
    ],
    ["human", "{input}"],
  ]);

  // 3. 组装消息并流式调用模型
  const messages = await prompt.invoke({ input: message });
  const stream = await model.stream(messages);

  // 4. 流式接收内容，分别收集 reasoning 和 answer
  let reasoning = "";
  let answer = "";

  for await (const chunk of stream) {
    // DeepSeek-R1 / QwQ 等模型的 reasoning_content 在 additional_kwargs 中
    const reasoningChunk = chunk?.additional_kwargs?.reasoning_content || "";
    const answerChunk = chunk?.content || "";

    if (reasoningChunk) {
      reasoning += reasoningChunk;
      if (options.onReasoning) {
        options.onReasoning(reasoningChunk);
      }
    }

    if (answerChunk) {
      answer += answerChunk;
      if (options.onAnswer) {
        options.onAnswer(answerChunk);
      }
    }
  }

  const result = {
    reasoning,
    answer,
    modelName,
  };

  if (options.onComplete) {
    options.onComplete(result);
  }

  return result;
}

module.exports = {
  useDeepThink,
};
