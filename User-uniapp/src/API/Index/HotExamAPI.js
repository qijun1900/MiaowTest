import { http } from '../../util/http.js';

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