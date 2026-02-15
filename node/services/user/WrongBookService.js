const WrongBookModel = require('../../models/WrongBookModel');
const WrongQuestionModel = require('../../models/WrongQuestionModel');

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
            const mongoose = require('mongoose');
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
                reviewHistory:0

            }).lean();
            return questions;
        } catch (error) {
            console.error("DATABASE:获取错题列表失败", error);
            throw error;
        }
    },
    /**
     * 删除错题
     */
    deleteWrongQuestion: async ({ uid, id }) => {
        try {
            const result = await WrongQuestionModel.deleteOne({ _id: id, Uid: uid });
            return {
                success: result.deletedCount > 0
            };
        } catch (error) {
            console.error("DATABASE:删除错题失败", error);
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
    updateWrongQuestion: async ({ uid, id, question, answer, category, note }) => {
        try {
            const updateData = {
                updatedAt: new Date()
            };
            if (question !== undefined) updateData.question = question;
            if (answer !== undefined) updateData.answer = answer;
            if (category !== undefined) updateData.category = category;
            if (note !== undefined) updateData.note = note;

            const result = await WrongBookModel.updateOne(
                { _id: id, uid },
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
    }
};

module.exports = WrongBookService;