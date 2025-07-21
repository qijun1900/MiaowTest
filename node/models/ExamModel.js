const mongoose = require('mongoose');
const ExamSchema  = new mongoose.Schema({
    name:String,
    code:String,
    category:[Number],
    year:String,
    cover:String,
    isPublish:Number,
    creator:String,
    day:Date,
    createdTime:Date,
})
const ExamModel  = mongoose.model("exam",ExamSchema)
module.exports = ExamModel