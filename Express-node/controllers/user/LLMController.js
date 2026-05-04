const llm = require("../../llm/index");
const LLMService = require("../../services//user/LLMService");

const LLMController = {
  Chat: async (req, res) => {
    try {
      console.log("LLMController.Chat 请求体：", req.body);
      // 从上下文中获取 Uid，若无则给默认兜底（请确保路由层已应用校验中间件/Token解析）
      const { uid } = req.user || { uid: "640000000000000000000000" };
      console.log("LLMController.Chat 解析到的 Uid：", uid);
      const { message, agentKey, conversationId } = req.body;
      
      if (!message || !agentKey) {
        return res.status(400).send({ success: false, error: "缺少必要参数" });
      }

      console.log("收到消息：", message, " Agent:", agentKey, " 会话:", conversationId);
      
      const response = await LLMService.ChatWithAgentAndSave({uid, message, agentKey, conversationId});
      
      console.log("模型回复处理完成，产生会话ID：", response.conversationId);
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
