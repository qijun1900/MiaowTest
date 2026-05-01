const LLMService = require("../../services/admin/LLMService");

const LLMController = {
  BatchaddQuestion: async (req, res) => {
    const { message, examId, category } = req.body;
    const result = await LLMService.BatchaddQuestion(message, examId, category);
    res.status(200).send({
      code: 200,
      ActionType: "OK",
      data: result,
    });
  },
  getQuestionAnalysis: async (req, res) => {
    const { message, questionType, _id } = req.body;
    const result = await LLMService.getQuestionAnalysis(
      message,
      questionType,
      _id,
    );
    console.log(result);
    res.status(200).send({
      code: 200,
      ActionType: "OK",
      data: result,
    });
  },
};

module.exports = LLMController;
