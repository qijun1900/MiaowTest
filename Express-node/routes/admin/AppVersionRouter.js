var express = require("express");
const AppVersionController = require("../../controllers/admin/AppVersionController");
var AppVersionRouter = express.Router();
const { upload, uploadToOSS } = require("../../helpers/uploadHelper");

// 版本管理接口（admin，需要登录）
AppVersionRouter.get("/adminapi/appversion/list", AppVersionController.getVersionList);
AppVersionRouter.post(
  "/adminapi/appversion/add",
  upload.single("file"),
  uploadToOSS("appversionuploads"),
  AppVersionController.addVersion,
);
AppVersionRouter.post(
  "/adminapi/appversion/edit",
  upload.single("file"),
  uploadToOSS("appversionuploads"),
  AppVersionController.editVersion,
);
AppVersionRouter.post("/adminapi/appversion/delete", AppVersionController.deleteVersion);
AppVersionRouter.post("/adminapi/appversion/deletemany", AppVersionController.deleteManyVersions);
AppVersionRouter.post("/adminapi/appversion/status", AppVersionController.updateStatus);

module.exports = AppVersionRouter;
