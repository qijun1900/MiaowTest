var express = require("express");
var router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     tags: [系统]
 *     summary: API 欢迎信息
 *     description: 返回 API 欢迎消息、版本号和时间戳，可用于验证服务是否正常运行
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to the API ,you successfully connected to the server!
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get("/", function (req, res, next) {
  res.json({
    message: "Welcome to the API ,you successfully connected to the server!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
