var express = require("express");
const AppVersionController = require("../../controllers/admin/AppVersionController");
var AppVersionRouter = express.Router();

// 用户端检查更新接口（无需登录）
AppVersionRouter.get("/uniappAPI/AppVersion/checkUpdate", AppVersionController.checkUpdate);
// 代理下载安装包（无需登录）
AppVersionRouter.get("/uniappAPI/AppVersion/download", AppVersionController.downloadVersion);

module.exports = AppVersionRouter;
