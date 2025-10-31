import axios from "axios";

export async function postAddQuestionTitle(data) {
    // 添加题目标题
    try {
        const response = await axios.post("/adminapi/questionTitle/addQuestionTitle", data);
        return response.data;
    }catch (error) {
        console.error("Error during add question title:", error);
    }
}

export async function getQuestionTitleList(params) {
    // 获取题目标题列表
    try {
        const response = await axios.get("/adminapi/questionTitle/getQuestionTitleList", {
            params:{
                page: params?.page || 1,
                size: params?.size || 20,
                // 保留其他可能的查询参数
                ...params
            }
        });
        return response.data;
    }catch (error) {
        console.error("Error during get question title list:", error);
    }
}

export async function UpdateQuestionTitleList(data) {
    // 更新题目标题信息
    try {
        const response = await axios.post("/adminapi/questionTitle/updateQuestionTitle", data);
        return response.data;
    }catch (error) {
        console.error("Error during update question title list:", error);
    }
}

/**
 * @description: 先检查该题型下是否还有题目，有则不能删除
 * @param {*} _id 
 * @param {*} examId 
 * @returns  {code: 200, data: {hasQuestion: true}} 有题目，不能删除
 */
export async function CheckQuestionTitle(_id, examId) {
    // 检查题目标题是否还有题目
    try {
        const response = await axios.post("/adminapi/questionTitle/checkQuestionTitle", {_id, examId});
        return response.data;
    }
    catch (error) {
        console.error("Error during check question title:", error);
    }
}

/**
 * @description: 删除单个题目标题
 * @param {*} _id 题目标题id
 * @param {*} examId 考试id
 * @returns {code: 200} 删除成功
 */

export async function DeleteOneQuestionTitle(_id, examId) {
    // 删除题目题型标题
    try {
        const response = await axios.post("/adminapi/questionTitle/deleteOneQuestionTitle", {_id, examId});
        return response.data;
    }catch (error) {
        console.error("Error during delete one question title:", error);
    }
}

export async function DeleteManyQuestionTitle(_ids, examId) {
    // 删除多个题目标题
    try {
        const response = await axios.post("/adminapi/questionTitle/deleteManyQuestionTitle", {_ids, examId});
        return response.data;
    }
    catch (error) {
        console.error("Error during delete many question title:", error);
    }
    
}

export async function UpdateQuestionTitleOneState({_id, examId, state}) {
    // 更新单个题目标题状态
    try {
        const response = await axios.post("/adminapi/questionTitle/updateQuestionOneTitleState", {_id, examId, state});
        return response.data;
    } catch (error) {
        console.error("Error during update question title one state:", error);
    }
}
