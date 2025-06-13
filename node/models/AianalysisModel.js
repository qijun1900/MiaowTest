//
const mongoose = require('mongoose');
const AianalysusSchema = new mongoose.Schema({
    questionId: String, // 题目ID 
    questionType: Number, // 题目类型 
    questionContent: String, // 题目内容 
    analysecontent: String, // 解析内容
    createdTime: Date, // 创建时间
    modelName: String, // 模型名称 
})
const AianalysisModel  = mongoose.model("aianalys",AianalysusSchema)
module.exports = AianalysisModel