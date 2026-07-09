const mongoose = require("mongoose");

const WordBookSchema = new mongoose.Schema({
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
  wordCount: {
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

WordBookSchema.pre("save", function (next) {
  this.normalizedTitle = String(this.title || "")
    .trim()
    .toLowerCase();
  this.updatedAt = Date.now();
  next();
});

WordBookSchema.index({ Uid: 1, updatedAt: -1 });
WordBookSchema.index(
  { Uid: 1, normalizedTitle: 1 },
  {
    unique: true,
    partialFilterExpression: {
      normalizedTitle: { $type: "string" },
    },
  },
);

const WordBookModel = mongoose.model("tools_user_word_book", WordBookSchema);

module.exports = WordBookModel;
