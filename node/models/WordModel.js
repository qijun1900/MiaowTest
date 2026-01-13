const mongoose = require('mongoose');

// 词汇书ID到图片的映射关系（哈希表）
const bookIdToImageMap = {
    'CET4luan_1': { title: '四级真题核心词（图片记忆）', words: 1162, reciteCount: 875260, tags: ['四级', '有道'] },
    'CET6luan_1': { title: '六级真题核心词（图片记忆）', words: 1228,  reciteCount: 218418, tags: ['六级', '有道'] },
    'KaoYanluan_1': { title: '考研必考词汇', words: 1341, reciteCount: 252505, tags: ['考研', '有道'] },
    'Level4luan_1': { title: '专四真题高频词', words: 595,  reciteCount: 62169, tags: ['专四', '有道'] },
    'Level8_1': { title: '专八真题高频词', words: 684,  reciteCount: 30059, tags: ['专八', '有道'] },
    'CET4luan_2': { title: '四级英语词汇', words: 3739,  reciteCount: 215979, tags: ['四级', '有道'] },
    'CET6_2': { title: '六级英语词汇', words: 2078,  reciteCount: 64093, tags: ['六级', '有道'] },
    'KaoYan_2': { title: '考研英语词汇', words: 4533,  reciteCount: 147205, tags: ['考研', '有道'] },
    'Level4luan_2': { title: '专四核心词汇', words: 4025,  reciteCount: 18858, tags: ['专四', '有道'] },
    'Level8luan_2': { title: '专八核心词汇', words: 12197,  reciteCount: 23123, tags: ['专八', '有道'] },
    'CET4_3': { title: '新东方四级词汇', words: 2607,  reciteCount: 3063, tags: ['四级', '新东方'] },
    'CET6_3': { title: '核心六级词汇', words: 2345,  reciteCount: 1193, tags: ['六级', '新东方'] },
    'KaoYan_3': { title: '新东方考研词汇', words: 3728,  reciteCount: 2644, tags: ['考研', '新东方'] }
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

const WordSchema = new mongoose.Schema({
    bookId: String,           // 词汇书标识 (如 "CET4luan_1")
    wordRank: Number,         // 单词排序
    headWord: String,         // 单词
    content: {                // 单词详细内容
        word: {
            wordHead: String,     // 词头
            wordId: String,       // 单词ID
            content: {            // 详细属性
                sentence: {           // 例句
                    sentences: [{     // 例句列表
                        sContent: String, // 英文例句
                        sCn: String       // 中文翻译
                    }],
                    desc: String          // 描述 (如 "例句")
                },
                usphone: String,         // 美式音标
                ukspeech: String,        // 英式发音
                star: Number,            //
                usspeech: String,        // 美式发音
                picture: String,         // 图片URL
                syno: {                  // 同近义词
                    synos: [{            // 同近义词列表
                        pos: String,        // 词性
                        tran: String,       // 释义
                        hwds: [{            // 相关词
                            w: String       // 词条
                        }]
                    }],
                    desc: String          // 描述 (如 "同近")
                },
                ukphone: String,         // 英式音标
                phrase: {                // 短语
                    phrases: [{           // 短语列表
                        pContent: String,   // 英文短语
                        pCn: String         // 中文翻译
                    }],
                    desc: String          // 描述 (如 "短语")
                },
                phone: String,           // 音标
                speech: String,          // 发音
                remMethod: {             // 记忆方法
                    val: String,            // 记忆内容
                    desc: String            // 描述 (如 "记忆")
                },
                relWord: {               // 同根词
                    desc: String,            // 描述 (如 "同根")
                    rels: [{                 // 同根词列表
                        pos: String,          // 词性
                        words: [{             // 单词列表
                            hwd: String,      // 词条
                            tran: String      // 释义
                        }]
                    }]
                },
                trans: [{            // 翻译释义
                    tranCn: String,       // 中文翻译
                    descOther: String,    // 英文描述
                    pos: String,          // 词性
                    descCn: String,       // 中文描述
                    tranOther: String     // 英文翻译
                }]
            }
        }
    },
    createdTime: { type: Date, default: Date.now }  // 创建时间
});

WordSchema.index({ bookId: 1, wordRank: 1 });
WordSchema.index({ bookId: 1, headWord: 1 });

const WordModel = mongoose.model('word', WordSchema);

// 导出模型和哈希表相关功能
module.exports = {
    WordModel,
    bookIdToImageMap, // 导出哈希表
    getImageByBookId // 导出查找函数
};
