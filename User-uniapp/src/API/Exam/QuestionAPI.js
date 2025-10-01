import { http } from '../../util/http.js';

/**
 * 通用添加题目接口
 * @param {Object} questionData - 题目数据
 * @param {string} questionData.stem - 题干
 * @param {number} questionData.Type - 题目类型 (1:选择题, 2:填空题, 3:判断题, 4:简答题)
 * @param {Array} questionData.options - 选项/答案数组 (选择题和填空题使用)
 * @param {number} questionData.answer - 答案 (判断题使用, 1:正确, 2:错误)
 * @param {string} questionData.content - 答案内容 (简答题使用)
 * @param {string} questionData.analysis - 解析
 * @param {number} questionData.isMultiple - 是否多选 (仅选择题使用)
 * @returns {Promise} 返回添加题目结果
 */
export async function addQuestion(questionData) {
  try {
    return await http({
      url: '/uniappAPI/exam/useradd/question',
      method: 'POST',
      data: {questionData}
    });
  } catch (error) {
    console.error("addQuestion 失败", error);
    throw error;
  }
}
/**
 * 获取用户题库列表
 * @param {String} bankId - 题库ID 
 * @returns {Promise} 返回用户题库列表
 */
export async function getUserBankQuestionList(bankId) {
  try {
    return await http({
      url: `/uniappAPI/exam/getUserBankQuestionList/${bankId}`,
      method: 'GET'
    });
  }catch (error) {
    console.error("getUserBankList 失败", error);
    throw error;
  }
}