const {
  ChatPromptTemplate,
  MessagesPlaceholder,
} = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { HumanMessage, AIMessage, SystemMessage } = require("@langchain/core/messages");
const ModelFactory = require("../../models/factory");
const { buildAttachmentContext } = require("../../../helpers/fileParser");
const { CONTENT_MODERATION_REPLY, IMAGE_DOWNLOAD_FAIL_REPLY, handleChainError } = require("../../utils/errorHandler");
const { extractUsage, buildUsageFallback } = require("../../utils/tokenEstimator");
const { buildUserContent } = require("../../utils/contentBuilder");

// Agent 对话提示词模板：系统人设 → 历史上下文 → 用户输入（纯文本模式）
const DEFAULT_SYSTEM_PROMPT = "你是一个有用的AI对话助手。";

/**
 * 解析原始消息数组，拆分为 LangChain 格式的 history 和最新用户 input。
 *
 * 策略：从后向前扫描找到最后一条 role=user 的消息作为 input，
 * 其余非 system 消息按正序构建 LangChain HumanMessage/AIMessage 历史。
 * 若未找到 user 消息，则从 history 末尾兜底提取。
 *
 * 当消息包含图片时，使用多模态内容格式（content 数组），
 * 视觉模型可直接解析图片，非视觉模型会忽略 image_url 部分。
 *
 * @param {Array<{role: string, content: string, ext?: object}>} rawMessages
 * @returns {Promise<{ input: string|Array, history: Array<HumanMessage|AIMessage>, hasImages: boolean }>}
 */
async function parseMessages(rawMessages) {
  let input = "";
  let hasImages = false;
  const history = [];

  // 从后向前定位最后一条用户消息作为本轮输入
  let lastUserIdx = -1;
  for (let i = rawMessages.length - 1; i >= 0; i--) {
    if (rawMessages[i].role === "user") { lastUserIdx = i; break; }
  }

  for (let index = 0; index < rawMessages.length; index++) {
    const msg = rawMessages[index];
    if (msg.role === "system") continue;

    if (index === lastUserIdx) {
      const images = msg.ext?.images;
      const files = msg.ext?.files;

      // 文档附件：优先使用落库时缓存的 parsedBlock，缺失时回落到实时解析
      let attachmentBlock = msg.ext?.parsedBlock || "";
      if (!attachmentBlock && Array.isArray(files) && files.length > 0) {
        const ctx = await buildAttachmentContext(files);
        attachmentBlock = ctx.block;
      }

      const composedText = attachmentBlock
        ? `${attachmentBlock}用户问题：${msg.content || "（未输入文字，请基于上述附件内容回复）"}`
        : msg.content;

      if (images && images.length > 0) {
        hasImages = true;
        input = buildUserContent(composedText, images);
      } else {
        input = composedText;
      }
      continue;
    }

    if (msg.role === "user") {
      // 历史消息中的图片也使用多模态格式
      const histImages = msg.ext?.images;
      const histParsedBlock = msg.ext?.parsedBlock || "";
      const histText = histParsedBlock
        ? `${histParsedBlock}用户问题：${msg.content || "（未输入文字）"}`
        : msg.content;

      if (histImages && histImages.length > 0) {
        hasImages = true;
        history.push(new HumanMessage({ content: buildUserContent(histText, histImages) }));
      } else {
        history.push(new HumanMessage(histText));
      }
    } else {
      history.push(new AIMessage(msg.content || "正在思考中..."));
    }
  }

  // 兜底：若未提取到 input（消息结构异常），从 history 末尾取出最后一条
  if (!input && history.length > 0) {
    const lastMsg = history.pop();
    input = lastMsg.text || lastMsg.content;
  }

  return { input, history, hasImages };
}

/**
 * 准备 Agent 对话链所需的消息数组。
 * 解析原始消息 → 构建 system + history + input 的完整消息列表。
 *
 * @param {Array} rawMessages - 原始对话记录
 * @param {string} systemPrompt - Agent 人设提示词
 * @returns {Promise<{input, history, hasImages, sysPrompt, messages}>}
 */
async function prepareChain(rawMessages, systemPrompt) {
  const { input, history, hasImages } = await parseMessages(rawMessages);
  const sysPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;

  const messages = hasImages
    ? [
        new SystemMessage(sysPrompt),
        ...history,
        new HumanMessage({ content: Array.isArray(input) ? input : [{ type: "text", text: input || "你好" }] }),
      ]
    : [
        new SystemMessage(sysPrompt),
        ...history,
        new HumanMessage(input || "你好"),
      ];

  return { input, history, hasImages, sysPrompt, messages };
}

