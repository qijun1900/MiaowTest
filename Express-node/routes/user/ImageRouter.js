var express = require("express");
const ImageController = require("../../controllers/user/ImageController");
const JWT = require("../../MiddleWares/jwt");
const requireUid = require("../../MiddleWares/requireUid");

var ImageRouter = express.Router();

// 统一图片上传（可通过 biz 区分业务：wrongbook/notebook）
ImageRouter.post(
  "/uniappAPI/upload/image",
  JWT.verifyTokenMiddleware(),
  requireUid,
  ImageController.uploadImage,
);

// 统一云托管图片上传（可通过 biz 区分业务：wrongbook/notebook）
//此条路由是通过云托管服务器中转上传图片到阿里云oss，适用于小于100KB的图片（因为云托管请求限制文件大小小于100KB）
//如果是微信云托管服务器需要开启对象存储，直接在客户端上传到微信云存储
ImageRouter.post(
  "/uniappAPI/upload/cloudImage",
  JWT.verifyTokenMiddleware(),
  requireUid,
  ImageController.uploadCloudImage,
);

// 统一图片删除（可通过 biz 区分业务：wrongbook/notebook）
ImageRouter.post(
  "/uniappAPI/delete/image",
  JWT.verifyTokenMiddleware(),
  requireUid,
  ImageController.deleteImage,
);

module.exports = ImageRouter;
