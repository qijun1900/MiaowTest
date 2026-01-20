const mongoose = require('mongoose');


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
module.exports = WordModel;