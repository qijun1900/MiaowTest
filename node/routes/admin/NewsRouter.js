var express = require('express');
const NewsController = require('../../controllers/admin/NewsController');
var NewsRouter = express.Router();
const multer  = require('multer')
const upload = multer({ dest: 'public/newsuploads/' })


//新
NewsRouter.post("/adminapi/announcement/add",upload.single('file'),NewsController.addAnnouncement)//添加通知公告
NewsRouter.get("/adminapi/announcement/list",NewsController.getAnnouncementList)//获取通知公告列表
NewsRouter.post("/adminapi/announcement/deloneannouncement",NewsController.DeleteOneAnnouncement)//删除单个信息
NewsRouter.post("/adminapi/announcement/delmanyannouncement",NewsController.DeleteManyAnnouncement)//删除多个信息
NewsRouter.post("/adminapi/announcement/updatestatus",NewsController.updateStatus)//修改通知公告发布状态


module.exports = NewsRouter; 