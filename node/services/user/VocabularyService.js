const { WordBooksModel } = require('../../models/WordBooksModel');
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
    
    }

}
module.exports = VocabularyService;