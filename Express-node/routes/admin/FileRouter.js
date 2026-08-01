const express = require("express");
const FileController = require("../../controllers/admin/FileController");
const FileRouter = express.Router();
const { upload, uploadToOSS } = require("../../helpers/uploadHelper");

/**
 * @swagger
 * /adminapi/admin/file/upload:
 *   post:
 *     tags: [管理员-文件]
 *     summary: 上传文件
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
 *                 description: 上传的文件
 *     responses:
 *       200:
 *         description: 成功
 */
FileRouter.post(
  "/adminapi/admin/file/upload",
  upload.single("file"),
  uploadToOSS("fileresource"),
  FileController.uploadFile,
);
/**
 * @swagger
 * /adminapi/admin/file/tags:
 *   get:
 *     tags: [管理员-文件]
 *     summary: 获取业务标签数组
 *     responses:
 *       200:
 *         description: 成功
 */
FileRouter.get("/adminapi/admin/file/tags", FileController.getTags);
/**
 * @swagger
 * /adminapi/admin/file/list:
 *   get:
 *     tags: [管理员-文件]
 *     summary: 获取资源列表
 *     responses:
 *       200:
 *         description: 成功
 */
FileRouter.get("/adminapi/admin/file/list", FileController.getFileList);
/**
 * @swagger
 * /adminapi/admin/file/deleteone:
 *   post:
 *     tags: [管理员-文件]
 *     summary: 删除文件资源
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 文件资源ID
 *     responses:
 *       200:
 *         description: 成功
 */
FileRouter.post("/adminapi/admin/file/deleteone", FileController.deleteFile);
/**
 * @swagger
 * /adminapi/admin/file/update:
 *   post:
 *     tags: [管理员-文件]
 *     summary: 更新（替换）文件资源信息
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
 *                 description: 替换的文件
 *               id:
 *                 type: string
 *                 description: 文件资源ID
 *     responses:
 *       200:
 *         description: 成功
 */
FileRouter.post(
  "/adminapi/admin/file/update",
  upload.single("file"),
  uploadToOSS("fileresource"),
  FileController.updateFile,
);
/**
 * @swagger
 * /adminapi/admin/file/change-status:
 *   post:
 *     tags: [管理员-文件]
 *     summary: 更改文件资源状态
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 文件资源ID
 *               status:
 *                 type: string
 *                 description: 目标状态
 *     responses:
 *       200:
 *         description: 成功
 */
FileRouter.post(
  "/adminapi/admin/file/change-status",
  FileController.changeFileStatus,
);

module.exports = FileRouter;
