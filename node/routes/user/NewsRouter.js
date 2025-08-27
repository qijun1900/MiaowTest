var express = require('express');
const NewsController = require('../../controllers/user/NewsController');
var NewsRouter = express.Router();


//涉及文件上传
NewsRouter.get("/uniappAPI/Notice/getNoticeInfo", NewsController.getNoticeInfo)


module.exports = NewsRouter; 