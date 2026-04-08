const mongoose = require("mongoose");

/**
 * 笔记列表模型
 * 存储用户在某个笔记本下的笔记条目（列表项）
 */
const NotesListSchema = new mongoose.Schema({
  Uid: {
    // 用户ID
    type: mongoose.Schema.Types.ObjectId,
    ref: "consumer",
    required: true,
    index: true,
  },
  notesBookId: {
    // 所属笔记本ID
    type: mongoose.Schema.Types.ObjectId,
    ref: "notes_book",
    required: true,
    index: true,
  },
  title: {
    // 笔记标题
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },
  normalizedTitle: {
    // 规范化标题（用于检索/去重判断）
    type: String,
    trim: true,
  },
  summary: {
    // 摘要（列表预览文案）
    type: String,
    default: "",
    trim: true,
    maxlength: 240,
  },
  content: {
    // 正文（支持文本+图片）
    text: {
      type: String,
      default: "",
    },
    images: [
      {
        url: {
          type: String,
          default: "",
        },
      },
    ],
    isAIgengrated: {
      // 是否经过AI生成/改写
      type: Boolean,
      default: false,
    },
    AIIntegrationInfo: {
      // AI生成/改写相关信息（如使用的模型、参数等）
      model: String,
        parameters: mongoose.Schema.Types.Mixed,
    },
  },
  tags: {
    // 自定义标签
    type: [String],
    default: [],
  },
  isPinned: {
    // 是否置顶
    type: Boolean,
    default: false,
  },
  isArchived: {
    // 是否归档
    type: Boolean,
    default: false,
  },
  wordCount: {
    // 字数统计（基于 text）
    type: Number,
    default: 0,
  },
  lastViewedAt: {
    // 最后查看时间
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 保存前自动维护规范化字段与统计字段
NotesListSchema.pre("save", function (next) {
  const safeTitle = String(this.title || "").trim();
  const safeText = String(this.content?.text || "");

  this.normalizedTitle = safeTitle.toLowerCase();
  this.wordCount = safeText.trim() ? safeText.trim().length : 0;
  this.updatedAt = Date.now();

  // 自动生成摘要（若未提供）
  if (!String(this.summary || "").trim()) {
    this.summary = safeText.trim().slice(0, 120);
  }

  next();
});

// 常用查询索引
NotesListSchema.index({ Uid: 1, notesBookId: 1, updatedAt: -1 });
NotesListSchema.index({ Uid: 1, notesBookId: 1, isPinned: -1, updatedAt: -1 });
NotesListSchema.index({ Uid: 1, notesBookId: 1, isArchived: 1, updatedAt: -1 });
NotesListSchema.index({ Uid: 1, notesBookId: 1, normalizedTitle: 1 });

// 文本搜索索引（标题+正文）
NotesListSchema.index({ title: "text", "content.text": "text", tags: "text" });

const NotesListModel = mongoose.model("notes_list", NotesListSchema);

module.exports = NotesListModel;
