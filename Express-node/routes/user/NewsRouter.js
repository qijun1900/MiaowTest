var express = require("express");
const NewsController = require("../../controllers/user/NewsController");
var NewsRouter = express.Router();

/**
 * @swagger
 * /uniappAPI/Notice/getNoticeInfo:
 *   get:
 *     tags: [用户-公告]
 *     summary: 获取公告信息
 *     responses:
 *       200:
 *         description: 成功
 */
//涉及文件上传
NewsRouter.get("/uniappAPI/Notice/getNoticeInfo", NewsController.getNoticeInfo);
/**
 * @swagger
 * /uniappAPI/Banner/getIndexBanner:
 *   get:
 *     tags: [用户-公告]
 *     summary: 获取首页轮播图
 *     responses:
 *       200:
 *         description: 成功
 */
NewsRouter.get(
  "/uniappAPI/Banner/getIndexBanner",
  NewsController.getIndexBanner,
);

module.exports = NewsRouter;
