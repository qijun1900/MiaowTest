const mongoose = require('mongoose')

const ConsumerSchema = new mongoose.Schema({
    username: {//�û���
        type: String,
        unique: true,
        index: true
    },
    email: { //����
        type: String,
    },
    password : { //����
        type: String,
    },
    openid: { //openid
        type: String,
    },
    session_key: {// session_key
        type: String,
    },
    nickname: { //�ǳ�
        type: String,
        default: ''
    },
    avatar: {  //ͷ��
        type: String,
        default: ''
    },
    gender: {
        type: Number,
        default: 0 //0 δ֪ 1 �� 2 Ů
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