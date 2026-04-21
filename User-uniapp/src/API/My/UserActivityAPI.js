import { http } from "../../util/http.js";

/**
 * 获取用户活动热力图聚合数据。
 * @param {Object} params - 查询参数
 * @param {number} params.months - 最近几个月，默认12
 * @returns {Promise<Object>} 热力图数据
 */
export async function getUserActivityHeatmap(params = {}) {
  try {
    return await http({
      url: "/uniappAPI/Activity/getActivityHeatmap",
      method: "GET",
      data: {
        months: params.months || 12,
      },
    });
  } catch (error) {
    console.error("getUserActivityHeatmap 失败", error);
    throw error;
  }
}

/**
 * 获取指定日期活动详情。
 * @param {string} date - 日期（YYYY-MM-DD）
 * @returns {Promise<Object>} 日期活动详情
 */
export async function getUserActivityByDate(date) {
  try {
    return await http({
      url: "/uniappAPI/Activity/getActivityByDate",
      method: "GET",
      data: { date },
    });
  } catch (error) {
    console.error("getUserActivityByDate 失败", error);
    throw error;
  }
}

/**
 * 手动添加用户活动。
 * @param {Object} payload - 活动内容
 * @returns {Promise<Object>} 写入结果
 */
export async function addUserActivity(payload = {}) {
  try {
    return await http({
      url: "/uniappAPI/Activity/addUserActivity",
      method: "POST",
      data: payload,
    });
  } catch (error) {
    console.error("addUserActivity 失败", error);
    throw error;
  }
}
