var express = require("express");
const WordBookController = require("../../controllers/user/WordBookController");
const WordListController = require("../../controllers/user/WordListController");
const WordReviewController = require("../../controllers/user/WordReviewController");
const JWT = require("../../MiddleWares/jwt");
const requireUid = require("../../MiddleWares/requireUid");

var WordBookRouter = express.Router();

/**
 * @swagger
 * /uniappAPI/tools/wordbook/getWordBooks:
 *   get:
 *     tags: [用户-单词本]
 *     summary: 获取单词本列表
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
// 获取单词本列表
WordBookRouter.get(
  "/uniappAPI/tools/wordbook/getWordBooks",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.getWordBooks,
);

/**
 * @swagger
 * /uniappAPI/tools/wordbook/getWordBookDetail:
 *   get:
 *     tags: [用户-单词本]
 *     summary: 获取单词本详情
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 单词本ID
 *     responses:
 *       200:
 *         description: 成功
 */
// 获取单词本详情
WordBookRouter.get(
  "/uniappAPI/tools/wordbook/getWordBookDetail",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.getWordBookDetail,
);

/**
 * @swagger
 * /uniappAPI/tools/wordbook/createWordBook:
 *   post:
 *     tags: [用户-单词本]
 *     summary: 创建单词本
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 description: 单词本名称
 *               description:
 *                 type: string
 *                 description: 单词本描述
 *     responses:
 *       200:
 *         description: 成功
 */
// 创建单词本
WordBookRouter.post(
  "/uniappAPI/tools/wordbook/createWordBook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.createWordBook,
);

/**
 * @swagger
 * /uniappAPI/tools/wordbook/updateWordBook:
 *   post:
 *     tags: [用户-单词本]
 *     summary: 更新单词本
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, title]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 单词本ID
 *               title:
 *                 type: string
 *                 description: 单词本名称
 *               description:
 *                 type: string
 *                 description: 单词本描述
 *     responses:
 *       200:
 *         description: 成功
 */
// 更新单词本
WordBookRouter.post(
  "/uniappAPI/tools/wordbook/updateWordBook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.updateWordBook,
);

/**
 * @swagger
 * /uniappAPI/tools/wordbook/deleteWordBook:
 *   post:
 *     tags: [用户-单词本]
 *     summary: 删除单词本
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 单词本ID
 *     responses:
 *       200:
 *         description: 成功
 */
// 删除单词本
WordBookRouter.post(
  "/uniappAPI/tools/wordbook/deleteWordBook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.deleteWordBook,
);

/**
 * @swagger
 * /uniappAPI/tools/wordbook/batchDeleteWordBooks:
 *   post:
 *     tags: [用户-单词本]
 *     summary: 批量删除单词本
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 单词本ID列表
 *     responses:
 *       200:
 *         description: 成功
 */
// 批量删除单词本
WordBookRouter.post(
  "/uniappAPI/tools/wordbook/batchDeleteWordBooks",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordBookController.batchDeleteWordBooks,
);

// ---- 单词列表 (原 WordListRouter) ----

/**
 * @swagger
 * /uniappAPI/tools/wordlist/getWords:
 *   get:
 *     tags: [用户-单词列表]
 *     summary: 分页获取单词列表
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: wordBookId
 *         required: true
 *         schema:
 *           type: string
 *         description: 单词本ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: isMarked
 *         schema:
 *           type: string
 *         description: 是否收藏筛选
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: 标签筛选
 *     responses:
 *       200:
 *         description: 成功
 */
// 分页获取单词列表
WordBookRouter.get(
  "/uniappAPI/tools/wordlist/getWords",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.getWords,
);

/**
 * @swagger
 * /uniappAPI/tools/wordlist/getWordDetail:
 *   get:
 *     tags: [用户-单词列表]
 *     summary: 获取单词详情
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 单词ID
 *     responses:
 *       200:
 *         description: 成功
 */
// 获取单词详情
WordBookRouter.get(
  "/uniappAPI/tools/wordlist/getWordDetail",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.getWordDetail,
);

