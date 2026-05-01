const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { HumanMessage, AIMessage } = require("@langchain/core/messages");
const ModelFactory = require("../../models/factory");

// 定义 Agent 人设注入与上下文记忆的提示词模板
const agentPrompt = ChatPromptTemplate.fromMessages([
  ["system", "{systemPrompt}"],
  new MessagesPlaceholder("history"),
  ["human", "{input}"]
]);

/**
 * 运行 Agent 的 LCEL 执行链
 * @param {Array} rawMessages - 前端传来的原始对话记录 (包含 role 和 content)
 * @param {String} systemPrompt - 需要注入的 Agent 人设提示词
 * @param {String} modelName - Agent 指定的底层模型
 * @returns 
 */
async function runAgentChain(rawMessages, systemPrompt, modelName = 'qwen-plus') {
  // 1. 通过统一工厂获取对应的模型实例
  const model = ModelFactory.getModel(modelName);

  // 2. 解析和分割原始的消息对象，拆分为上下文(history)与最新一句输入(input)
  let input = "";
  const history = [];

  rawMessages.forEach((msg, index) => {
    // 过滤掉因为兼容旧代码混入其中的原生 system 提示词
    if (msg.role === 'system') return;

    // 定位最后一条用户消息作为本次最新提问的 Input
    if (index === rawMessages.length - 1 && msg.role === 'user') {
      input = msg.content;
      return;
    }

    // 构建 LangChain Message 阵列，还原对话历史 Memory
    if (msg.role === 'user') {
      history.push(new HumanMessage(msg.content));
    } else {
      // 除了 user 之外（如 AI助手, assistant 或底层模型名），皆视为系统历史回复
      history.push(new AIMessage(msg.content || "正在思考中..."));
    }
  });

  // 如果未能正确提取到用户 input（如消息结构突变），做安全兜底
  if (!input && history.length > 0) {
    const lastMsg = history.pop();
    input = lastMsg.text || lastMsg.content;
  }

  // 3. 构建 Agent 逻辑链：模板 -> 底座模型 -> 字符串解析输出
  const chain = agentPrompt.pipe(model).pipe(new StringOutputParser());

  // 4. 调用 Chain，传入变量填充变量占位符 {systemPrompt}, {history}, {input}
  const result = await chain.invoke({
    systemPrompt: systemPrompt || "你是一个有用的AI对话助手。",
    history: history,
    input: input || "你好"
  });

  return {
    Aidata: result, // 规范统一向前端输出字段
    modelName: modelName
  };
}

module.exports = { runAgentChain };