/**
 * 非流式执行 Agent LCEL 链。
 * 构建 模板→模型→字符串解析器 管道，一次性返回完整回复。
 *
 * @param {Array} rawMessages - 原始对话记录
 * @param {string} systemPrompt - Agent 人设提示词
 * @param {string} modelName - 底座模型名
 * @returns {Promise<{reply: string, modelName: string}>}
 */
async function runAgentChain(rawMessages, systemPrompt, modelName = "qwen-plus") {
  const model = ModelFactory.getModel(modelName, 0.7, false);
  const { input, history, sysPrompt, messages } = await prepareChain(rawMessages, systemPrompt);

  try {
    const result = await model.invoke(messages);
    const text = typeof result?.content === "string" ? result.content : JSON.stringify(result.content);
    const usage = extractUsage(result) || buildUsageFallback(sysPrompt, history, input, text);
    return { reply: text, modelName, usage };
  } catch (error) {
    const fallback = handleChainError(error);
    if (fallback) return { reply: fallback, modelName, usage: null };
    throw error;
  }
}

/**
 * 流式执行 Agent LCEL 链。
 * 通过 model.stream() 逐 token 回调，实现实时流式输出。
 *
 * @param {Array} rawMessages - 原始对话记录
 * @param {string} systemPrompt - Agent 人设提示词
 * @param {string} modelName - 底座模型名
 * @param {Object} options - 可选回调
 * @param {Function} options.onToken - 每收到一个 token 时回调 (token: string) => void
 * @returns {Promise<{reply: string, modelName: string}>}
 */
async function streamAgentChain(rawMessages, systemPrompt, modelName = "qwen-plus", options = {}) {
  const model = ModelFactory.getModel(modelName, 0.7, true, { enableThinking: !!options.enableThinking });
  const { input, history, sysPrompt, messages } = await prepareChain(rawMessages, systemPrompt);

  const signal = options.signal;
  const isAborted = () => !!signal?.aborted;
  const buildAbortedResult = (reply, reasoning) => ({
    reply, reasoning, modelName, usage: buildUsageFallback(sysPrompt, history, input, reply), aborted: true,
  });

  // reply / reasoning 提到 try 之外，abort 时 catch 才能访问到已累积的内容
  let reply = "";
  let reasoning = "";
  let tokenCount = 0;
  let usage = null;

  try {
    const stream = await model.stream(messages, signal ? { signal } : undefined);

    for await (const chunk of stream) {
      if (isAborted()) break;

      // 深度思考片段：DashScope / DeepSeek-R1 / QwQ 在 additional_kwargs.reasoning_content
      const reasoningChunk = chunk?.additional_kwargs?.reasoning_content || "";
      if (reasoningChunk) {
        reasoning += reasoningChunk;
        options.onReasoning?.(reasoningChunk);
      }

      const text = typeof chunk?.content === "string" ? chunk.content : "";
      if (text) {
        reply += text;
        tokenCount++;
        options.onToken?.(text);
      }

      // 流式 chunk 中通常只有最后一帧带 usage_metadata（需 streamUsage:true）
      const chunkUsage = extractUsage(chunk);
      if (chunkUsage) usage = chunkUsage;
    }

    if (isAborted()) return buildAbortedResult(reply, reasoning);
    if (!usage) usage = buildUsageFallback(sysPrompt, history, input, reply);

    return { reply, reasoning, modelName, usage };
  } catch (error) {
    // AbortSignal 触发的中止视作正常停止
    if (isAborted() || error?.name === "AbortError" || /aborted/i.test(error?.message || "")) {
      return buildAbortedResult(reply, reasoning);
    }
    const fallback = handleChainError(error);
    if (fallback) {
      options.onToken?.(fallback);
      return { reply: fallback, modelName, usage: null };
    }
    throw error;
  }
}

/**
 * 根据用户提问和 AI 回答，调用 LLM 生成简短会话标题（不超过 20 字）。
 * 失败时抛错，由调用方降级处理。
 */
async function generateConversationTitle(userMessage, aiResponse, modelName = "qwen-plus") {
  const model = ModelFactory.getModel(modelName, 0.3, false);
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "你是一个标题生成助手。请根据用户的提问和AI的回答，提炼出一个简短的会话标题（不超过20个字），概括本轮对话的核心主题。只返回标题文本，不要加引号或其他修饰。"],
    ["human", "用户提问：{question}\n\nAI回答：{answer}"],
  ]);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const title = await chain.invoke({
    question: userMessage,
    answer: typeof aiResponse === "string" ? aiResponse : (aiResponse?.reply || JSON.stringify(aiResponse)),
  });
  return title?.trim() || "";
}

module.exports = { runAgentChain, streamAgentChain, generateConversationTitle };
