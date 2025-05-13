var express = require('express');
const NewsController = require('../../controllers/web/NewsController');
var NewsRouter = express.Router();


//涉及文件上传
NewsRouter.get("/webapi/Notice/getNoticInfo", NewsController.getNoticeInfo)


module.exports = NewsRouter; 