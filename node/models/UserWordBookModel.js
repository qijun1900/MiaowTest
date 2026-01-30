const mongoose = require('mongoose');

/**
 * 用户自定义单词书模型
 * 用于存放用户创建的单词书信息
 */
const UserWordBookSchema = new mongoose.Schema({
    // 关联用户
    Uid: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'consumer', // 关联到 consumer 表
        required: true,
        index: true
    },

    // 单词书标题
    title: { 
        type: String,
        required: true,
        trim: true
    },

    // 封面图片URL
    cover_url: { 
        type: String,
        default: ''
    },

    // 封面图片ID (可能用于关联文件资源表)
    cover_id: { 
        type: String,
        default: ''
    },

    // 是否为自定义封面
    isSelfCover: {
        type: Boolean,
        default: false
    },

    // 单词书描述
    description: { 
        type: String,
        default: ''
    },

    // 包含的单词数量
    wordCount: { 
        type: Number, 
        default: 0 
    },

    // 标签
    tags: { 
        type: [String], 
        default: [] 
    },

    // 是否公开 (默认私有)
    isPublic: { 
        type: Boolean, 
        default: false 
    },

    // 创建时间
    createTime: { 
        type: Date, 
        default: Date.now 
    },

    // 更新时间
    updateTime: { 
        type: Date, 
        default: Date.now 
    }
});

// 自动更新 updateTime
UserWordBookSchema.pre('save', function(next) {
    this.updateTime = Date.now();
    next();
});

// 创建索引
UserWordBookSchema.index({ Uid: 1, createTime: -1 });

const UserWordBookModel = mongoose.model('user_wordbook', UserWordBookSchema);

module.exports = UserWordBookModel;
