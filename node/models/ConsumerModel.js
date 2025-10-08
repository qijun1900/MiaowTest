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
    favoriteExams:{// 收藏的考试
        type:Array,
        default:[]
    },
    favoriteQuestions:{// 收藏的题目
        type:Array,
        default:[]
    },
    questionbanks:{// 题库
        type: [{
            _id: { // 题库唯一标识
                type: mongoose.Schema.Types.ObjectId,
                default: () => new mongoose.Types.ObjectId()
            },
            bankName: { // 题库名称
                type: String,
                required: true
            },
            description: { // 题库描述
                type: String,
                default: ''
            },
            createTime: { // 创建时间
                type: Date,
                default: Date.now
            },
            questionCount: { // 题目数量
                type: Number,
                default: 0
            },
            isPublic: { // 是否公开
                type: Boolean,
                default: false
            }
        }],
        default:[]
    },
    wrongQuestions:{//用户错题
        type: [{
            questionId: { // 题目ID
                type: mongoose.Schema.Types.ObjectId,
                ref: 'consumer.questionbanks',// 引用用户题库
                required: true
            },
            examId: { // 考试ID
                type: mongoose.Schema.Types.ObjectId,
                ref: 'consumer.exams',// 引用用户考试
                required: true
            },
            Type: { // 题目类型： 1-选择题 2-填空题 3-判断题 4-简答题
                type: Number,
                required: true,
                enum: [1, 2, 3, 4]// 限定类型
            },
            createTime: { // 创建时间
                type: Date,
                default: Date.now
            }   
        }]
    }
})


const ConsumerModel = mongoose.model("consumer", ConsumerSchema)

module.exports = ConsumerModel