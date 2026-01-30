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
 * @description 获取词书封面列表接口
 * @URL /uniappAPI/tools/vocabulary/getWordBookCovers
 * @method GET
 * @returns {
 *   code: number,
 *   data: {
 *     covers: Array
 *   }
 * }
 */
export async function getWordBookCoversAPI() {
    try {
        return await http({
            url: '/uniappAPI/tools/vocabulary/getWordBookCovers',
            method: 'GET',
        })
    } catch (error) {
        console.error("getWordBookCovers 失败", error);
    }
}

/**
  * @description 根据_id获取单词书列表
  * @URL /uniappAPI/tools/vocabulary/getWordBookList
  * @method POST
  * @param {string} bookId- 单词书_id
  * @param {number} page - 页码，默认1
  * @param {number} pageSize - 每页数量，默认20
  * @returns {
  *   code: number,
  *   data: {
  *     list: Array,
  *     total: number,
  *     page: number,
  *     pageSize: number,
  *     hasMore: boolean
  *   }
  * }
*/
export async function WordBookListAPI(bookId, page = 1, pageSize = 20) {
    try {
        return await http({
            url: '/uniappAPI/tools/vocabulary/getWordBookList',
            method: 'POST',
            data: {
                bookId: bookId,
                page,
                pageSize
            }
        })
    } catch (error) {
        console.error("getWordBookList 失败", error);
    }
}

/**
 * @description 用户创建单词书接口
 * @URL /uniappAPI/tools/vocabulary/createWordBook
 * @method POST
 * @param {string} title - 词书名称
 * @param {string} cover_id - 词书封面ID
 * @param {string} cover_url - 词书封面URL
 */
export async function createWordBookAPI({title, cover_id, cover_url}) {
    try {
        return await http({
            url: '/uniappAPI/tools/vocabulary/self/createWordBook',
            method: 'POST',
            data: {
                title: title,
                cover_id: cover_id,
                cover_url: cover_url,
            }
        })
    } catch (error) {
        console.error("createWordBook 失败", error);
    }
}


