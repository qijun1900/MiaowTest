import { http } from '../../util/http.js';

/**
 * 添加题目接口
 * @param {Object} questionData - 题目数据
 * @param {string} questionData.stem - 题干
 * @param {number} questionData.Type - 题目类型 (1:选择题, 2:填空题, 3:判断题, 4:简答题)
 * @param {Array} questionData.options - 选项/答案数组 (选择题和填空题使用)
 * @param {number} questionData.answer - 答案 (判断题使用, 1:正确, 2:错误)
 * @param {string} questionData.content - 答案内容 (简答题使用)
 * @param {string} questionData.analysis - 解析
 * @param {number} questionData.isMultiple - 是否多选 (仅选择题使用)
 * @param {string} questionData.questionbankId - 题库ID
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
 * 更新题目接口
 * @param {Object} questionData - 题目数据
 * @param {string} questionData._id - 题目ID (必填)
 * @param {string} questionData.stem - 题干
 * @param {number} questionData.Type - 题目类型 (1:选择题, 2:填空题, 3:判断题, 4:简答题)
 * @param {Array} questionData.options - 选项/答案数组 (选择题和填空题使用)
 * @param {number} questionData.answer - 答案 (判断题使用, 1:正确, 2:错误)
 * @param {string} questionData.content - 答案内容 (简答题使用)
 * @param {string} questionData.analysis - 解析
 * @param {number} questionData.isMultiple - 是否多选 (仅选择题使用)
 * @param {string} questionData.questionbankId - 题库ID
 * @returns {Promise} 返回更新题目结果
 */
export async function updateQuestion(questionData) {
  try {
    if (!questionData._id) {
      throw new Error('更新题目时必须提供题目ID');
    }
    return await http({
      url: '/uniappAPI/exam/userupdate/question',
      method: 'POST',
      data: {questionData}
    });
  } catch (error) {
    console.error("updateQuestion 失败", error);
    throw error;
  }
}

/**
 * 通用保存题目接口 (自动判断是添加还是更新)
 * @param {Object} questionData - 题目数据
 * @param {string} questionData._id - 题目ID (存在时为更新，不存在时为添加)
 * @param {string} questionData.stem - 题干
 * @param {number} questionData.Type - 题目类型 (1:选择题, 2:填空题, 3:判断题, 4:简答题)
 * @param {Array} questionData.options - 选项/答案数组 (选择题和填空题使用)
 * @param {number} questionData.answer - 答案 (判断题使用, 1:正确, 2:错误)
 * @param {string} questionData.content - 答案内容 (简答题使用)
 * @param {string} questionData.analysis - 解析
 * @param {number} questionData.isMultiple - 是否多选 (仅选择题使用)
 * @param {string} questionData.questionbankId - 题库ID
 * @returns {Promise} 返回保存题目结果
 */
