const {
  ChatPromptTemplate,
  MessagesPlaceholder,
} = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { HumanMessage, AIMessage } = require("@langchain/core/messages");
const ModelFactory = require("../../models/factory");
const { buildAttachmentContext } = require("../../../helpers/fileParser");

// Agent 对话提示词模板：系统人设 → 历史上下文 → 用户输入（纯文本模式）
const agentPrompt = ChatPromptTemplate.fromMessages([
  ["system", "{systemPrompt}"],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

const DEFAULT_SYSTEM_PROMPT = "你是一个有用的AI对话助手。";

/** DashScope 内容安全拦截的友好提示 */
const CONTENT_MODERATION_REPLY = "抱歉，您发送的内容触发了平台内容安全审核，请更换图片或修改文字后重试。";

const IMAGE_DOWNLOAD_FAIL_REPLY = "抱歉，图片处理失败，请重新上传图片后再试。";

/**
 * 检测是否为 DashScope 内容审核或图片下载错误。
 */
function isContentModerationError(error) {
  const msg = error?.message || error?.toString() || "";
  return msg.includes("DataInspectionFailed") || msg.includes("inappropriate content");
}

function isImageDownloadError(error) {
  const msg = error?.message || error?.toString() || "";
  return msg.includes("Failed to download multimodal content");
}

/**
 * 字符级 token 估算（DashScope 未返回 usage 时兜底）。
 * 中文/CJK 字符按 1 token，ASCII 按 4 字符 1 token，足以满足成本统计粗略需求。
 */
function estimateTokens(text) {
  if (!text) return 0;
  const str = typeof text === "string" ? text : JSON.stringify(text);
  const cjkCount = (str.match(/[一-鿿㐀-䶿]/g) || []).length;
  const otherLen = str.length - cjkCount;
  return Math.max(1, Math.ceil(cjkCount + otherLen / 4));
}

/**
 * 把 history + input + system 估算成 prompt tokens。
 * 用于 LLM 未在响应中返回 usage_metadata 时的兜底统计。
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
 * 从 LangChain 返回值中提取 usage。
 * 兼容 OpenAI/DashScope 两套字段：usage_metadata（v0.2+ 标准）与 response_metadata.tokenUsage（旧版）。
 */
function extractUsage(result) {
  const meta = result?.usage_metadata;
  if (meta && (meta.input_tokens || meta.output_tokens || meta.total_tokens)) {
    return {
      promptTokens: Number(meta.input_tokens || 0),
      completionTokens: Number(meta.output_tokens || 0),
      totalTokens: Number(meta.total_tokens || (meta.input_tokens || 0) + (meta.output_tokens || 0)),
    };
  }
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
 * 构建用户消息内容：纯文本或含图片的多模态内容数组。
 * 直接使用图片 URL，由 DashScope 视觉模型自行下载。
 */
function buildUserContent(text, images) {
  if (!images || images.length === 0) {
    return text || "";
  }
  const parts = [];
  if (text) {
    parts.push({ type: "text", text });
  }
  images.forEach((img) => {
    const url = typeof img === "string" ? img : img?.url;
    if (url && /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i.test(url)) {
      console.log("[buildUserContent] 图片URL:", url);
      parts.push({ type: "image_url", image_url: { url } });
    } else if (url) {
      console.warn("[buildUserContent] 跳过非图片URL:", url);
    }
  });
  if (parts.length === 0) return text || "";
  return parts.length === 1 && parts[0].type === "text" ? text : parts;
}

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
    if (rawMessages[i].role === "user") {
      lastUserIdx = i;
      break;
    }
  }

  console.log("[parseMessages] 消息数:", rawMessages.length, "lastUserIdx:", lastUserIdx);
  if (lastUserIdx >= 0) {
    const lastMsg = rawMessages[lastUserIdx];
    // 仅打印附件元信息（文件名/图片数），避免把完整 parsedBlock 文档正文输出到日志
    const ext = lastMsg.ext || {};
    const summary = {
      images: Array.isArray(ext.images) ? ext.images.length : 0,
      files: Array.isArray(ext.files) ? ext.files.map((f) => f?.name || f?.url || "").filter(Boolean) : [],
      parsedBlockChars: ext.parsedBlock ? ext.parsedBlock.length : 0,
    };
    console.log("[parseMessages] 最后用户消息 ext 摘要:", JSON.stringify(summary));
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
        console.log("[parseMessages] 当前轮实时解析附件数:", files.length, "字符:", attachmentBlock.length);
      }

      const composedText = attachmentBlock
        ? `${attachmentBlock}用户问题：${msg.content || "（未输入文字，请基于上述附件内容回复）"}`
        : msg.content;

      if (images && images.length > 0) {
        hasImages = true;
        input = buildUserContent(composedText, images);
        console.log("[parseMessages] 多模态输入, 图片数:", images.length);
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
  const { input, history, hasImages } = await parseMessages(rawMessages);

  const { SystemMessage } = require("@langchain/core/messages");
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

  try {
    const result = await model.invoke(messages);
    const text = typeof result?.content === "string" ? result.content : JSON.stringify(result.content);
    const usage = extractUsage(result) || {
      promptTokens: estimatePromptTokens(sysPrompt, history, input),
      completionTokens: estimateTokens(text),
      totalTokens: 0,
      estimated: true,
    };
    if (!usage.totalTokens) usage.totalTokens = usage.promptTokens + usage.completionTokens;
    return { reply: text, modelName, usage };
  } catch (error) {
    if (isContentModerationError(error)) {
      console.warn("[runAgentChain] 内容审核拦截:", error.message);
      return { reply: CONTENT_MODERATION_REPLY, modelName, usage: null };
    }
    if (isImageDownloadError(error)) {
      console.warn("[runAgentChain] 图片下载失败:", error.message);
      return { reply: IMAGE_DOWNLOAD_FAIL_REPLY, modelName, usage: null };
    }
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
  console.log("[streamAgentChain] 开始, model:", modelName, "消息数:", rawMessages.length);
  const model = ModelFactory.getModel(modelName, 0.7, true);
  const { input, history, hasImages } = await parseMessages(rawMessages);

  const { SystemMessage } = require("@langchain/core/messages");
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

  const signal = options.signal;
  const isAborted = () => !!signal?.aborted;
  const buildAbortedResult = (reply) => {
    const usage = {
      promptTokens: estimatePromptTokens(sysPrompt, history, input),
      completionTokens: estimateTokens(reply),
      totalTokens: 0,
      estimated: true,
    };
    usage.totalTokens = usage.promptTokens + usage.completionTokens;
    return { reply, modelName, usage, aborted: true };
  };

  console.log("[streamAgentChain] 调用 model.stream...");
  // reply 提到 try 之外,abort 时 catch 才能访问到已累积的内容
  let reply = "";
  let tokenCount = 0;
  let usage = null;
  try {
    const stream = await model.stream(messages, signal ? { signal } : undefined);

    for await (const chunk of stream) {
      if (isAborted()) {
        console.log("[streamAgentChain] 用户中止, 已生成长度:", reply.length);
        break;
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

    if (isAborted()) return buildAbortedResult(reply);

    if (!usage) {
      usage = {
        promptTokens: estimatePromptTokens(sysPrompt, history, input),
        completionTokens: estimateTokens(reply),
        totalTokens: 0,
        estimated: true,
      };
      usage.totalTokens = usage.promptTokens + usage.completionTokens;
    }

    console.log("[streamAgentChain] 完成, token数:", tokenCount, "总长度:", reply.length, "usage:", usage);
    return { reply, modelName, usage };
  } catch (error) {
    // AbortSignal 触发的中止视作正常停止
    if (isAborted() || error?.name === "AbortError" || /aborted/i.test(error?.message || "")) {
      console.log("[streamAgentChain] 流被中止, 已生成长度:", reply.length);
      return buildAbortedResult(reply);
    }
    if (isContentModerationError(error)) {
      console.warn("[streamAgentChain] 内容审核拦截:", error.message);
      options.onToken?.(CONTENT_MODERATION_REPLY);
      return { reply: CONTENT_MODERATION_REPLY, modelName, usage: null };
    }
    if (isImageDownloadError(error)) {
      console.warn("[streamAgentChain] 图片下载失败:", error.message);
      options.onToken?.(IMAGE_DOWNLOAD_FAIL_REPLY);
      return { reply: IMAGE_DOWNLOAD_FAIL_REPLY, modelName, usage: null };
    }
    throw error;
  }
}

module.exports = { runAgentChain, streamAgentChain, generateConversationTitle };
