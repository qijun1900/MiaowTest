const LLMService = require("../../services/user/LLMService");

/**
 * 从请求中提取用户 ID，兼容 JWT 中间件解析的多种字段名。
 */
function extractUid(req) {
  return req.user?.uid || req.user?.id || req.user?._id;
}

// ─── SSE 工具 ────────────────────────────────────────────────────────────────

/**
 * 设置 SSE 响应头，禁用压缩和缓冲。
 * 调用后即可通过 sendEvent() 逐步推送事件。
 */
function setupSSEResponse(res) {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Content-Encoding", "identity");
  res.flushHeaders();
}

/**
 * 向 SSE 连接写入一个事件帧。
 * 格式：event: <name>\ndata: <json>\n\n
 */
function sendSSEEvent(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  if (typeof res.flush === "function") res.flush();
}

// ─── 控制器 ──────────────────────────────────────────────────────────────────

const LLMController = {
  /** 非流式对话接口 */
  Chat: async (req, res) => {
    try {
      const uid = extractUid(req);
      const { message, agentKey, conversationId } = req.body;

      if (!message || !agentKey) {
        return res.status(400).send({ success: false, error: "缺少必要参数" });
      }

      const response = await LLMService.ChatWithAgentAndSave({ uid, message, agentKey, conversationId });
      res.status(200).send({ success: true, data: response });
    } catch (error) {
      console.error("LLMController.Chat 错误:", error.message);
      res.status(500).send({ success: false, error: "LLM对话失败" });
    }
  },

  /** SSE 流式对话接口：逐 token 推送事件，适用于 H5 等支持 SSE 的平台 */
  ChatStream: async (req, res) => {
    const sendEvent = (event, data) => {
      console.log(`[SSE] >>> ${event}`, event === "message" ? `(token)` : JSON.stringify(data).substring(0, 80));
      sendSSEEvent(res, event, data);
    };

    try {
      const uid = extractUid(req);
      const { message, agentKey, conversationId } = req.body;

      if (!message || !agentKey) {
        return res.status(400).send({ success: false, error: "缺少必要参数" });
      }

      console.log("[SSE] ChatStream 收到请求, uid:", uid, "agentKey:", agentKey);
      setupSSEResponse(res);

      await LLMService.ChatWithAgentAndSaveStream({
        uid,
        message,
        agentKey,
        conversationId,
        onStart: (payload) => sendEvent("start", payload),
        onToken: (content) => sendEvent("message", { content }),
      });

      sendEvent("done", { done: true });
      res.end();
    } catch (error) {
      console.error("[SSE] ChatStream 错误:", error.message);
      if (!res.headersSent) {
        return res.status(500).send({ success: false, error: "LLM流式对话失败" });
      }
      sendEvent("error", { message: error.message || "LLM流式对话失败" });
      res.end();
    }
  },

  /** 获取已发布 Agent 列表 */
  getAgentList: async (req, res) => {
    try {
      const list = await LLMService.getChatAgents();
      res.status(200).send({ success: true, data: list });
    } catch (error) {
      console.error("LLMController.getAgentList 错误:", error.message);
      res.status(500).send({ success: false, error: "获取Agent列表失败" });
    }
  },

  /** 获取当前用户的会话列表 */
  getConversationList: async (req, res) => {
    try {
      const uid = extractUid(req);
      if (!uid) return res.status(401).send({ success: false, error: "未登录" });

      const favoritesOnly = req.query.favorites === "1";
      const list = await LLMService.getConversationList(uid, { favoritesOnly });
      res.status(200).send({ success: true, data: list });
    } catch (error) {
      console.error("LLMController.getConversationList 错误:", error.message);
      res.status(500).send({ success: false, error: "获取会话列表失败" });
    }
  },

  /** 重命名会话标题 */
  renameConversation: async (req, res) => {
    try {
      const uid = extractUid(req);
      const { conversationId } = req.params;
      const { title } = req.body;
      if (!uid) return res.status(401).send({ success: false, error: "未登录" });
      if (!conversationId || !title) return res.status(400).send({ success: false, error: "缺少必要参数" });

      const result = await LLMService.renameConversation(uid, conversationId, title);
      res.status(200).send({ success: true, data: result });
    } catch (error) {
      console.error("LLMController.renameConversation 错误:", error.message);
      res.status(500).send({ success: false, error: error.message || "重命名失败" });
    }
  },

  /** 软删除会话 */
  deleteConversation: async (req, res) => {
    try {
      const uid = extractUid(req);
      const { conversationId } = req.params;
      if (!uid) return res.status(401).send({ success: false, error: "未登录" });
      if (!conversationId) return res.status(400).send({ success: false, error: "缺少参数" });

      const result = await LLMService.deleteConversation(uid, conversationId);
      res.status(200).send({ success: true, data: result });
    } catch (error) {
      console.error("LLMController.deleteConversation 错误:", error.message);
      res.status(500).send({ success: false, error: error.message || "删除失败" });
    }
  },

  /** 获取指定会话的消息列表（分页） */
  getConversationMessages: async (req, res) => {
    try {
      const uid = extractUid(req);
      const { conversationId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      if (!uid) return res.status(401).send({ success: false, error: "未登录" });
      if (!conversationId) return res.status(400).send({ success: false, error: "缺少参数" });

      const result = await LLMService.getMessageList(uid, conversationId, { page, limit });
      res.status(200).send({
        success: true,
        data: result.messages,
        meta: { total: result.total, page: result.page, limit: result.limit },
      });
    } catch (error) {
      console.error("LLMController.getConversationMessages 错误:", error.message);
      res.status(500).send({ success: false, error: error.message || "获取消息列表失败" });
    }
  },

  /** 切换会话收藏状态 */
  toggleFavorite: async (req, res) => {
    try {
      const uid = extractUid(req);
      const { conversationId } = req.params;
      if (!uid) return res.status(401).send({ success: false, error: "未登录" });
      if (!conversationId) return res.status(400).send({ success: false, error: "缺少参数" });

      const result = await LLMService.toggleFavoriteConversation(uid, conversationId);
      res.status(200).send({ success: true, data: result });
    } catch (error) {
      console.error("LLMController.toggleFavorite 错误:", error.message);
      res.status(500).send({ success: false, error: error.message || "操作失败" });
    }
  },
};

module.exports = LLMController;
