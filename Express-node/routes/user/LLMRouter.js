var express = require("express");
const LLMController = require("../../controllers/user/LLMController");
const JWT = require("../../MiddleWares/jwt");
const requireUid = require("../../MiddleWares/requireUid");
var LLMRouter = express.Router();

//用户与大模型对话接口
LLMRouter.post(
    "/uniappAPI/llm/agent/chat",
    JWT.verifyTokenMiddleware(),
    requireUid, 
    LLMController.Chat
); 
//获取已发布Agent列表
LLMRouter.get(
    "/uniappAPI/llm/agent/list",
    LLMController.getAgentList
); 

module.exports = LLMRouter;
