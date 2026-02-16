const mongoose = require('mongoose');

/**
 * 错题模型
 * 存储用户的错题详细信息，包括错误答案、正确答案、复习记录等
 */

const WrongQuestionSchema = new mongoose.Schema({
    // 用户关联信息
    Uid: { // 用户ID
        type: mongoose.Schema.Types.ObjectId,
        ref: 'consumer',
        required: true,
        index: true
    },
    
    // 错题本关联信息
    wrongBookId: { // 所属错题本ID
        type: mongoose.Schema.Types.ObjectId,
        ref: 'wrong_book',
        required: true,
        index: true
    },
    
    // 原题目关联信息
    questionId: { // 原题目ID
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    Type: { //// 1-选择题 2-填空题 3-判断题 4-简答题
        type: Number,
        enum: [1,2,3,4], 
        required: true
    },
    questionSource: { // 题目来源：system-系统题库 user-用户自建
        type: String,
        enum: ['system', 'user'],
        default: 'user'
    },
    
    // 题目内容（冗余存储，避免原题被删除）
    stem: { // 题干（支持富文本和图片）
        text: { // 文本内容
            type: String,
            default: ''
        },
        images: [{ // 图片列表
            url: String, // 图片URL
        }]
    },
    options: { // 选项（选择题/填空题）
        type: Array,
        default: []
    },
    
    // 答案信息
    wrongAnswer: { // 用户的错误答案（支持富文本和图片）
        text: { // 文本内容
            type: String,
            default: ''
        },
        images: [{ // 图片列表
            url: String,
        }]
    },
    correctAnswer: { // 正确答案（支持富文本和图片）
        text: { // 文本内容
            type: String,
            default: ''
        },
        images: [{ // 图片列表
            url: String,
        }]
    },
    analysis: { // 题目解析（支持富文本和图片）
        text: { // 文本内容
            type: String,
            default: ''
        },
        images: [{ // 图片列表
            url: String,
        }]
    },
    
    // 标签和分类
    tags: { // 知识点标签（如：#代数、#一元二次方程）
        type: [String],
        default: []
    },

    difficulty: { // 难度：easy-简单 medium-中等 hard-困难
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    
    // 复习状态
    status: { // 状态：0-new（新题） 1-reviewing（复习中） 2-mastered（已掌握）
        type: Number,
        enum: [0, 1, 2],
        default: 0
    },

    reviewCount: { // 复习次数
        type: Number,
        default: 0
    },

    wrongCount: { // 错误次数
        type: Number,
        default: 1
    },
    
    // 笔记内容
    note: { // 用户笔记/心得（支持富文本和图片）
        text: { // 文本内容
            type: String,
            default: ''
        },
        images: [{ // 图片列表
            url: String,
        }]
    },
    noteUpdatedAt: { // 笔记更新时间
        type: Date,
        default: null
    },
    
    // 复习记录
    reviewHistory: [{ // 复习历史记录
        reviewedAt: { // 复习时间
            type: Date,
            default: Date.now
        },
        isCorrect: { // 本次复习是否正确
            type: Boolean,
            default: false
        },
        timeSpent: { // 本次复习耗时（秒）
            type: Number,
            default: 0
        }
    }],
    
    // 时间戳
    addedAt: { // 添加到错题本的时间
        type: Date,
        default: Date.now
    },
    lastWrongAt: { // 最后一次做错的时间
        type: Date,
        default: Date.now
    },
    lastReviewAt: { // 最后一次复习的时间
        type: Date,
        default: null
    },
    nextReviewAt: { // 下次建议复习时间（艾宾浩斯遗忘曲线）
        type: Date,
        default: null
    },
    masteredAt: { // 掌握时间
        type: Date,
        default: null
    },
    createdAt: { // 创建时间
        type: Date,
        default: Date.now
    },
    updatedAt: { // 更新时间
        type: Date,
        default: Date.now
    }
});

// 自动更新updatedAt字段
WrongQuestionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// 创建复合索引以提高查询性能
WrongQuestionSchema.index({ Uid: 1, wrongBookId: 1 }); // 用户+错题本查询
WrongQuestionSchema.index({ Uid: 1, status: 1 }); // 用户+状态查询
WrongQuestionSchema.index({ Uid: 1, Type: 1 }); // 用户+题目类型查询
WrongQuestionSchema.index({ nextReviewAt: 1 }); // 复习提醒查询
WrongQuestionSchema.index({ createdAt: -1 }); // 时间排序

// 实例方法：标记为已掌握
WrongQuestionSchema.methods.markAsMastered = function() {
    this.status = 2; 
    this.reviewCount += 1; 
    this.masteredAt = Date.now();
    return this.save();
};

// 实例方法：标记为需要复习
WrongQuestionSchema.methods.markAsNeedReview = function() {
    this.status = 1;
    this.wrongCount += 1;
    return this.save();
}

// 实例方法：添加复习记录
WrongQuestionSchema.methods.addReviewRecord = function(isCorrect, timeSpent = 0) {
    this.reviewCount += 1;
    this.lastReviewAt = Date.now();
    
    // 添加复习历史
    this.reviewHistory.push({
        reviewedAt: Date.now(),
        isCorrect: isCorrect,
        timeSpent: timeSpent
    });
    
    // 如果答对了，更新状态
    if (isCorrect) {
        if (this.status === 0) {
            this.status = 1;
        }
        // 计算下次复习时间（艾宾浩斯遗忘曲线）
        this.nextReviewAt = this.calculateNextReviewTime();
    } else {
        // 如果答错了，增加错误次数
        this.wrongCount += 1;
        this.lastWrongAt = Date.now();
    }
    
    return this.save();
};

// 实例方法：计算下次复习时间（简化版艾宾浩斯遗忘曲线）
WrongQuestionSchema.methods.calculateNextReviewTime = function() {
    const now = Date.now();
    const intervals = [1, 2, 4, 7, 15, 30]; // 天数间隔
    const reviewIndex = Math.min(this.reviewCount - 1, intervals.length - 1);
    const daysToAdd = intervals[reviewIndex];
    
    return new Date(now + daysToAdd * 24 * 60 * 60 * 1000);
};

// 静态方法：获取需要复习的题目
WrongQuestionSchema.statics.getNeedReviewQuestions = function(userId) {
    return this.find({
        Uid: userId,
        status: { $in: [0, 1] },
        nextReviewAt: { $lte: new Date() }
    }).sort({ nextReviewAt: 1 });
};

const WrongQuestionModel = mongoose.model('wrong_question', WrongQuestionSchema);

module.exports = WrongQuestionModel;
