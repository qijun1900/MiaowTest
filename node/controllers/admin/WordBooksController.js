const WordBooksService = require('../../services/admin/WordBooksService');

const WordBooksController = {
    getWordBooksList: async (req, res) => {
        try {
            const { page = 1, size = 10 } = req.query;
            const result = await WordBooksService.getWordBooksList(page, size);

            res.status(200).send({
                code: 200,
                ActionType: 'OK',
                data: result
            });

        } catch (error) {
            console.error('获取词书列表失败:', error);
            res.status(500).send({
                code: 500,
                ActionType: 'ERROR',
                message: '获取词书列表失败'
            });

        }

    },
    updateWordBook: async (req, res) => {
        try {
            // 使用 uploadToOSS 中间件处理后的相对路径，如果没有文件则为 ""
            const cover = req.file ? req.file.relativePath : "";
            const { _id, title, tags, words, reciteCount } = req.body;
            if (!_id) {
                return res.status(400).send({
                    code: 400,
                    ActionType: 'ERROR',
                    message: '缺少词书ID'
                });
            }
            let handleTag;
            if (typeof tags === 'string') {
                handleTag = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            }
            const result = await WordBooksService.updateWordBook(_id, title, handleTag, words, reciteCount, cover);
            if (!result) {
                return res.status(404).send({
                    code: 404,
                    ActionType: 'ERROR',
                    message: '词书不存在'
                });
            }
            res.status(200).send({
                code: 200,
                ActionType: 'OK',
                data: result,
                message: '词书更新成功'
            });
        } catch (error) {
            console.error('更新词书失败:', error);
            res.status(500).send({
                code: 500,
                ActionType: 'ERROR',
                message: '更新词书失败'
            });
        }
    },
    deleteOneWordBook: async (req, res) => {
        try {
            const { _id } = req.body;
            if (!_id) {
                return res.status(400).send({
                    code: 400,
                    ActionType: 'ERROR',
                    message: '缺少词书ID'
                });
            }
            const result = await WordBooksService.deleteOneWordBook(_id);
            if (!result) {
                return res.status(404).send({
                    code: 404,
                    ActionType: 'ERROR',
                    message: '词书不存在'
                });
            }
            res.status(200).send({
                code: 200,
                ActionType: 'OK',
                message: '词书删除成功'
            });
        } catch (error) {
            console.error('删除词书失败:', error);
            res.status(500).send({
                code: 500,
                ActionType: 'ERROR',
                message: '删除词书失败'
            });
        }
    },
    deleteManyWordBooks: async (req, res) => {
        try {
            const { _ids } = req.body;
            if (!_ids || !Array.isArray(_ids) || _ids.length === 0) {

                return res.status(400).send({
                    code: 400,
                    ActionType: 'ERROR',
                    message: '缺少词书ID列表'
                });

            }
            const result = await WordBooksService.deleteManyWordBooks(_ids);
            res.status(200).send({
                code: 200,
                ActionType: 'OK',
                data: {
                    deletedCount: result.deletedCount
                },
                message: `成功删除 ${result.deletedCount} 本词书`
            });
        } catch (error) {
            console.error('批量删除词书失败:', error);
            res.status(500).send({
                code: 500,
                ActionType: 'ERROR',
                message: '批量删除词书失败'
            });
        }
    }
};

module.exports = WordBooksController