const { ChatOpenAI } = require("@langchain/openai");

/**
 * 模型工厂类，用于统一获取LLM实例
 */
class ModelFactory {
  /**
   * 获取OpenAI或兼容的Chat模型
   * @param {string} modelName - 模型名称，默认 qwen-plus
   * @param {number} temperature - 温度值
   * @param {boolean} [streaming] - 是否启用流式输出，启用后可通过 .stream() 逐 token 获取
   * @returns {ChatOpenAI} LLM实例
   */
  static getModel(modelName = "qwen-plus", temperature = 0.7, streaming = false) {
    return new ChatOpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY,
      configuration: {
        baseURL:
          process.env.DASHSCOPE_BASE_URL ||
          "https://dashscope.aliyuncs.com/compatible-mode/v1",
      },
      modelName: modelName,
      temperature: temperature,
      streaming: streaming,
    });
  }
}

module.exports = ModelFactory;
