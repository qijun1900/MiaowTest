import { http } from "../../util/http/request";

// ==================== 基础 CRUD ====================

/**
 * @description 分页获取单词列表
 */
export async function getWordsAPI(wordBookId, { page = 1, pageSize = 20, keyword = "", isMarked, tag = "" } = {}) {
  try {
    const query = [
      `wordBookId=${encodeURIComponent(wordBookId)}`,
      `page=${encodeURIComponent(page)}`,
      `pageSize=${encodeURIComponent(pageSize)}`,
      `keyword=${encodeURIComponent(keyword)}`,
      `tag=${encodeURIComponent(tag)}`,
    ];
    if (isMarked !== undefined && isMarked !== null) {
      query.push(`isMarked=${encodeURIComponent(isMarked)}`);
    }
    return await http({
      url: `/uniappAPI/tools/wordlist/getWords?${query.join("&")}`,
      method: "GET",
    });
  } catch (error) {
    console.error("getWordsAPI 失败", error);
    throw error;
  }
}

/**
 * @description 获取单词详情
 */
export async function getWordDetailAPI(id) {
  try {
    return await http({
      url: `/uniappAPI/tools/wordlist/getWordDetail?id=${id}`,
      method: "GET",
    });
  } catch (error) {
    console.error("getWordDetailAPI 失败", error);
    throw error;
  }
}

/**
 * @description 添加单词
 */
export async function addWordAPI({ wordBookId, word, phonetic, meaning, example, tags }) {
  try {
    return await http({
      url: "/uniappAPI/tools/wordlist/addWord",
      method: "POST",
      data: { wordBookId, word, phonetic, meaning, example, tags },
    });
  } catch (error) {
    console.error("addWordAPI 失败", error);
    throw error;
  }
}

/**
 * @description 更新单词
 */
export async function updateWordAPI({ id, word, phonetic, meaning, example, tags }) {
  try {
    return await http({
      url: "/uniappAPI/tools/wordlist/updateWord",
      method: "POST",
      data: { id, word, phonetic, meaning, example, tags },
    });
  } catch (error) {
    console.error("updateWordAPI 失败", error);
    throw error;
  }
}

/**
 * @description 删除单词
 */
export async function deleteWordAPI({ id, wordBookId }) {
  try {
    return await http({
      url: "/uniappAPI/tools/wordlist/deleteWord",
      method: "POST",
      data: { id, wordBookId },
    });
  } catch (error) {
    console.error("deleteWordAPI 失败", error);
    throw error;
  }
}

/**
 * @description 批量删除单词
 */
export async function batchDeleteWordsAPI({ ids, wordBookId }) {
  try {
    return await http({
      url: "/uniappAPI/tools/wordlist/batchDeleteWords",
      method: "POST",
      data: { ids, wordBookId },
    });
  } catch (error) {
    console.error("batchDeleteWordsAPI 失败", error);
    throw error;
  }
}

/**
 * @description 切换收藏状态
 */
export async function toggleMarkedAPI({ id }) {
  try {
    return await http({
      url: "/uniappAPI/tools/wordlist/toggleMarked",
      method: "POST",
      data: { id },
    });
  } catch (error) {
    console.error("toggleMarkedAPI 失败", error);
    throw error;
  }
}

/**
 * @description 批量添加单词
 */
export async function batchAddWordsAPI({ wordBookId, words }) {
  try {
    return await http({
      url: "/uniappAPI/tools/wordlist/batchAddWords",
      method: "POST",
      data: { wordBookId, words },
    });
  } catch (error) {
    console.error("batchAddWordsAPI 失败", error);
    throw error;
  }
}

// ==================== AI 相关 ====================

/**
 * @description AI 查询单词（音标+释义）
 */
export async function aiLookupWordAPI(word) {
  try {
    return await http({
      url: "/uniappAPI/tools/wordlist/aiLookupWord",
      method: "POST",
      data: { word },
    });
  } catch (error) {
    console.error("aiLookupWordAPI 失败", error);
    throw error;
  }
}

/**
 * @description AI 从文本提取单词
 */
export async function aiExtractWordsAPI(text) {
  try {
    return await http({
      url: "/uniappAPI/tools/wordlist/aiExtractWords",
      method: "POST",
      data: { text },
    });
  } catch (error) {
    console.error("aiExtractWordsAPI 失败", error);
    throw error;
  }
}

/**
 * @description AI 生成单词扩展信息（助记/词根/近义词）
 * @param {string} word - 单词
 * @param {string} [type='all'] - 类型: 'all' | 'mnemonic' | 'root' | 'synonyms'
 */
export async function aiWordDetailAPI(word, type = "all") {
  try {
    return await http({
      url: "/uniappAPI/tools/wordlist/aiWordDetail",
      method: "POST",
      data: { word, type },
    });
  } catch (error) {
    console.error("aiWordDetailAPI 失败", error);
    throw error;
  }
}

// ==================== 知识库相关 ====================

/**
 * @description 获取可用知识库列表
 * @param {string} [businessType] - 可选，按业务标识筛选
 */
export async function getKnowledgeBasesAPI(businessType) {
  try {
    const params = {};
    if (businessType) params.businessType = businessType;
    return await http({
      url: "/uniappAPI/tools/wordlist/getKnowledgeBases",
      method: "GET",
      data: params,
    });
  } catch (error) {
    console.error("getKnowledgeBasesAPI 失败", error);
    throw error;
  }
}

/**
 * @description 从知识库检索例句
 */
export async function searchExamplesAPI({ word, kbId, topK = 5 }) {
  try {
    return await http({
      url: "/uniappAPI/tools/wordlist/searchExamples",
      method: "POST",
      data: { word, kbId, topK },
    });
  } catch (error) {
    console.error("searchExamplesAPI 失败", error);
    throw error;
  }
}
