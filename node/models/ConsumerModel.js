const mongoose = require('mongoose')

const ConsumerSchema = new mongoose.Schema({
    username: {//用户名
        type: String,
        unique: true,
        index: true
    },
    email: { //邮箱
        type: String,
    },
    password : { //密码
        type: String,
    },
    openid: { //openid
        type: String,
    },
    session_key: {// session_key
        type: String,
    },
    nickname: { //昵称
        type: String,
        default: ''
    },
    avatar: {  //头像
        type: String,
        default: ''
    },
    gender: {
        type: Number,
        default: 0 //0 未知 1 男 2 女
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