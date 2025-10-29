import axios from "axios";

/**
 * 获取用户消息数量，用来显示在消息图标上
 * @returns {Promise<number>} 用户消息数量
 */
export async function getMessageCount() {
    try {
        const response = await axios.get("/adminapi/consumermessage/getcount"); 
        return response.data;
        
    }catch (error) {
        console.error("Error fetching message count:", error); // 修正错误描述
        throw error;
    }
}

/**
 * 获取用户消息列表
 * @param {Object} params - 查询参数，包括分页信息和其他筛选条件
 * @param {number} params.page - 当前页码，默认为1
 * @param {number} params.size - 每页显示的消息数量，默认为20
 * @returns {Promise<Array>} 用户消息列表
 */
export async function getMessageList(params) {
    try {
        const response = await axios.get("/adminapi/consumermessage/getlist",{
             params:{
                page: params?.page || 1,
                size: params?.size || 20,
                // 保留其他可能的查询参数
                ...params 
            }
        }); 
        return response.data;
    }catch (error) {
        console.error("Error fetching message list:", error); // 修正错误描述
        throw error;
    }
}
