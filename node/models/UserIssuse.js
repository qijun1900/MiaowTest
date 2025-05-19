const mongoose = require('mongoose');
const  UserIssuseSchema  = new mongoose.Schema({
    ExamId:String, // 考试id
    ExamtagId:Number, // 问题标签
    Type:Number, // 1：考试相关问题，2：考试题相关问题
    createdTime:Date,
})
const UserIssuseModel  = mongoose.model("userissuse",UserIssuseSchema)
module.exports = UserIssuseModel
