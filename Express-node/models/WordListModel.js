const mongoose = require("mongoose");

const WordListSchema = new mongoose.Schema({
  Uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "consumer",
    required: true,
    index: true,
  },
  wordBookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tools_user_word_book",
    required: true,
    index: true,
  },
  word: {
    type: String,
    required: true,
    trim: true,
  },
  phonetic: {
    type: String,
    default: "",
    trim: true,
  },
  meaning: {
    type: String,
    default: "",
    trim: true,
  },
  example: {
    type: String,
    default: "",
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  isMarked: {
    type: Boolean,
    default: false,
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

WordListSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

WordListSchema.index({ Uid: 1, wordBookId: 1, updatedAt: -1 });

const WordListModel = mongoose.model("tools_user_word_list", WordListSchema);

module.exports = WordListModel;
