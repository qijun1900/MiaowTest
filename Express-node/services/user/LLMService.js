const AgentDefinitionModel = require("../../models/AgentDefinitionModel");
const AgentConversationModel = require("../../models/AgentConversationModel");
const AgentMessageModel = require("../../models/AgentMessageModel");
const { runAgentChain, streamAgentChain, generateConversationTitle } = require("../../llm/chains/agent/agentChat")/** 每次送入 LLM 的历史消息上限，防止上下文过长 */
const HISTORY_MESSAGE_LIMIT = 20;

// ─── 内部共享方法 ────────────────────────────────────────────────────────────

/**
 * 查找已发布的 Agent 配置，不存在则抛错。
 */
async function getAgentConfig(agentKey) {
  const config = await AgentDefinitionModel.findOne({ agentKey, isPublish: 1 });
  if (!config) throw new Error("Agent不存在或未发布");
  return config;
}

/**
 * 确保会话存在：新建或更新已有会话，返回 { convId, sequence }。
 * 新建时 sequence 从 0 开始；已有时从最后一条消息的 sequence + 1 继续。
 */
async function ensureConversation(convId, uid, agentKey, agentConfig, userMessage, images) {
  const displayText = userMessage || (images?.length ? "[图片消息]" : "");
  if (!convId) {
    const newConv = await AgentConversationModel.create({
      Uid: uid,
      agentKey,
      title: displayText.substring(0, 20) || "[图片消息]",
      lastMessagePreview: displayText.substring(0, 50) || "[图片消息]",
      messageCount: 0,
      scene: agentConfig.agentKey || "default",
      currentModel: agentConfig.defaultModel || "",
    });
    return { convId: newConv._id, sequence: 0 };
  }

  const [, lastMsg] = await Promise.all([
    AgentConversationModel.updateOne(
      { _id: convId },
      {
        $set: {
          lastMessagePreview: displayText.substring(0, 50) || "[图片消息]",
          lastMessageAt: new Date(),
          currentModel: agentConfig.defaultModel || "",
        },
      }
    ),
    AgentMessageModel.findOne({ conversationId: convId }).sort({ sequence: -1 }),
  ]);

  return { convId, sequence: lastMsg ? lastMsg.sequence + 1 : 0 };
}

/**
 * 并行落库用户消息 + 拉取最近历史（限制条数）。
 * 返回正序排列的历史消息数组（包含刚保存的用户消息）。
 */
async function saveUserMessageAndFetchHistory(convId, uid, agentKey, agentConfig, userMessage, sequence, images) {
  const userMsgDoc = {
    conversationId: convId,
    Uid: uid,
    agentKey,
    sequence,
    role: "user",
    content: userMessage || "",
    modelName: agentConfig.defaultModel || "default",
  };
  if (images && images.length > 0) {
    userMsgDoc.contentType = "image";
    // 统一存储为纯 URL 字符串，兼容前端传入对象或字符串
    const imageUrls = images.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);
    if (imageUrls.length > 0) {
      userMsgDoc.ext = { images: imageUrls };
      console.log("[saveUserMessage] 存储图片消息, 图片数:", imageUrls.length);
    }
  }

  // 先落库用户消息，确保后续查询能读到
  const savedMsg = await AgentMessageModel.create(userMsgDoc);

  // 再查询历史（此时刚保存的用户消息一定在结果中）
  const historyDocs = await AgentMessageModel.find({ conversationId: convId, status: 1 })
    .sort({ sequence: -1 })
    .limit(HISTORY_MESSAGE_LIMIT);

  // 恢复正序（从旧到新），保证 LLM 上下文顺序正确
  const messages = historyDocs.reverse().map((doc) => ({
    role: doc.role,
    content: doc.content,
    ext: doc.ext || {},
  }));
  console.log("[saveUserMessage] 历史消息数:", messages.length, "含图片消息数:", messages.filter(m => m.ext?.images?.length).length);

  return { messages, savedSequence: savedMsg.sequence };
}

/**
 * 落库 AI 回复消息。
 */
async function saveAIReply(convId, uid, agentKey, agentConfig, aiResponse, sequence) {
  const replyText = typeof aiResponse === "object" && aiResponse !== null
    ? (aiResponse.reply || JSON.stringify(aiResponse))
    : aiResponse;

  await AgentMessageModel.create({
    conversationId: convId,
    Uid: uid,
    agentKey,
    sequence,
    role: "assistant",
    content: replyText,
    modelName: typeof aiResponse === "object" && aiResponse?.modelName
      ? aiResponse.modelName
      : (agentConfig.defaultModel || "default"),
  });

  return replyText;
}

/**
 * 新会话时异步生成标题（fire-and-forget，不阻塞主流程）。
 */
function maybeGenerateTitle(isNew, userMessage, replyText, convId, modelName) {
  if (!isNew) return;
  generateConversationTitle(userMessage, replyText, modelName)
    .then((aiTitle) => {
      if (aiTitle) {
        return AgentConversationModel.updateOne({ _id: convId }, { $set: { title: aiTitle } });
      }
    })
    .catch(() => {});
}

// ─── 对外服务方法 ────────────────────────────────────────────────────────────

