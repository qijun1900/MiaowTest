const mongoose = require("mongoose");

const AgentToolCallSchema = new mongoose.Schema(
  {
    callId: {
      // 模型返回的工具调用 ID，用来把一次模型输出中的调用和后续结果串起来。
      type: String,
      default: "",
      trim: true,
    },
    toolName: {
      // 被调用的工具名称，例如 searchKnowledge、createTodo 等。
      type: String,
      default: "",
      trim: true,
    },
    args: {
      // 工具入参，保持为 Mixed 以兼容不同工具的参数结构。
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    result: {
      // 工具执行后的输出结果，成功时通常保存返回数据，失败时可保存错误上下文。
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    status: {
      // 调用状态：pending 表示执行中，success 表示成功，failed 表示失败。
      type: String,
      default: "pending",
      enum: ["pending", "success", "failed"],
    },
    errorMessage: {
      // 如果工具调用失败，这里记录可读错误信息，便于调试和前端提示。
      type: String,
      default: "",
    },
    startedAt: {
      // 工具调用开始时间，用于耗时统计和链路追踪。
      type: Date,
      default: null,
    },
    finishedAt: {
      // 工具调用结束时间，用于判断执行耗时和最终状态。
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

/**
 * Agent 消息模型。
 * 这里记录会话中的每一条消息明细，包括用户输入、模型回复、系统消息和工具消息；
 * 它和 AgentConversationModel 配合使用，前者管“会话壳”，后者管“消息流”。
 */
const AgentMessageSchema = new mongoose.Schema({
  conversationId: {
    // 所属会话 ID，通过它可以取出某个会话下的完整消息历史。
    type: mongoose.Schema.Types.ObjectId,
    ref: "agent_conversation",
    required: true,
    index: true,
  },
  Uid: {
    // 冗余保存用户 ID，方便按用户直接过滤消息，不必每次都先查会话表。
    type: mongoose.Schema.Types.ObjectId,
    ref: "consumer",
    required: true,
    index: true,
  },
  agentKey: {
    // 冗余保存 Agent 标识，便于按用户 + Agent 组合查询历史消息。
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  sequence: {
    // 会话内顺序号，通常按时间递增，用于稳定排序和增量拉取。
    type: Number,
    default: 0,
    min: 0,
  },
  role: {
    // 消息角色：system、user、assistant、tool。
    // 其中 tool 用于保存工具调用链路中的工具消息。
    type: String,
    required: true,
    enum: ["system", "user", "assistant", "tool"],
  },
  content: {
    // 消息正文，具体展示内容由 contentType 决定，可能是纯文本、Markdown 或结构化 JSON。
    type: String,
    default: "",
  },
  contentType: {
    // 内容类型，用于前端选择不同的渲染方式。
    type: String,
    default: "text",
    enum: ["text", "markdown", "json", "tool_result", "image"],
  },
  modelName: {
    // 记录产生这条消息的模型名称，便于追踪不同模型版本的输出表现。
    type: String,
    default: "",
    trim: true,
  },
  status: {
    // 消息状态：0 表示归档，1 表示活跃，2 表示已删除（随会话软删除级联）。
    type: Number,
    default: 1,
    enum: [0, 1, 2],
  },
  messageStatus: {
    // 消息生成状态：0 表示生成中，1 表示成功，2 表示失败。
    type: Number,
    default: 1,
    enum: [0, 1, 2],
  },
  finishReason: {
    // 模型输出结束原因，例如 stop、length、tool_calls 等。
    type: String,
    default: "",
    trim: true,
  },
  requestId: {
    // 一次请求链路标识，用于把同一轮用户提问、模型回复和工具调用串起来追踪。
    type: String,
    default: "",
    trim: true,
  },
  parentMessageId: {
    // 可选的父消息 ID，可用于分叉对话、重试回复或回溯某条消息的来源。
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  promptTokens: {
    // 本条消息相关的 Prompt Token 数，用于计费和使用量统计。
    type: Number,
    default: 0,
    min: 0,
  },
  completionTokens: {
    // 本条消息相关的 Completion Token 数，通常表示模型输出成本。
    type: Number,
    default: 0,
    min: 0,
  },
  totalTokens: {
    // 本条消息的总 Token 数，默认由 promptTokens + completionTokens 自动补齐。
    type: Number,
    default: 0,
    min: 0,
  },
  latencyMs: {
    // 模型响应或工具调用耗时，单位毫秒，便于做性能分析。
    type: Number,
    default: 0,
    min: 0,
  },
  toolCalls: {
    // 记录一次 assistant 消息中可能包含的多个工具调用，保留参数、结果和状态。
    type: [AgentToolCallSchema],
    default: [],
  },
  ext: {
    // 业务扩展字段，适合存放与主结构无关但需要随消息一起保存的信息。
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createTime: {
    // 消息创建时间，用于列表排序和时间线展示。
    type: Date,
    default: Date.now,
  },
});

AgentMessageSchema.pre("save", function (next) {
  // 如果没有显式设置总 Token，则按输入 + 输出自动计算，保证统计字段始终可用。
  if (!this.totalTokens) {
    this.totalTokens = Number(this.promptTokens || 0) + Number(this.completionTokens || 0);
  }
  next();
});

// 按会话和顺序号读取消息，适合分页加载或增量同步。
AgentMessageSchema.index({ conversationId: 1, sequence: 1 });
// 按会话和创建时间读取消息，适合时间线展示和历史回放。
AgentMessageSchema.index({ conversationId: 1, createTime: 1 });
// 按用户 + 会话 + 创建时间倒序查询，适合最近消息列表或用户消息追踪。
AgentMessageSchema.index({ Uid: 1, conversationId: 1, createTime: -1 });
// requestId 并不是所有消息都有，因此使用 sparse 索引避免空值占用索引空间。
AgentMessageSchema.index({ requestId: 1 }, { sparse: true });

const AgentMessageModel = mongoose.model("agent_message", AgentMessageSchema);

module.exports = AgentMessageModel;