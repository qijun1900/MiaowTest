const { WordBooksModel } = require('../../models/WordBooksModel');

const getWordBooksList = async (page = 1, size = 10) => {
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
};

const updateWordBook = async (_id, title, tags, words, reciteCount) => {
    const updateData = {
        updatedAt: Date.now()
    };

    if (title !== undefined) updateData.title = title;
    if (tags !== undefined) updateData.tags = tags;
    if (words !== undefined) updateData.words = words;
    if (reciteCount !== undefined) updateData.reciteCount = reciteCount;

    const result = await WordBooksModel.findByIdAndUpdate(
        _id,
        { $set: updateData },
        { new: true }
    );

    return result;
};

const deleteOneWordBook = async (_id) => {
    const result = await WordBooksModel.findByIdAndDelete(_id);
    return result;
};

const deleteManyWordBooks = async (_ids) => {
    const result = await WordBooksModel.deleteMany({
        _id: { $in: _ids }
    });
    return result;
};

module.exports = {
    getWordBooksList,
    updateWordBook,
    deleteOneWordBook,
    deleteManyWordBooks
};
