const WordListModel = require("../../models/WordListModel");
const WordBookModel = require("../../models/WordBookModel");
const KnowledgeBaseModel = require("../../models/KnowledgeBaseModel");
const {
  similaritySearch,
} = require("../../llm/vectorstores/stores/chromaManager");
const ModelFactory = require("../../llm/models/factory");
const {
  wordLookupPrompt,
  wordExtractPrompt,
  wordDetailPrompt,
} = require("../../llm/prompts/templates/wordListPrompts");

const escapeRegex = (keyword = "") =>
  keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const WordListService = {
  /**
   * 分页获取单词列表
   */
  getWords: async ({
    uid,
    wordBookId,
    page = 1,
    pageSize = 20,
    keyword = "",
    isMarked,
    tag = "",
  }) => {
    try {
      // 验证单词本归属
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

      const query = { Uid: uid, wordBookId };

      // 关键词搜索
      const safeKeyword = String(keyword || "").trim();
      if (safeKeyword) {
        const regex = new RegExp(escapeRegex(safeKeyword), "i");
        query.$or = [{ word: regex }, { meaning: regex }];
      }

      // 收藏筛选
      if (isMarked === true || isMarked === "true") {
        query.isMarked = true;
      }

      // 标签筛选
      const safeTag = String(tag || "").trim();
      if (safeTag) {
        query.tags = safeTag;
      }

      const safePage = Math.max(1, Number(page) || 1);
      const safePageSize = Math.min(50, Math.max(1, Number(pageSize) || 20));
      const skip = (safePage - 1) * safePageSize;

      const total = await WordListModel.countDocuments(query);
      const list = await WordListModel.find(query, {
        _id: 1,
        word: 1,
        phonetic: 1,
        meaning: 1,
        example: 1,
        tags: 1,
        isMarked: 1,
        updatedAt: 1,
        createdAt: 1,
      })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(safePageSize)
        .lean();

      // 统计收藏数
      const markedCount = await WordListModel.countDocuments({
        Uid: uid,
        wordBookId,
        isMarked: true,
      });

      return {
        success: true,
        data: {
          list,
          markedCount,
          pagination: {
            page: safePage,
            pageSize: safePageSize,
            total,
            hasMore: skip + list.length < total,
          },
        },
      };
    } catch (error) {
      console.error("DATABASE:获取单词列表失败", error);
      throw error;
    }
  },

  /**
   * 获取单个单词详情
   */
  getWordDetail: async ({ uid, id }) => {
    try {
      const word = await WordListModel.findOne(
        { _id: id, Uid: uid },
        {
          _id: 1,
          wordBookId: 1,
          word: 1,
          phonetic: 1,
          meaning: 1,
          example: 1,
          tags: 1,
          isMarked: 1,
          updatedAt: 1,
          createdAt: 1,
        },
      ).lean();

      if (!word) {
        return {
          success: false,
          code: "WORD_NOT_FOUND",
          message: "单词不存在或无权限",
        };
      }

      return { success: true, data: word };
    } catch (error) {
      console.error("DATABASE:获取单词详情失败", error);
      throw error;
    }
  },

  /**
   * 添加单词
   */
  addWord: async ({
    uid,
    wordBookId,
    word,
    phonetic = "",
    meaning = "",
    example = "",
    tags = [],
  }) => {
    try {
      // 验证单词本归属
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

      const safeWord = String(word || "").trim();
      if (!safeWord) {
        return {
          success: false,
          code: "INVALID_PARAMS",
          message: "请输入单词",
        };
      }

      // 检查同一单词本内是否重复
      const existing = await WordListModel.findOne({
        Uid: uid,
        wordBookId,
        word: { $regex: new RegExp(`^${escapeRegex(safeWord)}$`, "i") },
      })
        .select({ _id: 1 })
        .lean();

      if (existing) {
        return {
          success: false,
          code: "DUPLICATE_WORD",
          message: "该单词已存在于此单词本中",
        };
      }

      const safeTags = Array.isArray(tags)
        ? tags
            .map((t) => String(t || "").trim())
            .filter(Boolean)
            .slice(0, 10)
        : [];

      const newWord = await WordListModel.create({
        Uid: uid,
        wordBookId,
        word: safeWord,
        phonetic: String(phonetic || "").trim(),
        meaning: String(meaning || "").trim(),
        example: String(example || "").trim(),
        tags: safeTags,
      });

      // 更新单词本单词数
      await WordBookModel.updateOne(
        { _id: wordBookId, Uid: uid },
        { $inc: { wordCount: 1 }, $set: { updatedAt: new Date() } },
      );

      return { success: true, data: newWord };
    } catch (error) {
      console.error("DATABASE:添加单词失败", error);
      throw error;
    }
  },

  /**
   * 更新单词
   */
  updateWord: async ({ uid, id, word, phonetic, meaning, example, tags }) => {
    try {
      const wordDoc = await WordListModel.findOne({ _id: id, Uid: uid });
      if (!wordDoc) {
        return {
          success: false,
          code: "WORD_NOT_FOUND",
          message: "单词不存在或无权限",
        };
      }

      if (word !== undefined) {
        const safeWord = String(word || "").trim();
        if (!safeWord) {
          return {
            success: false,
            code: "INVALID_PARAMS",
            message: "单词不能为空",
          };
        }
        // 检查重复（排除自身）
        const existing = await WordListModel.findOne({
          Uid: uid,
          wordBookId: wordDoc.wordBookId,
          _id: { $ne: id },
          word: { $regex: new RegExp(`^${escapeRegex(safeWord)}$`, "i") },
        })
          .select({ _id: 1 })
          .lean();
        if (existing) {
          return {
            success: false,
            code: "DUPLICATE_WORD",
            message: "该单词已存在于此单词本中",
          };
        }
        wordDoc.word = safeWord;
      }

      if (phonetic !== undefined)
        wordDoc.phonetic = String(phonetic || "").trim();
      if (meaning !== undefined) wordDoc.meaning = String(meaning || "").trim();
      if (example !== undefined) wordDoc.example = String(example || "").trim();
      if (tags !== undefined) {
        wordDoc.tags = Array.isArray(tags)
          ? tags
              .map((t) => String(t || "").trim())
              .filter(Boolean)
              .slice(0, 10)
          : [];
      }

      await wordDoc.save();

      // 更新单词本 updatedAt
      await WordBookModel.updateOne(
        { _id: wordDoc.wordBookId, Uid: uid },
        { $set: { updatedAt: new Date() } },
      );

      return { success: true };
    } catch (error) {
      console.error("DATABASE:更新单词失败", error);
      throw error;
    }
  },

  /**
   * 删除单词
   */
  deleteWord: async ({ uid, id, wordBookId }) => {
    try {
      const query = { _id: id, Uid: uid };
      if (wordBookId) query.wordBookId = wordBookId;

      const result = await WordListModel.deleteOne(query);
      if (result.deletedCount === 0) {
        return {
          success: false,
          code: "WORD_NOT_FOUND",
          message: "单词不存在或无权限",
        };
      }

      // 更新单词本单词数（最小为 0）
      if (wordBookId) {
        await WordBookModel.updateOne({ _id: wordBookId, Uid: uid }, [
          {
            $set: {
              wordCount: {
                $max: [{ $subtract: [{ $ifNull: ["$wordCount", 0] }, 1] }, 0],
              },
              updatedAt: "$$NOW",
            },
          },
        ]);
      }

      return { success: true };
    } catch (error) {
      console.error("DATABASE:删除单词失败", error);
      throw error;
    }
  },

  /**
   * 批量删除单词
   */
  batchDeleteWords: async ({ uid, ids, wordBookId }) => {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        return {
          success: false,
          code: "INVALID_PARAMS",
          message: "请选择要删除的单词",
        };
      }

      const query = { _id: { $in: ids }, Uid: uid };
      if (wordBookId) query.wordBookId = wordBookId;

      const result = await WordListModel.deleteMany(query);

      // 更新单词本单词数
      if (wordBookId && result.deletedCount > 0) {
        await WordBookModel.updateOne({ _id: wordBookId, Uid: uid }, [
          {
            $set: {
              wordCount: {
                $max: [
                  {
                    $subtract: [
                      { $ifNull: ["$wordCount", 0] },
                      result.deletedCount,
                    ],
                  },
                  0,
                ],
              },
              updatedAt: "$$NOW",
            },
          },
        ]);
      }

      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      console.error("DATABASE:批量删除单词失败", error);
      throw error;
    }
  },

  /**
   * 切换收藏状态
   */
  toggleMarked: async ({ uid, id }) => {
    try {
      const word = await WordListModel.findOne({ _id: id, Uid: uid })
        .select({ _id: 1, isMarked: 1 })
        .lean();
      if (!word) {
        return {
          success: false,
          code: "WORD_NOT_FOUND",
          message: "单词不存在或无权限",
        };
      }

      const nextMarked = !word.isMarked;
      await WordListModel.updateOne(
        { _id: id, Uid: uid },
        { $set: { isMarked: nextMarked } },
      );

      return { success: true, data: { id, isMarked: nextMarked } };
    } catch (error) {
      console.error("DATABASE:切换收藏状态失败", error);
      throw error;
    }
  },

  /**
   * 批量添加单词
   */
  batchAddWords: async ({ uid, wordBookId, words }) => {
    try {
      // 验证单词本归属
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

      if (!Array.isArray(words) || words.length === 0) {
        return {
          success: false,
          code: "INVALID_PARAMS",
          message: "请提供要添加的单词",
        };
      }

      // 获取已有单词（用于去重）
      const existingWords = await WordListModel.find(
        { Uid: uid, wordBookId },
        { word: 1 },
      ).lean();
      const existingSet = new Set(
        existingWords.map((w) => String(w.word || "").toLowerCase()),
      );

      const toInsert = [];
      const skipped = [];

      for (const item of words.slice(0, 100)) {
        const safeWord = String(item.word || "").trim();
        if (!safeWord) continue;

        if (existingSet.has(safeWord.toLowerCase())) {
          skipped.push(safeWord);
          continue;
        }

        const safeTags = Array.isArray(item.tags)
          ? item.tags
              .map((t) => String(t || "").trim())
              .filter(Boolean)
              .slice(0, 10)
          : [];

        toInsert.push({
          Uid: uid,
          wordBookId,
          word: safeWord,
          phonetic: String(item.phonetic || "").trim(),
          meaning: String(item.meaning || "").trim(),
          example: String(item.example || "").trim(),
          tags: safeTags,
        });

        existingSet.add(safeWord.toLowerCase());
      }

      let insertedCount = 0;
      if (toInsert.length > 0) {
        const result = await WordListModel.insertMany(toInsert);
        insertedCount = result.length;

        // 更新单词本单词数
        await WordBookModel.updateOne(
          { _id: wordBookId, Uid: uid },
          {
            $inc: { wordCount: insertedCount },
            $set: { updatedAt: new Date() },
          },
        );
      }

      return {
        success: true,
        data: { insertedCount, skippedCount: skipped.length, skipped },
      };
    } catch (error) {
      console.error("DATABASE:批量添加单词失败", error);
      throw error;
    }
  },

  /**
   * AI 查询单词（音标+释义）
   */
  aiLookupWord: async ({ word }) => {
    try {
      const safeWord = String(word || "").trim();
      if (!safeWord) {
        return {
          success: false,
          code: "INVALID_PARAMS",
          message: "请输入单词",
        };
      }

      const model = ModelFactory.getModel("qwen-plus", 0.3);
      const prompt = wordLookupPrompt(safeWord);

      const response = await model.invoke(prompt);
      const rawText = String(response?.content || "").trim();

      // 从原始文本中提取 JSON 对象（兼容代码块包裹和嵌套情况）
      let result = { phonetic: "", meaning: "", example: "" };

      // 去掉 ```json ``` 包裹
      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      // 用正则提取三个字段（绕过 JSON 解析的各种边界问题）
      const phoneticMatch = cleaned.match(/"phonetic"\s*:\s*"([^"]*)"/);
      const exampleMatch = cleaned.match(/"example"\s*:\s*"([^"]*)"/);

      if (phoneticMatch) result.phonetic = phoneticMatch[1];
      if (exampleMatch) result.example = exampleMatch[1];

      // meaning 可能包含换行符，用更宽松的匹配
      const meaningMatch = cleaned.match(
        /"meaning"\s*:\s*"((?:[^"\\]|\\[\s\S])*?)"/,
      );
      if (meaningMatch) {
        result.meaning = meaningMatch[1]
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"');
      }

      // 如果正则没提取到，尝试 JSON.parse 作为兜底
      if (!result.meaning) {
        try {
          const parsed = JSON.parse(cleaned);
          result.phonetic = parsed.phonetic || "";
          result.meaning = parsed.meaning || "";
          result.example = parsed.example || "";
        } catch {
          result.meaning = cleaned.slice(0, 200);
        }
      }

      return { success: true, data: result };
    } catch (error) {
      console.error("AI:查询单词失败", error);
      throw error;
    }
  },

  /**
   * AI 从文本中提取单词
   */
  aiExtractWords: async ({ text }) => {
    try {
      const safeText = String(text || "").trim();
      if (!safeText) {
        return {
          success: false,
          code: "INVALID_PARAMS",
          message: "请输入文本",
        };
      }

      const model = ModelFactory.getModel("qwen-plus", 0.3);
      const prompt = wordExtractPrompt(safeText);

      const response = await model.invoke(prompt);
      const responseText = String(response?.content || "").trim();

      let result;
      try {
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        result = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
      } catch {
        result = [];
      }

      return { success: true, data: Array.isArray(result) ? result : [] };
    } catch (error) {
      console.error("AI:提取单词失败", error);
      throw error;
    }
  },

  /**
   * AI 生成单词扩展信息（助记法/词根/近义词）
   */
  aiWordDetail: async function* ({ word }) {
    const safeWord = String(word || "").trim();
    if (!safeWord) return;

    const model = ModelFactory.getModel("qwen-plus", 0.7);
    const prompt = wordDetailPrompt(safeWord);

    const stream = await model.stream(prompt);
    for await (const chunk of stream) {
      if (chunk?.content) {
        yield String(chunk.content);
      }
    }
  },

  /**
   * AI 生成单词扩展信息（非流式版本）
   */
  aiWordDetailSync: async ({ word, type = "all" }) => {
    const safeWord = String(word || "").trim();
    if (!safeWord) return "";

    const model = ModelFactory.getModel("qwen-plus", 0.7);
    const prompt = wordDetailPrompt(safeWord, type);

    const response = await model.invoke(prompt);
    let content = String(response?.content || "").trim();

    // 去掉 AI 可能包裹的 ```markdown ... ``` 代码块
    content = content
      .replace(/^```(?:markdown)?\s*\n?([\s\S]*?)\n?```$/g, "$1")
      .trim();

    return content;
  },

  /**
   * 获取可用知识库列表
   */
  getKnowledgeBases: async () => {
    try {
      const kbs = await KnowledgeBaseModel.find(
        {},
        {
          _id: 1,
          name: 1,
          description: 1,
          collectionName: 1,
        },
      )
        .sort({ createTime: -1 })
        .lean();

      return { success: true, data: kbs };
    } catch (error) {
      console.error("DATABASE:获取知识库列表失败", error);
      throw error;
    }
  },

  /**
   * 从指定知识库检索例句
   */
  searchExamples: async ({ word, kbId, topK = 5 }) => {
    try {
      const safeWord = String(word || "").trim();
      if (!safeWord) {
        return {
          success: false,
          code: "INVALID_PARAMS",
          message: "请输入单词",
        };
      }

      // 查找知识库
      const kb = await KnowledgeBaseModel.findOne({ _id: kbId })
        .select({ _id: 1, name: 1, collectionName: 1 })
        .lean();
      if (!kb) {
        return {
          success: false,
          code: "KB_NOT_FOUND",
          message: "知识库不存在",
        };
      }

      // 向量检索
      const safeTopK = Math.min(10, Math.max(1, Number(topK) || 5));
      const results = await similaritySearch(
        safeWord,
        safeTopK,
        kb.collectionName,
      );

      // 过滤并格式化结果
      const examples = (results || [])
        .filter((r) => r.content && r.content.length > 10)
        .map((r) => ({
          content: r.content.slice(0, 500),
          source: r.metadata?.source || r.metadata?.fileName || kb.name,
          score: r.score,
        }));

      return {
        success: true,
        data: { kbName: kb.name, examples },
      };
    } catch (error) {
      console.error("知识库检索例句失败", error);
      throw error;
    }
  },
};

module.exports = WordListService;
