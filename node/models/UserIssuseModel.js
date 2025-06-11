const mongoose = require('mongoose');
const  UserIssuseSchema  = new mongoose.Schema({
    ExamId:String, // 考试id
    ExamtagId:Number, // 问题标签
    Type:Number, // 1：考试相关问题，2：考试题相关问题
    IsSolved:Number, // 0：已解决，1：未解决
    createdTime:Date,
    stem:String, // 问题
    questionId:String, // 问题id
    userQuestion:String, // 用户问题

})
const UserIssuseModel  = mongoose.model("userissuse",UserIssuseSchema)
module.exports = UserIssuseModel
