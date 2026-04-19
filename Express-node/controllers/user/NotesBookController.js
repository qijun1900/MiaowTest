const NotesBookService = require("../../services/user/NotesBookService");

const isValidObjectId = (value) =>
  /^[a-f\d]{24}$/i.test(String(value || "").trim());

const resolveErrorStatus = (code) => {
  if (["NOTEBOOK_NOT_FOUND", "NOTE_NOT_FOUND"].includes(code)) return 404;
  if (code === "DUPLICATE_TITLE") return 409;
  return 400;
};

const parsePositiveInteger = (value, defaultValue) => {
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num) || num <= 0) {
    return defaultValue;
  }
  return num;
};

const parseBooleanLike = (value) => {
  if (typeof value === "boolean") return value;

  const safeValue = String(value || "").trim().toLowerCase();
  if (["1", "true"].includes(safeValue)) return true;
  if (["0", "false"].includes(safeValue)) return false;

  return null;
};

const NotesBookController = {
  getNotebooks: async (req, res) => {
    try {
      const { uid } = req.user;
      const data = await NotesBookService.getNotebooks({ uid });
      res.status(200).send({
        code: 200,
        data,
      });
    } catch (error) {
      console.error("获取笔记本列表失败", error);
      res.status(200).send({
        code: 500,
        message: "获取笔记本列表失败",
      });
    }
  },

  getNotebookDetail: async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.query;
      const data = await NotesBookService.getNotebookDetail({ uid, id });

      if (!data) {
        return res.status(200).send({
          code: 404,
          message: "笔记本不存在",
        });
      }

      res.status(200).send({
        code: 200,
        data,
      });
    } catch (error) {
      console.error("获取笔记本详情失败", error);
      res.status(200).send({
        code: 500,
        message: "获取笔记本详情失败",
      });
    }
  },

  updateNotebook: async (req, res) => {
    try {
      const { uid } = req.user;
      const { id, title, description } = req.body;
      const safeTitle = String(title || "").trim();

      if (!safeTitle) {
        return res.status(200).send({
          code: 400,
          message: "请输入笔记本名称",
        });
      }

      const result = await NotesBookService.updateNotebook({
        uid,
        id,
        title: safeTitle,
        description,
      });

      if (!result.success) {
        let responseCode = 400;
        if (result.code === "DUPLICATE_TITLE") {
          responseCode = 409;
        }
        if (result.code === "NOTEBOOK_NOT_FOUND") {
          responseCode = 404;
        }

        return res.status(200).send({
          code: responseCode,
          message: result.message || "更新笔记本失败",
        });
      }

      res.status(200).send({
        code: 200,
        message: "更新笔记本成功",
      });
    } catch (error) {
      console.error("更新笔记本失败", error);
      res.status(200).send({
        code: 500,
        message: "更新笔记本失败",
      });
    }
  },

  deleteNotebook: async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.body;
      const result = await NotesBookService.deleteNotebook({ uid, id });

      if (!result.success) {
        let responseCode = 400;
        if (result.code === "NOTEBOOK_NOT_FOUND") {
          responseCode = 404;
        }
        if (result.code === "NOTEBOOK_HAS_NOTES") {
          responseCode = 409;
        }

        return res.status(200).send({
          code: responseCode,
          message: result.message || "删除笔记本失败",
          data: {
            noteCount: result.noteCount,
          },
        });
      }

      res.status(200).send({
        code: 200,
        message: "删除笔记本成功",
      });
    } catch (error) {
      console.error("删除笔记本失败", error);
      res.status(200).send({
        code: 500,
        message: "删除笔记本失败",
      });
    }
  },

  createNotebook: async (req, res) => {
    try {
      const { uid } = req.user;
      const title = String(req.body.title || "").trim();
      const description = String(req.body.description || "").trim();

      if (!title) {
        return res.status(200).send({
          code: 400,
          message: "请输入笔记本名称",
        });
      }

      const result = await NotesBookService.createNotebook({
        uid,
        title,
        description,
      });

      if (!result.success) {
        return res.status(200).send({
          code: result.code === "DUPLICATE_TITLE" ? 409 : 400,
          message: result.message || "创建笔记本失败",
        });
      }

      res.status(200).send({
        code: 200,
        message: "创建笔记本成功",
      });
    } catch (error) {
      console.error("创建笔记本失败", error);
      res.status(200).send({
        code: 500,
        message: "创建笔记本失败",
      });
    }
  },

  getNotebookNotes: async (req, res) => {
    try {
      const { uid } = req.user;
      const bookId = String(req.query.bookId || "").trim();
      const page = parsePositiveInteger(req.query.page, 1);
      const pageSize = Math.min(
        parsePositiveInteger(req.query.pageSize, 12),
        50,
      );
      const keyword = String(req.query.keyword || "").trim();

      if (!isValidObjectId(bookId)) {
        return res.status(200).send({
          code: 400,
          message: "bookId格式不正确",
        });
      }

      const result = await NotesBookService.getNotebookNotes({
        uid,
        bookId,
        page,
        pageSize,
        keyword,
      });

      if (!result.success) {
        return res.status(200).send({
          code: resolveErrorStatus(result.code),
          message: result.message || "获取笔记列表失败",
        });
      }

      res.status(200).send({
        code: 200,
        data: result.data,
      });
    } catch (error) {
      console.error("获取笔记列表失败", error);
      res.status(200).send({
        code: 500,
        message: "获取笔记列表失败",
      });
    }
  },

  getNotebookNoteDetail: async (req, res) => {
    try {
      const { uid } = req.user;
      const id = String(req.query.id || "").trim();
      const bookId = String(req.query.bookId || "").trim();

      if (!isValidObjectId(id)) {
        return res.status(200).send({
          code: 400,
          message: "id格式不正确",
        });
      }

      if (bookId && !isValidObjectId(bookId)) {
        return res.status(200).send({
          code: 400,
          message: "bookId格式不正确",
        });
      }

      const result = await NotesBookService.getNotebookNoteDetail({
        uid,
        id,
        bookId,
      });

      if (!result.success) {
        return res.status(200).send({
          code: resolveErrorStatus(result.code),
          message: result.message || "获取笔记详情失败",
        });
      }

      res.status(200).send({
        code: 200,
        data: result.data,
      });
    } catch (error) {
      console.error("获取笔记详情失败", error);
      res.status(200).send({
        code: 500,
        message: "获取笔记详情失败",
      });
    }
  },

  saveNotebookNote: async (req, res) => {
    try {
      const { uid } = req.user;
      const id = String(req.body.id || "").trim();
      const bookId = String(req.body.bookId || "").trim();
      const title = String(req.body.title || "");
      const content = String(req.body.content || "");
      const tags = req.body.tags;

      if (!isValidObjectId(bookId)) {
        return res.status(200).send({
          code: 400,
          message: "bookId格式不正确",
        });
      }

      if (id && !isValidObjectId(id)) {
        return res.status(200).send({
          code: 400,
          message: "id格式不正确",
        });
      }

      const result = await NotesBookService.saveNotebookNote({
        uid,
        id,
        bookId,
        title,
        content,
        tags,
      });

      if (!result.success) {
        return res.status(200).send({
          code: resolveErrorStatus(result.code),
          message: result.message || "保存笔记失败",
        });
      }

      res.status(200).send({
        code: 200,
        message: "保存成功",
        data: {
          id: result.id,
          action: result.action,
        },
      });
    } catch (error) {
      console.error("保存笔记失败", error);
      res.status(200).send({
        code: 500,
        message: "保存笔记失败",
      });
    }
  },

  toggleNotebookNotePin: async (req, res) => {
    try {
      const { uid } = req.user;
      const id = String(req.body.id || "").trim();
      const bookId = String(req.body.bookId || "").trim();

      if (!isValidObjectId(id) || !isValidObjectId(bookId)) {
        return res.status(200).send({
          code: 400,
          message: "参数格式不正确",
        });
      }

      let isPinned;
      if (Object.prototype.hasOwnProperty.call(req.body, "isPinned")) {
        isPinned = parseBooleanLike(req.body.isPinned);
        if (isPinned === null) {
          return res.status(200).send({
            code: 400,
            message: "isPinned参数不正确",
          });
        }
      }

      const result = await NotesBookService.toggleNotebookNotePin({
        uid,
        id,
        bookId,
        isPinned,
      });

      if (!result.success) {
        return res.status(200).send({
          code: resolveErrorStatus(result.code),
          message: result.message || "切换置顶状态失败",
        });
      }

      res.status(200).send({
        code: 200,
        message: "设置成功",
        data: result.data,
      });
    } catch (error) {
      console.error("切换置顶状态失败", error);
      res.status(200).send({
        code: 500,
        message: "切换置顶状态失败",
      });
    }
  },

  deleteNotebookNote: async (req, res) => {
    try {
      const { uid } = req.user;
      const id = String(req.body.id || "").trim();
      const bookId = String(req.body.bookId || "").trim();

      if (!isValidObjectId(id) || !isValidObjectId(bookId)) {
        return res.status(200).send({
          code: 400,
          message: "参数格式不正确",
        });
      }

      const result = await NotesBookService.deleteNotebookNote({
        uid,
        id,
        bookId,
      });

      if (!result.success) {
        return res.status(200).send({
          code: resolveErrorStatus(result.code),
          message: result.message || "删除笔记失败",
        });
      }

      res.status(200).send({
        code: 200,
        message: "删除成功",
      });
    } catch (error) {
      console.error("删除笔记失败", error);
      res.status(200).send({
        code: 500,
        message: "删除笔记失败",
      });
    }
  },
};

module.exports = NotesBookController;
