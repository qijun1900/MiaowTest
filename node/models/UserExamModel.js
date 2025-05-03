const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: String ,   // 考试名称
  questionTitle: [{
    content: String,                           // 题型名称
    questionIdS: [{ type: Array }],           // 关联的题目ID集合
    isPublishType:Number,                     // 发布状态
    }],
  code: String ,       
  isPublish: Number,     
  category:Array, 
  examId:String, 
  createdTime: Date,     
});
const UserExamModel = mongoose.model("userExam", UserSchema);
module.exports = UserExamModel;