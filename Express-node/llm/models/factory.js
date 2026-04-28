const { ChatOpenAI } = require("@langchain/openai");

/**
 * 模型工厂类，用于统一获取LLM实例
 */
class ModelFactory {
  /**
   * 获取OpenAI或兼容的Chat模型
   * @param {string} modelName - 模型名称，默认 gpt-3.5-turbo
   * @param {number} temperature - 温度值
   * @returns {ChatOpenAI} LLM实例
   */
  static getModel(modelName = 'gpt-3.5-turbo', temperature = 0.7) {
    return new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      configuration: {
        baseURL: process.env.OPENAI_BASE_URL
      },
      modelName: modelName,
      temperature: temperature,
    });
  }
}

module.exports = ModelFactory;