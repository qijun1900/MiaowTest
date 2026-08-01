const express = require("express");
const AgentController = require("../../controllers/admin/AgentController");
const AgentRouter = express.Router();

/**
 * @swagger
 * /agent/addagent:
 *   post:
 *     tags: [管理员-Agent]
 *     summary: 添加智能体
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 智能体名称
 *               description:
 *                 type: string
 *                 description: 智能体描述
 *               prompt:
 *                 type: string
 *                 description: 系统提示词
 *     responses:
 *       200:
 *         description: 成功
 */
AgentRouter.post("/adminapi/agent/addagent", AgentController.addAgent);

/**
 * @swagger
 * /agent/getagentlist:
 *   get:
 *     tags: [管理员-Agent]
 *     summary: 获取智能体列表
 *     security: [{ BearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功
 */
AgentRouter.get("/adminapi/agent/getagentlist", AgentController.getAgentList);

/**
 * @swagger
 * /agent/updateagent:
 *   post:
 *     tags: [管理员-Agent]
 *     summary: 更新智能体
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 智能体ID
 *               name:
 *                 type: string
 *                 description: 智能体名称
 *               description:
 *                 type: string
 *                 description: 智能体描述
 *               prompt:
 *                 type: string
 *                 description: 系统提示词
 *     responses:
 *       200:
 *         description: 成功
 */
AgentRouter.post("/adminapi/agent/updateagent", AgentController.updateAgent);

/**
 * @swagger
 * /agent/deloneagent:
 *   post:
 *     tags: [管理员-Agent]
 *     summary: 删除单个智能体
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 智能体ID
 *     responses:
 *       200:
 *         description: 成功
 */
AgentRouter.post("/adminapi/agent/deloneagent", AgentController.deleteOneAgent);

/**
 * @swagger
 * /agent/delmanyagent:
 *   post:
 *     tags: [管理员-Agent]
 *     summary: 批量删除智能体
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 智能体ID列表
 *     responses:
 *       200:
 *         description: 成功
 */
AgentRouter.post(
  "/adminapi/agent/delmanyagent",
  AgentController.deleteManyAgent,
);

/**
 * @swagger
 * /agent/changestatus:
 *   post:
 *     tags: [管理员-Agent]
 *     summary: 切换智能体状态
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 智能体ID
 *               status:
 *                 type: boolean
 *                 description: 目标状态
 *     responses:
 *       200:
 *         description: 成功
 */
AgentRouter.post("/adminapi/agent/changestatus", AgentController.changeStatus);

/**
 * @swagger
 * /agent/chat:
 *   post:
 *     tags: [管理员-Agent]
 *     summary: 使用智能体对话
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agentId:
 *                 type: string
 *                 description: 智能体ID
 *               message:
 *                 type: string
 *                 description: 用户消息
 *     responses:
 *       200:
 *         description: 成功
 */
AgentRouter.post("/adminapi/agent/chat", AgentController.useAgentChat);

/**
 * @swagger
 * /agent/getchatagents:
 *   get:
 *     tags: [管理员-Agent]
 *     summary: 获取可对话的智能体列表
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: 成功
 */
AgentRouter.get("/adminapi/agent/getchatagents", AgentController.getChatAgents);

module.exports = AgentRouter;
