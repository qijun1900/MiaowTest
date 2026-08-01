var express = require("express");
const LLMController = require("../../controllers/user/LLMController");
const JWT = require("../../MiddleWares/jwt");
const requireUid = require("../../MiddleWares/requireUid");
var LLMRouter = express.Router();

/**
 * @swagger
 * /uniappAPI/llm/agent/chat:
 *   post:
 *     tags: [用户-AI聊天]
 *     summary: 用户与大模型对话接口
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: 用户消息内容
 *               agentId:
 *                 type: string
 *                 description: Agent ID
 *               conversationId:
 *                 type: string
 *                 description: 会话ID（可选，不传则创建新会话）
 *     responses:
 *       200:
 *         description: 成功
 */
//用户与大模型对话接口
LLMRouter.post(
    "/uniappAPI/llm/agent/chat",
    JWT.verifyTokenMiddleware(),
    requireUid, 
    LLMController.Chat
);
/**
 * @swagger
 * /uniappAPI/llm/agent/chat/stream:
 *   post:
 *     tags: [用户-AI聊天]
 *     summary: 用户与大模型流式对话接口（SSE）
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: 用户消息内容
 *               agentId:
 *                 type: string
 *                 description: Agent ID
 *               conversationId:
 *                 type: string
 *                 description: 会话ID（可选，不传则创建新会话）
 *     responses:
 *       200:
 *         description: 成功（SSE 流式响应）
 */
//用户与大模型流式对话接口（SSE）
LLMRouter.post(
    "/uniappAPI/llm/agent/chat/stream",
    JWT.verifyTokenMiddleware(),
    requireUid,
    LLMController.ChatStream
);

/**
 * @swagger
 * /uniappAPI/llm/agent/list:
 *   get:
 *     tags: [用户-AI聊天]
 *     summary: 获取已发布Agent列表
 *     responses:
 *       200:
 *         description: 成功
 */
//获取已发布Agent列表
LLMRouter.get(
    "/uniappAPI/llm/agent/list",
    LLMController.getAgentList
); 

/**
 * @swagger
 * /uniappAPI/llm/agent/conversations:
 *   get:
 *     tags: [用户-会话]
 *     summary: 获取用户的Agent对话列表，搜索会话（按标题和消息预览模糊匹配）
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词（可选）
 *     responses:
 *       200:
 *         description: 成功
 */
//获取用户的Agent对话列表，搜索会话（按标题和消息预览模糊匹配）
LLMRouter.get(
    "/uniappAPI/llm/agent/conversations",
    JWT.verifyTokenMiddleware(),
    requireUid,
    LLMController.getConversationList
);

/**
 * @swagger
 * /uniappAPI/llm/agent/conversations/{conversationId}/rename:
 *   put:
 *     tags: [用户-会话]
 *     summary: 重命名会话标题
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: 会话ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 新的会话标题
 *     responses:
 *       200:
 *         description: 成功
 */
//重命名会话标题
LLMRouter.put(
    "/uniappAPI/llm/agent/conversations/:conversationId/rename",
    JWT.verifyTokenMiddleware(),
    requireUid,
    LLMController.renameConversation
);

/**
 * @swagger
 * /uniappAPI/llm/agent/conversations/{conversationId}:
 *   delete:
 *     tags: [用户-会话]
 *     summary: 删除会话
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: 会话ID
 *     responses:
 *       200:
 *         description: 成功
 */
//删除会话
LLMRouter.delete(
    "/uniappAPI/llm/agent/conversations/:conversationId",
    JWT.verifyTokenMiddleware(),
    requireUid,
    LLMController.deleteConversation
);

/**
 * @swagger
 * /uniappAPI/llm/agent/conversations/{conversationId}/messages:
 *   get:
 *     tags: [用户-会话]
 *     summary: 获取具体会话的历史消息
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: 会话ID
 *     responses:
 *       200:
 *         description: 成功
 */
//获取具体会话的历史消息
LLMRouter.get(
    "/uniappAPI/llm/agent/conversations/:conversationId/messages",
    JWT.verifyTokenMiddleware(),
    requireUid,
    LLMController.getConversationMessages
);

/**
 * @swagger
 * /uniappAPI/llm/agent/conversations/{conversationId}/favorite:
 *   put:
 *     tags: [用户-会话]
 *     summary: 收藏/取消收藏会话
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: 会话ID
 *     responses:
 *       200:
 *         description: 成功
 */
//收藏/取消收藏会话
LLMRouter.put(
    "/uniappAPI/llm/agent/conversations/:conversationId/favorite",
    JWT.verifyTokenMiddleware(),
    requireUid,
    LLMController.toggleFavorite
);

module.exports = LLMRouter;
