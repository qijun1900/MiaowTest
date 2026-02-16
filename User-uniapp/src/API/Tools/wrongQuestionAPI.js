import { http } from "../../util/http";

/**
 * @description 添加错题到错题本
 * @method POST
 * @param {Object} data - 错题数据
 * @param {String} data.wrongBookId - 错题本ID，必填
 * @param {Number} data.Type - 题目类型（1-选择题 2-填空题 3-判断题 4-简答题），必填
 * @param {String} data.questionSource - 题目来源（system-系统题库 user-用户自建）
 * @param {Object} data.stem - 题干对象 { text, images }
 * @param {Array} data.options - 选项数组
 * @param {Object} data.correctAnswer - 正确答案对象 { text, images }
 * @param {Object} data.wrongAnswer - 错误答案对象 { text, images }
 * @param {Object} data.analysis - 解析对象 { text, images }
 * @param {Array} data.tags - 标签数组
 * @param {String} data.difficulty - 难度（easy-简单 medium-中等 hard-困难）
 * @returns {Promise} 返回添加错题的响应
 */
export async function addWrongQuestionAPI(data) {
    try {
        return await http({
            url: '/uniappAPI/tools/wrongbook/addWrongQuestion',
            method: 'POST',
            data: data
        });
    } catch (error) {
        console.error("addWrongQuestion 失败", error);
        throw error;
    }
}

/**
 * @description 获取错题本中的错题列表
 * @method GET
 * @param {String} wrongBookId - 错题本ID，必填
 * @param {Object} params - 查询参数（可选）
 * @param {Number} params.page - 页码
 * @param {Number} params.pageSize - 每页数量
 * @param {Number} params.Type - 题目类型筛选
 * @param {Number} params.status - 状态筛选（0-新题 1-复习中 2-已掌握）
 * @param {String} params.difficulty - 难度筛选
 * @returns {Promise} 返回错题列表
 */
export async function getWrongQuestionsAPI(wrongBookId, params = {}) {
  try {
    let queryString = 'wrongBookId=' + wrongBookId;
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        queryString += '&' + key + '=' + params[key];
      }
    }

    return await http({
      url: `/uniappAPI/tools/wrongbook/getWrongQuestions?${queryString}`,
      method: 'GET'
    });
  } catch (error) {
    console.error("getWrongQuestions 失败", error);
    throw error;
  }
}
/**
 * @description 删除错题
 * @method POST
 * @param {String} questionId - 错题ID，必填
 * @returns {Promise} 返回删除结果
 */
export async function deleteWrongQuestionAPI(questionId) {
    try {
        return await http({
            url: '/uniappAPI/tools/wrongbook/deleteWrongQuestion',
            method: 'POST',
            data: { id: questionId }
        });
    } catch (error) {
        console.error("deleteWrongQuestion 失败", error);
        throw error;
    }
}

/**
 * @description 获取错题详情
 * @method GET
 * @param {String} questionId - 错题ID，必填
 * @returns {Promise} 返回错题详情
 */
export async function getWrongQuestionDetailAPI(questionId) {
    try {
        return await http({
            url: `/uniappAPI/tools/wrongQuestion/getWrongQuestionDetail?id=${questionId}`,
            method: 'GET'
        });
    } catch (error) {
        console.error("getWrongQuestionDetail 失败", error);
        throw error;
    }
}

/**
 * @description 更新错题信息
 * @method POST
 * @param {Object} data - 更新数据
 * @param {String} data.id - 错题ID，必填
 * @param {Object} data.stem - 题干对象（可选）
 * @param {Object} data.analysis - 解析对象（可选）
 * @param {Array} data.tags - 标签数组（可选）
 * @param {String} data.difficulty - 难度（可选）
 * @returns {Promise} 返回更新结果
 */
export async function updateWrongQuestionAPI(data) {
    try {
        return await http({
            url: '/uniappAPI/tools/wrongQuestion/updateWrongQuestion',
            method: 'POST',
            data: data
        });
    } catch (error) {
        console.error("updateWrongQuestion 失败", error);
        throw error;
    }
}
/**
 * @description 添加复习记录
 * @method POST
 * @param {Object} data - 复习记录数据
 * @param {String} data.questionId - 错题ID，必填
 * @param {Boolean} data.isCorrect - 本次复习是否正确，必填
 * @param {Number} data.timeSpent - 本次复习耗时（秒），可选
 * @returns {Promise} 返回添加复习记录的结果
 */
export async function addReviewRecordAPI({ questionId, isCorrect, timeSpent = 0 }) {
    try {
        return await http({
            url: '/uniappAPI/tools/wrongQuestion/addReviewRecord',
            method: 'POST',
            data: {
                questionId,
                isCorrect,
                timeSpent
            }
        });
    } catch (error) {
        console.error("addReviewRecord 失败", error);
        throw error;
    }
}

/**
 * @description 标记错题为已掌握
 * @method POST
 * @param {String} questionId - 错题ID，必填
 * @returns {Promise} 返回标记结果
 */
export async function markAsMasteredAPI(questionId) {
    try {
        return await http({
            url: '/uniappAPI/tools/wrongbook/markAsMastered',
            method: 'POST',
            data: { id: questionId }
        });
    } catch (error) {
        console.error("markAsMastered 失败", error);
        throw error;
    }
}

/**
 * @description 获取需要复习的错题列表
 * @method GET
 * @returns {Promise} 返回需要复习的错题列表
 */
export async function getNeedReviewQuestionsAPI() {
    try {
        return await http({
            url: '/uniappAPI/tools/wrongQuestion/getNeedReviewQuestions',
            method: 'GET'
        });
    } catch (error) {
        console.error("getNeedReviewQuestions 失败", error);
        throw error;
    }
}

/**
 * @description 更新错题笔记
 * @method POST
 * @param {Object} data - 笔记数据
 * @param {String} data.questionId - 错题ID，必填
 * @param {Object} data.note - 笔记对象 { text, images }，必填
 * @returns {Promise} 返回更新结果
 */
export async function updateWrongQuestionNoteAPI({ questionId, note }) {
    try {
        return await http({
            url: '/uniappAPI/tools/wrongQuestion/updateNote',
            method: 'POST',
            data: {
                id: questionId,
                note
            }
        });
    } catch (error) {
        console.error("updateWrongQuestionNote 失败", error);
        throw error;
    }
}

/**
 * @description 批量删除错题
 * @method POST
 * @param {Array} questionIds - 错题ID数组，必填
 * @returns {Promise} 返回批量删除结果
 */
export async function batchDeleteWrongQuestionsAPI(questionIds) {
    try {
        return await http({
            url: '/uniappAPI/tools/wrongQuestion/batchDelete',
            method: 'POST',
            data: { ids: questionIds }
        });
    } catch (error) {
        console.error("batchDeleteWrongQuestions 失败", error);
        throw error;
    }
}

/**
 * @description 获取错题统计信息
 * @method GET
 * @param {String} wrongBookId - 错题本ID，必填
 * @returns {Promise} 返回统计信息（总数、各状态数量、各题型数量等）
 */
export async function getWrongQuestionStatsAPI(wrongBookId) {
    try {
        return await http({
            url: `/uniappAPI/tools/wrongQuestion/getStats?wrongBookId=${wrongBookId}`,
            method: 'GET'
        });
    } catch (error) {
        console.error("getWrongQuestionStats 失败", error);
        throw error;
  }
}
