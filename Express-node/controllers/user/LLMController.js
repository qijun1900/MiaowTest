const llm = require("../../llm/index");

const LLMController = {
  Chat : async (req, res) => {
    try {
      console.log("LLMController.Chat 请求体：", req.body);
      const { message } = req.body;
      console.log("收到消息：", message);
      const response = await llm.useChat(message, "qwen-plus");
      console.log("模型回复：", response);
      res.json({ success: true, data: response });
    } catch (error) {
      console.error("LLMController.Chat 错误", error);
      res.status(500).json({ success: false, error: "LLM对话失败" });
    }
  }
};

module.exports = LLMController;
