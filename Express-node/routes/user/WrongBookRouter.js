var express = require("express");
const WrongBookController = require("../../controllers/user/WrongBookController");
const JWT = require("../../MiddleWares/jwt");
const requireUid = require("../../MiddleWares/requireUid");
var WrongBookRouter = express.Router();

/**
 * @swagger
 * /uniappAPI/tools/wrongbook/getWrongBooks:
 *   get:
 *     tags: [用户-错题本]
 *     summary: 获取错题本列表
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
// 获取错题本列表
WrongBookRouter.get(
  "/uniappAPI/tools/wrongbook/getWrongBooks",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WrongBookController.getWrongBooks,
);

/**
 * @swagger
 * /uniappAPI/tools/wrongbook/getWrongBookDetail:
 *   get:
 *     tags: [用户-错题本]
 *     summary: 获取错题本详情
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 错题本ID
 *     responses:
 *       200:
 *         description: 成功
 */
// 获取错题本详情
WrongBookRouter.get(
  "/uniappAPI/tools/wrongbook/getWrongBookDetail",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WrongBookController.getWrongBookDetail,
);

/**
 * @swagger
 * /uniappAPI/tools/wrongbook/createWrongBook:
 *   post:
 *     tags: [用户-错题本]
 *     summary: 创建错题本
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
 *                 description: 错题本标题
 *               color:
 *                 type: string
 *                 description: 颜色标识
 *     responses:
 *       200:
 *         description: 成功
 */
// 创建错题本
WrongBookRouter.post(
  "/uniappAPI/tools/wrongbook/createWrongBook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WrongBookController.createWrongBook,
);

/**
 * @swagger
 * /uniappAPI/tools/wrongbook/updateWrongBook:
 *   post:
 *     tags: [用户-错题本]
 *     summary: 更新错题本
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
 *                 description: 错题本ID
 *               title:
 *                 type: string
 *                 description: 错题本标题
 *               color:
 *                 type: string
 *                 description: 颜色标识
 *     responses:
 *       200:
 *         description: 成功
 */
// 更新错题本
WrongBookRouter.post(
  "/uniappAPI/tools/wrongbook/updateWrongBook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WrongBookController.updateWrongBook,
);

/**
 * @swagger
 * /uniappAPI/tools/wrongbook/deleteWrongBook:
 *   post:
 *     tags: [用户-错题本]
 *     summary: 删除错题本
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
 *                 description: 错题本ID
 *     responses:
 *       200:
 *         description: 成功
 */
// 删除错题本
WrongBookRouter.post(
  "/uniappAPI/tools/wrongbook/deleteWrongBook",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WrongBookController.deleteWrongBook,
);

/**
 * @swagger
 * /uniappAPI/tools/wrongbook/addWrongQuestion:
 *   post:
 *     tags: [用户-错题本]
 *     summary: 添加错题
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [wrongBookId, Type]
 *             properties:
 *               wrongBookId:
 *                 type: string
 *                 description: 错题本ID
 *               Type:
 *                 type: string
 *                 description: 题目类型
 *               questionSource:
 *                 type: string
 *                 description: 题目来源
 *               stem:
 *                 type: string
 *                 description: 题干
 *               options:
 *                 type: array
 *                 description: 选项
 *               correctAnswer:
 *                 type: string
 *                 description: 正确答案
 *               wrongAnswer:
 *                 type: string
 *                 description: 错误答案
 *               analysis:
 *                 type: string
 *                 description: 解析
 *               tags:
 *                 type: array
 *                 description: 标签
 *               difficulty:
 *                 type: number
 *                 description: 难度
 *     responses:
 *       200:
 *         description: 成功
 */
// 添加错题
WrongBookRouter.post(
  "/uniappAPI/tools/wrongbook/addWrongQuestion",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WrongBookController.addWrongQuestion,
);

/**
 * @swagger
 * /uniappAPI/tools/wrongbook/getWrongQuestions:
 *   get:
 *     tags: [用户-错题本]
 *     summary: 获取错题列表
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: wrongBookId
 *         required: true
 *         schema:
 *           type: string
 *         description: 错题本ID
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
 *         name: tag
 *         schema:
 *           type: string
 *         description: 标签筛选
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 状态筛选
 *     responses:
 *       200:
 *         description: 成功
 */
