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
          code: 400,
          message: "创建笔记本失败",
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