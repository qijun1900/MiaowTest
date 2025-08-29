import { http } from '../../util/http.js';

/**
 * 获取热门考试列表
 * @returns {Promise} 返回热门考试数据
 */
export async function getHotExamList() {
    try{
        return await http({
            url: '/uniappAPI/IndexHotExam/getHotExamList',
            method: 'GET',
        });
    }catch(error){
        console.error("getHotExamList 失败", error);
        throw error; 
    }
}