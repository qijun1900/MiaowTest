const mongoose = require("mongoose");

const NotesBookSchema = new mongoose.Schema({
  Uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "consumer",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
  },
  normalizedTitle: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
    maxlength: 120,
  },
  noteCount: {
    type: Number,
    default: 0,
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

NotesBookSchema.pre("save", function (next) { // 在保存笔记本之前，计算 normalizedTitle 和 updatedAt 字段
  this.normalizedTitle = String(this.title || "")
    .trim()
    .toLowerCase();
  this.updatedAt = Date.now();
  next();
});

NotesBookSchema.index({ Uid: 1, updatedAt: -1 });
NotesBookSchema.index( // 创建复合唯一索引，确保同一用户下笔记本名称唯一，忽略大小写
  { Uid: 1, normalizedTitle: 1 },
  {
    unique: true,
    partialFilterExpression: {
      normalizedTitle: { $type: "string" },
    },
  },
);

const NotesBookModel = mongoose.model("notes_book", NotesBookSchema);

module.exports = NotesBookModel;