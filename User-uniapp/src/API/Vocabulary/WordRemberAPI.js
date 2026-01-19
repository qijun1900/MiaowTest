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
 *   code: number,
 * }
 */
export async function setWordRember({
    currentBook_id,
    dailyGoal,
    currentBookTitle,
}) {
    try{
        console.log(currentBook_id, dailyGoal, currentBookTitle);
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