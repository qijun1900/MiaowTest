const mongoose = require('mongoose');
const JudgeSchema  = new mongoose.Schema({
    examId:String,
    stem:String,
    answer:Number,
    isPublish:Number,
    analysis:String,// 新增字段，用于存储解析
    isAIanswer:Number,// 新增字段，用于存储是否AI回答 
    createdTime:Date,
})
const ExamJudgeModel  = mongoose.model("judge",JudgeSchema)
module.exports = ExamJudgeModel