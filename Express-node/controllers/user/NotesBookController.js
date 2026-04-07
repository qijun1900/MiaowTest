const NotesBookService = require("../../services/user/NotesBookService");

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
};

module.exports = NotesBookController;