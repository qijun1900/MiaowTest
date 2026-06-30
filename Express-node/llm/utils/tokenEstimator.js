/**
 * Token 估算与 Usage 提取工具
 *
 * 提供两套能力：
 * 1. 字符级 token 粗估算 — 当 LLM 响应中未返回 usage_metadata 时的兜底方案
 * 2. LangChain usage 提取 — 兼容 OpenAI/DashScope 新旧两套 usage 字段格式
 *
 * 估算精度：中文/CJK 字符按 1 token，ASCII 按 4 字符 1 token，
 * 足以满足成本统计和配额管控的粗略需求，不适合用于精确计费。
 */

/**
 * 字符级 token 估算（DashScope 未返回 usage 时兜底）。
 * 中文/CJK 字符按 1 token，ASCII 按 4 字符 1 token。
 *
 * @param {string} text - 待估算的文本内容
 * @returns {number} 估算的 token 数（至少为 1）
 */
function estimateTokens(text) {
  if (!text) return 0;
  const str = typeof text === "string" ? text : JSON.stringify(text);
  // 一-鿿: CJK 基本区 (U+4E00-U+9FFF)，㐀-䶿: CJK 扩展 A 区 (U+3400-U+4DBF)
  const cjkCount = (str.match(/[一-鿿㐀-䶿]/g) || []).length;
  const otherLen = str.length - cjkCount;
  return Math.max(1, Math.ceil(cjkCount + otherLen / 4));
}

/**
 * 把 history + input + system 估算成 prompt tokens。
 * 用于 LLM 未在响应中返回 usage_metadata 时的兜底统计。
 *
 * @param {string} systemPrompt - 系统提示词
 * @param {Array} history - LangChain 格式的历史消息数组 (HumanMessage/AIMessage)
 * @param {string|Array} input - 用户输入（纯文本或含图片的多模态数组）
 * @returns {number} 估算的 prompt token 总数
 */
function estimatePromptTokens(systemPrompt, history, input) {
  let total = estimateTokens(systemPrompt || "");
  for (const msg of history || []) {
    total += estimateTokens(msg?.content);
  }
  if (Array.isArray(input)) {
    for (const part of input) {
      if (part?.type === "text") total += estimateTokens(part.text);
      if (part?.type === "image_url") total += 256; // 图片走视觉模型，按常见经验值粗估
    }
  } else {
    total += estimateTokens(input);
  }
  return total;
}

/**
 * 从 LangChain 返回值中提取 usage 信息。
 * 兼容 OpenAI/DashScope 两套字段：
 * - usage_metadata（LangChain v0.2+ 标准字段）
 * - response_metadata.tokenUsage（旧版 DashScope / OpenAI 兼容格式）
 *
 * @param {Object} result - LangChain 模型返回的 chunk 或完整结果
 * @returns {{promptTokens: number, completionTokens: number, totalTokens: number}|null}
 *   提取到的 usage 对象，或 null（表示未携带 usage 信息）
 */
function extractUsage(result) {
  // 优先使用 v0.2+ 标准字段
  const meta = result?.usage_metadata;
  if (meta && (meta.input_tokens || meta.output_tokens || meta.total_tokens)) {
    return {
      promptTokens: Number(meta.input_tokens || 0),
      completionTokens: Number(meta.output_tokens || 0),
      totalTokens: Number(meta.total_tokens || (meta.input_tokens || 0) + (meta.output_tokens || 0)),
    };
  }
  // 回退到旧版字段
  const legacy = result?.response_metadata?.tokenUsage || result?.response_metadata?.usage;
  if (legacy) {
    const p = Number(legacy.promptTokens || legacy.prompt_tokens || 0);
    const c = Number(legacy.completionTokens || legacy.completion_tokens || 0);
    return {
      promptTokens: p,
      completionTokens: c,
      totalTokens: Number(legacy.totalTokens || legacy.total_tokens || p + c),
    };
  }
  return null;
}

/**
 * 构建兜底 usage 对象（当 LLM 响应未携带 usage 时使用估算值）。
 * 返回对象中 estimated=true 标记这是估算值而非精确值。
 *
 * @param {string} systemPrompt - 系统提示词
 * @param {Array} history - 历史消息数组
 * @param {string|Array} input - 用户输入
 * @param {string} reply - AI 回复文本
 * @returns {{promptTokens: number, completionTokens: number, totalTokens: number, estimated: boolean}}
 */
function buildUsageFallback(systemPrompt, history, input, reply) {
  const usage = {
    promptTokens: estimatePromptTokens(systemPrompt, history, input),
    completionTokens: estimateTokens(reply),
    totalTokens: 0,
    estimated: true,
  };
  usage.totalTokens = usage.promptTokens + usage.completionTokens;
  return usage;
}

module.exports = {
  estimateTokens,
  estimatePromptTokens,
  extractUsage,
  buildUsageFallback,
};
