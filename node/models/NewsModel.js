const mongoose = require('mongoose')

const NewsSchema = new mongoose.Schema({
    title: String,
    content: String,
    category:Number,//分类
    cover:String,
    isPublish:Number,//0:未发布，1：发布
    creator:String,//创建者
    editTime:Date,
})

const NewsModel  = mongoose.model("news",NewsSchema)

module.exports = NewsModel