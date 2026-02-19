const WrongBookModel = require('../../models/WrongBookModel');
const WrongQuestionModel = require('../../models/WrongQuestionModel');
const mongoose = require('mongoose');

const WrongBookService = {
    /**
     * 获取错题本列表
     */
    getWrongBooks: async ({ uid}) => {
        try {
            const wrongBooks = await WrongBookModel.find({ Uid:uid },{
                _id: 1,
                title: 1,
                color: 1,
                updatedAt: 1,
                count: 1
            }).sort({ updatedAt: -1 }).lean();
            return wrongBooks;
        } catch (error) {
            console.error("DATABASE:获取错题本列表失败", error);
            throw error;
        }
    },
    /**
     * 创建错题本
     */
    createWrongBook: async ({ uid, title, color }) => {
        try {
            const newWrongBook = new WrongBookModel({
                Uid: uid,
                title,
                color,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            const saved = await newWrongBook.save();
            return {
                success: true,
                data: saved
            };
        } catch (error) {
            console.error("DATABASE:创建错题本失败", error);
            throw error;
        }
    },
    /**
     * 添加错题
     */
    addWrongQuestion: async ({ uid, questionData }) => {
        try {
            const { wrongBookId, Type, questionSource, stem, options, correctAnswer, wrongAnswer, analysis, tags, difficulty } = questionData;
            
            // 验证错题本是否存在且属于该用户
            const wrongBook = await WrongBookModel.findOne({ _id: wrongBookId, Uid: uid });
            if (!wrongBook) {
                return {
                    success: false,
                    message: '错题本不存在或无权限'
                };
            }
            
            // 生成题目ID（用户自建题目）
            const questionId = new mongoose.Types.ObjectId();
            
            // 创建错题记录
            const newWrongQuestion = new WrongQuestionModel({
                Uid: uid,
                wrongBookId: wrongBookId,
                questionId: questionId,
                Type: Type,
                questionSource: questionSource || 'user',
                stem: stem || { text: '', images: [] },
                options: options || [],
                correctAnswer: correctAnswer || { text: '', images: [] },
                wrongAnswer: wrongAnswer || { text: '', images: [] },
                analysis: analysis || { text: '', images: [] },
                tags: tags || [],
                difficulty: difficulty || 'medium',
                status: 0,
                reviewCount: 0,
                wrongCount: 1,
                addedAt: new Date(),
                lastWrongAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            // 保存错题
            const savedQuestion = await newWrongQuestion.save();
            
            // 更新错题本的题目数量和更新时间
            await WrongBookModel.updateOne(
                { _id: wrongBookId },
                { 
                    $inc: { count: 1 },
                    $set: { updatedAt: new Date() }
                }
            );
            
            return {
                success: true,
                data: savedQuestion
            };
        } catch (error) {
            console.error("DATABASE:添加错题失败", error);
            throw error;
        }
    },
    /**
     * 获取错题列表
     */
    getWrongQuestions: async ({ uid, wrongBookId }) => {
        try {
            const questions = await WrongQuestionModel.find({ Uid: uid, wrongBookId: wrongBookId },{
                questionSource :0,
                note: 0,
                noteUpdatedAt: 0,
                createdAt: 0,
                __v: 0,
                masteredAt: 0,
                nextReviewAt:0,
                lastReviewAt:0,
                addedAt:0,
                reviewHistory:0,
                Uid:0,
            }).lean();
            return questions;
        } catch (error) {
            console.error("DATABASE:获取错题列表失败", error);
            throw error;
        }
    },
    /**
     * 删除错题(先查找后删除 以更新错题本数量，同时带出url 以删除图片)
     */
    deleteWrongQuestion: async ({ uid, id }) => {
        try {
            const question = await WrongQuestionModel.findOne({ _id: id, Uid: uid });
            if (!question) {
                return { 
                    success: false ,
                    message: '错题不存在或无权限'
                };
            }
            const wrongBookId = question.wrongBookId;
            const result = await WrongQuestionModel.deleteOne({ _id: id, Uid: uid });
            if (result.deletedCount > 0) {
                await WrongBookModel.updateOne(
                    { _id: wrongBookId },
                    { 
                        $inc: { count: -1 },
                        $set: { updatedAt: new Date() }
                    }
                );
            }
            return { 
                success: result.deletedCount > 0 ,
                    data: {
                        images: [
                            ...question.stem.images,
                            ...question.correctAnswer.images,
                            ...question.wrongAnswer.images,
                            ...question.analysis.images,
                            ...question.note.images
                        ]
                    }
            };
        } catch (error) {
            console.error("DATABASE:删除错题失败", error);
            throw error;
        }
    },

    /**
     * 标记为已掌握
     */
    markAsMastered: async ({ uid, id }) => {
        try {
            const question = await WrongQuestionModel.findOne({ _id: id, Uid: uid });
            if (!question) {
                return { success: false };
            }
            await question.markAsMastered();
            return { success: true };
        } catch (error) {
            console.error("DATABASE:标记为已掌握失败", error);
            throw error;
        }
    },

    /**
     * 标记为需要复习
     */
    markAsNeedReview: async ({ uid, id }) => {
        try {
            const question = await WrongQuestionModel.findOne({ _id: id, Uid: uid });
            if (!question) {
                return { success: false };
            }
            await question.markAsNeedReview();
            return { success: true };
        } catch (error) {
            console.error("DATABASE:标记为需要复习失败", error);
            throw error;
        }
    },

    /**
     * 获取错题本详情
     */
    getWrongBookDetail: async ({ uid, id }) => {
        try {
            const detail = await WrongBookModel.findOne({ _id: id, Uid: uid }, {
                title: 1,
                color: 1,
                count: 1,
                updatedAt: 1
            }).lean();
            return detail;
        } catch (error) {
            console.error("DATABASE:获取错题本详情失败", error);
            throw error;
        }
    },

    /**
     * 更新错题本
     */
    updateWrongBook: async ({ uid, id, title, color }) => {
        try {
            const result = await WrongBookModel.updateOne(
                { _id: id, Uid: uid },
                { 
                    $set: { 
                        title, 
                        color,
                        updatedAt: new Date()
                    } 
                }
            );
            return {
                success: result.modifiedCount > 0
            };
        } catch (error) {
            console.error("DATABASE:更新错题本失败", error);
            throw error;
        }
    },

    /**
     * 删除错题本
     */
    deleteWrongBook: async ({ uid, id }) => {
        try {
            const result = await WrongBookModel.deleteOne({ _id: id, Uid: uid });
            return {
                success: result.deletedCount > 0
            };
        } catch (error) {
            console.error("DATABASE:删除错题本失败", error);
            throw error;
        }
    },

    /**
     * 获取错题详情 
     */
    getWrongQuestionDetail: async ({ uid, id }) => {
        try {
            const detail = await WrongQuestionModel.findOne({ _id: id, Uid: uid }).lean();
            return detail;
        } catch (error) {
            console.error("DATABASE:获取错题详情失败", error);
            throw error;
        }
    },

    /**
     * 更新错题
     */
    updateWrongQuestion: async ({ uid, id, wrongBookId, Type, questionSource, stem, options, correctAnswer, wrongAnswer, analysis, tags, difficulty }) => {
        try {
            // 验证错题是否存在且属于该用户
            const question = await WrongQuestionModel.findOne({ _id: id, Uid: uid });
            if (!question) {
                return {
                    success: false,
                    message: '错题不存在或无权限'
                };
            }

            const updateData = {
                updatedAt: new Date()
            };

            // 只更新传入的字段
            if (wrongBookId !== undefined) updateData.wrongBookId = wrongBookId;
            if (Type !== undefined) updateData.Type = Type;
            if (questionSource !== undefined) updateData.questionSource = questionSource;
            if (stem !== undefined) updateData.stem = stem;
            if (options !== undefined) updateData.options = options;
            if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
            if (wrongAnswer !== undefined) updateData.wrongAnswer = wrongAnswer;
            if (analysis !== undefined) updateData.analysis = analysis;
            if (tags !== undefined) updateData.tags = tags;
            if (difficulty !== undefined) updateData.difficulty = difficulty;

            const result = await WrongQuestionModel.updateOne(
                { _id: id, Uid: uid },
                { $set: updateData }
            );
            return {
                success: result.modifiedCount > 0
            };
        } catch (error) {
            console.error("DATABASE:更新错题失败", error);
            throw error;
        }
    },

    /**
     * 获取错题统计
     */
    getWrongBookStatistics: async ({ uid }) => {
        try {
            const totalCount = await WrongBookModel.countDocuments({ uid });
            
            // 按分类统计
            const categoryStats = await WrongBookModel.aggregate([
                { $match: { uid } },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        category: '$_id',
                        count: 1,
                        _id: 0
                    }
                }
            ]);

            return {
                totalCount,
                categoryStats
            };
        } catch (error) {
            console.error("获取错题统计失败", error);
            throw error;
        }
    },

    /**
     * 上传图片并保存记录
     */
    uploadImage: async ({ uid, url }) => {
        try {
            const imageId = new mongoose.Types.ObjectId();
            
            // 创建临时图片记录（未关联到具体题目）
            const imageRecord = {
                _id: imageId,
                url: url,
                uploadedAt: new Date()
            };
            
            return {
                success: true,
                data: {
                    _id: imageId.toString(),
                    url: url
                }
            };
        } catch (error) {
            console.error("DATABASE:保存图片记录失败", error);
            throw error;
        }
    },

    /**
     * 通过图片ID删除图片记录
     */
    removeImageById: async ({ uid, imageId, imageUrl }) => {
        try {
            // 先查找包含该图片的题目（仅限当前用户）
            const questions = await WrongQuestionModel.find({
                Uid: uid,
                $or: [
                    { 'stem.images._id': imageId },
                    { 'wrongAnswer.images._id': imageId },
                    { 'correctAnswer.images._id': imageId },
                    { 'analysis.images._id': imageId },
                    { 'note.images._id': imageId }
                ]
            });

            if (questions.length === 0) {
                return {
                    success: true,
                    modifiedCount: 0,
                    message: '未找到包含该图片的题目'
                };
            }

            // 从找到的题目中移除该图片
            const updateOperations = {
                $pull: {
                    'stem.images': { _id: imageId },
                    'wrongAnswer.images': { _id: imageId },
                    'correctAnswer.images': { _id: imageId },
                    'analysis.images': { _id: imageId },
                    'note.images': { _id: imageId }
                },
                $set: {
                    updatedAt: new Date()
                }
            };

            const result = await WrongQuestionModel.updateMany(
                { 
                    Uid: uid,
                    _id: { $in: questions.map(q => q._id) }
                },
                updateOperations
            );

            return {
                success: true,
                modifiedCount: result.modifiedCount
            };
        } catch (error) {
            console.error("DATABASE:删除图片记录失败", error);
            throw error;
        }
    },
}

module.exports = WrongBookService;