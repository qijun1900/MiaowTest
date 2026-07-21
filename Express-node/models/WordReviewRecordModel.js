const mongoose = require("mongoose");

/**
 * 单词复习记录模型
 * 记录每次复习操作的详细信息，用于统计分析
 */
const WordReviewRecordSchema = new mongoose.Schema({
  Uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "consumer",
    required: true,
    index: true,
  },
  wordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tools_user_word_list",
    required: true,
    index: true,
  },
  wordBookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tools_user_word_book",
    required: true,
    index: true,
  },
  // SM-2 评分 (0-5)
  quality: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  // 复习前的 EF 值
  prevEF: {
    type: Number,
    default: 2.5,
  },
  // 复习后的 EF 值
  newEF: {
    type: Number,
    default: 2.5,
  },
  // 复习前间隔（天）
  prevInterval: {
    type: Number,
    default: 0,
  },
  // 复习后间隔（天）
  newInterval: {
    type: Number,
    default: 0,
  },
  // 复习前掌握等级
  prevMastery: {
    type: Number,
    enum: [0, 1, 2, 3],
    default: 0,
  },
  // 复习后掌握等级
  newMastery: {
    type: Number,
    enum: [0, 1, 2, 3],
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 复合索引：按用户+单词本查询复习记录
WordReviewRecordSchema.index({ Uid: 1, wordBookId: 1, createdAt: -1 });
// 按单词查询其复习历史
WordReviewRecordSchema.index({ Uid: 1, wordId: 1, createdAt: -1 });

const WordReviewRecordModel = mongoose.model(
  "tools_user_word_review_record",
  WordReviewRecordSchema,
);

module.exports = WordReviewRecordModel;
