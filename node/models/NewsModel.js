const mongoose = require('mongoose')

const NewsSchema = new mongoose.Schema({
    tittle: String,
    content: String,
    category:Number,//性别,0,1,2
    cover:String,
    isPublish:Number,//0:未发布，1：发布
    editTime:Date,
})

const NewsModel  = mongoose.model("news",NewsSchema)

module.exports = NewsModel