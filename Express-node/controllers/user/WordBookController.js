const WordBookService = require("../../services/user/WordBookService");
const ActivityService = require("../../services/user/ActivityService");

const isValidObjectId = (value) =>
  /^[a-f\d]{24}$/i.test(String(value || "").trim());

const WordBookController = {
  getWordBooks: async (req, res) => {
    try {
      const { uid } = req.user;
      const data = await WordBookService.getWordBooks({ uid });
      res.status(200).send({
        code: 200,
        data,
      });
    } catch (error) {
      console.error("获取单词本列表失败", error);
      res.status(200).send({
        code: 500,
        message: "获取单词本列表失败",
      });
    }
  },

  getWordBookDetail: async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.query;

      if (!isValidObjectId(id)) {
        return res.status(200).send({
          code: 400,
          message: "id格式不正确",
        });
      }

      const data = await WordBookService.getWordBookDetail({ uid, id });

      if (!data) {
        return res.status(200).send({
          code: 404,
          message: "单词本不存在",
        });
      }

      res.status(200).send({
        code: 200,
        data,
      });
    } catch (error) {
      console.error("获取单词本详情失败", error);
      res.status(200).send({
        code: 500,
        message: "获取单词本详情失败",
      });
    }
  },

  createWordBook: async (req, res) => {
    try {
      const { uid } = req.user;
      const title = String(req.body.title || "").trim();
      const description = String(req.body.description || "").trim();

      if (!title) {
        return res.status(200).send({
          code: 400,
          message: "请输入单词本名称",
        });
      }

      const result = await WordBookService.createWordBook({
        uid,
        title,
        description,
      });

      if (!result.success) {
        return res.status(200).send({
          code: result.code === "DUPLICATE_TITLE" ? 409 : 400,
          message: result.message || "创建单词本失败",
        });
      }

      ActivityService.recordBusinessActivity(req, {
        eventName: "创建单词本",
        module: "单词本",
        bizId: String(result?.data?._id || ""),
        score: 2,
        metadata: {
          title,
          description: description || "",
        },
      }).catch((error) => {
        console.error("记录 创建单词本 失败", error);
      });

      res.status(200).send({
        code: 200,
        message: "创建单词本成功",
      });
    } catch (error) {
      console.error("创建单词本失败", error);
      res.status(200).send({
        code: 500,
        message: "创建单词本失败",
      });
    }
  },

  updateWordBook: async (req, res) => {
    try {
      const { uid } = req.user;
      const { id, title, description } = req.body;
      const safeTitle = String(title || "").trim();

      if (!isValidObjectId(id)) {
        return res.status(200).send({
          code: 400,
          message: "id格式不正确",
        });
      }

      if (!safeTitle) {
        return res.status(200).send({
          code: 400,
          message: "请输入单词本名称",
        });
      }

      const result = await WordBookService.updateWordBook({
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
        if (result.code === "WORDBOOK_NOT_FOUND") {
          responseCode = 404;
        }

        return res.status(200).send({
          code: responseCode,
          message: result.message || "更新单词本失败",
        });
      }

      res.status(200).send({
        code: 200,
        message: "更新单词本成功",
      });
    } catch (error) {
      console.error("更新单词本失败", error);
      res.status(200).send({
        code: 500,
        message: "更新单词本失败",
      });
    }
  },

  deleteWordBook: async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.body;

      if (!isValidObjectId(id)) {
        return res.status(200).send({
          code: 400,
          message: "id格式不正确",
        });
      }

      const result = await WordBookService.deleteWordBook({ uid, id });

      if (!result.success) {
        return res.status(200).send({
          code: result.code === "WORDBOOK_NOT_FOUND" ? 404 : 400,
          message: result.message || "删除单词本失败",
        });
      }

      res.status(200).send({
        code: 200,
        message: "删除成功",
      });
    } catch (error) {
      console.error("删除单词本失败", error);
      res.status(200).send({
        code: 500,
        message: "删除单词本失败",
      });
    }
  },

  batchDeleteWordBooks: async (req, res) => {
    try {
      const { uid } = req.user;
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(200).send({
          code: 400,
          message: "请选择要删除的单词本",
        });
      }

      if (!ids.every(isValidObjectId)) {
        return res.status(200).send({
          code: 400,
          message: "ids中存在格式不正确的id",
        });
      }

      const result = await WordBookService.batchDeleteWordBooks({ uid, ids });

      if (!result.success) {
        return res.status(200).send({
          code: 400,
          message: result.message || "批量删除失败",
        });
      }

      res.status(200).send({
        code: 200,
        message: result.message,
        data: {
          deletedCount: result.deletedCount,
        },
      });
    } catch (error) {
      console.error("批量删除单词本失败", error);
      res.status(200).send({
        code: 500,
        message: "批量删除单词本失败",
      });
    }
  },
};

module.exports = WordBookController;
