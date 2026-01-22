const { WordBooksModel } = require('../../models/WordBooksModel');
const ConsumerWordModel = require('../../models/ConsumerWordModel');
const WordModel = require('../../models/WordModel');

const VocabularyService = {
    /**
     * 获取单词书列表和单词书总数
     */
    getWordBooks: async () => {
        try {
            const wordBooks = await WordBooksModel.find({}, {
                updatedAt: 0,
                createdAt: 0,
                fileSize: 0,
                starredNumber: 0,
                reciteCount: 0,
                reciteNumber: 0,
            });
            const totalCount = await WordBooksModel.countDocuments();
            return {
                wordBooks,
                totalCount
            };
        } catch (error) {
            console.error("获取单词书列表失败", error);
            throw error;
        }

    },
    /**
     * 设置用户单词书和每日词数
     */
    setWordRember: async ({ uid, currentBook_id, dailyGoal, currentBookTitle }) => {
        try {
            const existing = await ConsumerWordModel.findOne({ uid });
            if (existing) {
                await ConsumerWordModel.updateOne({ uid }, {
                    'settings.currentBook_id': currentBook_id,
                    'settings.dailyGoal': dailyGoal,
                    'settings.currentBookTitle': currentBookTitle
                });
            } else {
                await ConsumerWordModel.create({
                    uid,
                    settings: {
                        currentBook_id,
                        dailyGoal,
                        currentBookTitle
                    }
                });
            }
            return { success: true };
        } catch (error) {
            console.error("设置用户单词书和每日词数失败", error);
            throw error;
        }
    },
    checkWordRember: async ({ uid }) => {
        try {
            const userSettings = await ConsumerWordModel.findOne({ uid }, { 'settings.currentBook_id': 1, 'settings.dailyGoal': 1 });
            return {
                currentBook_id: userSettings?.settings?.currentBook_id || null,
                dailyGoal: userSettings?.settings?.dailyGoal || null
            };
        } catch (error) {
            console.error("检查用户单词书设置失败", error);
            throw error;
        }
    },
    /**
     * @description 需要的字段：
        1._id : 单词_id
        2. headWord: 对应粗体的单词
        3. usphone: 音标 (需要加/ /)
        4. trans0.pos: 词性
        5. trans0.tranCn: 中文释义
        6. trans0.tranOther: 英文释义
        7. sentence.sentences0.sContent: 例句
     */
    getWordBookList: async ({ bookId, page = 1, pageSize = 20 }) => {
        try {
            const skip = (page - 1) * pageSize;

            const [result, total] = await Promise.all([
                WordModel.aggregate([
                    { $match: { bookId: bookId } }, // 1. 筛选
                    { $sort: { wordRank: 1 } },     // 2. 排序
                    { $skip: skip },                // 3. 跳过
                    { $limit: pageSize },          // 4. 限制
                    {
                        $project: {                 // 5. 投影并重塑结构
                            _id: 1,
                            headWord: 1,
                            phonetic: {
                                $concat: ["/", { $ifNull: ["$content.word.content.usphone", ""] }, "/"]
                            },
                            // 获取数组第一个元素的字段
                            firstTrans: { $arrayElemAt: ["$content.word.content.trans", 0] },
                            firstSentence: { $arrayElemAt: ["$content.word.content.sentence.sentences", 0] }
                        }
                    },
                    {
                        $project: { // 6. 再次投影整理最终字段
                            _id: 1,
                            headWord: 1,
                            phonetic: 1,
                            pos: { $ifNull: ["$firstTrans.pos", ""] },
                            cn: { $ifNull: ["$firstTrans.tranCn", ""] },
                            en: { $ifNull: ["$firstTrans.tranOther", ""] },
                            sentence: { $ifNull: ["$firstSentence.sContent", ""] }
                        }
                    }
                ]),
                WordModel.countDocuments({ bookId: bookId })
            ]);

            return {
                list: result,
                total,
                page,
                pageSize,
                hasMore: skip + pageSize < total
            };
        } catch (error) {
            console.error("获取单词书列表失败", error);
            throw error;
        }
    }
}
module.exports = VocabularyService;