import { http } from "../../util/http";

/**
 * @description 用户设置词书和每日词数
 * @URL /uniappAPI/tools/vocabulary/setting/setWordRember
 * @method POST
 * @param {
 *   currentBook_id: string, // 单词书ID
 *   dailyGoal: number, // 每日学习目标（单词数量）
 *   currentBookTitle: string, // 单词书标题
 * }
 * @returns {
 *   code: number
 * }
 */
export async function setWordRember({
    currentBook_id,
    dailyGoal,
    currentBookTitle,
}) {
    try{
        return await http({
            url: '/uniappAPI/tools/vocabulary/setting/setWordRember',
            method: 'POST',
            data: {
                currentBook_id,
                dailyGoal,
                currentBookTitle,
            },
        })
    }catch(err){
        console.error('设置词书和每日词数失败:', err);
    }
}

/**
 * @description 检查用户是否设置了词书和每日词数，返回状态
 * @URL /uniappAPI/tools/vocabulary/check/getWordRember
 * @method GET
 * @returns {
 *   code: number,
 *   data: {
 *     currentBook_id: string, // 单词书ID
 *     dailyGoal: number, // 每日学习目标（单词数量）
 *      
 *   }
 *  isInit: boolean, // 是否初始化
 * }
 */
export async function checkWordRember() {
    try{
        return await http({
            url: '/uniappAPI/tools/vocabulary/check/getWordRember',
            method: 'GET',
        })
    }catch(err){
        console.error('检查词书和每日词数失败:', err);
    }
}