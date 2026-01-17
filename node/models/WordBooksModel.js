//单词书对应模型
const mongoose = require('mongoose');

// 系统默认词书数据（哈希表）
const bookIdToImageMap = {
    'CET4luan_1': { title: '四级真题核心词（图片记忆）', words: 1162, fileSize: 788457, reciteCount: 875260, tags: ['四级', '有道'] },
    'CET6luan_1': { title: '六级真题核心词（图片记忆）', words: 1228, fileSize: 591417, reciteCount: 218418, tags: ['六级', '有道'] },
    'KaoYanluan_1': { title: '考研必考词汇', words: 1341, fileSize: 771889, reciteCount: 252505, tags: ['考研', '有道'] },
    'Level4luan_1': { title: '专四真题高频词', words: 595, fileSize: 269844, reciteCount: 62169, tags: ['专四', '有道'] },
    'Level8_1': { title: '专八真题高频词', words: 684, fileSize: 242255, reciteCount: 30059, tags: ['专八', '有道'] },
    'CET4luan_2': { title: '四级英语词汇', words: 3739, fileSize: 2723074, reciteCount: 215979, tags: ['四级', '有道'] },
    'CET6_2': { title: '六级英语词汇', words: 2078, fileSize: 1111633, reciteCount: 64093, tags: ['六级', '有道'] },
    'KaoYan_2': { title: '考研英语词汇', words: 4533, fileSize: 2431155, reciteCount: 147205, tags: ['考研', '有道'] },
    'Level4luan_2': { title: '专四核心词汇', words: 4025, fileSize: 1783295, reciteCount: 18858, tags: ['专四', '有道'] },
    'Level8luan_2': { title: '专八核心词汇', words: 12197, fileSize: 5320395, reciteCount: 23123, tags: ['专八', '有道'] },
    'CET4_3': { title: '新东方四级词汇', words: 2607, fileSize: 1719305, reciteCount: 3063, tags: ['四级', '新东方'] },
    'CET6_3': { title: '核心六级词汇', words: 2345, fileSize: 1452645, reciteCount: 1193, tags: ['六级', '新东方'] },
    'KaoYan_3': { title: '新东方考研词汇', words: 3728, fileSize: 1838572, reciteCount: 2644, tags: ['考研', '新东方'] }
};

// 根据bookId查找对应图片信息的函数
/**
 * 根据bookId查找对应图片信息的函数。
 * @param {string} bookId - 词汇书ID。
 * @returns {Object|null} - 包含图片信息的对象，如果未找到则返回null。
 */
const getImageByBookId = (bookId) => {
    return bookIdToImageMap[bookId] || null;
};

const WordBooksSchema = new mongoose.Schema({
    bookId: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true, 
        index: true 
    },           // 词汇书标识 (如 "CET4luan_1")
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },            // 书名
    words: { 
        type: Number, 
        default: 0 
    },            // 单词数量
    fileSize: { 
        type: Number, 
        default: 0 
    },           // 文件大小（字节）
    reciteCount: { 
        type: Number, 
        default: 0 
    },         // 默认背诵人数
    tags: { 
        type: [String], 
        default: [],
        index: true 
    },            // 标签（如 ['四级', '有道']）
    createdAt: { 
        type: Date, 
        default: Date.now 
    },         // 创建时间  
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },          // 更新时间
    cover:{
        type: String,
        default: ''
    },        // 封面图片URL
    starredNumber:{
        type: Number,
        default: 0  // 学习人数
    },
}); 

// 自动更新updatedAt字段
WordBooksSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// 创建并导出模型
const WordBooksModel = mongoose.model('word_books', WordBooksSchema);

module.exports = {
    WordBooksModel,
    getImageByBookId, // 导出函数
    bookIdToImageMap, // 导出默认词书数据
};
