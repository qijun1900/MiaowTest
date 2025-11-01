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
 * @param {number} params.size - 每页显示的消息数量，默认为10
 * @returns {Promise<Array>} 用户消息列表
 */
export async function getMessageList(params) {
    try {
        const response = await axios.get("/adminapi/consumermessage/getlist",{
             params:{
                page: params?.page || 1,
                size: params?.size || 10,
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

/**
 * 处理反馈
 * @param {String} _id 反馈ID
 * @param {Object}  handleForm - 处理表单数据
 * @param {Number} handleForm.state 处理状态，0-待处理 1-处理中 2-已处理
 * @param {String} handleForm.adminReply 管理员回复，可选
 * @returns {Promise<Object>} 处理结果
 */
export async function handleFeedback(_id, handleForm) {
    try {
        const response = await axios.post("/adminapi/consumermessage/handlefeedback", {
            _id,
            ...handleForm// 展开处理表单数据
        });
        return response.data;
    }catch (error) {
        console.error("Error fetching message list:", error); // 修正错误描述
        throw error;
    }
}

/**
 * @param {String} _id 反馈ID
 * @returns {Promise<Object>} 处理结果
 */
export async function deleteFeedback(_id) {
    try {
        const response = await axios.post("/adminapi/consumermessage/deletefeedback", {
            _id,
        });
        return response.data;
    }catch (error) {
        console.error("Error fetching message list:", error); // 修正错误描述
        throw error;
    }
}