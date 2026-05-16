import { http } from "../../util/http.js";

/**
 * 检查应用更新
 * @param {string} platform - 平台标识 (android/ios)
 * @param {number} currentVersionCode - 当前应用版本号
 * @returns {Promise<{hasUpdate: boolean, latestVersion?: object}>}
 */
export const checkAppUpdate = async (platform, currentVersionCode) => {
  try {
    return await http({
      url: "/uniappAPI/AppVersion/checkUpdate",
      method: "GET",
      data: { platform, currentVersionCode },
    });
  } catch (error) {
    console.error("checkAppUpdate failed:", error);
    throw error;
  }
};
