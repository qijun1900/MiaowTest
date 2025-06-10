var express = require('express');
const LLMController = require('../../controllers/web/LLMController');
var LLMRouter = express.Router();

LLMRouter.post("/webapi/chat/ExamAIanalyse/psotExamAIanalyse",LLMController.sendExamAIanalyse)//调用大模型获得题目解析
LLMRouter.post("/webapi/UserChat/postUserChat",LLMController.UserChat)//用户与大模型对话接口
LLMRouter.get("/webapi/llm/getChooseLLMList",LLMController.getLLMList)//获取大模型列表给用户选择

module.exports = LLMRouter;
