const mongoose = require("mongoose");

/**
 * Agent 会话模型 (AgentConversationModel)
 *
 * 这里只保存会话元数据，不保存每一条消息内容；消息明细由 AgentMessageModel 记录。
 * 该模型主要用于会话列表、置顶排序、会话统计和上下文恢复。
 *
 * 对应 MongoDB 集合: agent_conversation
 *
 * 主要关系:
 *   - Uid → consumer (用户模型)
 *   - agentKey → AgentDefinition.agentKey (Agent 定义标识)
 *
 * 复合索引:
 *   1. { Uid, status, isPinned, lastMessageAt } — 适配用户会话列表，先过滤状态，再按置顶和最新消息排序。
 *   2. { Uid, agentKey, lastMessageAt }         — 适配同一用户在某个 Agent 下查看会话历史。
 *   3. { agentKey, status, lastMessageAt }       — 适配按 Agent 维度统计或查询活跃会话。
 */
const AgentConversationSchema = new mongoose.Schema({
  /**
   * 会话所属用户 ID。
   * 这是会话权限隔离和列表查询的第一条件，所有用户态接口都应带着它过滤数据。
   */
  Uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "consumer",
    required: true,
    index: true,
  },
  agentKey: {
    // 当前会话归属的 Agent 定义标识，和 AgentDefinition.agentKey 保持一致。
    // 这样同一个用户可以在不同 Agent 下保存彼此独立的会话列表。
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  /**
   * 会话标题，最长 120 字符。
   * 通常展示在会话列表顶部，可由首轮问题、人工命名或后台摘要生成。
   */
  title: {
    type: String,
    default: "",
    trim: true,
    maxlength: 120,
  },
  summary: {
    // 会话摘要，通常用于列表预览或搜索结果展示，可由后台异步生成。
    type: String,
    default: "",
    maxlength: 500,
  },
  scene: {
    // 业务场景标识，例如 default、notes、exam。
    // 这个字段帮助同一个 Agent 在不同入口或业务流程中复用同一套消息能力。
    type: String,
    default: "default",
    trim: true,
    maxlength: 60,
  },
  currentModel: {
    // 当前会话最近一次使用的模型标识，便于续聊时回显，也便于排查某次会话使用了哪个模型。
    type: String,
    default: "",
    trim: true,
  },
  status: {
    // 会话状态：0 表示归档，1 表示活跃，2 表示已删除。
    // 列表接口通常会优先查 1，归档和删除的数据一般需要显式筛选。
    type: Number,
    default: 1,
    enum: [0, 1, 2],
  },
  /** 是否置顶显示，置顶会在会话列表中优先排在前面。 */
  isPinned: {
    type: Boolean,
    default: false,
  },
  /**
   * 最后一条消息的预览文本。
   * 这是会话列表中最常见的摘要字段，通常只展示一小段内容，避免列表过长。
   */
  lastMessagePreview: {
    type: String,
    default: "",
    trim: true,
    maxlength: 240,
  },
  /** 最后一条消息的时间，用于列表排序和“最近活跃”判断。 */
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  /** 会话中的消息总数，用于列表展示、统计和判断会话活跃程度。 */
  messageCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  /** 会话累计 Prompt Token 消耗量，主要用于成本统计和分析。 */
  totalPromptTokens: {
    type: Number,
    default: 0,
    min: 0,
  },
  /** 会话累计 Completion Token 消耗量，用于区分输入和输出成本。 */
  totalCompletionTokens: {
    type: Number,
    default: 0,
    min: 0,
  },
  /** 会话累计总 Token 消耗量，等于 prompt + completion 的总和。 */
  totalTokens: {
    type: Number,
    default: 0,
    min: 0,
  },
  contextState: {
    // 会话上下文快照，适合保存变量、记忆摘要、工具状态或其他运行时中间结果。
    // 结构不固定，因此使用 Mixed 以便后续灵活扩展。
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ext: {
    // 业务扩展字段，适合存放和主流程解耦的附加信息。
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  /** 会话创建时间，表示该会话第一次被创建的时刻。 */
  createTime: {
    type: Date,
    default: Date.now,
  },
  /** 会话最后更新时间，由 save 中间件自动刷新，便于后台展示最新变更。 */
  updateTime: {
    type: Date,
    default: Date.now,
  },
});

/**
 * save 前置钩子：
 * 1. 每次保存都刷新 updateTime，确保后台能看到最新修改时间；
 * 2. 如果 lastMessageAt 没有被显式写入，则默认回填为会话创建时间，避免排序字段为空。
 */
AgentConversationSchema.pre("save", function (next) {
  this.updateTime = Date.now();
  if (!this.lastMessageAt) {
    this.lastMessageAt = this.createTime || Date.now();
  }
  next();
});

// 用户会话列表查询：先按状态过滤，再按置顶和最新消息时间排序。
AgentConversationSchema.index({ Uid: 1, status: 1, isPinned: -1, lastMessageAt: -1 });
// 用户在某个 Agent 下的会话列表：直接按 Agent 过滤并按最近消息时间倒序展示。
AgentConversationSchema.index({ Uid: 1, agentKey: 1, lastMessageAt: -1 });
// 按 Agent 维度查询活跃会话：适合后台统计或运维查询。
AgentConversationSchema.index({ agentKey: 1, status: 1, lastMessageAt: -1 });

const AgentConversationModel = mongoose.model(
  "agent_conversation",
  AgentConversationSchema,
);

module.exports = AgentConversationModel;