/**
 * @swagger
 * /uniappAPI/tools/wordlist/addWord:
 *   post:
 *     tags: [用户-单词列表]
 *     summary: 添加单词
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [wordBookId, word]
 *             properties:
 *               wordBookId:
 *                 type: string
 *                 description: 单词本ID
 *               word:
 *                 type: string
 *                 description: 单词
 *               phonetic:
 *                 type: string
 *                 description: 音标
 *               meaning:
 *                 type: string
 *                 description: 释义
 *               example:
 *                 type: string
 *                 description: 例句
 *               tags:
 *                 type: array
 *                 description: 标签列表
 *     responses:
 *       200:
 *         description: 成功
 */
// 添加单词
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/addWord",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.addWord,
);

/**
 * @swagger
 * /uniappAPI/tools/wordlist/updateWord:
 *   post:
 *     tags: [用户-单词列表]
 *     summary: 更新单词
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 单词ID
 *               word:
 *                 type: string
 *                 description: 单词
 *               phonetic:
 *                 type: string
 *                 description: 音标
 *               meaning:
 *                 type: string
 *                 description: 释义
 *               example:
 *                 type: string
 *                 description: 例句
 *               tags:
 *                 type: array
 *                 description: 标签列表
 *     responses:
 *       200:
 *         description: 成功
 */
// 更新单词
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/updateWord",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.updateWord,
);

/**
 * @swagger
 * /uniappAPI/tools/wordlist/deleteWord:
 *   post:
 *     tags: [用户-单词列表]
 *     summary: 删除单词
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 单词ID
 *               wordBookId:
 *                 type: string
 *                 description: 单词本ID
 *     responses:
 *       200:
 *         description: 成功
 */
// 删除单词
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/deleteWord",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.deleteWord,
);

/**
 * @swagger
 * /uniappAPI/tools/wordlist/batchDeleteWords:
 *   post:
 *     tags: [用户-单词列表]
 *     summary: 批量删除单词
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 单词ID列表
 *               wordBookId:
 *                 type: string
 *                 description: 单词本ID
 *     responses:
 *       200:
 *         description: 成功
 */
// 批量删除单词
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/batchDeleteWords",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.batchDeleteWords,
);

/**
 * @swagger
 * /uniappAPI/tools/wordlist/toggleMarked:
 *   post:
 *     tags: [用户-单词列表]
 *     summary: 切换收藏状态
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 单词ID
 *     responses:
 *       200:
 *         description: 成功
 */
// 切换收藏状态
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/toggleMarked",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.toggleMarked,
);

/**
 * @swagger
 * /uniappAPI/tools/wordlist/batchAddWords:
 *   post:
 *     tags: [用户-单词列表]
 *     summary: 批量添加单词
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [wordBookId, words]
 *             properties:
 *               wordBookId:
 *                 type: string
 *                 description: 单词本ID
 *               words:
 *                 type: array
 *                 description: 单词列表
 *     responses:
 *       200:
 *         description: 成功
 */
// 批量添加单词
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/batchAddWords",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.batchAddWords,
);

/**
 * @swagger
 * /uniappAPI/tools/wordlist/aiLookupWord:
 *   post:
 *     tags: [用户-单词列表]
 *     summary: AI查询单词
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [word]
 *             properties:
 *               word:
 *                 type: string
 *                 description: 要查询的单词
 *     responses:
 *       200:
 *         description: 成功
 */
// AI 查询单词
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/aiLookupWord",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.aiLookupWord,
);

/**
 * @swagger
 * /uniappAPI/tools/wordlist/aiExtractWords:
 *   post:
 *     tags: [用户-单词列表]
 *     summary: AI从文本提取单词
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 description: 待提取的文本内容
 *     responses:
 *       200:
 *         description: 成功
 */
// AI 从文本提取单词
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/aiExtractWords",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.aiExtractWords,
);

/**
 * @swagger
 * /uniappAPI/tools/wordlist/aiWordDetail:
 *   post:
 *     tags: [用户-单词列表]
 *     summary: AI单词扩展信息
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [word]
 *             properties:
 *               word:
 *                 type: string
 *                 description: 单词
 *               type:
 *                 type: string
 *                 description: 扩展信息类型
 *     responses:
 *       200:
 *         description: 成功
 */
// AI 单词扩展信息（流式）
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/aiWordDetail",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.aiWordDetail,
);

