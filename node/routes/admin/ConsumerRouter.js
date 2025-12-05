var express = require('express');
const ConsumerController = require('../../controllers/admin/ConsumerController');
const ConsumerRouter = express.Router();

ConsumerRouter.get("/adminapi/consumermessage/getcount",ConsumerController.GetMessageCount)// 获取用户消息数量，用来显示在消息图标上
ConsumerRouter.get("/adminapi/consumermessage/getlist",ConsumerController.GetMessageList)// 获取用户消息列表
ConsumerRouter.post("/adminapi/consumermessage/handlefeedback",ConsumerController.HandleFeedback)// 处理反馈
ConsumerRouter.post("/adminapi/consumermessage/deletefeedback",ConsumerController.DeleteFeedback)// 删除反馈
ConsumerRouter.get("/adminapi/consumer/getlist",ConsumerController.GetConsumerList)// 获取用户列表
ConsumerRouter.post("/adminapi/exam/getAuthExamList",ConsumerController.GetAuthExamList)// 获取认证要求的考试列表
ConsumerRouter.post("/adminapi/exam/updateExamAuth",ConsumerController.updateExamAuthStatus)// 为用户添加/删除认证考试

module.exports = ConsumerRouter;