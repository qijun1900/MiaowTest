var express = require("express");
const ActivityController = require("../../controllers/user/ActivityController");
const JWT = require("../../MiddleWares/jwt");
var ActivityRouter = express.Router();

/**
 * @swagger
 * /uniappAPI/Activity/addUserActivity:
 *   post:
 *     tags: [用户-活动]
 *     summary: 记录用户业务活动
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 description: 活动行为类型
 *               metadata:
 *                 type: object
 *                 description: 附加元数据
 *     responses:
 *       200:
 *         description: 成功
 */
// 记录用户业务活动。
ActivityRouter.post(
  "/uniappAPI/Activity/addUserActivity",
  JWT.verifyTokenMiddleware(),
  ActivityController.addUserActivity,
);

/**
 * @swagger
 * /uniappAPI/Activity/getActivityHeatmap:
 *   get:
 *     tags: [用户-活动]
 *     summary: 获取用户活动热力图数据
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
// 获取用户活动热力图数据。
ActivityRouter.get(
  "/uniappAPI/Activity/getActivityHeatmap",
  JWT.verifyTokenMiddleware(),
  ActivityController.getActivityHeatmap,
);

/**
 * @swagger
 * /uniappAPI/Activity/getActivityByDate:
 *   get:
 *     tags: [用户-活动]
 *     summary: 获取指定日期的用户活动明细
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         description: 日期（格式如 2024-01-01）
 *     responses:
 *       200:
 *         description: 成功
 */
// 获取指定日期的用户活动明细。
ActivityRouter.get(
  "/uniappAPI/Activity/getActivityByDate",
  JWT.verifyTokenMiddleware(),
  ActivityController.getActivityByDate,
);

module.exports = ActivityRouter;
