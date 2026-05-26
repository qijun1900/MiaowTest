const mongoose = require("mongoose");

/**
 * Agent 定义模型。
 * 这里只保存 Agent 的静态配置和展示信息，不记录会话消息本身；
 * 运行时通过 agentKey 找到对应定义，再读取默认模型、系统提示词、
 * 能力标签和排序配置来决定一个 Agent 如何被展示和调用。
 */
const AgentDefinitionSchema = new mongoose.Schema({
  agentKey: {
    // Agent 的业务唯一标识，前后端和接口调用都应优先使用这个值。
    // 例如 default-chat、exam-tutor；一旦对外使用，尽量保持稳定不变。
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: 64,
  },
  agentName: {
    // 后台列表、下拉选择和前端卡片中显示的名称，只负责展示，不参与业务匹配。
    type: String,
    required: true,
    trim: true,
    maxlength: 60,
  },
  agentType: {
    // Agent 的工作模式，用于区分调用方式和 UI 呈现：
    // chat 表示对话型，workflow 表示需要按步骤执行的流程型，tool 表示偏工具/能力调用型。
    type: String,
    default: "chat",
    enum: ["chat", "workflow", "tool"],
  },
  description: {
    // 用于运营或管理员快速理解该 Agent 的用途，通常是一句简短说明。
    type: String,
    default: "",
    trim: true,
    maxlength: 300,
  },
  defaultModel: {
    // 默认使用的模型标识，例如 qwen、gpt-4o-mini 等；为空时由调用方或策略层兜底。
    type: String,
    default: "",
    trim: true,
  },
  systemPrompt: {
    // 注入给大模型的系统提示词模板，通常包含角色设定、回答边界、输出格式要求等约束。
    type: String,
    default: "",
  },
  capabilities: {
    // 能力标签列表，用于按功能筛选或控制前端展示，例如 ["chat", "rag", "tools"]。
    // 如果后续增加新的能力，只需要扩展标签即可，不必立刻改表结构。
    type: [String],
    default: [],
  },
  isPublish: {
    // 发布状态：0 表示未发布或停用，1 表示已发布可在常规列表中使用。
    type: Number,
    default: 1,
    enum: [0, 1],
  },
  isMultimodal: {
    // 是否为多模态模型：0 表示仅支持文本，1 表示支持图片等多模态输入。
    // 前端依据此字段决定是否展示图片上传入口。
    type: Number,
    default: 0,
    enum: [0, 1],
  },
  sort: {
    // 列表排序值，数字越小越靠前，便于后台人工调整展示顺序。
    type: Number,
    default: 0,
  },
  config: {
    // 可变扩展配置，适合存放温度、topP、知识库开关、工具白名单等非固定字段。
    // 需要频繁演进但结构不稳定的参数，优先放在这里而不是继续扩字段。
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  creator: {
    // 创建人标识，通常是账号名、用户 ID 或后台管理员标识，用于审计和回溯。
    type: String,
    default: "",
    trim: true,
  },
  createTime: {
    // 记录这条 Agent 定义首次创建的时间。
    type: Date,
    default: Date.now,
  },
  editTime: {
    // 最近一次修改时间，便于管理端判断配置是否有更新。
    type: Date,
    default: Date.now,
  },
});

AgentDefinitionSchema.pre("save", function (next) {
  // 首次保存时补齐创建时间，后续每次保存都刷新编辑时间，方便后台展示最后修改时间。
  if (!this.createTime) {
    this.createTime = Date.now();
  }
  this.editTime = Date.now();
  next();
});

// 常用查询：先按发布状态筛选，再按排序值展示。
AgentDefinitionSchema.index({ isPublish: 1, sort: 1 });
// 常用查询：按类型筛选已发布的 Agent，例如只取对话型或工具型配置。
AgentDefinitionSchema.index({ agentType: 1, isPublish: 1 });

const AgentDefinitionModel = mongoose.model(
  "agent_definition",
  AgentDefinitionSchema,
);

module.exports = AgentDefinitionModel;