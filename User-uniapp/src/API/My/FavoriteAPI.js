import { http } from '../../util/http.js';

/**
 * 收藏考试
 * @param {string} examId - 考试ID
 * @returns {Promise} 返回收藏操作结果
 */
export async function addExamFavorite(examId) {
    try {
        return await http({
            url: '/uniappAPI/UserFavorite/addExamFavorite',
            method: 'POST',
            data: { examId }
        });
    } catch (error) {
        console.error("addExamFavorite 失败", error);
        throw error;
    }
}

/**
 * 取消收藏考试
 * @param {string} examId - 考试ID
 * @returns {Promise} 返回取消收藏操作结果
 */
export async function removeExamFavorite(examId) {
    try {
        return await http({
            url: '/uniappAPI/UserFavorite/removeExamFavorite',
            method: 'POST',
            data: { examId }
        });
    } catch (error) {
        console.error("removeExamFavorite 失败", error);
        throw error;
    }
}

/**
 * 检测是否收藏了考试
 * @param {string} examId - 考试ID
 * @returns {Promise} 返回用户收藏的考试列表
 */
export async function getExamFavorites(examId) {
    try {
        return await http({
            url: '/uniappAPI/UserFavorite/getExamFavorites',
            method: 'POST',
           data: { examId }
        });
    } catch (error) {
        console.error("getExamFavorites 失败", error);
        throw error;
    }
}

/**
 * 获取用户收藏的考试列表
 * @returns {Promise} 返回用户收藏的考试列表
 */
export async function getUserFavorites() {
    try {
        return await http({
            url: '/uniappAPI/UserFavorite/getUserFavoritesExams',
            method: 'GET',
        });
    }catch (error) {
        console.error("getUserFavorites 失败", error);
        throw error;
    }
}

