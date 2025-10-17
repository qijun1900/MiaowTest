const mongoose = require('mongoose');

/**
 * 用户考试题型模型
 * 用于存储用户的考试题型名称信息，包括考试ID、题目ID集合等
 */
const UserSchema = new mongoose.Schema({
  questionTitle: [{
    content: String,                           // 题型名称
    description: String,                          // 题型描述
    questionIdS: [{ type: Array }],           // 关联的题目ID集合
    isPublish:Number,                     // 发布状态
    }],
  examId:String,// 考试ID
});
const UserExamModel = mongoose.model("userexam", UserSchema);

module.exports = UserExamModel;