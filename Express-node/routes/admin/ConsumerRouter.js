var express = require("express");
const ConsumerController = require("../../controllers/admin/ConsumerController");
const ConsumerRouter = express.Router();

/**
 * @swagger
 * /consumermessage/getcount:
 *   get:
 *     tags: [管理员-反馈]
 *     summary: 获取用户消息数量
 *     description: 获取用户消息数量，用来显示在消息图标上
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: 成功
 */
ConsumerRouter.get(
  "/adminapi/consumermessage/getcount",
  ConsumerController.GetMessageCount,
); // 获取用户消息数量，用来显示在消息图标上

/**
 * @swagger
 * /consumermessage/getlist:
 *   get:
 *     tags: [管理员-反馈]
 *     summary: 获取用户消息列表
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功
 */
ConsumerRouter.get(
  "/adminapi/consumermessage/getlist",
  ConsumerController.GetMessageList,
); // 获取用户消息列表

/**
 * @swagger
 * /consumermessage/handlefeedback:
 *   post:
 *     tags: [管理员-反馈]
 *     summary: 处理反馈
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 反馈ID
 *               status:
 *                 type: string
 *                 description: 处理状态
 *               reply:
 *                 type: string
 *                 description: 回复内容
 *     responses:
 *       200:
 *         description: 成功
 */
ConsumerRouter.post(
  "/adminapi/consumermessage/handlefeedback",
  ConsumerController.HandleFeedback,
); // 处理反馈

/**
 * @swagger
 * /consumermessage/deletefeedback:
 *   post:
 *     tags: [管理员-反馈]
 *     summary: 删除反馈
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 反馈ID
 *     responses:
 *       200:
 *         description: 成功
 */
ConsumerRouter.post(
  "/adminapi/consumermessage/deletefeedback",
  ConsumerController.DeleteFeedback,
); // 删除反馈

/**
 * @swagger
 * /consumer/getlist:
 *   get:
 *     tags: [管理员-用户管理]
 *     summary: 获取用户列表
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 每页数量
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 成功
 */
ConsumerRouter.get(
  "/adminapi/consumer/getlist",
  ConsumerController.GetConsumerList,
); // 获取用户列表

/**
 * @swagger
 * /exam/getAuthExamList:
 *   post:
 *     tags: [管理员-考试]
 *     summary: 获取认证要求的考试列表
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 用户ID
 *     responses:
 *       200:
 *         description: 成功
 */
ConsumerRouter.post(
  "/adminapi/exam/getAuthExamList",
  ConsumerController.GetAuthExamList,
); // 获取认证要求的考试列表

/**
 * @swagger
 * /exam/updateExamAuth:
 *   post:
 *     tags: [管理员-考试]
 *     summary: 为用户添加/删除认证考试
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 用户ID
 *               examId:
 *                 type: string
 *                 description: 考试ID
 *               action:
 *                 type: string
 *                 enum: [add, remove]
 *                 description: 操作类型
 *     responses:
 *       200:
 *         description: 成功
 */
ConsumerRouter.post(
  "/adminapi/exam/updateExamAuth",
  ConsumerController.updateExamAuthStatus,
); // 为用户添加/删除认证考试

module.exports = ConsumerRouter;
