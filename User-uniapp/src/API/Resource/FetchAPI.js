import { http } from '../../util/http.js';

/**
 * @description  向服务器获取资源列表
 * @param {string} tag 业务标签
 * @returns {Promise} 返回资源列表数据
 */
export async function getResourceList({ tag }) {
  try {
    return await http({
      url: `/uniappAPI/resource/user/getResourceList`,
      method: 'POST',
      data: { tag }
    });
  } catch (error) {
    console.error("getResourceList 失败", error);
    throw error;
  }
}