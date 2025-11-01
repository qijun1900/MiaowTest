import axios from "axios";
/**
 * 获取客户端用户信息列表
 * @param {*} params 分页参数
 * @param {*} params.page 当前页码，默认为1
 * @param {*} params.pageSize 每页显示的数量，默认为10
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