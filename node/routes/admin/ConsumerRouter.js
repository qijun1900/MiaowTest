var express = require('express');
const ConsumerController = require('../../controllers/admin/ConsumerController');
const ConsumerRouter = express.Router();

ConsumerRouter.get("/adminapi/consumermessage/getcount",ConsumerController.GetMessageCount)// 获取用户消息数量，用来显示在消息图标上
ConsumerRouter.get("/adminapi/consumermessage/getlist",ConsumerController.GetMessageList)// 获取用户消息列表

module.exports = ConsumerRouter;