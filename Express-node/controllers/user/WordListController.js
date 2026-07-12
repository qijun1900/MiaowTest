const WordListService = require("../../services/user/WordListService");
const ActivityService = require("../../services/user/ActivityService");

const isValidObjectId = (value) =>
  /^[a-f\d]{24}$/i.test(String(value || "").trim());

const WordListController = {
  getWords: async (req, res) => {
    try {
      const { uid } = req.user;
      const wordBookId = String(req.query.wordBookId || "").trim();
      const page = Math.max(1, Number(req.query.page) || 1);
      const pageSize = Math.min(
        50,
        Math.max(1, Number(req.query.pageSize) || 20),
      );
      const keyword = String(req.query.keyword || "").trim();
      const isMarked = req.query.isMarked;
      const tag = String(req.query.tag || "").trim();

      if (!isValidObjectId(wordBookId)) {
        return res
          .status(200)
          .send({ code: 400, message: "wordBookId格式不正确" });
      }

      const result = await WordListService.getWords({
        uid,
        wordBookId,
        page,
        pageSize,
        keyword,
        isMarked,
        tag,
      });

      if (!result.success) {
        return res.status(200).send({
          code: result.code === "WORDBOOK_NOT_FOUND" ? 404 : 400,
          message: result.message,
        });
      }

      res.status(200).send({ code: 200, data: result.data });
    } catch (error) {
      console.error("获取单词列表失败", error);
      res.status(200).send({ code: 500, message: "获取单词列表失败" });
    }
  },

  getWordDetail: async (req, res) => {
    try {
      const { uid } = req.user;
      const id = String(req.query.id || "").trim();

      if (!isValidObjectId(id)) {
        return res.status(200).send({ code: 400, message: "id格式不正确" });
      }

      const result = await WordListService.getWordDetail({ uid, id });

      if (!result.success) {
        return res.status(200).send({
          code: result.code === "WORD_NOT_FOUND" ? 404 : 400,
          message: result.message,
        });
      }

      res.status(200).send({ code: 200, data: result.data });
    } catch (error) {
      console.error("获取单词详情失败", error);
      res.status(200).send({ code: 500, message: "获取单词详情失败" });
    }
  },

  addWord: async (req, res) => {
    try {
      const { uid } = req.user;
      const { wordBookId, word, phonetic, meaning, example, tags } = req.body;

      if (!isValidObjectId(wordBookId)) {
        return res
          .status(200)
          .send({ code: 400, message: "wordBookId格式不正确" });
      }

      const result = await WordListService.addWord({
        uid,
        wordBookId,
        word,
        phonetic,
        meaning,
        example,
        tags,
      });

      if (!result.success) {
        let code = 400;
        if (result.code === "WORDBOOK_NOT_FOUND") code = 404;
        if (result.code === "DUPLICATE_WORD") code = 409;
        return res.status(200).send({ code, message: result.message });
      }

      ActivityService.recordBusinessActivity(req, {
        eventName: "添加单词",
        module: "单词本",
        bizId: String(result.data?._id || ""),
        score: 1,
        metadata: { wordBookId, word: String(word || "").trim() },
      }).catch((e) => console.error("记录 添加单词 失败", e));

      res
        .status(200)
        .send({
          code: 200,
          message: "添加成功",
          data: { _id: result.data?._id },
        });
    } catch (error) {
      console.error("添加单词失败", error);
      res.status(200).send({ code: 500, message: "添加单词失败" });
    }
  },

  updateWord: async (req, res) => {
    try {
      const { uid } = req.user;
      const { id, word, phonetic, meaning, example, tags } = req.body;

      if (!isValidObjectId(id)) {
        return res.status(200).send({ code: 400, message: "id格式不正确" });
      }

      const result = await WordListService.updateWord({
        uid,
        id,
        word,
        phonetic,
        meaning,
        example,
        tags,
      });

      if (!result.success) {
        let code = 400;
        if (result.code === "WORD_NOT_FOUND") code = 404;
        if (result.code === "DUPLICATE_WORD") code = 409;
        return res.status(200).send({ code, message: result.message });
      }

      res.status(200).send({ code: 200, message: "更新成功" });
    } catch (error) {
      console.error("更新单词失败", error);
      res.status(200).send({ code: 500, message: "更新单词失败" });
    }
  },

  deleteWord: async (req, res) => {
    try {
      const { uid } = req.user;
      const { id, wordBookId } = req.body;

      if (!isValidObjectId(id)) {
        return res.status(200).send({ code: 400, message: "id格式不正确" });
      }

      const result = await WordListService.deleteWord({ uid, id, wordBookId });

      if (!result.success) {
        return res.status(200).send({
          code: result.code === "WORD_NOT_FOUND" ? 404 : 400,
          message: result.message,
        });
      }

      res.status(200).send({ code: 200, message: "删除成功" });
    } catch (error) {
      console.error("删除单词失败", error);
      res.status(200).send({ code: 500, message: "删除单词失败" });
    }
  },

  batchDeleteWords: async (req, res) => {
    try {
      const { uid } = req.user;
      const { ids, wordBookId } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res
          .status(200)
          .send({ code: 400, message: "请选择要删除的单词" });
      }

      if (!ids.every(isValidObjectId)) {
        return res
          .status(200)
          .send({ code: 400, message: "ids中存在格式不正确的id" });
      }

      const result = await WordListService.batchDeleteWords({
        uid,
        ids,
        wordBookId,
      });

      if (!result.success) {
        return res.status(200).send({ code: 400, message: result.message });
      }

      res.status(200).send({
        code: 200,
        message: `成功删除 ${result.deletedCount} 个单词`,
        data: { deletedCount: result.deletedCount },
      });
    } catch (error) {
      console.error("批量删除单词失败", error);
      res.status(200).send({ code: 500, message: "批量删除单词失败" });
    }
  },

  toggleMarked: async (req, res) => {
    try {
      const { uid } = req.user;
      const { id } = req.body;

      if (!isValidObjectId(id)) {
        return res.status(200).send({ code: 400, message: "id格式不正确" });
      }

      const result = await WordListService.toggleMarked({ uid, id });

      if (!result.success) {
        return res.status(200).send({
          code: result.code === "WORD_NOT_FOUND" ? 404 : 400,
          message: result.message,
        });
      }

      res.status(200).send({ code: 200, data: result.data });
    } catch (error) {
      console.error("切换收藏状态失败", error);
      res.status(200).send({ code: 500, message: "切换收藏状态失败" });
    }
  },

  batchAddWords: async (req, res) => {
    try {
      const { uid } = req.user;
      const { wordBookId, words } = req.body;

      if (!isValidObjectId(wordBookId)) {
        return res
          .status(200)
          .send({ code: 400, message: "wordBookId格式不正确" });
      }

      const result = await WordListService.batchAddWords({
        uid,
        wordBookId,
        words,
      });

      if (!result.success) {
        let code = 400;
        if (result.code === "WORDBOOK_NOT_FOUND") code = 404;
        return res.status(200).send({ code, message: result.message });
      }

      ActivityService.recordBusinessActivity(req, {
        eventName: "批量添加单词",
        module: "单词本",
        bizId: wordBookId,
        score: 2,
        metadata: { insertedCount: result.data.insertedCount },
      }).catch((e) => console.error("记录 批量添加单词 失败", e));

      res.status(200).send({
        code: 200,
        message: `成功添加 ${result.data.insertedCount} 个单词`,
        data: result.data,
      });
    } catch (error) {
      console.error("批量添加单词失败", error);
      res.status(200).send({ code: 500, message: "批量添加单词失败" });
    }
  },

  // ---- AI 相关 ----

  aiLookupWord: async (req, res) => {
    try {
      const { word } = req.body;
      const result = await WordListService.aiLookupWord({ word });

      if (!result.success) {
        return res.status(200).send({ code: 400, message: result.message });
      }

      res.status(200).send({ code: 200, data: result.data });
    } catch (error) {
      console.error("AI查询单词失败", error);
      res.status(200).send({ code: 500, message: "AI查询失败，请稍后重试" });
    }
  },

  aiExtractWords: async (req, res) => {
    try {
      const { text } = req.body;
      const result = await WordListService.aiExtractWords({ text });

      if (!result.success) {
        return res.status(200).send({ code: 400, message: result.message });
      }

      res.status(200).send({ code: 200, data: result.data });
    } catch (error) {
      console.error("AI提取单词失败", error);
      res.status(200).send({ code: 500, message: "AI提取失败，请稍后重试" });
    }
  },

  aiWordDetail: async (req, res) => {
    try {
      const { word, type } = req.body;

      if (!word || !String(word).trim()) {
        return res.status(200).send({ code: 400, message: "请输入单词" });
      }

      const result = await WordListService.aiWordDetailSync({ word, type });
      res.status(200).send({ code: 200, data: { content: result } });
    } catch (error) {
      console.error("AI单词详情失败", error);
      res.status(200).send({ code: 500, message: "AI生成失败，请稍后重试" });
    }
  },

  // ---- 知识库相关 ----

  getKnowledgeBases: async (req, res) => {
    try {
      const result = await WordListService.getKnowledgeBases();
      res.status(200).send({ code: 200, data: result.data });
    } catch (error) {
      console.error("获取知识库列表失败", error);
      res.status(200).send({ code: 500, message: "获取知识库列表失败" });
    }
  },

  searchExamples: async (req, res) => {
    try {
      const { word, kbId, topK } = req.body;

      if (!isValidObjectId(kbId)) {
        return res.status(200).send({ code: 400, message: "kbId格式不正确" });
      }

      const result = await WordListService.searchExamples({ word, kbId, topK });

      if (!result.success) {
        let code = 400;
        if (result.code === "KB_NOT_FOUND") code = 404;
        return res.status(200).send({ code, message: result.message });
      }

      res.status(200).send({ code: 200, data: result.data });
    } catch (error) {
      console.error("检索例句失败", error);
      res.status(200).send({ code: 500, message: "检索例句失败" });
    }
  },
};

module.exports = WordListController;
