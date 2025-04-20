const mongoose = require('mongoose');
const BlankSchema  = new mongoose.Schema({
    examId:String,
    stem:String,
    options:[],
    isPublish:Number,
    analysis:String,// 新增字段，用于存储解析
    isAIanswer:Number,// 新增字段，用于存储是否AI回答 
    createdTime:Date,
})
const ExamBlankModel  = mongoose.model("blank",BlankSchema)
module.exports = ExamBlankModel