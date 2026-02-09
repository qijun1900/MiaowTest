const mongoose = require('mongoose');

const WrongBookSchema = new mongoose.Schema({
    Uid: { //uid
        type: mongoose.Schema.Types.ObjectId,
        ref: 'consumer',
        required: true,
        index: true
    },                   
    title: {  // 错题本名称 (如 '英语语法专项')
        type: String,
        required: true,
        trim: true
    },        
    count: {  // 题目数量       
        type: Number,
        default: 0
    },                          
    iconBg: { // 图标背景颜色
        type: String,
        default: '#FFFFFF40'
    },                          
    questions: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },                      // 题目ID
        tags:{
            type: [String],
            default: [] 
        },
        questionType: {
            type: String,
            enum: ['select', 'judge', 'blank', 'short'],
            required: true
        },                      // 题目类型
        addedAt: {
            type: Date,
            default: Date.now
        },                      // 添加时间
        wrongCount: {
            type: Number,
            default: 1
        },                      // 错误次数
        lastWrongAt: {
            type: Date,
            default: Date.now
        }                       // 最后一次错误时间
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },                          // 创建时间
    updatedAt: {
        type: Date,
        default: Date.now
    }                           // 更新时间
});

// 自动更新updatedAt字段
WrongBookSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// 创建复合索引
WrongBookSchema.index({ userId: 1, name: 1 });

const WrongBookModel = mongoose.model('wrong_book', WrongBookSchema);

module.exports = WrongBookModel;
