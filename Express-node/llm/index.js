/**
 * llm 入口 — 统一导出所有对话链
 */
const { runAgentChain, streamAgentChain, generateConversationTitle } = require("./chains/agent/agentChat");

module.exports = {
  runAgentChain,
  streamAgentChain,
  generateConversationTitle,
};
