const mongoose = require('mongoose');
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