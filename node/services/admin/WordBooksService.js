const { WordBooksModel } = require('../../models/WordBooksModel');

const WordBooksService = {
    getWordBooksList: async (page = 1, size = 10) => {
        const skip = (page - 1) * size;

        const wordBooks = await WordBooksModel
            .find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(size));

        const total = await WordBooksModel.countDocuments();

        return {
            data: wordBooks,
            total: total,
            page: parseInt(page),
            size: parseInt(size)
        };
    },
    updateWordBook: async (_id, title, tags, words, reciteCount, cover) => {
        const updateData = {
            updatedAt: Date.now()
        };

        if (title !== undefined) updateData.title = title;
        if (tags !== undefined) updateData.tags = tags;
        if (words !== undefined) updateData.words = words;
        if (reciteCount !== undefined) updateData.reciteCount = reciteCount;
        if (cover !== undefined && cover !== "") updateData.cover = cover; // 确保 cover 不为空字符串

        const result = await WordBooksModel.findByIdAndUpdate(
            _id,
            { $set: updateData },
            { new: true }
        );

        return result;

    },
    deleteOneWordBook: async (_id) => {
        const result = await WordBooksModel.findByIdAndDelete(_id);
        return result;
    },
    deleteManyWordBooks: async (_ids) => {
        const result = await WordBooksModel.deleteMany({
            _id: { $in: _ids }
        });
        return result;
    }

};

module.exports = WordBooksService
