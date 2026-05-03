var express = require("express");
const LLMController = require("../../controllers/user/LLMController");
var LLMRouter = express.Router();

LLMRouter.post("/uniappAPI/llm/agent/chat", LLMController.Chat); //用户与大模型对话接口
LLMRouter.get("/uniappAPI/llm/agent/list", LLMController.getAgentList); //获取已发布Agent列表

module.exports = LLMRouter;
