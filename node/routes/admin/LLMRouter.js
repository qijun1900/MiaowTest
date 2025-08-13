var express = require('express');
const LLMController = require('../../controllers/admin/LLMController');
var LLMRouter = express.Router();

LLMRouter.post("/adminapi/model/addmodel",LLMController.addmodel)//新增模型
LLMRouter.get("/adminapi/model/getmodelList",LLMController.getmodellist)//获取模型列表
LLMRouter.post("/adminapi/model/updateModel",LLMController.updateModel)//修改更新模型
LLMRouter.post("/adminapi/model/deloneModel",LLMController.deleteOnemodel)//删除单个模型
LLMRouter.post("/adminapi/model/delmanyModel",LLMController.deleteManymodel)//删除多个模型
LLMRouter.post("/adminapi/model/updateModelPublishStatus",LLMController.changestatus)//修改模型发布状态
LLMRouter.post("/adminapi/caht/test",LLMController.testChatModel)//测试接口
LLMRouter.get("/adminapi/caht/get/getChatModelsList",LLMController.getChatModels)//获取对话模型列表

module.exports = LLMRouter; 