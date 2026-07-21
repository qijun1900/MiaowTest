const WordListModel = require("../../models/WordListModel");
const WordBookModel = require("../../models/WordBookModel");
const WordReviewStateModel = require("../../models/WordReviewStateModel");
const WordReviewRecordModel = require("../../models/WordReviewRecordModel");

/**
 * SM-2 间隔重复算法实现
 * 基于 SuperMemo 2 算法，针对单词背诵场景优化
 *
 * quality 评分标准（前端映射）：
 *   5 = 完美回忆，毫不犹豫
 *   4 = 正确回忆，稍有犹豫
 *   3 = 正确回忆，但很困难
 *   2 = 错误回忆，看到答案后觉得"啊对"
 *   1 = 错误回忆，看到答案后有点印象
 *   0 = 完全不记得
 *
 * 前端三按钮映射：
 *   ❌ 不认识 → quality=1
 *   😐 模糊   → quality=3
 *   ✅ 认识   → quality=5
 */
function calculateSM2(currentEF, currentInterval, reviewCount, quality) {
  let newEF = currentEF;
  let newInterval = currentInterval;

  const q = quality;
  const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  newEF = Math.max(1.3, currentEF + delta);

  if (quality >= 3) {
    if (reviewCount === 0) {
      newInterval = 1;
    } else if (reviewCount === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * newEF);
    }
  } else {
    newInterval = 1;
  }

  let masteryLevel;
  if (newInterval >= 30) {
    masteryLevel = 3;
  } else if (newInterval >= 7) {
    masteryLevel = 2;
  } else if (newInterval >= 1) {
    masteryLevel = 1;
  } else {
    masteryLevel = 0;
  }

  return { newEF, newInterval, masteryLevel };
}

function calculateNextReviewAt(intervalDays) {
  const now = new Date();
  return new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
}

/**
 * 将复习状态合并到单词对象上（兼容前端已有的字段访问）
 */
function mergeWordWithState(wordDoc, stateDoc) {
  const state = stateDoc || {};
  return {
    _id: wordDoc._id,
    wordBookId: wordDoc.wordBookId,
    word: wordDoc.word,
    phonetic: wordDoc.phonetic,
    meaning: wordDoc.meaning,
    example: wordDoc.example,
    tags: wordDoc.tags,
    isMarked: wordDoc.isMarked,
    createdAt: wordDoc.createdAt,
    // 复习状态字段（来自 state，无记录则为默认值）
    masteryLevel: state.masteryLevel ?? 0,
    easeFactor: state.easeFactor ?? 2.5,
    reviewInterval: state.reviewInterval ?? 0,
    reviewCount: state.reviewCount ?? 0,
    correctCount: state.correctCount ?? 0,
    wrongCount: state.wrongCount ?? 0,
    lastReviewedAt: state.lastReviewedAt ?? null,
    nextReviewAt: state.nextReviewAt ?? null,
  };
}

