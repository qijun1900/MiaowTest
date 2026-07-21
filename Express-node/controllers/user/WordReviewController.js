const WordReviewService = require("../../services/user/WordReviewService");
const ActivityService = require("../../services/user/ActivityService");

const isValidObjectId = (value) =>
  /^[a-f\d]{24}$/i.test(String(value || "").trim());

const WordReviewController = {
  /**
   * 获取待复习单词
   * GET /uniappAPI/tools/wordreview/getReviewWords?wordBookId=xxx&mode=mixed&limit=20
   */
  getReviewWords: async (req, res) => {
    try {
      const { uid } = req.user;
      const wordBookId = String(req.query.wordBookId || "").trim();
      const mode = String(req.query.mode || "mixed").trim();
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

      if (!isValidObjectId(wordBookId)) {
        return res
          .status(200)
          .send({ code: 400, message: "wordBookId格式不正确" });
      }

      const validModes = ["new", "review", "mixed", "marked"];
      if (!validModes.includes(mode)) {
        return res
          .status(200)
          .send({ code: 400, message: "mode参数不正确，可选值: new|review|mixed|marked" });
      }

      const result = await WordReviewService.getReviewWords({
        uid,
        wordBookId,
        mode,
        limit,
      });

      if (!result.success) {
        return res.status(200).send({
          code: result.code === "WORDBOOK_NOT_FOUND" ? 404 : 400,
          message: result.message,
        });
      }

      res.status(200).send({ code: 200, data: result.data });
    } catch (error) {
      console.error("获取复习单词失败", error);
      res.status(200).send({ code: 500, message: "获取复习单词失败" });
    }
  },

  /**
   * 获取单词本复习统计
   * GET /uniappAPI/tools/wordreview/getReviewStats?wordBookId=xxx
   */
  getReviewStats: async (req, res) => {
    try {
      const { uid } = req.user;
      const wordBookId = String(req.query.wordBookId || "").trim();

      if (!isValidObjectId(wordBookId)) {
        return res
          .status(200)
          .send({ code: 400, message: "wordBookId格式不正确" });
      }

      const result = await WordReviewService.getReviewStats({ uid, wordBookId });

      if (!result.success) {
        return res.status(200).send({
          code: result.code === "WORDBOOK_NOT_FOUND" ? 404 : 400,
          message: result.message,
        });
      }

      res.status(200).send({ code: 200, data: result.data });
    } catch (error) {
      console.error("获取复习统计失败", error);
      res.status(200).send({ code: 500, message: "获取复习统计失败" });
    }
  },

  /**
   * 提交单个单词的复习结果
   * POST /uniappAPI/tools/wordreview/submitReview
   * Body: { wordId, quality }
   */
  submitReview: async (req, res) => {
    try {
      const { uid } = req.user;
      const { wordId, quality } = req.body;

      if (!isValidObjectId(wordId)) {
        return res.status(200).send({ code: 400, message: "wordId格式不正确" });
      }

      if (quality === undefined || quality === null) {
        return res.status(200).send({ code: 400, message: "请提供quality评分" });
      }

      const result = await WordReviewService.submitReview({
        uid,
        wordId,
        quality,
      });

      if (!result.success) {
        return res.status(200).send({
          code: result.code === "WORD_NOT_FOUND" ? 404 : 400,
          message: result.message,
        });
      }

      // 记录活动
      ActivityService.recordBusinessActivity(req, {
        eventName: "复习单词",
        module: "单词本",
        bizId: wordId,
        score: result.data.isCorrect ? 2 : 1,
        metadata: { quality, isCorrect: result.data.isCorrect },
      }).catch((e) => console.error("记录 复习单词 失败", e));

      res.status(200).send({ code: 200, data: result.data });
    } catch (error) {
      console.error("提交复习结果失败", error);
      res.status(200).send({ code: 500, message: "提交复习结果失败" });
    }
  },

  /**
   * 批量提交复习结果
   * POST /uniappAPI/tools/wordreview/batchSubmitReview
   * Body: { reviews: [{ wordId, quality }] }
   */
  batchSubmitReview: async (req, res) => {
    try {
      const { uid } = req.user;
      const { reviews } = req.body;

      if (!Array.isArray(reviews) || reviews.length === 0) {
        return res
          .status(200)
          .send({ code: 400, message: "请提供复习结果" });
      }

      const result = await WordReviewService.batchSubmitReview({ uid, reviews });

      if (!result.success) {
        return res.status(200).send({ code: 400, message: result.message });
      }

      // 记录活动
      ActivityService.recordBusinessActivity(req, {
        eventName: "完成一轮单词复习",
        module: "单词本",
        score: 3,
        metadata: {
          total: result.data.total,
          correctCount: result.data.correctCount,
          accuracy: result.data.accuracy,
        },
      }).catch((e) => console.error("记录 复习单词 失败", e));

      res.status(200).send({ code: 200, data: result.data });
    } catch (error) {
      console.error("批量提交复习结果失败", error);
      res.status(200).send({ code: 500, message: "批量提交复习结果失败" });
    }
  },

  /**
   * 重置单词本复习进度
   * POST /uniappAPI/tools/wordreview/resetReviewProgress
   * Body: { wordBookId }
   */
  resetReviewProgress: async (req, res) => {
    try {
      const { uid } = req.user;
      const { wordBookId } = req.body;

      if (!isValidObjectId(wordBookId)) {
        return res
          .status(200)
          .send({ code: 400, message: "wordBookId格式不正确" });
      }

      const result = await WordReviewService.resetReviewProgress({
        uid,
        wordBookId,
      });

      if (!result.success) {
        return res.status(200).send({
          code: result.code === "WORDBOOK_NOT_FOUND" ? 404 : 400,
          message: result.message,
        });
      }

      res.status(200).send({ code: 200, message: "复习进度已重置" });
    } catch (error) {
      console.error("重置复习进度失败", error);
      res.status(200).send({ code: 500, message: "重置复习进度失败" });
    }
  },
};

module.exports = WordReviewController;