/**
 * @swagger
 * /uniappAPI/tools/wordlist/getKnowledgeBases:
 *   get:
 *     tags: [用户-单词列表]
 *     summary: 获取可用知识库列表
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessType
 *         schema:
 *           type: string
 *         description: 业务类型
 *     responses:
 *       200:
 *         description: 成功
 */
// 获取可用知识库列表
WordBookRouter.get(
  "/uniappAPI/tools/wordlist/getKnowledgeBases",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.getKnowledgeBases,
);

/**
 * @swagger
 * /uniappAPI/tools/wordlist/searchExamples:
 *   post:
 *     tags: [用户-单词列表]
 *     summary: 从知识库检索例句
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [word, kbId]
 *             properties:
 *               word:
 *                 type: string
 *                 description: 要检索的单词
 *               kbId:
 *                 type: string
 *                 description: 知识库ID
 *               topK:
 *                 type: integer
 *                 description: 返回结果数量
 *     responses:
 *       200:
 *         description: 成功
 */
// 从知识库检索例句
WordBookRouter.post(
  "/uniappAPI/tools/wordlist/searchExamples",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordListController.searchExamples,
);

// ---- 单词复习 (WordReview) ----

/**
 * @swagger
 * /uniappAPI/tools/wordreview/getReviewWords:
 *   get:
 *     tags: [用户-单词复习]
 *     summary: 获取待复习单词
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: wordBookId
 *         required: true
 *         schema:
 *           type: string
 *         description: 单词本ID
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [new, review, mixed, marked]
 *           default: mixed
 *         description: 复习模式
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 获取数量上限
 *     responses:
 *       200:
 *         description: 成功
 */
// 获取待复习单词
WordBookRouter.get(
  "/uniappAPI/tools/wordreview/getReviewWords",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordReviewController.getReviewWords,
);

/**
 * @swagger
 * /uniappAPI/tools/wordreview/getReviewStats:
 *   get:
 *     tags: [用户-单词复习]
 *     summary: 获取单词本复习统计
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: wordBookId
 *         required: true
 *         schema:
 *           type: string
 *         description: 单词本ID
 *     responses:
 *       200:
 *         description: 成功
 */
// 获取单词本复习统计
WordBookRouter.get(
  "/uniappAPI/tools/wordreview/getReviewStats",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordReviewController.getReviewStats,
);

/**
 * @swagger
 * /uniappAPI/tools/wordreview/submitReview:
 *   post:
 *     tags: [用户-单词复习]
 *     summary: 提交单个单词的复习结果
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [wordId, quality]
 *             properties:
 *               wordId:
 *                 type: string
 *                 description: 单词ID
 *               quality:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 5
 *                 description: 复习质量评分（0-5）
 *     responses:
 *       200:
 *         description: 成功
 */
// 提交单个单词的复习结果
WordBookRouter.post(
  "/uniappAPI/tools/wordreview/submitReview",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordReviewController.submitReview,
);

/**
 * @swagger
 * /uniappAPI/tools/wordreview/batchSubmitReview:
 *   post:
 *     tags: [用户-单词复习]
 *     summary: 批量提交复习结果
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reviews]
 *             properties:
 *               reviews:
 *                 type: array
 *                 maxItems: 100
 *                 items:
 *                   type: object
 *                   required: [wordId, quality]
 *                   properties:
 *                     wordId:
 *                       type: string
 *                       description: 单词ID
 *                     quality:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 5
 *                       description: 复习质量评分（0-5）
 *                 description: 复习结果列表（单次最多100条）
 *     responses:
 *       200:
 *         description: 成功
 */
// 批量提交复习结果
WordBookRouter.post(
  "/uniappAPI/tools/wordreview/batchSubmitReview",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordReviewController.batchSubmitReview,
);

/**
 * @swagger
 * /uniappAPI/tools/wordreview/resetReviewProgress:
 *   post:
 *     tags: [用户-单词复习]
 *     summary: 重置单词本复习进度
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [wordBookId]
 *             properties:
 *               wordBookId:
 *                 type: string
 *                 description: 单词本ID
 *     responses:
 *       200:
 *         description: 成功
 */
// 重置单词本复习进度
WordBookRouter.post(
  "/uniappAPI/tools/wordreview/resetReviewProgress",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WordReviewController.resetReviewProgress,
);

module.exports = WordBookRouter;
