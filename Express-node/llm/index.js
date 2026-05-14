/**
 * llm 入口 — 统一导出所有对话链
 */
const { useChat } = require("./chains/conversational/chat");
const { useDeepThink } = require("./chains/conversational/deepThink");

module.exports = {
  useChat,
  useDeepThink,
};
