// 填空题模型 route.query.questionType ==2
const mongoose = require('mongoose');
const BlankSchema  = new mongoose.Schema({
    examId:String,
    stem:String,
    options:[],
    isPublish:Number,
    analysis:String,// 新增字段，用于存储解析
    isAIanswer:Number,// 新增字段，用于存储是否AI回答 
    isAddUserList:Number,//0:不是，1：是
    Type:Number, // 题目类型
    createdTime:Date,
})
const ExamBlankModel  = mongoose.model("blank",BlankSchema)
module.exports = ExamBlankModel