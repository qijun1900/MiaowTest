var express = require("express");
const NewsController = require("../../controllers/admin/NewsController");
var NewsRouter = express.Router();
const { upload, uploadToOSS } = require("../../helpers/uploadHelper");

/**
 * @swagger
 * /adminapi/announcement/add:
 *   post:
 *     tags: [管理员-公告]
 *     summary: 添加通知公告
 *     security: [{ BearerAuth: [] }]
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
 *                 description: 公告附件
 *     responses:
 *       200:
 *         description: 成功
 */
NewsRouter.post(
  "/adminapi/announcement/add",
  upload.single("file"),
  uploadToOSS("newsuploads"),
  NewsController.addAnnouncement,
); //添加通知公告
/**
 * @swagger
 * /adminapi/announcement/list:
 *   get:
 *     tags: [管理员-公告]
 *     summary: 获取通知公告列表
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: 成功
 */
NewsRouter.get(
  "/adminapi/announcement/list",
  NewsController.getAnnouncementList,
); //获取通知公告列表
/**
 * @swagger
 * /adminapi/announcement/deloneannouncement:
 *   post:
 *     tags: [管理员-公告]
 *     summary: 删除单个通知公告
 *     security: [{ BearerAuth: [] }]
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
 *                 description: 公告ID
 *     responses:
 *       200:
 *         description: 成功
 */
NewsRouter.post(
  "/adminapi/announcement/deloneannouncement",
  NewsController.DeleteOneAnnouncement,
); //删除单个信息
/**
 * @swagger
 * /adminapi/announcement/delmanyannouncement:
 *   post:
 *     tags: [管理员-公告]
 *     summary: 批量删除通知公告
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 公告ID列表
 *     responses:
 *       200:
 *         description: 成功
 */
NewsRouter.post(
  "/adminapi/announcement/delmanyannouncement",
  NewsController.DeleteManyAnnouncement,
); //删除多个信息
/**
 * @swagger
 * /adminapi/announcement/updatestatus:
 *   post:
 *     tags: [管理员-公告]
 *     summary: 修改通知公告发布状态
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, status]
 *             properties:
 *               id:
 *                 type: string
 *                 description: 公告ID
 *               status:
 *                 type: number
 *                 description: 发布状态
 *     responses:
 *       200:
 *         description: 成功
 */
NewsRouter.post(
  "/adminapi/announcement/updatestatus",
  NewsController.updateStatus,
); //修改通知公告发布状态
/**
 * @swagger
 * /adminapi/announcement/edit:
 *   post:
 *     tags: [管理员-公告]
 *     summary: 编辑通知公告
 *     security: [{ BearerAuth: [] }]
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
 *                 description: 公告附件
 *     responses:
 *       200:
 *         description: 成功
 */
NewsRouter.post(
  "/adminapi/announcement/edit",
  upload.single("file"),
  uploadToOSS("newsuploads"),
  NewsController.editAnnouncement,
); //编辑通知公告

module.exports = NewsRouter;