const WordReviewService = {
  /**
   * 获取待复习单词
   */
  getReviewWords: async ({ uid, wordBookId, mode = "mixed", limit = 20 }) => {
    try {
      const book = await WordBookModel.findOne({ _id: wordBookId, Uid: uid })
        .select({ _id: 1, title: 1, wordCount: 1 })
        .lean();
      if (!book) {
        return {
          success: false,
          code: "WORDBOOK_NOT_FOUND",
          message: "单词本不存在或无权限",
        };
      }

      const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
      const wordBaseQuery = { Uid: uid, wordBookId };
      const stateBaseQuery = { Uid: uid, wordBookId };
      const now = new Date();

      let words = [];

      if (mode === "new") {
        // 新词：找出所有有复习状态的单词 ID，然后排除它们
        const reviewedIds = await WordReviewStateModel.find(
          { ...stateBaseQuery },
          { wordId: 1 },
        ).lean();
        const reviewedIdSet = new Set(reviewedIds.map((s) => s.wordId.toString()));

        const allWords = await WordListModel.find(wordBaseQuery)
          .sort({ createdAt: 1 })
          .lean();

        const newWords = allWords
          .filter((w) => !reviewedIdSet.has(w._id.toString()))
          .slice(0, safeLimit);

        words = newWords.map((w) => mergeWordWithState(w, null));
      } else if (mode === "review") {
        // 复习：已到复习时间的
        const dueStates = await WordReviewStateModel.find({
          ...stateBaseQuery,
          nextReviewAt: { $lte: now, $ne: null },
        })
          .sort({ nextReviewAt: 1 })
          .limit(safeLimit)
          .lean();

        const wordIds = dueStates.map((s) => s.wordId);
        const wordMap = new Map();
        if (wordIds.length > 0) {
          const wordDocs = await WordListModel.find({ _id: { $in: wordIds } }).lean();
          wordDocs.forEach((w) => wordMap.set(w._id.toString(), w));
        }

        words = dueStates
          .map((s) => {
            const w = wordMap.get(s.wordId.toString());
            return w ? mergeWordWithState(w, s) : null;
          })
          .filter(Boolean);
      } else if (mode === "marked") {
        // 收藏：仅收藏的单词
        const markedWords = await WordListModel.find({
          ...wordBaseQuery,
          isMarked: true,
        })
          .sort({ updatedAt: -1 })
          .limit(safeLimit)
          .lean();

        const wordIds = markedWords.map((w) => w._id);
        const states = await WordReviewStateModel.find({
          wordId: { $in: wordIds },
          Uid: uid,
        }).lean();
        const stateMap = new Map();
        states.forEach((s) => stateMap.set(s.wordId.toString(), s));

        words = markedWords.map((w) =>
          mergeWordWithState(w, stateMap.get(w._id.toString()) || null),
        );
      } else {
        // mixed 混合模式：优先到期词，不足用新词补充
        // 1) 到期词
        const dueStates = await WordReviewStateModel.find({
          ...stateBaseQuery,
          nextReviewAt: { $lte: now, $ne: null },
        })
          .sort({ nextReviewAt: 1 })
          .limit(safeLimit)
          .lean();

        const dueWordIds = dueStates.map((s) => s.wordId);
        const dueWordMap = new Map();
        if (dueWordIds.length > 0) {
          const dueWordDocs = await WordListModel.find({ _id: { $in: dueWordIds } }).lean();
          dueWordDocs.forEach((w) => dueWordMap.set(w._id.toString(), w));
        }

        words = dueStates
          .map((s) => {
            const w = dueWordMap.get(s.wordId.toString());
            return w ? mergeWordWithState(w, s) : null;
          })
          .filter(Boolean);

        // 2) 不足用新词补充
        if (words.length < safeLimit) {
          const existingIdSet = new Set(words.map((w) => w._id.toString()));

          const reviewedIds = await WordReviewStateModel.find(
            { ...stateBaseQuery },
            { wordId: 1 },
          ).lean();
          reviewedIds.forEach((s) => existingIdSet.add(s.wordId.toString()));

          const allWords = await WordListModel.find(wordBaseQuery)
            .sort({ createdAt: 1 })
            .lean();

          const newWords = allWords
            .filter((w) => !existingIdSet.has(w._id.toString()))
            .slice(0, safeLimit - words.length)
            .map((w) => mergeWordWithState(w, null));

          words = [...words, ...newWords];
        }
      }

      const stats = await WordReviewService.getReviewStats({ uid, wordBookId });

      return {
        success: true,
        data: {
          words,
          book: { _id: book._id, title: book.title, wordCount: book.wordCount },
          stats: stats.data,
        },
      };
    } catch (error) {
      console.error("DATABASE:获取复习单词失败", error);
      throw error;
    }
  },

  /**
   * 获取单词本复习统计
   */
  getReviewStats: async ({ uid, wordBookId }) => {
    try {
      const stateBaseQuery = { Uid: uid, wordBookId };

      const [totalWords, newCount, learningCount, familiarCount, masteredCount, dueCount] =
        await Promise.all([
          WordListModel.countDocuments({ Uid: uid, wordBookId }),
          // 新词 = 总词数 - 有复习状态的词数
          WordReviewStateModel.countDocuments(stateBaseQuery).then(
            (reviewed) => WordListModel.countDocuments({ Uid: uid, wordBookId }).then((total) => total - reviewed),
          ),
          WordReviewStateModel.countDocuments({ ...stateBaseQuery, masteryLevel: 1 }),
          WordReviewStateModel.countDocuments({ ...stateBaseQuery, masteryLevel: 2 }),
          WordReviewStateModel.countDocuments({ ...stateBaseQuery, masteryLevel: 3 }),
          WordReviewStateModel.countDocuments({
            ...stateBaseQuery,
            nextReviewAt: { $lte: new Date(), $ne: null },
          }),
        ]);

      return {
        success: true,
        data: {
          totalWords,
          newWords: Math.max(0, newCount),
          learningWords: learningCount,
          familiarWords: familiarCount,
          masteredWords: masteredCount,
          dueWords: dueCount,
        },
      };
    } catch (error) {
      console.error("DATABASE:获取复习统计失败", error);
      throw error;
    }
  },

  /**
   * 提交单个单词的复习结果
   */
  submitReview: async ({ uid, wordId, quality }) => {
    try {
      const word = await WordListModel.findOne({ _id: wordId, Uid: uid });
      if (!word) {
        return {
          success: false,
          code: "WORD_NOT_FOUND",
          message: "单词不存在或无权限",
        };
      }

      const safeQuality = Math.min(5, Math.max(0, Number(quality) || 0));

      // 查找或创建复习状态
      let state = await WordReviewStateModel.findOne({ Uid: uid, wordId });
      if (!state) {
        state = new WordReviewStateModel({
          Uid: uid,
          wordId: word._id,
          wordBookId: word.wordBookId,
        });
      }

      const prevEF = state.easeFactor;
      const prevInterval = state.reviewInterval;
      const prevMastery = state.masteryLevel;

      const { newEF, newInterval, masteryLevel } = calculateSM2(
        prevEF,
        prevInterval,
        state.reviewCount,
        safeQuality,
      );

      state.easeFactor = newEF;
      state.reviewInterval = newInterval;
      state.masteryLevel = masteryLevel;
      state.reviewCount += 1;
      state.lastReviewedAt = new Date();
      state.nextReviewAt = calculateNextReviewAt(newInterval);

      if (safeQuality >= 3) {
        state.correctCount += 1;
      } else {
        state.wrongCount += 1;
      }

      await state.save();

      // 创建复习历史记录
      await WordReviewRecordModel.create({
        Uid: uid,
        wordId: word._id,
        wordBookId: word.wordBookId,
        quality: safeQuality,
        prevEF,
        newEF,
        prevInterval,
        newInterval,
        prevMastery,
        newMastery: masteryLevel,
      });

      return {
        success: true,
        data: {
          wordId: word._id,
          word: word.word,
          meaning: word.meaning,
          quality: safeQuality,
          prevMastery,
          newMastery: masteryLevel,
          newInterval,
          nextReviewAt: state.nextReviewAt,
          isCorrect: safeQuality >= 3,
        },
      };
    } catch (error) {
      console.error("DATABASE:提交复习结果失败", error);
      throw error;
    }
  },

  /**
   * 批量提交复习结果
   */
  batchSubmitReview: async ({ uid, reviews }) => {
    try {
      if (!Array.isArray(reviews) || reviews.length === 0) {
        return {
          success: false,
          code: "INVALID_PARAMS",
          message: "请提供复习结果",
        };
      }

      const results = [];
      let correctCount = 0;
      let wrongCount = 0;

      for (const review of reviews.slice(0, 100)) {
        const result = await WordReviewService.submitReview({
          uid,
          wordId: review.wordId,
          quality: review.quality,
        });
        if (result.success) {
          results.push(result.data);
          if (result.data.isCorrect) {
            correctCount++;
          } else {
            wrongCount++;
          }
        }
      }

      return {
        success: true,
        data: {
          total: results.length,
          correctCount,
          wrongCount,
          accuracy:
            results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0,
          details: results,
        },
      };
    } catch (error) {
      console.error("DATABASE:批量提交复习结果失败", error);
      throw error;
    }
  },

  /**
   * 重置单词本的复习进度
   */
  resetReviewProgress: async ({ uid, wordBookId }) => {
    try {
      const book = await WordBookModel.findOne({ _id: wordBookId, Uid: uid })
        .select({ _id: 1 })
        .lean();
      if (!book) {
        return {
          success: false,
          code: "WORDBOOK_NOT_FOUND",
          message: "单词本不存在或无权限",
        };
      }

      // 删除复习状态
      await WordReviewStateModel.deleteMany({ Uid: uid, wordBookId });
      // 删除复习记录
      await WordReviewRecordModel.deleteMany({ Uid: uid, wordBookId });

      return { success: true };
    } catch (error) {
      console.error("DATABASE:重置复习进度失败", error);
      throw error;
    }
  },
};

module.exports = WordReviewService;
