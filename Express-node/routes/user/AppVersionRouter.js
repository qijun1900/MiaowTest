var express = require("express");
const AppVersionController = require("../../controllers/admin/AppVersionController");
var AppVersionRouter = express.Router();

/**
 * @swagger
 * /uniappAPI/AppVersion/checkUpdate:
 *   get:
 *     tags: [用户-版本]
 *     summary: 用户端检查更新接口（无需登录）
 *     parameters:
 *       - in: query
 *         name: version
 *         schema:
 *           type: string
 *         description: 当前客户端版本号
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: 平台类型（如 android/ios）
 *     responses:
 *       200:
 *         description: 成功
 */
// 用户端检查更新接口（无需登录）
AppVersionRouter.get("/uniappAPI/AppVersion/checkUpdate", AppVersionController.checkUpdate);
/**
 * @swagger
 * /uniappAPI/AppVersion/download:
 *   get:
 *     tags: [用户-版本]
 *     summary: 代理下载安装包（无需登录）
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: 安装包下载地址
 *     responses:
 *       200:
 *         description: 成功（返回文件流）
 */
// 代理下载安装包（无需登录）
AppVersionRouter.get("/uniappAPI/AppVersion/download", AppVersionController.downloadVersion);

module.exports = AppVersionRouter;
