import { http } from '../../util/http.js';
import { cacheManager } from '../../util/cache.js';

// 缓存键
const CACHE_KEY = 'exam_subjects_cache';
const CACHE_EXPIRY_TIME = 60 * 60 * 1000; // 缓存过期时间(初始为1小时)

/**
 * 获取考试科目列表（带缓存）
 * @param {boolean} forceRefresh 是否强制刷新缓存
 * @returns {Promise} 返回考试科目数据
 */
export async function getExamSubjects(forceRefresh = false) {
  // 如果不是强制刷新，先尝试从缓存获取
  if (!forceRefresh) {
    const cachedData = cacheManager.get(CACHE_KEY, CACHE_EXPIRY_TIME);
    if (cachedData) {
      console.log('使用缓存数据获取考试科目');
      return cachedData;
    }
  }

  // 缓存无数据或已过期，请求服务器
  try {
    const response = await http({
      url: '/uniappAPI/Exam/getExamSubjects',
      method: 'GET',
    });


    // 将数据存入缓存
    cacheManager.set(CACHE_KEY, response);
    console.log('从服务器获取考试科目数据并缓存');

    return response;
  } catch (error) {
    console.error("getExamSubjects 失败", error);
    throw error;
  }
}

/**
 * 清除考试科目缓存
 */
export function clearExamSubjectsCache() {
  cacheManager.remove(CACHE_KEY);
  console.log('已清除考试科目缓存');
}

/**
 * 检查是否有有效的考试科目缓存
 * @returns {boolean} 是否有有效缓存
 */
export function hasValidExamSubjectsCache() {
  return cacheManager.has(CACHE_KEY, CACHE_EXPIRY_TIME);
}


/**
 * 获取用户点击的考试科目考试题型
 * @param {string} examSubjectId 考试科目ID
 */
export async function getExamSubjectTypes(examSubjectId) {
  try {
    const response = await http({
      url: `/uniappAPI/Exam/getExamSubjectTypes/${examSubjectId}`,
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error("getExamSubjectTypes 失败", error);
    throw error;
  }

}

/** 匹配题目列表
 * @param {Array} extractedData 问题ID数组
 * @returns {Promise} 返回匹配的题目列表
 */
export async function FetchMatchQuestionList(extractedData) {
  try {
    const response = await http({
      url: `/uniappAPI/Exam/FetchMatchQuestionList`,
      method: 'POST',
      data: extractedData
    });

    return response;

  } catch (error) {
    console.error("FetchMatchQuestionList 失败", error);
    throw error;
  }
}

/**
 * 添加用户自建题库
 * @param {String} bankName 题库名称
**/
export async function AddUserBank(bankName) {
  try {
      return await http({
      url:"/uniappAPI/exam/AddUserBank",
      method: 'POST',
      data: { bankName: bankName } 
    });
  }catch (error) {
    console.error("AddUserBank 失败", error);
    throw error;
  }
}
