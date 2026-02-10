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

/**
 * @description 获取错题本详情
 * @param {string} id - 错题本ID
 * @returns {Promise}
 */
export async function getWrongBookDetailAPI(id) {
    try {
        return await http({
            url: `/uniappAPI/tools/wrongbook/getWrongBookDetail?id=${id}`,
            method: 'GET',
        });
    } catch (error) {
        console.error("getWrongBookDetail 失败", error);
        throw error;
    }
}

/**
 * @description 更新错题本
 * @param {Object} data
 * @param {string} data.id - 错题本ID
 * @param {string} data.title - 标题
 * @param {string} data.color - 颜色
 */
export async function updateWrongBookAPI({ id, title, color }) {
    try {
        return await http({
            url: '/uniappAPI/tools/WrongBook/updateWrongBook',
            method: 'POST',
            data: { id, title, color }
        });
    } catch (error) {
        console.error("updateWrongBook 失败", error);
        throw error;
    }
}

/**
 * @description 删除错题本
 * @param {string} id - 错题本ID
 */
export async function deleteWrongBookAPI(id) {
    try {
        return await http({
            url: '/uniappAPI/tools/WrongBook/deleteWrongBook',
            method: 'POST',
            data: { id }
        });
    } catch (error) {
        console.error("deleteWrongBook 失败", error);
        throw error;
    }
}
