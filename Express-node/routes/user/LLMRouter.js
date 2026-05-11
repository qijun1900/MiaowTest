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

//获取用户的Agent对话列表
LLMRouter.get(
    "/uniappAPI/llm/agent/conversations",
    JWT.verifyTokenMiddleware(),
    requireUid,
    LLMController.getConversationList
);

//重命名会话标题
LLMRouter.put(
    "/uniappAPI/llm/agent/conversations/:conversationId/rename",
    JWT.verifyTokenMiddleware(),
    requireUid,
    LLMController.renameConversation
);

//删除会话
LLMRouter.delete(
    "/uniappAPI/llm/agent/conversations/:conversationId",
    JWT.verifyTokenMiddleware(),
    requireUid,
    LLMController.deleteConversation
);

//获取具体会话的历史消息
LLMRouter.get(
    "/uniappAPI/llm/agent/conversations/:conversationId/messages",
    JWT.verifyTokenMiddleware(),
    requireUid,
    LLMController.getConversationMessages
);

//收藏/取消收藏会话
LLMRouter.put(
    "/uniappAPI/llm/agent/conversations/:conversationId/favorite",
    JWT.verifyTokenMiddleware(),
    requireUid,
    LLMController.toggleFavorite
);

module.exports = LLMRouter;
