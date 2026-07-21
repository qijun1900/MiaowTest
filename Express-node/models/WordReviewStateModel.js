const mongoose = require("mongoose");

/**
 * 单词复习状态模型
 * 与 WordListModel 解耦，每个用户每个单词一条记录
 * 记录 SM-2 算法所需的全部状态
 */
const WordReviewStateSchema = new mongoose.Schema({
  Uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "consumer",
    required: true,
  },
  wordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tools_user_word_list",
    required: true,
  },
  wordBookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tools_user_word_book",
    required: true,
  },

  // ---- SM-2 算法状态 ----
  masteryLevel: {
    // 掌握等级：0=新词 1=学习中 2=熟悉 3=已掌握
    type: Number,
    enum: [0, 1, 2, 3],
    default: 0,
  },
  easeFactor: {
    // SM-2 算法的 EF 值（最低 1.3）
    type: Number,
    default: 2.5,
    min: 1.3,
  },
  reviewInterval: {
    // 当前复习间隔（天）
    type: Number,
    default: 0,
  },
  reviewCount: {
    // 总复习次数
    type: Number,
    default: 0,
  },
  correctCount: {
    // 正确回忆次数
    type: Number,
    default: 0,
  },
  wrongCount: {
    // 错误回忆次数
    type: Number,
    default: 0,
  },
  lastReviewedAt: {
    // 上次复习时间
    type: Date,
    default: null,
  },
  nextReviewAt: {
    // 下次复习时间（null = 从未复习）
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

WordReviewStateSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// 同一用户同一单词只有一条状态记录
WordReviewStateSchema.index({ Uid: 1, wordId: 1 }, { unique: true });
// 按单词本查询到期复习词
WordReviewStateSchema.index({ Uid: 1, wordBookId: 1, nextReviewAt: 1 });
// 按掌握等级统计
WordReviewStateSchema.index({ Uid: 1, wordBookId: 1, masteryLevel: 1 });

const WordReviewStateModel = mongoose.model(
  "tools_user_word_review_state",
  WordReviewStateSchema,
);

module.exports = WordReviewStateModel;
