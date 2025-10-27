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
