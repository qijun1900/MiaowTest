var express = require("express");
const LogController = require("../../controllers/user/LogController");
const JWT = require("../../MiddleWares/jwt");
var LogRouter = express.Router();

/**
 * @swagger
 * /uniappAPI/Log/reportActions:
 *   post:
 *     tags: [用户-日志]
 *     summary: 用户端行为日志上报（支持批量，允许匿名上报）
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actions:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: 行为日志数组
 *     responses:
 *       200:
 *         description: 成功
 */
// 允许匿名上报（未登录用户也可记录行为），登录后自动关联 uid。
LogRouter.post(
  "/uniappAPI/Log/reportActions",
  JWT.optionalTokenMiddleware(),
  LogController.reportActions,
); // 用户端行为日志上报（支持批量）

/**
 * @swagger
 * /uniappAPI/Log/reportError:
 *   post:
 *     tags: [用户-日志]
 *     summary: 用户端异常日志上报
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: object
 *                 description: 异常信息
 *     responses:
 *       200:
 *         description: 成功
 */
// 前端异常日志上报接口。
LogRouter.post(
  "/uniappAPI/Log/reportError",
  JWT.optionalTokenMiddleware(),
  LogController.reportError,
); // 用户端异常日志上报

module.exports = LogRouter;
