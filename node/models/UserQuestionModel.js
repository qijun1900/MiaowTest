const mongoose = require('mongoose');
/**
 * 用户题目模型
 * 存储用户创建的题目信息，包括题目类型、选项、答案等
 */

const UserQuestionSchema = new mongoose.Schema({
    // 用户关联信息
    Uid: { // 创建题目的用户ID
        type: mongoose.Schema.Types.ObjectId,// 关联用户表的主键
        ref: 'consumer',// 引用用户模型
        required: true// 必填
    },
    
    // 题库关联信息
    questionbankId: { // 所属题库ID
        type: mongoose.Schema.Types.ObjectId,
        ref: 'consumer.questionbanks',// 引用用户题库
        default: null
    },
    
    // 题目基本信息
    stem: { // 题目标题/题干
        type: String,
        required: true
    },
    Type: { // 题目类型： 1-选择题 2-填空题 3-判断题 4-简答题
        type: Number,
        required: true,
        enum: [1, 2, 3, 4]// 限定类型
    },
    
    // 简答题答案 
    content: { 
        type: String,
        default:null
    },
    options: { // 选择题选项及答案，填空题答案内容
        type: Array,
        default:null,
    },
    answer: {  //0:错误，1：正确
        type: Number, //答案，针对判断题
        default: null
    },
    analysis: { // 解析 
        type: String,
        default: ''
    },
    
    // 选择题特有字段
    isMultiple: { // 是否多选（仅选择题有效）
        type:Number,
        default:null
    },
    
    // 状态管理
    status: { // 状态：0-草稿 1-已发布 2-审核中 3-审核不通过
        type: Number,
        default: 0
    },
    // 时间戳
    createTime: {
        type: Date,
        default: Date.now
    }
});

// 添加索引以提高查询性能
UserQuestionSchema.index({ Uid: 1, createTime: -1 });
UserQuestionSchema.index({ Type: 1, status: 1 });
UserQuestionSchema.index({ questionbankId: 1 }); // 添加题库索引

const UserQuestionModel = mongoose.model("user_question", UserQuestionSchema);
module.exports = UserQuestionModel;