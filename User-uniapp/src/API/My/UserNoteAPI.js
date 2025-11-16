import { http } from "../../util/http";

/**
 * @description 获取用户笔记科目及其数量结果
 * @returns {Promise} 结果
 */
export async function  getNoteExamListAPI() {
	try {
		return await http({
			url: '/uniappAPI/UserNote/getNoteExamList',
			method: 'GET',
		});
	}catch (error) {
		console.error("getNoteExamListAPI 失败", error);
		throw error;
	}
}

/**
 * @description 根据科目id获取用户笔记列表
 * @param {string} examId - 科目id
 * @returns {Promise} 结果
 */
export async function  getNoteListByExamIdAPI(examId) {
	try {
		return await http({
			url: '/uniappAPI/UserNote/getNoteListByExamId',
			method: 'POST',
			data: { examId }
		});
	}catch (error) {
		console.error("getNoteListByExamIdAPI 失败", error);
	}
}
