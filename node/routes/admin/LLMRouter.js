var express = require('express');
const LLMController = require('../../controllers/admin/LLMController');
var LLMRouter = express.Router();

LLMRouter.post("/adminapi/model/addmodel",LLMController.addmodel)//新增模型
LLMRouter.get("/adminapi/model/getmodel",LLMController.getmodellist)//获取模型列表
LLMRouter.put("/adminapi/model/updatempdelinfo",LLMController.updatempdelinfo)//修改模型
LLMRouter.delete("/adminapi/model/deletemodel/:id",LLMController.deletemodel)//删除模型
LLMRouter.put("/adminapi/model/changestatus",LLMController.changestatus)//修改模型发布状态

module.exports = LLMRouter; 