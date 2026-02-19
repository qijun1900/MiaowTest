const WrongBookService = require('../../services/user/WrongBookService');
const multer = require('multer');
const path = require('path');
const { deleteFileByUrl, uploadBuffer } = require('../../helpers/ossHelper')

// 使用内存存储，方便后续上传到OSS
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 限制10MB
});

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
                return res.status(200).send({
                    code: 400,
                    message: '创建错题本失败'
                });
            }
            res.status(200).send({
                code: 200,
                message: '创建错题本成功',
            });
        } catch (error) {
            console.error("创建错题本失败", error);
            res.status(200).send({
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
                return res.status(200).send({
                    code: 404,
                    message: '错题本不存在'
                });
            }
            res.status(200).send({
                code: 200,
                data
            });
        } catch (error) {
            console.error("获取错题本详情失败", error);
            res.status(200).send({
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
                return res.status(200).send({
                    code: 400,
                    message: '更新错题本失败'
                });
            }
            res.status(200).send({
                code: 200,
                message: '更新错题本成功'
            });
        } catch (error) {
            console.error("更新错题本失败", error);
            res.status(200).send({
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
            
            // 统一返回 200 状态码，通过 code 字段区分成功/失败
            if (!result.success) {
                return res.status(200).send({
                    code: 400,
                    message: result.message || '删除错题本失败',
                    data: {
                        questionCount: result.questionCount
                    }
                });
            }
            
            res.status(200).send({
                code: 200,
                message: '删除错题本成功'
            });
        } catch (error) {
            console.error("删除错题本失败", error);
            res.status(200).send({
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
                    return res.status(200).send({
                        code: 400,
                        ActionType: "ERROR",
                        message: '请选择要上传的图片'
                    });
                }
                
                const { uid } = req.user;
                
                // 生成唯一的文件名
                const fileExtension = path.extname(req.file.originalname);
                const fileName = `user/wrong_question/${uid}/${Date.now()}${fileExtension}`;

                // 使用 ossHelper 的 Buffer 上传
                const fileUrl = await uploadBuffer(req.file.buffer, fileName);

                if (fileUrl) {
                    // 保存图片记录到数据库
                    const dbResult = await WrongBookService.uploadImage({
                        uid,
                        url: fileUrl
                    });
                    
                    if (dbResult.success) {
                        res.status(200).send({
                            code: 200,
                            message: '上传图片成功',
                            data: {
                                _id: dbResult.data._id,
                                url: dbResult.data.url
                            }
                        });
                    } else {
                        res.status(200).send({
                            code: 500,
                            message: '图片上传成功但保存记录失败'
                        });
                    }
                } else {
                    res.status(200).send({
                        code: 500,
                        message: "上传图片失败"
                    });
                }
            } catch (error) {
                console.error("上传图片失败", error);
                res.status(500).send({
                    code: 500,
                    message: "上传图片失败"
                });
            }
        },
    ],
    
    //删除图片
    deleteImage: async (req, res) => {
        try {
            const { uid } = req.user;
            const { path, _id } = req.body;
            
            // 删除OSS文件
            const ossResult = await deleteFileByUrl(path);
            
            if (ossResult && _id) {
                // 从数据库中移除图片记录（通过_id）
                const dbResult = await WrongBookService.removeImageById({ 
                    uid, 
                    imageId: _id,
                    imageUrl: path
                });
                
                res.status(200).send({
                    code: 200,
                    message: '删除图片成功',
                    data: {
                        modifiedCount: dbResult.modifiedCount
                    }
                });
            } else if (ossResult) {
                res.status(200).send({
                    code: 200,
                    message: '删除图片成功',
                });
            } else {
                res.status(200).send({
                    code: 400,
                    message: '删除图片失败'
                });
            }
        } catch (error) {
            console.error("删除图片失败", error);
            res.status(500).send({
                code: 500,
                message: "删除图片失败"
            });
        }
    },

    // 添加错题
    addWrongQuestion: async (req, res) => {
        try {
            const { uid } = req.user;
            const questionData = req.body;
            
            // 验证必填字段
            if (!questionData.wrongBookId) {
                return res.status(200).send({
                    code: 400,
                    message: '缺少错题本ID'
                });
            }
            
            if (!questionData.Type) {
                return res.status(200).send({
                    code: 400,
                    message: '缺少题目类型'
                });
            }
            
            // 调用 Service 层添加错题
            const result = await WrongBookService.addWrongQuestion({ 
                uid, 
                questionData 
            });
            
            if (!result.success) {
                return res.status(200).send({
                    code: 400,
                    message: result.message || '添加错题失败'
                });
            }
            
            res.status(200).send({
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
    // 获取错题列表
    getWrongQuestions: async (req, res) => {
        try {
            const { uid } = req.user;
            const { wrongBookId} = req.query;
            const data = await WrongBookService.getWrongQuestions({ 
                uid, 
                wrongBookId,
            });
            res.send({
                code: 200,
                data
            });
        } catch (error) {
            console.error("获取错题列表失败", error);
            res.status(500).send({
                code: 500,
                message: "获取错题列表失败"
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
                return res.status(200).send({
                    code: 400,
                    message: result.message || '删除错题失败'
                });
            }
            // 删除错题相关图片(如果有的话) images[{url:...,_id:...}...]
            // 并行删除
            await Promise.all(
                result.data.images.map(img => deleteFileByUrl(img.url))
            );

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

    //将错题标记为已掌握
    markAsMastered: async (req, res) => {
        try {
            const { uid } = req.user;
            const { id } = req.body;
            const result = await WrongBookService.markAsMastered({ uid, id });
            if (!result.success) {
                return res.status(200).send({
                    code: 400,
                    message: '标记为已掌握失败'
                });
            }
            res.status(200).send({
                code: 200,
                message: '标记为已掌握成功'
            });
        } catch (error) {
            console.error("标记为已掌握失败", error);
            res.status(500).send({
                code: 500,
                message: "标记为已掌握失败"
            });
        }
    },

    //将错题标记为需要复习
    markAsNeedReview: async (req, res) => {
        try {
            const { uid } = req.user;
            const { id } = req.body;
            const result = await WrongBookService.markAsNeedReview({ uid, id });
            if (!result.success) {
                return res.status(200).send({
                    code: 400,
                    message: '标记为需要复习失败'
                });
            }
            res.status(200).send({
                code: 200,
                message: '标记为需要复习成功'
            });
        } catch (error) {
            console.error("标记为需要复习失败", error);
            res.status(500).send({
                code: 500,
                message: "标记为需要复习失败"
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
                return res.status(200).send({
                    code: 404,
                    message: '错题不存在'
                });
            }
            res.status(200).send({
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
            const { id, wrongBookId, Type, questionSource, stem, options, correctAnswer, wrongAnswer, analysis, tags, difficulty } = req.body;
            const result = await WrongBookService.updateWrongQuestion({
                uid,
                id,
                wrongBookId,
                Type,
                questionSource,
                stem,
                options,
                correctAnswer,
                wrongAnswer,
                analysis,
                tags,
                difficulty
            });
            if (!result.success) {
                return res.status(200).send({
                    code: 400,
                    message: result.message || '更新错题失败'
                });
            }
            res.status(200).send({
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
