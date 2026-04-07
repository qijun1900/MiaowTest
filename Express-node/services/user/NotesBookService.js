const NotesBookModel = require("../../models/NotesBookModel");

const NotesBookService = {
  /**
   * 获取笔记本列表
   */
  getNotebooks: async ({ uid }) => {
    try {
      const notebooks = await NotesBookModel.find(
        { Uid: uid },
        {
          _id: 1,
          title: 1,
          description: 1,
          noteCount: 1,
          updatedAt: 1,
        },
      )
        .sort({ updatedAt: -1 })
        .lean();

      return notebooks;
    } catch (error) {
      console.error("DATABASE:获取笔记本列表失败", error);
      throw error;
    }
  },

  /**
   * 创建笔记本
   */
  createNotebook: async ({ uid, title, description = "" }) => {
    try {
      const newNotebook = new NotesBookModel({
        Uid: uid,
        title,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const saved = await newNotebook.save();
      return {
        success: true,
        data: saved,
      };
    } catch (error) {
      console.error("DATABASE:创建笔记本失败", error);
      throw error;
    }
  },
};

module.exports = NotesBookService;