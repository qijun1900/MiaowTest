const mongoose = require('mongoose');

const QuestionNoteSchema = new mongoose.Schema({
    Uid: {
        type: mongoose.Schema.Types.ObjectId,// 关联用户表的主键
        ref: 'consumer',
        required: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId, // 关联题目表的主键
        required: true
    },
    questionType: { // 题目类型： 1-选择题 2-填空题 3-判断题 4-简答题
        type: Number,
        required: true,
        enum: [1, 2, 3, 4]
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,// 关联考试表的主键
        required: true
    },
    content: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        default: []
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    updateTime: {
        type: Date,
        default: Date.now
    }
});

// 添加索引以提高查询性能
QuestionNoteSchema.index({ Uid: 1, questionId: 1 });
QuestionNoteSchema.index({ Uid: 1, updateTime: -1 });

const QuestionNoteModel = mongoose.model("question_note", QuestionNoteSchema);
module.exports = QuestionNoteModel;