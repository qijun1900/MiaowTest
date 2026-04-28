var express = require("express");
const LLMController = require("../../controllers/user/LLMController");
var LLMRouter = express.Router();

LLMRouter.post("/uniappAPI/llm/chat", LLMController.chat); //用户与大模型对话接口

module.exports = LLMRouter;
