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

  getConversationList: async (req, res) => {
    try {
      const { uid } = req.user;
      if (!uid) {
        return res.status(401).send({ success: false, error: "未登录" });
      }
      const favoritesOnly = req.query.favorites === '1';
      const list = await LLMService.getConversationList(uid, { favoritesOnly });
      res.status(200).send({
        success: true,
        data: list
      });
    } catch (error) {
      console.error("LLMController.getConversationList 错误", error);
      res.status(500).send({ success: false, error: "获取会话列表失败" });
    }
  },

  renameConversation: async (req, res) => {
    try {
      const { uid } = req.user;
      const { conversationId } = req.params;
      const { title } = req.body;
      if (!uid) {
        return res.status(401).send({ success: false, error: "未登录" });
      }
      if (!conversationId || !title) {
        return res.status(400).send({ success: false, error: "缺少必要参数" });
      }
      const result = await LLMService.renameConversation(uid, conversationId, title);
      res.status(200).send({ success: true, data: result });
    } catch (error) {
      console.error("LLMController.renameConversation 错误", error);
      res.status(500).send({ success: false, error: error.message || "重命名失败" });
    }
  },

  deleteConversation: async (req, res) => {
    try {
      const { uid } = req.user;
      const { conversationId } = req.params;
      if (!uid) {
        return res.status(401).send({ success: false, error: "未登录" });
      }
      if (!conversationId) {
        return res.status(400).send({ success: false, error: "缺少参数" });
      }
      const result = await LLMService.deleteConversation(uid, conversationId);
      res.status(200).send({ success: true, data: result });
    } catch (error) {
      console.error("LLMController.deleteConversation 错误", error);
      res.status(500).send({ success: false, error: error.message || "删除失败" });
    }
  },

  getConversationMessages: async (req, res) => {
    try {
      const { uid } = req.user;
      const { conversationId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      if (!uid) {
        return res.status(401).send({ success: false, error: "未登录" });
      }
      if (!conversationId) {
        return res.status(400).send({ success: false, error: "缺少参数" });
      }
      const result = await LLMService.getMessageList(uid, conversationId, { page, limit });
      res.status(200).send({
        success: true,
        data: result.messages,
        meta: { total: result.total, page: result.page, limit: result.limit }
      });
    } catch (error) {
      console.error("LLMController.getConversationMessages 错误", error);
      res.status(500).send({ success: false, error: error.message || "获取消息列表失败" });
    }
  },

  toggleFavorite: async (req, res) => {
    try {
      const { uid } = req.user;
      const { conversationId } = req.params;
      if (!uid) {
        return res.status(401).send({ success: false, error: "未登录" });
      }
      if (!conversationId) {
        return res.status(400).send({ success: false, error: "缺少参数" });
      }
      const result = await LLMService.toggleFavoriteConversation(uid, conversationId);
      res.status(200).send({ success: true, data: result });
    } catch (error) {
      console.error("LLMController.toggleFavorite 错误", error);
      res.status(500).send({ success: false, error: error.message || "操作失败" });
    }
  },
};

module.exports = LLMController;
