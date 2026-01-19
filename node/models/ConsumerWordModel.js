const mongoose = require('mongoose');

/**
 * 用户单词学习模型
 * 包含用户的单词学习设置、学习进度、单词掌握情况等数据
 */

const ConsumerWordSchema = new mongoose.Schema({
    // 用户uid，关联到 Consumer
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'consumer',
        required: true,
        index: true
    },

    // ==================== 每日学习设置（设置） ====================
    settings: {
        // 每日学习目标（单词数量）
        dailyGoal: {
            type: Number,
            default: 30,
            min: 1,
            max: 500
        },
        // 当前学习的词书ID
        currentBook_id: {
            type: String,
            default: '',
            ref: 'word_books'
        },
        //
        currentBookTitle: {
            type: String,
            default: ''
        },
        // // 学习模式：1-顺序学习 2-乱序学习 3-智能复习
        // learningMode: {
        //     type: Number,
        //     default: 1,
        //     enum: [1, 2, 3]
        // },
        // // 是否开启每日提醒
        // dailyReminder: {
        //     type: Boolean,
        //     default: false
        // },
        // // 提醒时间（小时）
        // reminderTime: {
        //     type: String,
        //     default: '09:00'
        // },

        // 是否自动播放发音
        autoPlayAudio: {
            type: Boolean,
            default: true
        },

        // 发音类型：1-美式 2-英式
        pronunciationType: {
            type: Number,
            default: 1,
            enum: [1, 2]
        }
    },

    // ==================== 学习进度(数据) ====================
    progress: {
        //当前学习到的单词序号（wordRank）
        currentWordRank: {
            type: Number,
            default: 0
        },
        // 总学习天数
        totalDays: {
            type: Number,
            default: 0
        },
        // 连续打卡天数
        consecutiveDays: {
            type: Number,
            default: 0
        },
        // 最长连续打卡天数
        maxConsecutiveDays: {
            type: Number,
            default: 0
        },
        // 累计学习单词数
        totalWordsLearned: {
            type: Number,
            default: 0
        },
        // 上次学习时间
        lastLearningDate: {
            type: Date,
            default: null
        }
    },

    // ==================== 每日打卡记录 ====================
    dailyRecords: [{
        // 打卡日期（YYYY-MM-DD格式）
        date: {
            type: String,
            required: true
        },
        // 当天学习单词数
        wordsLearned: {
            type: Number,
            default: 0
        },
        // 学习时长（分钟）
        duration: {
            type: Number,
            default: 0
        },
        // 是否完成目标
        goalCompleted: {
            type: Boolean,
            default: false
        },
        // 创建时间
        createTime: {
            type: Date,
            default: Date.now
        }
    }],

    // ==================== 单词掌握情况 ====================
    wordMastery: [{
        // 单词ID
        wordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'word',
            required: true
        },
        // 词书ID
        bookId: {
            type: String,
            required: true
        },
        // 单词（便于查询）
        headWord: {
            type: String,
            required: true
        },
        // 掌握程度：0-未学习 1-学习中 2-已掌握 3-熟练
        masteryLevel: {
            type: Number,
            default: 0,
            enum: [0, 1, 2, 3]
        },
        // 复习次数
        reviewCount: {
            type: Number,
            default: 0
        },
        // 错误次数
        wrongCount: {
            type: Number,
            default: 0
        },
        // 首次学习时间
        firstLearnTime: {
            type: Date,
            default: Date.now
        },
        // 最后复习时间
        lastReviewTime: {
            type: Date,
            default: Date.now
        },
        // 下次复习时间（基于艾宾浩斯遗忘曲线）
        nextReviewTime: {
            type: Date,
            default: null
        },
        // 是否收藏
        isFavorite: {
            type: Boolean,
            default: false
        }
    }],

    // ==================== 创建和更新时间 ====================
    createTime: {
        type: Date,
        default: Date.now
    },
    updateTime: {
        type: Date,
        default: Date.now
    }
});

// 创建复合索引，提高查询效率
ConsumerWordSchema.index({ Uid: 1, 'settings.currentBookId': 1 });
ConsumerWordSchema.index({ Uid: 1, 'wordMastery.bookId': 1 });
ConsumerWordSchema.index({ Uid: 1, 'wordMastery.masteryLevel': 1 });
ConsumerWordSchema.index({ Uid: 1, 'wordMastery.nextReviewTime': 1 });
ConsumerWordSchema.index({ Uid: 1, 'dailyRecords.date': 1 });

// 自动更新 updateTime
ConsumerWordSchema.pre('save', function(next) {
    this.updateTime = Date.now();
    next();
});

const ConsumerWordModel = mongoose.model('consumerword', ConsumerWordSchema);

module.exports = ConsumerWordModel;
