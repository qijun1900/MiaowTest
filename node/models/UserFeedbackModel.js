const mongoose = require('mongoose');
const  UserFeedbackSchema  = new mongoose.Schema({
    userAdvice:String, // 用户反馈
    userInfo:String, // 用户信息
    Type:Number, // 1 表示用户反馈
    IsSolved:Number, // 0：已解决，1：未解决
    createdTime:Date,
})
const UserFeedbackModel  = mongoose.model("userfeedback",UserFeedbackSchema)
module.exports = UserFeedbackModel