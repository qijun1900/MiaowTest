const llm = require("../../llm/index");
const LLMService = require("../../services//user/LLMService");

const LLMController = {
  Chat: async (req, res) => {
    try {
      console.log("LLMController.Chat 请求体：", req.body);
      // 支持传 messages 数组或者单条 message
      let { message, messages, agentKey } = req.body;
      
      // 统一构建格式给 runAgentChain (数组形式 [{role: 'user', content: '...'}])
      if (!messages && message) {
        messages = [{ role: 'user', content: message }];
      }

      console.log("收到消息：", messages);
      const response = await LLMService.ChatWithAgent(messages, agentKey);
      console.log("模型回复：", response);
      res.status(200).send({ success: true, data: response });
    } catch (error) {
      console.error("LLMController.Chat 错误", error);
      res.status(500).send({ success: false, error: "LLM对话失败" });
    }
  },

  getAgentList: async (req, res) => {
    try {
      const list = await LLMService.getChatAgents();
      res.status(200).send({
        success: true, data: list
      });
    } catch (error) {
      console.error("LLMController.getAgentList 错误", error);
      res.status(500).json({ success: false, error: "获取Agent列表失败" });
    }
  },
};

module.exports = LLMController;
