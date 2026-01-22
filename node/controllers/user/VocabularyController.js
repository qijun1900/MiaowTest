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
    },
    setWordRember: async (req, res) => {
        try {
            const { uid } = req.user
            if (!uid) {
                return res.send({ 
                    code: 401, 
                    message: '您未登录' 
                }); 
            }
            const { currentBook_id, dailyGoal, currentBookTitle } = req.body;
            const result = await VocabularyService.setWordRember({ 
                uid,
                currentBook_id, 
                dailyGoal, 
                currentBookTitle,
            });
            if (!result.success) {
                return res.send({ 
                    code: 400, 
                    message: '设置失败' 
                }); 
            }else{
                res.send({
                    code: 200,
                    message: "设置成功"
                });
            }
        } catch (error) {
            console.error("设置词书和每日词数失败", error);
            res.status(500).send({ 
                code: 500,
                message: "设置词书和每日词数失败" 
            });
        }
    },
    checkWordRember: async (req, res) => {
        try {
            const { uid } = req.user
            if (!uid) {
                return res.send({ 
                    code: 401, 
                    message: '您未登录' 
                }); 
            }
            const data = await VocabularyService.checkWordRember({ uid });
            if (!data.currentBook_id && !data.dailyGoal) {
                return res.send({ 
                    code: 400, 
                    isInit: false
                }); 
            }else{
                res.send({
                    code: 200,
                    data,
                    isInit: true
                });
            }
        } catch (error) {
            console.error("检查词书和每日词数失败", error);
            res.status(500).send({ 
                code: 500,
                message: "检查词书和每日词数失败" 
            });
        }
    },
    getWordBookList: async (req, res) => {
        try {
            const { uid } = req.user
            if (!uid) {
                return res.send({
                    code: 401,
                    message: '您未登录'
                });
            }
            const { bookId, page, pageSize } = req.body;
            const data = await VocabularyService.getWordBookList({ bookId, page, pageSize });
            if (!data) {
                return res.send({
                    code: 400,
                    message: '获取单词书列表失败'
                });
            }
            res.send({
                code: 200,
                data,
            })
            
        }catch (error) {
            console.error("获取单词书列表失败", error);
            res.status(500).send({
                code: 500,
                message: "获取单词书列表失败"
            });
        }
        
    }
};

module.exports = VocabularyController;