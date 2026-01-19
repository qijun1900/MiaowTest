const { WordBooksModel } = require('../../models/WordBooksModel');
const ConsumerWordModel = require('../../models/ConsumerWordModel');
const VocabularyService = {
    /**
     * 获取单词书列表和单词书总数
     */
    getWordBooks: async () => { 
        try {
            const wordBooks = await WordBooksModel.find({},{
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
        }catch (error) {
            console.error("获取单词书列表失败", error);
            throw error;
        }
    
    },
    /**
     * 设置用户单词书和每日词数
     */
    setWordRember: async ({ uid, currentBook_id, dailyGoal, currentBookTitle }) => {
        try{
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
        }catch (error) {
            console.error("设置用户单词书和每日词数失败", error);
            throw error;
        }
    }
}
module.exports = VocabularyService;