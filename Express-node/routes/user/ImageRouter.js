var express = require("express");
const ImageController = require("../../controllers/user/ImageController");
const JWT = require("../../MiddleWares/jwt");
const requireUid = require("../../MiddleWares/requireUid");

var ImageRouter = express.Router();

/**
 * @swagger
 * /uniappAPI/upload/image:
 *   post:
 *     tags: [用户-图片]
 *     summary: 统一图片上传（可通过 biz 区分业务：wrongbook/notebook）
 *     security:
 *       - BearerAuth: []
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
 *                 description: 图片文件
 *               biz:
 *                 type: string
 *                 description: 业务类型（wrongbook/notebook）
 *     responses:
 *       200:
 *         description: 成功
 */
// 统一图片上传（可通过 biz 区分业务：wrongbook/notebook）
ImageRouter.post(
  "/uniappAPI/upload/image",
  JWT.verifyTokenMiddleware(),
  requireUid,
  ImageController.uploadImage,
);

/**
 * @swagger
 * /uniappAPI/upload/cloudImage:
 *   post:
 *     tags: [用户-图片]
 *     summary: 统一云托管图片上传（适用于小于100KB的图片）
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               base64:
 *                 type: string
 *                 description: 图片Base64编码
 *               biz:
 *                 type: string
 *                 description: 业务类型（wrongbook/notebook）
 *     responses:
 *       200:
 *         description: 成功
 */
// 统一云托管图片上传（可通过 biz 区分业务：wrongbook/notebook）
//此条路由是通过云托管服务器中转上传图片到阿里云oss，适用于小于100KB的图片（因为云托管请求限制文件大小小于100KB）
//如果是微信云托管服务器需要开启对象存储，直接在客户端上传到微信云存储
ImageRouter.post(
  "/uniappAPI/upload/cloudImage",
  JWT.verifyTokenMiddleware(),
  requireUid,
  ImageController.uploadCloudImage,
);

/**
 * @swagger
 * /uniappAPI/delete/image:
 *   post:
 *     tags: [用户-图片]
 *     summary: 统一图片删除（可通过 biz 区分业务：wrongbook/notebook）
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: 要删除的图片URL
 *               biz:
 *                 type: string
 *                 description: 业务类型（wrongbook/notebook）
 *     responses:
 *       200:
 *         description: 成功
 */
// 统一图片删除（可通过 biz 区分业务：wrongbook/notebook）
ImageRouter.post(
  "/uniappAPI/delete/image",
  JWT.verifyTokenMiddleware(),
  requireUid,
  ImageController.deleteImage,
);

module.exports = ImageRouter;
