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

NotesBookSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

NotesBookSchema.index({ Uid: 1, updatedAt: -1 });

const NotesBookModel = mongoose.model("notes_book", NotesBookSchema);

module.exports = NotesBookModel;