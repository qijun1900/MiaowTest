import { http } from '../../util/http.js';
import { cacheManager } from '../../util/cache.js';

// 缓存键
const CACHE_KEY = 'exam_subjects_cache';
const CACHE_EXPIRY_TIME = 60 * 60 * 1000; // 缓存过期时间(初始为1小时)

/**
 * 清除考试科目缓存
 */
export function clearExamSubjectsCache() {
  try {
    cacheManager.remove(CACHE_KEY);
    console.log('考试科目缓存已清除');
  } catch (error) {
    console.error('清除考试科目缓存失败:', error);
  }
}

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
 * 获取用户点击的考试科目考试题型
 * @param {*string} examId 考试科目ID
 */
export async function getExamSubjectTypes(examId) {
  try {
    const response = await http({
      url: `/uniappAPI/Exam/getExamSubjectTypes/${examId}`,
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error("getExamSubjectTypes 失败", error);
    throw error;
  }

}

/** 匹配题目列表
 * @param {Array} extractedData 问题ID数组 [{ _id: '68c57b6f30e5b87cc7790354', category: 1 },]
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
 * @param {*String} bankName 题库名称
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
/**
 * 获取用户题库列表
 * @returns {*blankName} 返回用户题库名称
 * @returns {*questionCount} 返回用户题库题目数量
 * @returns {*bankId} 返回用户题库ID
 * @returns {*createTime} 返回用户题库创建时间
 */
export async function getUserBankList() {
  try {
    return await http({
      url: `/uniappAPI/exam/getUserBankList`,
      method: 'GET',
    });
  }catch (error) {
    console.error("getUserBankList 失败", error);
    throw error;
  }
  
}
/**
 * 删除用户自建题库
 * @param {String} bankId 题库ID
 *  @returns {Promise} 返回删除结果
 */
export async function deleteUserBankAPI(bankId) {
  try {
    return await http({
      url: `/uniappAPI/exam/userdelete/bank`,
      method: 'POST',
      data: { bankId: bankId }
    });
  }catch (error) {
    console.error("deleteUserBank 失败", error);
    throw error;
  }
}

/**
 * @description  获取该考试科目下的资料列表
 * @method POST
 * @param {*String} examId 考试科目ID - 必填
 * @returns {*String} title 资料标题 
 */
export async function getExamSubjectNetMaterials(examId) {
  try {
    return await http({
      url: `/uniappAPI/exam/getexamsubjectmaterials`,
      data: { examId: examId },
      method: 'POST',
    });
  }catch (error) {
    console.error("getExamSubjectMaterials 失败", error);
    throw error;
  }
}
