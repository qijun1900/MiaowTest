var express = require("express");
const LLMController = require("../../controllers/admin/LLMController");
var LLMRouter = express.Router();

LLMRouter.post(
  "/adminapi/modelapp/batchaddquestion",
  LLMController.BatchaddQuestion,
); //智能体批量导入题目
LLMRouter.post(
  "/adminapi/modelapp/getquestionanalysis",
  LLMController.getQuestionAnalysis,
); //智能体获取题目解析
module.exports = LLMRouter;
