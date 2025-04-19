const mongoose = require('mongoose');
const SelectSchema  = new mongoose.Schema({
    examId:String,
    stem:String,
    options:[],
    isPublish:Number,
    analysis:String,// 新增字段，用于存储解析
    isAIanswer:Number,// 新增字段，用于存储是否AI回答 
    createdTime:Date,
})
const ExamSelectModel  = mongoose.model("select",SelectSchema)
module.exports = ExamSelectModel