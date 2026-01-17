import axios from "axios";
import upload from "@/util/upload";

/**
 * 获取词书列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @returns {Promise} 词书列表数据
 */
export async function getWordBooksList(params) {
    try {
        const response = await axios.get("/adminapi/wordbooks/list", {
            params: {
                page: params?.page || 1,
                size: params?.size || 10,
                ...params
            }
        });
        if (response.data.code === 200) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error("Error during get wordbooks list:", error);
        throw error;
    }
}

/**
 * 删除单个词书
 * @param {string} _id - 词书ID
 * @returns {Promise} 删除结果
 */
export async function deleteOneWordBook(_id) {
    try {
        const response = await axios.post("/adminapi/wordbooks/deleteOne", { _id });
        if (response.data.code === 200) {
            return response.data;
        }
    } catch (error) {
        console.error("Error during delete one wordbook:", error);
        throw error;
    }
}

/**
 * 批量删除词书
 * @param {Array} _ids - 词书ID数组
 * @returns {Promise} 删除结果
 */
export async function deleteManyWordBooks(_ids) {
    try {
        const response = await axios.post("/adminapi/wordbooks/deleteMany", { _ids });
        if (response.data.code === 200) {
            return response.data;
        }
    } catch (error) {
        console.error("Error during delete many wordbooks:", error);
        throw error;
    }
}

/**
 * 更新词书信息
 * @param {Object} data - 词书数据
 * @returns {Promise} 更新结果
 */
export async function updateWordBook(data) {
    try {
        const response = await upload("/adminapi/wordbooks/update", data);
        return response;
    } catch (error) {
        console.error("Error during update wordbook:", error);
        throw error;
    }
}
