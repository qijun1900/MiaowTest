import { http } from '../../util/http.js';
/**
 * 获取公告详情
 * @returns {Promise} 返回公告详情数据
 */
export async function getNoticeInfo() {
    try{
        return await http({
            url: '/uniappAPI/Notice/getNoticeInfo',
            method: 'GET',
        });
    }catch(error){
        console.error("getNoticeInfo 失败", error);
        throw error; 
    }
}

export async function getIndexBanner(){
    try{
        return await http({
            url: '/uniappAPI/Banner/getIndexBanner',
            method: 'GET',
        })
    }catch(error){
        console.error("getBanner 失败", error);
        throw error; 
    }

}

