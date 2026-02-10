const WrongBookService = require('../../services/user/WrongBookService');

const WrongBookController = {
    // 获取错题本列表
    getWrongBooks: async (req, res) => {
        try {
            const { uid } = req.user;
            const data = await WrongBookService.getWrongBooks({ uid });
            res.send({
                code: 200,
                data: data
            });
        } catch (error) {
            console.error("获取错题本列表失败", error);
            res.status(500).send({
                code: 500,
                message: "获取错题本列表失败"
            });
        }
    },
    // 创建错题本
    createWrongBook: async (req, res) => {
        try {
            const { uid } = req.user;
            const { title, color } = req.body;
            const result = await WrongBookService.createWrongBook({ uid, title, color });
            if (!result.success) {
                return res.send({
                    code: 400,
                    message: '创建错题本失败'
                });
            }
            res.send({
                code: 200,
                message: '创建错题本成功',
            });
        } catch (error) {
            console.error("创建错题本失败", error);
            res.status(500).send({
                code: 500,
                message: "创建错题本失败"
            });
        }
    },
    // 获取错题本详情 (Book)
    getWrongBookDetail: async (req, res) => {
        try {
            const { uid } = req.user;
            const { id } = req.query;
            const data = await WrongBookService.getWrongBookDetail({ uid, id });
            if (!data) {
                return res.send({
                    code: 404,
                    message: '错题本不存在'
                });
            }
            res.send({
                code: 200,
                data
            });
        } catch (error) {
            console.error("获取错题本详情失败", error);
            res.status(500).send({
                code: 500,
                message: "获取错题本详情失败"
            });
        }
    },

    // 更新错题本 (Book)
    updateWrongBook: async (req, res) => {
        try {
            const { uid } = req.user;
            const { id, title, color } = req.body;
            const result = await WrongBookService.updateWrongBook({ uid, id, title, color });
            if (!result.success) {
                return res.send({
                    code: 400,
                    message: '更新错题本失败'
                });
            }
            res.send({
                code: 200,
                message: '更新错题本成功'
            });
        } catch (error) {
            console.error("更新错题本失败", error);
            res.status(500).send({
                code: 500,
                message: "更新错题本失败"
            });
        }
    },

    // 删除错题本 (Book)
    deleteWrongBook: async (req, res) => {
        try {
            const { uid } = req.user;
            const { id } = req.body;
            const result = await WrongBookService.deleteWrongBook({ uid, id });
            if (!result.success) {
                return res.send({
                    code: 400,
                    message: '删除错题本失败'
                });
            }
            res.send({
                code: 200,
                message: '删除错题本成功'
            });
        } catch (error) {
            console.error("删除错题本失败", error);
            res.status(500).send({
                code: 500,
                message: "删除错题本失败"
            });
        }
    },

    // 添加错题
    addWrongQuestion: async (req, res) => {
        try {
            const { uid } = req.user;
            const { question, answer, category, note } = req.body;
            const result = await WrongBookService.addWrongQuestion({
                uid,
                question,
                answer,
                category,
                note
            });
            if (!result.success) {
                return res.send({
                    code: 400,
                    message: '添加错题失败'
                });
            }
            res.send({
                code: 200,
                message: '添加错题成功',
                data: result.data
            });
        } catch (error) {
            console.error("添加错题失败", error);
            res.status(500).send({
                code: 500,
                message: "添加错题失败"
            });
        }
    },

    // 删除错题
    deleteWrongQuestion: async (req, res) => {
        try {
            const { uid } = req.user;
            const { id } = req.body;
            const result = await WrongBookService.deleteWrongQuestion({ uid, id });
            if (!result.success) {
                return res.send({
                    code: 400,
                    message: '删除错题失败'
                });
            }
            res.send({
                code: 200,
                message: '删除错题成功'
            });
        } catch (error) {
            console.error("删除错题失败", error);
            res.status(500).send({
                code: 500,
                message: "删除错题失败"
            });
        }
    },

    // 获取错题详情
    getWrongQuestionDetail: async (req, res) => {
        try {
            const { uid } = req.user;
            const { id } = req.params;
            const data = await WrongBookService.getWrongQuestionDetail({ uid, id });
            if (!data) {
                return res.send({
                    code: 404,
                    message: '错题不存在'
                });
            }
            res.send({
                code: 200,
                data
            });
        } catch (error) {
            console.error("获取错题详情失败", error);
            res.status(500).send({
                code: 500,
                message: "获取错题详情失败"
            });
        }
    },

    // 更新错题
    updateWrongQuestion: async (req, res) => {
        try {
            const { uid } = req.user;
            const { id, question, answer, category, note } = req.body;
            const result = await WrongBookService.updateWrongQuestion({
                uid,
                id,
                question,
                answer,
                category,
                note
            });
            if (!result.success) {
                return res.send({
                    code: 400,
                    message: '更新错题失败'
                });
            }
            res.send({
                code: 200,
                message: '更新错题成功'
            });
        } catch (error) {
            console.error("更新错题失败", error);
            res.status(500).send({
                code: 500,
                message: "更新错题失败"
            });
        }
    },

    // 获取错题统计
    getWrongBookStatistics: async (req, res) => {
        try {
            const { uid } = req.user;
            const data = await WrongBookService.getWrongBookStatistics({ uid });
            res.send({
                code: 200,
                data
            });
        } catch (error) {
            console.error("获取错题统计失败", error);
            res.status(500).send({
                code: 500,
                message: "获取错题统计失败"
            });
        }
    }
};

module.exports = WrongBookController;
