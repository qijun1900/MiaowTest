import axios from "axios";
/**
 * 获取客户端用户信息列表
 * @param {*} params 分页参数
 * @param {*} params.page 当前页码，默认为1
 * @param {*} params.size 每页显示的数量，默认为10
 * @returns {Promise<Array>} 用户信息列表
 */
export async function getConsumerList(params) {
    try {
        const response = await axios.get('/adminapi/consumer/getlist', { 
            params:{
                page: params?.page || 1,
                size: params?.size || 10,
                ...params 
            }
        });
        return response.data;

    }catch(error) {
        console.error('获取客户端用户信息列表失败:', error);
        throw error;
    }
}
/**
 * @description: 获取全部考试认证列表 
 * @param {*} uid 用户ID
 */
export async function GetAuthExamListAPI({uid}) {
    try {
        const response = await axios.post("/adminapi/exam/getAuthExamList", { 
            uid 
        });
        return response.data;
    }catch (error) {
        console.error("Error during get auth exam list:", error);
    }
    
}

/**
 * @description: 为用户添加认证考试
 * @param {*} uid 用户ID
 * @param {*} examId 考试ID
 */
export async function updateExamAuthStatusAPI({uid,examId}) {
    try {
        const response = await axios.post("/adminapi/exam/updateExamAuth", {
            uid,
            examId
        });
        return response.data;
        
    }catch (error) {
        console.error("Error during add auth exam:", error);
    }
}