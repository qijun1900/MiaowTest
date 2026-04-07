const NotesBookModel = require("../../models/NotesBookModel");

const escapeRegex = (keyword = "") =>
  keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
   * 获取笔记本详情
   */
  getNotebookDetail: async ({ uid, id }) => {
    try {
      const detail = await NotesBookModel.findOne(
        { _id: id, Uid: uid },
        {
          _id: 1,
          title: 1,
          description: 1,
          noteCount: 1,
          updatedAt: 1,
        },
      ).lean();

      return detail;
    } catch (error) {
      console.error("DATABASE:获取笔记本详情失败", error);
      throw error;
    }
  },

  /**
   * 更新笔记本
   */
  updateNotebook: async ({ uid, id, title, description = "" }) => {
    try {
      const safeTitle = String(title || "").trim();
      const safeDescription = String(description || "").trim();

      const duplicated = await NotesBookModel.findOne({
        Uid: uid,
        _id: { $ne: id },
        title: {
          $regex: new RegExp(`^${escapeRegex(safeTitle)}$`, "i"),
        },
      })
        .select({ _id: 1 })
        .lean();

      if (duplicated) {
        return {
          success: false,
          code: "DUPLICATE_TITLE",
          message: "笔记本名称已存在，请更换名称",
        };
      }

      const notebook = await NotesBookModel.findOne({
        _id: id,
        Uid: uid,
      });

      if (!notebook) {
        return {
          success: false,
          code: "NOTEBOOK_NOT_FOUND",
          message: "笔记本不存在或无权限",
        };
      }

      notebook.title = safeTitle;
      notebook.description = safeDescription;
      await notebook.save();

      return {
        success: true,
      };
    } catch (error) {
      if (error && error.code === 11000) {
        return {
          success: false,
          code: "DUPLICATE_TITLE",
          message: "笔记本名称已存在，请更换名称",
        };
      }
      console.error("DATABASE:更新笔记本失败", error);
      throw error;
    }
  },

  /**
   * 创建笔记本
   */
  createNotebook: async ({ uid, title, description = "" }) => {
    try {
      const safeTitle = String(title || "").trim();
      const duplicated = await NotesBookModel.findOne({
        Uid: uid,
        title: {
          $regex: new RegExp(`^${escapeRegex(safeTitle)}$`, "i"),
        },
      })
        .select({ _id: 1 })
        .lean();

      if (duplicated) {
        return {
          success: false,
          code: "DUPLICATE_TITLE",
          message: "笔记本名称已存在，请更换名称",
        };
      }

      const newNotebook = new NotesBookModel({
        Uid: uid,
        title: safeTitle,
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
      if (error && error.code === 11000) {
        return {
          success: false,
          code: "DUPLICATE_TITLE",
          message: "笔记本名称已存在，请更换名称",
        };
      }
      console.error("DATABASE:创建笔记本失败", error);
      throw error;
    }
  },
};

module.exports = NotesBookService;