export async function saveQuestion(questionData) {
  try {
    // 根据是否有ID判断是添加还是更新
    if (questionData._id) {
      return await updateQuestion(questionData);
    } else {
      return await addQuestion(questionData);
    }
  } catch (error) {
    console.error("saveQuestion 失败", error);
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
/**
 * 用户删除题目
 * @param {String} questionId - 题目ID
 * @param {String} bankId - 题库ID
 * @returns {Promise} 返回删除结果
 */
export async function deleteQuestionAPI(questionId, bankId) {
  try {
    return await http({
      url: `/uniappAPI/exam/userdelete/question`,
      method: 'POST',
      data:{questionId, bankId}
    });
  }catch (error) {
    console.error("deleteQuestion 失败", error);
    throw error;
  }
}
/**
 * 用户将错题加入错题本
 * @param {String} questionId - 题目ID
 * @param {String} examId - 考试ID
 * @param {String} Type - 题目类型 (1:选择题, 2:填空题, 3:判断题, 4:简答题)
 * @returns {Promise} 返回添加结果
 */
export async function addWrongQuestionAPI(questionId, examId,Type) {
  try {
    return await http({
      url: `/uniappAPI/exam/useradd/wrongquestion`,
      method: 'POST',
      data:{questionId, examId,Type}
    });
  }catch (error) {
    console.error("addWrongQuestion 失败", error);
    throw error;
  }
}
/**
 * 用户删除错题本
 * @param {String} questionId - 题目ID
 * @returns {Promise} 返回删除结果
 */
export async function deleteWrongQuestionAPI(questionId) {
  try {
    return await http({
      url: `/uniappAPI/exam/userdelete/wrongquestion`,
      method: 'POST',
      data:{questionId,}
    })
  }catch (error) {
    console.error("deleteWrongQuestion 失败", error);
    throw error;
  }
}

/**
 * 用户获取错题本
 * @returns {Promise} 返回错题本列表
 */
export async function getUserWrongQuestionListAPI() {
  try {
    return await http({
      url: `/uniappAPI/exam/getUserWrongQuestionList`,
      method: 'GET'
    })
  }catch (error) {
    console.error("getUserWrongQuestionList 失败", error);
  }
}

/**
 * 用户获取错题本
 * @returns {Promise} 返回错题本列表
 */

/**
 * 用户收藏题目
 * @param {String} questionId - 题目ID
 * @param {String} examId - 考试ID
 * @param {String} Type - 题目类型 (1:选择题, 2:填空题, 3:判断题, 4:简答题)
 * @returns {Promise} 返回收藏结果
 */
export async function addFavoriteQuestionAPI(questionId, examId,Type) {
  try {
    return await http({
      url: `/uniappAPI/exam/useradd/favoritequestion`,
      method: 'POST',
      data:{questionId, examId,Type}
    })
  }catch (error) {
    console.error("addFavoriteQuestion 失败", error);
  }
}
/**
 * 用户删除收藏
 * @param {String} questionId - 题目ID
 * @returns {Promise} 返回删除结果
 */
export async function deleteFavoriteQuestionAPI(questionId) {
  try {
    return await http({
      url: `/uniappAPI/exam/userdelete/favoritequestion`,
      method: 'POST',
      data:{questionId,}
    })
  }catch (error) {
    console.error("deleteFavoriteQuestion 失败", error);
  }
}
/**
 * 用户获取收藏题目
 * @returns {Promise} 返回收藏题目列表
 */
export async function getUserFavoriteQuestionListAPI() {
  try {
    return await http({
      url: `/uniappAPI/exam/getUserFavoriteQuestionList`,
      method: 'GET'
    })
  }catch (error) {
    console.error("getUserFavoriteQuestionList 失败", error);
  }
}
/**
 * @description 刷题时候检测当前题目是否收藏
 * @param {String} questionId - 题目ID
 * @returns {Promise} 返回收藏结果
*/
export async function checkFavoriteQuestionAPI(questionId) {
  try {
    return await http({
      url: `/uniappAPI/exam/checkFavoriteQuestion`,
      method: 'POST',
      data:{questionId,}
    })
  }catch (error) {
    console.error("checkFavoriteQuestion 失败", error);
  }
}


/**
 * 用户点击题目进行练习
 * @param {Type}  Type - 题目类型 (1:选择题, 2:填空题, 3:判断题, 4:简答题)
 * @param {String} questionId - 题目ID
 * @returns {Promise} 返回练习结果 code: 200,isFavorited: true / false
 * @example
 */
export async function practiceQuestionAPI(Type, questionId) {
  try {
    return await http({
      url: `/uniappAPI/exam/userpractice/question`,
      method: 'POST',
      data:{Type, questionId}
    })
  }catch (error) {
    console.error("practiceFavoriteQuestion 失败", error);
  } 
}
/**
 * @description 刷题时候保存用户记录的笔记内容
 * @param {*String} questionId - 题目ID
 * @param {*Number} questionType - 题目类型 (1:选择题, 2:填空题, 3:判断题, 4:简答题)
 * @param {*String} examId - 考试ID 
 * @param {*String} content - 笔记内容
 * @returns {Promise} 返回保存结果-code -   message -  ActionType 
 * 
 */
export async function savePracticeNoteAPI({
  questionId,
  questionType,
  examId,
  content
}) {
  try {
    return await http({
      url: `/uniappAPI/exam/savePracticeNote`,
      method: 'POST',
      data: { questionId, questionType, examId, content }
    })

  } catch (error) {
    console.error("savePracticeNote 失败", error);
  }
}

/**
 * @description 刷题时获取用户记录的笔记内容(检测是否存在笔记)
 * @param {*String} questionId - 题目ID
 * @returns {Promise} 返回笔记内容
 */
export async function getPracticeNoteAPI(questionId) {
  try {
    return await http({
      url: `/uniappAPI/exam/getPracticeNote`,
      method: 'POST',
      data:{questionId}
    })
  }catch (error) {
    console.error("getPracticeNote 失败", error);
  }
}
