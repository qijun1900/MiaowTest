const {
  ChatPromptTemplate,
  MessagesPlaceholder,
} = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { HumanMessage, AIMessage } = require("@langchain/core/messages");
const ModelFactory = require("../../models/factory");

// Agent 对话提示词模板：系统人设 → 历史上下文 → 用户输入
const agentPrompt = ChatPromptTemplate.fromMessages([
  ["system", "{systemPrompt}"],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

const DEFAULT_SYSTEM_PROMPT = "你是一个有用的AI对话助手。";

/**
 * 解析原始消息数组，拆分为 LangChain 格式的 history 和最新用户 input。
 *
 * 策略：从后向前扫描找到最后一条 role=user 的消息作为 input，
 * 其余非 system 消息按正序构建 LangChain HumanMessage/AIMessage 历史。
 * 若未找到 user 消息，则从 history 末尾兜底提取。
 *
 * @param {Array<{role: string, content: string}>} rawMessages
 * @returns {{ input: string, history: Array<HumanMessage|AIMessage> }}
 */
function parseMessages(rawMessages) {
  let input = "";
  const history = [];

  // 从后向前定位最后一条用户消息作为本轮输入
  let lastUserIdx = -1;
  for (let i = rawMessages.length - 1; i >= 0; i--) {
    if (rawMessages[i].role === "user") {
      lastUserIdx = i;
      break;
    }
  }

  rawMessages.forEach((msg, index) => {
    if (msg.role === "system") return;

    if (index === lastUserIdx) {
      input = msg.content;
      return;
    }

    if (msg.role === "user") {
      history.push(new HumanMessage(msg.content));
    } else {
      history.push(new AIMessage(msg.content || "正在思考中..."));
    }
  });

  // 兜底：若未提取到 input（消息结构异常），从 history 末尾取出最后一条
  if (!input && history.length > 0) {
    const lastMsg = history.pop();
    input = lastMsg.text || lastMsg.content;
  }

  return { input, history };
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
  const { input, history } = parseMessages(rawMessages);

  const chain = agentPrompt.pipe(model).pipe(new StringOutputParser());
  const result = await chain.invoke({
    systemPrompt: systemPrompt || DEFAULT_SYSTEM_PROMPT,
    history,
    input: input || "你好",
  });

  return { reply: result, modelName };
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
  const { input, history } = parseMessages(rawMessages);

  const messages = await agentPrompt.invoke({
    systemPrompt: systemPrompt || DEFAULT_SYSTEM_PROMPT,
    history,
    input: input || "你好",
  });

  console.log("[streamAgentChain] 调用 model.stream...");
  const stream = await model.stream(messages);
  let reply = "";
  let tokenCount = 0;

  for await (const chunk of stream) {
    const text = typeof chunk?.content === "string" ? chunk.content : "";
    if (!text) continue;
    reply += text;
    tokenCount++;
    console.log(`[streamAgentChain] token #${tokenCount}:`, text.substring(0, 20));
    options.onToken?.(text);
  }

  console.log("[streamAgentChain] 完成, token数:", tokenCount, "总长度:", reply.length);
  return { reply, modelName };
}

module.exports = { runAgentChain, streamAgentChain, generateConversationTitle };
