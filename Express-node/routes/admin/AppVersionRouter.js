var express = require("express");
const AppVersionController = require("../../controllers/admin/AppVersionController");
var AppVersionRouter = express.Router();
const { upload, uploadToOSS } = require("../../helpers/uploadHelper");

// 版本管理接口（admin，需要登录）
/**
 * @swagger
 * /adminapi/appversion/list:
 *   get:
 *     tags: [管理员-版本]
 *     summary: 获取版本列表
 *     responses:
 *       200:
 *         description: 成功
 */
AppVersionRouter.get("/adminapi/appversion/list", AppVersionController.getVersionList);
/**
 * @swagger
 * /adminapi/appversion/add:
 *   post:
 *     tags: [管理员-版本]
 *     summary: 新增版本
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 版本安装包文件
 *               version:
 *                 type: string
 *                 description: 版本号
 *               description:
 *                 type: string
 *                 description: 版本描述
 *     responses:
 *       200:
 *         description: 成功
 */
AppVersionRouter.post(
  "/adminapi/appversion/add",
  upload.single("file"),
  uploadToOSS("appversionuploads"),
  AppVersionController.addVersion,
);
/**
 * @swagger
 * /adminapi/appversion/edit:
 *   post:
 *     tags: [管理员-版本]
 *     summary: 编辑版本
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 版本安装包文件
 *               id:
 *                 type: string
 *                 description: 版本ID
 *               version:
 *                 type: string
 *                 description: 版本号
 *               description:
 *                 type: string
 *                 description: 版本描述
 *     responses:
 *       200:
 *         description: 成功
 */
AppVersionRouter.post(
  "/adminapi/appversion/edit",
  upload.single("file"),
  uploadToOSS("appversionuploads"),
  AppVersionController.editVersion,
);
/**
 * @swagger
 * /adminapi/appversion/delete:
 *   post:
 *     tags: [管理员-版本]
 *     summary: 删除版本
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 版本ID
 *     responses:
 *       200:
 *         description: 成功
 */
AppVersionRouter.post("/adminapi/appversion/delete", AppVersionController.deleteVersion);
/**
 * @swagger
 * /adminapi/appversion/deletemany:
 *   post:
 *     tags: [管理员-版本]
 *     summary: 批量删除版本
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 版本ID列表
 *     responses:
 *       200:
 *         description: 成功
 */
AppVersionRouter.post("/adminapi/appversion/deletemany", AppVersionController.deleteManyVersions);
/**
 * @swagger
 * /adminapi/appversion/status:
 *   post:
 *     tags: [管理员-版本]
 *     summary: 更新版本状态
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 版本ID
 *               status:
 *                 type: string
 *                 description: 目标状态
 *     responses:
 *       200:
 *         description: 成功
 */
AppVersionRouter.post("/adminapi/appversion/status", AppVersionController.updateStatus);

module.exports = AppVersionRouter;
