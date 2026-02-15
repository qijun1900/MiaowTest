const WrongBookService = require('../../services/user/WrongBookService');
const multer = require('multer');
const OSS = require('ali-oss');
const ossConfig = require('../../config/oss.config');
const path = require('path');
// 使用内存存储，方便后续上传到OSS
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 限制10MB
});
// 创建OSS客户端
const client = new OSS(ossConfig);

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
    //上传图片
    uploadImage: [
        upload.single('file'),
        async (req, res) => {
            try {
                // 检查是否有文件上传
                if (!req.file) {
                    return res.send({
                        code: 400,
                        ActionType: "ERROR",
                        message: '请选择要上传的图片'
                    });
                }
                const { uid } = req.user;
                console.log('上传图片的用户UID:', uid);
                console.log('上传的文件信息:', req.file);
                // 生成唯一的文件名
                const fileExtension = path.extname(req.file.originalname);
                const fileName = `user/wrong_question/${uid}/${Date.now()}${fileExtension}`;

                // 上传文件到OSS
                const result = await client.put(fileName, req.file.buffer);

                console.log('OSS上传结果:', result);
                
                // 获取上传后的URL
                const url = result.url;
                res.send({
                    code: 200,
                    message: '上传图片成功',
                    data: {
                        url
                    }
                });
            } catch (error) {
                console.error("上传图片失败", error);
                res.status(500).send({
                    code: 500,
                    message: "上传图片失败"
                });
            }
        },
    ],
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
