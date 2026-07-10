const express = require("express");
const WordListController = require("../../controllers/user/WordListController");
const JWT = require("../../MiddleWares/jwt");
const requireUid = require("../../MiddleWares/requireUid");

const WordListRouter = express.Router();

// ---- 基础 CRUD ----

// 分页获取单词列表
WordListRouter.get(
  "/uniappAPI/tools/wordlist/getWords",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.getWords,
);

// 获取单词详情
WordListRouter.get(
  "/uniappAPI/tools/wordlist/getWordDetail",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.getWordDetail,
);

// 添加单词
WordListRouter.post(
  "/uniappAPI/tools/wordlist/addWord",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.addWord,
);

// 更新单词
WordListRouter.post(
  "/uniappAPI/tools/wordlist/updateWord",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.updateWord,
);

// 删除单词
WordListRouter.post(
  "/uniappAPI/tools/wordlist/deleteWord",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.deleteWord,
);

// 批量删除单词
WordListRouter.post(
  "/uniappAPI/tools/wordlist/batchDeleteWords",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.batchDeleteWords,
);

// 切换收藏状态
WordListRouter.post(
  "/uniappAPI/tools/wordlist/toggleMarked",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.toggleMarked,
);

// 批量添加单词
WordListRouter.post(
  "/uniappAPI/tools/wordlist/batchAddWords",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.batchAddWords,
);

// ---- AI 相关 ----

// AI 查询单词
WordListRouter.post(
  "/uniappAPI/tools/wordlist/aiLookupWord",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.aiLookupWord,
);

// AI 从文本提取单词
WordListRouter.post(
  "/uniappAPI/tools/wordlist/aiExtractWords",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.aiExtractWords,
);

// AI 单词扩展信息（流式）
WordListRouter.post(
  "/uniappAPI/tools/wordlist/aiWordDetail",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.aiWordDetail,
);

// ---- 知识库相关 ----

// 获取可用知识库列表
WordListRouter.get(
  "/uniappAPI/tools/wordlist/getKnowledgeBases",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.getKnowledgeBases,
);

// 从知识库检索例句
WordListRouter.post(
  "/uniappAPI/tools/wordlist/searchExamples",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.searchExamples,
);

module.exports = WordListRouter;
