const mongoose = require('mongoose')
/**
 * 客户端用户表
 * @param {String} username 用户名，唯一
 * @param {String} email 邮箱，唯一
 * @param {String} password 密码，加密存储 
 * @param {String} openid openid，唯一
 * @param {String} session_key session_key，唯一
 * @param {String} nickname 昵称，默认空字符串
 * @param {String} avatar 头像，默认空字符串
 * @param {Number} gender 性别，0: 未知、1: 男性、2: 女性，默认0
 * @param {Date} createTime 创建时间，默认当前时间
 * @param {Array} favoriteExams 收藏的考试，默认空数组
 * @param {Array} questionbanks 题库，默认空数组
 * @param {Array} wrongQuestions 用户错题，默认空数组
 * @param {Array} favoriteQuestions 收藏的题目，默认空数组
 * @param {Number} AuthRequiredExams 认证要求的考试，默认空数组
 * @return {*}
 */

const ConsumerSchema = new mongoose.Schema({
    username: {
        type: String,
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
    userCount: { // 用户注册顺序号
        type: Number,
        unique: true,
        sparse: true // 允许唯一值为null
    },
    favoriteExams:{// 收藏的考试
        type:Array,
        default:[]
    },
    AuthRequiredExams:{// 认证要求的考试
        type:Array,
        default:[]
    },
    questionbanks:{// 题库
        type: [{
            _id: { // 题库唯一标识
                type: mongoose.Schema.Types.ObjectId,// 引用用户题库
                default: () => new mongoose.Types.ObjectId()// 自动生成ID
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
                required: true
            },
            examId: { // 考试ID
                type: mongoose.Schema.Types.ObjectId,
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
    },
    favoriteQuestions: { // 收藏的题目
        type: [{
            questionId: { // 题目ID
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            examId: { // 考试ID
                type: mongoose.Schema.Types.ObjectId,
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