// 获取错题列表
WrongBookRouter.get(
  "/uniappAPI/tools/wrongbook/getWrongQuestions",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WrongBookController.getWrongQuestions,
);

/**
 * @swagger
 * /uniappAPI/tools/wrongbook/deleteWrongQuestion:
 *   post:
 *     tags: [用户-错题本]
 *     summary: 删除错题
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
 *                 description: 错题ID
 *     responses:
 *       200:
 *         description: 成功
 */
// 删除错题
WrongBookRouter.post(
  "/uniappAPI/tools/wrongbook/deleteWrongQuestion",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WrongBookController.deleteWrongQuestion,
);

/**
 * @swagger
 * /uniappAPI/tools/wrongbook/markAsMastered:
 *   post:
 *     tags: [用户-错题本]
 *     summary: 标记为已掌握
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
 *                 description: 错题ID
 *     responses:
 *       200:
 *         description: 成功
 */
// 标记为已掌握
WrongBookRouter.post(
  "/uniappAPI/tools/wrongbook/markAsMastered",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WrongBookController.markAsMastered,
);

/**
 * @swagger
 * /uniappAPI/tools/wrongbook/markAsNeedReview:
 *   post:
 *     tags: [用户-错题本]
 *     summary: 标记为需要复习
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
 *                 description: 错题ID
 *     responses:
 *       200:
 *         description: 成功
 */
//标记为需要复习
WrongBookRouter.post(
  "/uniappAPI/tools/wrongbook/markAsNeedReview",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WrongBookController.markAsNeedReview,
);

/**
 * @swagger
 * /uniappAPI/tools/wrongbook/getWrongQuestionDetail/{id}:
 *   get:
 *     tags: [用户-错题本]
 *     summary: 获取错题详情
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 错题ID
 *     responses:
 *       200:
 *         description: 成功
 */
// 获取错题详情
WrongBookRouter.get(
  "/uniappAPI/tools/wrongbook/getWrongQuestionDetail/:id",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WrongBookController.getWrongQuestionDetail,
);

/**
 * @swagger
 * /uniappAPI/tools/wrongbook/updateWrongQuestion:
 *   post:
 *     tags: [用户-错题本]
 *     summary: 更新错题
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
 *                 description: 错题ID
 *               wrongBookId:
 *                 type: string
 *                 description: 错题本ID
 *               Type:
 *                 type: string
 *                 description: 题目类型
 *               questionSource:
 *                 type: string
 *                 description: 题目来源
 *               stem:
 *                 type: string
 *                 description: 题干
 *               options:
 *                 type: array
 *                 description: 选项
 *               correctAnswer:
 *                 type: string
 *                 description: 正确答案
 *               wrongAnswer:
 *                 type: string
 *                 description: 错误答案
 *               analysis:
 *                 type: string
 *                 description: 解析
 *               tags:
 *                 type: array
 *                 description: 标签
 *               difficulty:
 *                 type: number
 *                 description: 难度
 *     responses:
 *       200:
 *         description: 成功
 */
// 更新错题
WrongBookRouter.post(
  "/uniappAPI/tools/wrongbook/updateWrongQuestion",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WrongBookController.updateWrongQuestion,
);

/**
 * @swagger
 * /uniappAPI/tools/wrongbook/getWrongBookStatistics:
 *   get:
 *     tags: [用户-错题本]
 *     summary: 获取错题统计
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
// 获取错题统计
WrongBookRouter.get(
  "/uniappAPI/tools/wrongbook/getWrongBookStatistics",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WrongBookController.getWrongBookStatistics,
);

/**
 * @swagger
 * /uniappAPI/tools/wrongbook/getUserTags:
 *   get:
 *     tags: [用户-错题本]
 *     summary: 获取用户所有已使用的标签
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: wrongBookId
 *         required: true
 *         schema:
 *           type: string
 *         description: 错题本ID
 *     responses:
 *       200:
 *         description: 成功
 */
// 获取用户所有已使用的标签
WrongBookRouter.get(
  "/uniappAPI/tools/wrongbook/getUserTags",
  JWT.verifyTokenMiddleware(),
  requireUid,
  WrongBookController.getUserTags,
);

module.exports = WrongBookRouter;
