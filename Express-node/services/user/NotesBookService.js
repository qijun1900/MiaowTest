const NotesBookModel = require("../../models/NotesBookModel");
const NotesListModel = require("../../models/NotesListModel");

const escapeRegex = (keyword = "") =>
  keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const stripHtml = (value = "") =>
  String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

const IMAGE_NOTE_PLACEHOLDER = "[\u56fe\u7247]";

const buildSafeNoteTitle = ({ title = "", plainText = "" }) => {
  const safeTitle = String(title || "").trim();
  if (safeTitle) return safeTitle.slice(0, 80);

  if (plainText) {
    return plainText.slice(0, 20);
  }

  return "未命名笔记";
};

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
   * 删除笔记本
   */
  deleteNotebook: async ({ uid, id }) => {
    try {
      const notebook = await NotesBookModel.findOne({ _id: id, Uid: uid });
      if (!notebook) {
        return {
          success: false,
          code: "NOTEBOOK_NOT_FOUND",
          message: "笔记本不存在或无权限",
        };
      }

      const noteCount = Number(notebook.noteCount) || 0;
      if (noteCount > 0) {
        return {
          success: false,
          code: "NOTEBOOK_HAS_NOTES",
          message: `笔记本中还有 ${noteCount} 条笔记，请先清空后再删除`,
          noteCount,
        };
      }

      const result = await NotesBookModel.deleteOne({ _id: id, Uid: uid });
      return {
        success: result.deletedCount > 0,
        message: result.deletedCount > 0 ? "删除成功" : "删除失败",
      };
    } catch (error) {
      console.error("DATABASE:删除笔记本失败", error);
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

  /**
   * 获取某个笔记本下的笔记列表
   */
  getNotebookNotes: async ({ uid, bookId }) => {
    try {
      const notebook = await NotesBookModel.findOne({ _id: bookId, Uid: uid })
        .select({ _id: 1 })// 仅验证笔记本存在与权限，不返回其他字段
        .lean();

      if (!notebook) {
        return {
          success: false,
          code: "NOTEBOOK_NOT_FOUND",
          message: "笔记本不存在或无权限",
        };
      }

      const notes = await NotesListModel.find(
        {
          Uid: uid,
          notesBookId: bookId,
          isArchived: { $ne: true },
        },
        {
          _id: 1,
          notesBookId: 1,
          title: 1,
          summary: 1,
          tags: 1,
          updatedAt: 1,
          createdAt: 1,
          "content.text": 1,
        },
      )
        .sort({ isPinned: -1, updatedAt: -1 })
        .lean();

      const list = notes.map((item) => {
        const contentText = String(item?.content?.text || "");
        const plainText = stripHtml(contentText);
        const rawSummary = String(item.summary || "");
        const hasImage =
          /<img\b/i.test(contentText) || /<img\b/i.test(rawSummary);
        const summary =
          stripHtml(rawSummary) ||
          plainText.slice(0, 120) ||
          (hasImage ? IMAGE_NOTE_PLACEHOLDER : "");

        return {
          _id: item._id,
          notesBookId: item.notesBookId,
          title: item.title,
          summary,
          plainText,
          tags: item.tags || [],
          updatedAt: item.updatedAt,
          createdAt: item.createdAt,
        };
      });

      return {
        success: true,
        data: list,
      };
    } catch (error) {
      console.error("DATABASE:获取笔记列表失败", error);
      throw error;
    }
  },

  /**
   * 获取单条笔记详情
   */
  getNotebookNoteDetail: async ({ uid, id, bookId }) => {
    try {
      const query = {
        _id: id,
        Uid: uid,
      };

      if (bookId) {
        query.notesBookId = bookId;
      }

      const note = await NotesListModel.findOne(
        query,
        {
          _id: 1,
          notesBookId: 1,
          title: 1,
          summary: 1,
          tags: 1,
          updatedAt: 1,
          createdAt: 1,
          "content.text": 1,
        },
      ).lean();

      if (!note) {
        return {
          success: false,
          code: "NOTE_NOT_FOUND",
          message: "笔记不存在或无权限",
        };
      }

      return {
        success: true,
        data: {
          _id: note._id,
          notesBookId: note.notesBookId,
          title: note.title,
          content: String(note?.content?.text || ""),
          summary: note.summary || "",
          tags: note.tags || [],
          updatedAt: note.updatedAt,
          createdAt: note.createdAt,
        },
      };
    } catch (error) {
      console.error("DATABASE:获取笔记详情失败", error);
      throw error;
    }
  },

  /**
   * 保存笔记（有id为更新，无id为新增）
   */
  saveNotebookNote: async ({ uid, id, bookId, title, content }) => {
    try {
      const notebook = await NotesBookModel.findOne({ _id: bookId, Uid: uid })
        .select({ _id: 1 })
        .lean();

      if (!notebook) {
        return {
          success: false,
          code: "NOTEBOOK_NOT_FOUND",
          message: "笔记本不存在或无权限",
        };
      }

      const safeContent = String(content || "").trim();
      const plainText = stripHtml(safeContent);
      const safeTitle = buildSafeNoteTitle({
        title,
        plainText,
      });

      if (!safeTitle && !plainText) {
        return {
          success: false,
          code: "INVALID_PARAMS",
          message: "请输入内容后再保存",
        };
      }

      const summary =
        plainText.slice(0, 120) ||
        (/<img\b/i.test(safeContent) ? IMAGE_NOTE_PLACEHOLDER : "");

      if (id) {
        const note = await NotesListModel.findOne({
          _id: id,
          Uid: uid,
          notesBookId: bookId,
        });

        if (!note) {
          return {
            success: false,
            code: "NOTE_NOT_FOUND",
            message: "笔记不存在或无权限",
          };
        }

        note.title = safeTitle;
        note.summary = summary;
        // 仅更新正文文本，避免把 undefined 的嵌套对象回写触发 schema cast 错误
        note.set("content.text", safeContent);

        await note.save();
        await NotesBookModel.updateOne(
          { _id: bookId, Uid: uid },
          { $set: { updatedAt: new Date() } },
        );

        return {
          success: true,
          action: "updated",
          id: note._id,
        };
      }

      const created = await NotesListModel.create({
        Uid: uid,
        notesBookId: bookId,
        title: safeTitle,
        summary,
        content: {
          text: safeContent,
        },
      });

      await NotesBookModel.updateOne(
        { _id: bookId, Uid: uid },
        {
          $inc: { noteCount: 1 },
          $set: { updatedAt: new Date() },
        },
      );

      return {
        success: true,
        action: "created",
        id: created._id,
      };
    } catch (error) {
      console.error("DATABASE:保存笔记失败", error);
      throw error;
    }
  },

  /**
   * 删除单条笔记
   */
  deleteNotebookNote: async ({ uid, id, bookId }) => {
    try {
      const result = await NotesListModel.deleteOne({
        _id: id,
        Uid: uid,
        notesBookId: bookId,
      });

      if (!result.deletedCount) {
        return {
          success: false,
          code: "NOTE_NOT_FOUND",
          message: "笔记不存在或无权限",
        };
      }

      await NotesBookModel.updateOne(
        {
          _id: bookId,
          Uid: uid,
          noteCount: { $gt: 0 },
        },
        {
          $inc: { noteCount: -1 },
          $set: { updatedAt: new Date() },
        },
      );

      return {
        success: true,
      };
    } catch (error) {
      console.error("DATABASE:删除笔记失败", error);
      throw error;
    }
  },
};

module.exports = NotesBookService;
