//  判断题模型 route.query.questionType ==3
const mongoose = require('mongoose');
const JudgeSchema  = new mongoose.Schema({
    examId:String,
    stem:String,
    answer:Number,//0:错误，1：正确
    isPublish:Number,
    analysis:String,// 新增字段，用于存储解析
    isAIanswer:Number,// 新增字段，用于存储是否AI回答 
    isAddUserList:Number,//0:不是，1：是
    Type:Number, // 题目类型
    createdTime:Date,
})
const ExamJudgeModel  = mongoose.model("judge",JudgeSchema)
module.exports = ExamJudgeModel