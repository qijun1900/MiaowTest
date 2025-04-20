const mongoose = require('mongoose');
const ShortSchema  = new mongoose.Schema({
    examId:String,
    stem:String,
    content:String,
    isPublish:Number,
    analysis:String,// 新增字段，用于存储解析
    isAIanswer:Number,// 新增字段，用于存储是否AI回答 
    createdTime:Date,
})
const ExamShortModel  = mongoose.model("short",ShortSchema)
module.exports = ExamShortModel