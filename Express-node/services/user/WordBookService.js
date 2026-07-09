const WordBookModel = require("../../models/WordBookModel");
const WordListModel = require("../../models/WordListModel");

const escapeRegex = (keyword = "") =>
  keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const WordBookService = {
  /**
   * 获取单词本列表
   */
  getWordBooks: async ({ uid }) => {
    try {
      const wordBooks = await WordBookModel.find(
        { Uid: uid },
        {
          _id: 1,
          title: 1,
          description: 1,
          wordCount: 1,
          updatedAt: 1,
        },
      )
        .sort({ updatedAt: -1 })
        .lean();

      return wordBooks;
    } catch (error) {
      console.error("DATABASE:获取单词本列表失败", error);
      throw error;
    }
  },

  /**
   * 获取单词本详情
   */
  getWordBookDetail: async ({ uid, id }) => {
    try {
      const detail = await WordBookModel.findOne(
        { _id: id, Uid: uid },
        {
          _id: 1,
          title: 1,
          description: 1,
          wordCount: 1,
          updatedAt: 1,
          createdAt: 1,
        },
      ).lean();

      return detail;
    } catch (error) {
      console.error("DATABASE:获取单词本详情失败", error);
      throw error;
    }
  },

  /**
   * 创建单词本
   */
  createWordBook: async ({ uid, title, description = "" }) => {
    try {
      const safeTitle = String(title || "").trim();
      const normalizedTitle = safeTitle.toLowerCase();
      const duplicated = await WordBookModel.findOne({
        Uid: uid,
        normalizedTitle,
      })
        .select({ _id: 1, title: 1 })
        .lean();

      if (duplicated) {
        return {
          success: false,
          code: "DUPLICATE_TITLE",
          message: "单词本名称已存在，请更换名称",
        };
      }

      const newWordBook = new WordBookModel({
        Uid: uid,
        title: safeTitle,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const saved = await newWordBook.save();
      return {
        success: true,
        data: saved,
      };
    } catch (error) {
      if (error && error.code === 11000) {
        return {
          success: false,
          code: "DUPLICATE_TITLE",
          message: "单词本名称已存在，请更换名称",
        };
      }
      console.error("DATABASE:创建单词本失败", error);
      throw error;
    }
  },

  /**
   * 更新单词本
   */
  updateWordBook: async ({ uid, id, title, description = "" }) => {
    try {
      const safeTitle = String(title || "").trim();
      const safeDescription = String(description || "").trim();
      const normalizedTitle = safeTitle.toLowerCase();

      const duplicated = await WordBookModel.findOne({
        Uid: uid,
        _id: { $ne: id },
        normalizedTitle,
      })
        .select({ _id: 1 })
        .lean();

      if (duplicated) {
        return {
          success: false,
          code: "DUPLICATE_TITLE",
          message: "单词本名称已存在，请更换名称",
        };
      }

      const wordBook = await WordBookModel.findOne({
        _id: id,
        Uid: uid,
      });

      if (!wordBook) {
        return {
          success: false,
          code: "WORDBOOK_NOT_FOUND",
          message: "单词本不存在或无权限",
        };
      }

      wordBook.title = safeTitle;
      wordBook.description = safeDescription;
      await wordBook.save();

      return {
        success: true,
      };
    } catch (error) {
      if (error && error.code === 11000) {
        return {
          success: false,
          code: "DUPLICATE_TITLE",
          message: "单词本名称已存在，请更换名称",
        };
      }
      console.error("DATABASE:更新单词本失败", error);
      throw error;
    }
  },

  /**
   * 删除单个单词本（同时删除其下所有单词）
   */
  deleteWordBook: async ({ uid, id }) => {
    try {
      const wordBook = await WordBookModel.findOne({ _id: id, Uid: uid });
      if (!wordBook) {
        return {
          success: false,
          code: "WORDBOOK_NOT_FOUND",
          message: "单词本不存在或无权限",
        };
      }

      // 删除单词本下的所有单词
      await WordListModel.deleteMany({ wordBookId: id, Uid: uid });

      // 删除单词本本身
      const result = await WordBookModel.deleteOne({ _id: id, Uid: uid });
      return {
        success: result.deletedCount > 0,
        message: result.deletedCount > 0 ? "删除成功" : "删除失败",
      };
    } catch (error) {
      console.error("DATABASE:删除单词本失败", error);
      throw error;
    }
  },

  /**
   * 批量删除单词本（同时删除其下所有单词）
   */
  batchDeleteWordBooks: async ({ uid, ids }) => {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        return {
          success: false,
          code: "INVALID_PARAMS",
          message: "请选择要删除的单词本",
        };
      }

      // 验证所有单词本都属于当前用户
      const wordBooks = await WordBookModel.find({
        _id: { $in: ids },
        Uid: uid,
      })
        .select({ _id: 1 })
        .lean();

      if (wordBooks.length === 0) {
        return {
          success: false,
          code: "WORDBOOK_NOT_FOUND",
          message: "单词本不存在或无权限",
        };
      }

      const validIds = wordBooks.map((item) => item._id);

      // 删除这些单词本下的所有单词
      await WordListModel.deleteMany({
        wordBookId: { $in: validIds },
        Uid: uid,
      });

      // 删除单词本本身
      const result = await WordBookModel.deleteMany({
        _id: { $in: validIds },
        Uid: uid,
      });

      return {
        success: true,
        deletedCount: result.deletedCount,
        message: `成功删除 ${result.deletedCount} 个单词本`,
      };
    } catch (error) {
      console.error("DATABASE:批量删除单词本失败", error);
      throw error;
    }
  },
};

module.exports = WordBookService;
