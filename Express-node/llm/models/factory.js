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
   * @param {Object} [options]
   * @param {boolean} [options.enableThinking] - 是否启用深度思考，仅对支持 reasoning_content 的模型生效
   *   （DashScope Qwen3 系列需要通过 extra_body.enable_thinking 显式开启；
   *    deepseek-r1 / qwq 等模型默认输出 reasoning_content，无需该参数）
   * @returns {ChatOpenAI} LLM实例
   */
  static getModel(modelName = "qwen-plus", temperature = 0.7, streaming = false, options = {}) {
    const modelKwargs = streaming ? { stream_options: { include_usage: true } } : {};
    if (options.enableThinking) {
      // DashScope OpenAI 兼容模式下，开启 Qwen3 深度思考必须通过 extra_body 透传
      modelKwargs.extra_body = { ...(modelKwargs.extra_body || {}), enable_thinking: true };
    }
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
      // 让流式响应在最后一帧带 usage_metadata，便于精确统计 token 消耗（DashScope OpenAI 兼容协议支持）
      streamUsage: true,
      modelKwargs,
    });
  }
}

module.exports = ModelFactory;
