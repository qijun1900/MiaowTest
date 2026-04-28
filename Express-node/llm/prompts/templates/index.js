const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");

// 基础对话 Prompt
const basicChatPrompt = ChatPromptTemplate.fromMessages([
  ["system", "你是一个有用的AI助手。请简明扼要地回答用户的问题。"],
  ["human", "{input}"]
]);

// 带记忆的对话 Prompt
const memoryChatPrompt = ChatPromptTemplate.fromMessages([
  ["system", "你是一个友好的AI助手，会记得之前的对话记录。"],
  new MessagesPlaceholder("history"),
  ["human", "{input}"]
]);

// 题目生成 Prompt
const questionGenerationPrompt = ChatPromptTemplate.fromMessages([
  ["system", "你是一个专业的出题老师。请根据用户的要求生成题目。以JSON格式返回内容。"],
  ["human", "{prompt}"]
]);

module.exports = {
  basicChatPrompt,
  memoryChatPrompt,
  questionGenerationPrompt
};