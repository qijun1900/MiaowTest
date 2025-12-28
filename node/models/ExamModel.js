const mongoose = require('mongoose');
const ExamSchema  = new mongoose.Schema({
    name:String,
    code:String,
    category:[Number],
    year:String,
    cover:String,
    isPublish:Number,
    isAuthRequired:{ //是否需要认证，0-不需要，1-需要
        type:Number,default:0
    },
    creator:String,
    day:Date,
    createdTime:Date,
    clickTimes:{
        type:Number,
        default:0
    }
})
const ExamModel  = mongoose.model("exam",ExamSchema)
module.exports = ExamModel