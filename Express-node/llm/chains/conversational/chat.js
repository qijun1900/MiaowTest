const ModelFactory = require('../../models/factory');
const { basicChatPrompt } = require('../../prompts/templates');
const { StringOutputParser } = require("@langchain/core/output_parsers");

/**
 * 基础对话方法 (LCEL)
 * @param {string} message - 用户输入的消息
 * @param {string} modelName - 模型名称
 * @returns {Promise<string>} AI回复内容
 */
async function useChat(message, modelName = 'qwen-plus') {
  // 1. 获取模型实例
  const model = ModelFactory.getModel(modelName);

  // 2. 组装链 (Prompt | Model | OutputParser)
  const chain = basicChatPrompt.pipe(model).pipe(new StringOutputParser());

  // 3. 执行链
  const response = await chain.invoke({
    input: message
  });

  return response;
}

module.exports = {
  useChat
};