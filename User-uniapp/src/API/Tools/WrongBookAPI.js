import { http } from "../../util/http";
/**
 * @description 创建错题本
 * @param {Object} data - 创建错题本的数据对象
 * @param {string} data.title - 错题本名称，必填
 * @param {string} data.color - 错题本颜色，必填
 * @returns {Promise} 返回创建错题本的响应
 */
export async  function createWrongBookAPI({
    title,
    color
}){
    try {
        return await http({
            url: '/uniappAPI/tools/WrongBook/createWrongBook',
            method: 'POST',
            data: { title, color },
        });
    }catch (error) {
        console.error("createWrongBook 失败", error);
        throw error;
    }
}

/**
 * @description 获取错题本列表接口
 * @URL /uniappAPI/tools/wrongbook/getWrongBooks
 * @method GET
 */
export async function getWrongBooksAPI() {
    try {
        return await http({
            url: '/uniappAPI/tools/wrongbook/getWrongBooks',
            method: 'GET',
        });
    } catch (error) {
        console.error("getWrongBooks 失败", error);
        throw error;
    }
}