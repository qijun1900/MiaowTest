const mongoose = require('mongoose')
//Admin USer
const ConsumerSchema = new mongoose.Schema({
    openid: {//用户唯一标识
        type: String,
        required: true,
        unique: true,
        index: true//索引
    },
    session_key: {//用户会话密钥
        type: String,
        required: true
    },
    nickname: { //昵称
        type: String,
        default: ''
    },
    avatar: {   //头像
        type: String,
        default: ''
    },
    gender: {
        type: Number,
        default: 0 // 0:未知, 1:男, 2:女
    },
    createTime: {
        type: Date,
    }


})

const ConsumerModel = mongoose.model("consumer", ConsumerSchema)

module.exports = ConsumerModel