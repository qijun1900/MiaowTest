var express = require('express');
const NewsController = require('../../controllers/web/NewsController');
var NewsRouter = express.Router();


//涉及文件上传
NewsRouter.get('/webapi/news/list',NewsController.getList)
NewsRouter.get('/webapi/news/list/:id',NewsController.getList)
NewsRouter.get('/webapi/news/toplist',NewsController.getTopList)



module.exports = NewsRouter; 