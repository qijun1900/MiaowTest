import { http } from "../../util/http";

/**
 * @description 获取单词书列表接口
 * @URL /uniappAPI/tools/vocabulary/getWordBooks
 * @method GET
 * @returns {
 *   code: number,
 *   data: {
 *     wordbooks: Array,
 *     total: number,
 *   }
 * }
 */
export async function getWordBooksAPI() {
    try {
        return  await http({
            url: '/uniappAPI/tools/vocabulary/getWordBooks',
            method: 'GET',
        })
    }catch (error) {
        console.error("getWordBooks 失败", error);
    }
}
/**
 * @description 根据_id获取单词书详情
 * @URL /uniappAPI/tools/vocabulary/getWordBookDetail
 * @method GET
 * @param {string} _id - 单词书_id
 * @returns {
 *   code: number,
 *   data: {
 *   }
 * }
 */