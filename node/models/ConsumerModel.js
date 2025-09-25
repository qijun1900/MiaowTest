const mongoose = require('mongoose')

const ConsumerSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,// 唯一索引
        index: true// 索引
    },
    email: { 
        type: String,
    },
    password : {
        type: String,
    },
    openid: { //openid
        type: String,
    },
    session_key: {// session_key
        type: String,
    },
    nickname: { 
        type: String,
        default: ''
    },
    avatar: {  
        type: String,
        default: ''
    },
    gender: {
        type: Number,
        default: 0 //性别 0: 未知、1: 男性、2: 女性
    },
    createTime: {
        type: Date,
    },
    favoriteExams:{
        type:Array,
        default:[]
    }
})

const ConsumerModel = mongoose.model("consumer", ConsumerSchema)

module.exports = ConsumerModel