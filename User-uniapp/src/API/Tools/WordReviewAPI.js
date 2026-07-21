import { http } from "../../util/http/request";

/**
 * @description 获取待复习单词
 * @param {string} wordBookId - 单词本 ID
 * @param {object} params - { mode: 'new'|'review'|'mixed'|'marked', limit: number }
 */
export async function getReviewWordsAPI(wordBookId, { mode = "mixed", limit = 20 } = {}) {
  try {
    return await http({
      url: `/uniappAPI/tools/wordreview/getReviewWords?wordBookId=${wordBookId}&mode=${mode}&limit=${limit}`,
      method: "GET",
    });
  } catch (error) {
    console.error("getReviewWordsAPI 失败", error);
    throw error;
  }
}

/**
 * @description 获取单词本复习统计
 * @param {string} wordBookId - 单词本 ID
 */
export async function getReviewStatsAPI(wordBookId) {
  try {
    return await http({
      url: `/uniappAPI/tools/wordreview/getReviewStats?wordBookId=${wordBookId}`,
      method: "GET",
    });
  } catch (error) {
    console.error("getReviewStatsAPI 失败", error);
    throw error;
  }
}

/**
 * @description 提交单个单词的复习结果
 * @param {object} data - { wordId, quality (0-5) }
 */
export async function submitReviewAPI({ wordId, quality }) {
  try {
    return await http({
      url: "/uniappAPI/tools/wordreview/submitReview",
      method: "POST",
      data: { wordId, quality },
    });
  } catch (error) {
    console.error("submitReviewAPI 失败", error);
    throw error;
  }
}

/**
 * @description 批量提交复习结果
 * @param {object} data - { reviews: [{ wordId, quality }] }
 */
export async function batchSubmitReviewAPI({ reviews }) {
  try {
    return await http({
      url: "/uniappAPI/tools/wordreview/batchSubmitReview",
      method: "POST",
      data: { reviews },
    });
  } catch (error) {
    console.error("batchSubmitReviewAPI 失败", error);
    throw error;
  }
}

/**
 * @description 重置单词本复习进度
 * @param {string} wordBookId - 单词本 ID
 */
export async function resetReviewProgressAPI(wordBookId) {
  try {
    return await http({
      url: "/uniappAPI/tools/wordreview/resetReviewProgress",
      method: "POST",
      data: { wordBookId },
    });
  } catch (error) {
    console.error("resetReviewProgressAPI 失败", error);
    throw error;
  }
}
