const WrongBookModel = require('../../models/WrongBookModel');

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
    addWrongQuestion: async ({ uid, question, answer, category, note }) => {
        try {
            const newWrongQuestion = new WrongBookModel({
                uid,
                question,
                answer,
                category,
                note,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            const saved = await newWrongQuestion.save();
            return {
                success: true,
                data: saved
            };
        } catch (error) {
            console.error("DATABASE:添加错题失败", error);
            throw error;
        }
    },

    /**
     * 删除错题
     */
    deleteWrongQuestion: async ({ uid, id }) => {
        try {
            const result = await WrongBookModel.deleteOne({ _id: id, uid });
            return {
                success: result.deletedCount > 0
            };
        } catch (error) {
            console.error("DATABASE:删除错题失败", error);
            throw error;
        }
    },

    /**
     * 获取错题详情
     */
    getWrongQuestionDetail: async ({ uid, id }) => {
        try {
            const detail = await WrongBookModel.findOne({ _id: id, uid }).lean();
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