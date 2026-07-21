var express = require("express");
const WordBookController = require("../../controllers/user/WordBookController");
const WordListController = require("../../controllers/user/WordListController");
const WordReviewController = require("../../controllers/user/WordReviewController");
const JWT = require("../../MiddleWares/jwt");
const requireUid = require("../../MiddleWares/requireUid");

var WordBookRouter = express.Router();

// 获取单词本列表
WordBookRouter.get(
  "/uniappAPI/tools/wordbook/getWordBooks",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.getWordBooks,
);

// 获取单词本详情
WordBookRouter.get(
  "/uniappAPI/tools/wordbook/getWordBookDetail",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.getWordBookDetail,
);

// 创建单词本
WordBookRouter.post(
  "/uniappAPI/tools/wordbook/createWordBook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.createWordBook,
);

// 更新单词本
WordBookRouter.post(
  "/uniappAPI/tools/wordbook/updateWordBook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.updateWordBook,
);

// 删除单词本
WordBookRouter.post(
  "/uniappAPI/tools/wordbook/deleteWordBook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.deleteWordBook,
);

// 批量删除单词本
WordBookRouter.post(
  "/uniappAPI/tools/wordbook/batchDeleteWordBooks",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.batchDeleteWordBooks,
);

// ---- 单词列表 (原 WordListRouter) ----

// 分页获取单词列表
WordBookRouter.get(
  "/uniappAPI/tools/wordlist/getWords",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.getWords,
);

// 获取单词详情
WordBookRouter.get(
  "/uniappAPI/tools/wordlist/getWordDetail",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.getWordDetail,
);

// 添加单词
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/addWord",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.addWord,
);

// 更新单词
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/updateWord",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.updateWord,
);

// 删除单词
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/deleteWord",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.deleteWord,
);

// 批量删除单词
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/batchDeleteWords",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.batchDeleteWords,
);

// 切换收藏状态
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/toggleMarked",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.toggleMarked,
);

// 批量添加单词
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/batchAddWords",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.batchAddWords,
);

// AI 查询单词
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/aiLookupWord",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.aiLookupWord,
);

// AI 从文本提取单词
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/aiExtractWords",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.aiExtractWords,
);

// AI 单词扩展信息（流式）
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/aiWordDetail",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.aiWordDetail,
);

// 获取可用知识库列表
WordBookRouter.get(
  "/uniappAPI/tools/wordlist/getKnowledgeBases",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.getKnowledgeBases,
);

// 从知识库检索例句
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/searchExamples",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.searchExamples,
);

// ---- 单词复习 (WordReview) ----

// 获取待复习单词
WordBookRouter.get(
  "/uniappAPI/tools/wordreview/getReviewWords",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordReviewController.getReviewWords,
);

// 获取单词本复习统计
WordBookRouter.get(
  "/uniappAPI/tools/wordreview/getReviewStats",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordReviewController.getReviewStats,
);

// 提交单个单词的复习结果
WordBookRouter.post(
  "/uniappAPI/tools/wordreview/submitReview",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordReviewController.submitReview,
);

// 批量提交复习结果
WordBookRouter.post(
  "/uniappAPI/tools/wordreview/batchSubmitReview",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordReviewController.batchSubmitReview,
);

// 重置单词本复习进度
WordBookRouter.post(
  "/uniappAPI/tools/wordreview/resetReviewProgress",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordReviewController.resetReviewProgress,
);

module.exports = WordBookRouter;
