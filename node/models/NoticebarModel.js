const mongoose = require('mongoose')

const noticebarSchema = new mongoose.Schema({
content:String,
isPublish:Number,//0:未发布，1：发布
editTime:Date,
})

const NoticebarModel  = mongoose.model("notice",noticebarSchema)

module.exports = NoticebarModel