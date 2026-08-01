var express = require("express");
const LLMController = require("../../controllers/admin/LLMController");
var LLMRouter = express.Router();

/**
 * @swagger
 * /modelapp/batchaddquestion:
 *   post:
 *     tags: [管理员-LLM]
 *     summary: 智能体批量导入题目
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               examId:
 *                 type: string
 *                 description: 考试ID
 *               questions:
 *                 type: array
 *                 description: 题目列表
 *     responses:
 *       200:
 *         description: 成功
 */
LLMRouter.post(
  "/adminapi/modelapp/batchaddquestion",
  LLMController.BatchaddQuestion,
); //智能体批量导入题目

/**
 * @swagger
 * /modelapp/getquestionanalysis:
 *   post:
 *     tags: [管理员-LLM]
 *     summary: 智能体获取题目解析
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *                 description: 题目ID
 *               questionType:
 *                 type: string
 *                 description: 题目类型
 *     responses:
 *       200:
 *         description: 成功
 */
LLMRouter.post(
  "/adminapi/modelapp/getquestionanalysis",
  LLMController.getQuestionAnalysis,
); //智能体获取题目解析
module.exports = LLMRouter;