const LLMService = {
  /**
   * 非流式对话：用户发消息 → LLM 一次性返回完整回复 → 落库。
   */
  ChatWithAgentAndSave: async ({ uid, message: userMessage, agentKey, conversationId, images }) => {
    const agentConfig = await getAgentConfig(agentKey);
    const isNew = !conversationId;
    const { convId, sequence } = await ensureConversation(conversationId, uid, agentKey, agentConfig, userMessage, images);
    const { messages } = await saveUserMessageAndFetchHistory(convId, uid, agentKey, agentConfig, userMessage, sequence, images);

    const aiResponse = await runAgentChain(messages, agentConfig.systemPrompt, agentConfig.defaultModel);
    const replyText = await saveAIReply(convId, uid, agentKey, agentConfig, aiResponse, sequence + 1);

    maybeGenerateTitle(isNew, userMessage || "[图片消息]", replyText, convId, agentConfig.defaultModel);

    await AgentConversationModel.updateOne({ _id: convId }, { $inc: { messageCount: 2 } });

    return { conversationId: convId, data: aiResponse };
  },

  /**
   * 流式对话：用户发消息 → LLM 逐 token 回调 → 落库。
   * onStart/onToken 由控制器注入，用于实时推送 SSE/WebSocket 事件。
   */
  ChatWithAgentAndSaveStream: async ({
    uid,
    message: userMessage,
    agentKey, conversationId,
    images,
    onStart,
    onToken
  }) => {
    const agentConfig = await getAgentConfig(agentKey);
    const isNew = !conversationId;
    const { convId, sequence } = await ensureConversation(conversationId, uid, agentKey, agentConfig, userMessage, images);

    // 通知前端：会话已创建/确认，可以开始接收流式数据
    onStart?.({
      conversationId: String(convId),
      modelName: agentConfig.defaultModel || "default",
    });

    const { messages } = await saveUserMessageAndFetchHistory(convId, uid, agentKey, agentConfig, userMessage, sequence, images);

    const aiResponse = await streamAgentChain(messages, agentConfig.systemPrompt, agentConfig.defaultModel, { onToken });
    const replyText = await saveAIReply(convId, uid, agentKey, agentConfig, aiResponse, sequence + 1);

    maybeGenerateTitle(isNew, userMessage || "[图片消息]", replyText, convId, agentConfig.defaultModel);

    await AgentConversationModel.updateOne(
      { _id: convId },
      {
        $set: { lastMessagePreview: replyText.substring(0, 50), lastMessageAt: new Date() },
        $inc: { messageCount: 2 },
      }
    );

    return { conversationId: convId, data: aiResponse };
  },

  // ─── 会话管理 ──────────────────────────────────────────────────────────────

  /** 获取已发布的 Agent 列表 */
  getChatAgents: async () => {
    return AgentDefinitionModel.find(
      { isPublish: 1 },
      { agentName: 1, agentKey: 1, isMultimodal: 1 }
    ).sort({ sort: 1, createTime: -1 });
  },

  /** 重命名会话标题（校验归属权） */
  renameConversation: async (uid, conversationId, title) => {
    const conv = await AgentConversationModel.findOne({ _id: conversationId, Uid: uid, status: 1 });
    if (!conv) throw new Error("会话不存在或无权限");
    await AgentConversationModel.updateOne({ _id: conversationId }, { $set: { title } });
    return { conversationId, title };
  },

  /** 软删除会话及其所有消息（status → 2） */
  deleteConversation: async (uid, conversationId) => {
    const conv = await AgentConversationModel.findOne({ _id: conversationId, Uid: uid, status: 1 });
    if (!conv) throw new Error("会话不存在或无权限");
    await Promise.all([
      AgentConversationModel.updateOne({ _id: conversationId }, { $set: { status: 2 } }),
      AgentMessageModel.updateMany({ conversationId }, { $set: { status: 2 } }),
    ]);
    return { conversationId };
  },

  /** 切换会话收藏状态 */
  toggleFavoriteConversation: async (uid, conversationId) => {
    const conv = await AgentConversationModel.findOne({ _id: conversationId, Uid: uid, status: 1 });
    if (!conv) throw new Error("会话不存在或无权限");
    const newPinned = !conv.isPinned;
    await AgentConversationModel.updateOne({ _id: conversationId }, { $set: { isPinned: newPinned } });
    return { conversationId, isPinned: newPinned };
  },

  /** 获取用户会话列表（支持收藏筛选 + 关键字搜索） */
  getConversationList: async (uid, { favoritesOnly = false, keyword = "" } = {}) => {
    const filter = { Uid: uid, status: 1 };
    if (favoritesOnly) filter.isPinned = true;
    if (keyword) {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filter.$or = [{ title: regex }, { lastMessagePreview: regex }];
    }
    return AgentConversationModel.find(filter)
      .sort({ isPinned: -1, lastMessageAt: -1 })
      .select("title lastMessagePreview lastMessageAt agentKey messageCount createTime _id isPinned");
  },

  /** 分页获取会话消息列表 */
  getMessageList: async (uid, conversationId, { page = 1, limit = 50 } = {}) => {
    const conv = await AgentConversationModel.findOne({ _id: conversationId, Uid: uid, status: 1 });
    if (!conv) throw new Error("会话不存在或无权限");
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      AgentMessageModel.find({ conversationId, status: 1 })
        .sort({ sequence: 1 })
        .skip(skip)
        .limit(limit)
        .select("role content contentType ext createTime"),
      AgentMessageModel.countDocuments({ conversationId, status: 1 }),
    ]);
    return { messages, total, page, limit };
  },
};
module.exports = LLMService;
