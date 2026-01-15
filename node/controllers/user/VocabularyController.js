const VocabularyService = require('../../services/user/VocabularyService');

const VocabularyController = {
    getWordBooks: async (req, res) => {
        try {
            const wordBooks = await VocabularyService.getWordBooks();    
            res.send({
                code: 200,
                data: wordBooks
            });
        } catch (error) {
            console.error("获取单词书列表失败", error);
            res.status(500).send({ 
                code: 500,
                message: "获取单词书列表失败" 
            });
        }
    }
};

module.exports = VocabularyController;