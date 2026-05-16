import { checkAppUpdate } from "../API/Application/UpdateAPI";
import showModal from "./showModal";
import { getPlatform } from "./http";
import escconfig from "../config/esc.config";

/**
 * 后台下载并安装更新包（不阻塞用户操作）
 * @param {string} versionId - 版本记录 ID
 */
function downloadAndInstall(versionId) {
  const base = escconfig.useTunnel
    ? escconfig.tunnelUrl
    : `http://${escconfig.serverHost}:${escconfig.serverPort}`;
  const url = `${base}/uniappAPI/AppVersion/download?id=${versionId}`;

  uni.showToast({ title: "开始下载更新包...", icon: "none", duration: 1500 });

  const downloadTask = uni.downloadFile({
    url,
    success: (res) => {
      if (res.statusCode === 200) {
        if (uni.getSystemInfoSync().platform === "ios") {
          plus.runtime.openURL(url);
        } else {
          plus.runtime.install(
            res.tempFilePath,
            { force: true },
            () => plus.runtime.restart(),
            (err) => uni.showToast({ title: "安装失败: " + err.message, icon: "none", duration: 3000 }),
          );
        }
      } else {
        uni.showToast({ title: `下载失败(${res.statusCode})`, icon: "none" });
      }
    },
    fail: () => {
      uni.showToast({ title: "下载失败，请检查网络", icon: "none" });
    },
  });

  downloadTask.onProgressUpdate((res) => {
    console.log("[checkUpdate] 下载进度:", res.progress + "%");
  });
}

/**
 * 检查应用更新（仅 App 平台生效）
 * @param {object} options
 * @param {boolean} options.silent - 静默模式（true=无更新时不弹提示）
 * @returns {Promise<boolean>} 是否有更新
 */
export async function checkForUpdate({ silent = true } = {}) {
  // 仅 App 平台检查更新
  if (getPlatform() !== "app") return false;

  try {
    const currentVersionCode = plus.runtime.versionCode;
    const currentVersionName = plus.runtime.version;
    const platform = uni.getSystemInfoSync().platform; // "android" 或 "ios"

    // 调用检查更新 API
    const result = await checkAppUpdate(platform, currentVersionCode);
    if (!result || !result.data) return false;

    const { hasUpdate, latestVersion } = result.data;

    // 无更新
    if (!hasUpdate) {
      if (!silent) {
        uni.showToast({ title: "当前已是最新版本", icon: "none" });
      }
      return false;
    }

    const isForce = latestVersion.forceUpdate;

    // 非强制更新：检查用户是否已跳过此版本
    if (!isForce) {
      const skippedCode = uni.getStorageSync("skipUpdateVersionCode");
      if (skippedCode === currentVersionCode) return false;
    }

    // 构建更新日志内容
    const changelog = latestVersion.changelog || "发现新版本，建议立即更新";
    const content = `当前版本: v${currentVersionName}\n最新版本: v${latestVersion.versionName}\n\n更新内容:\n${changelog}`;

    // 显示更新弹窗
    const modalRes = await showModal({
      title: "发现新版本",
      content,
      confirmText: "立即更新",
      showCancel: !isForce,
      cancelText: "稍后再说",
    });

    if (modalRes.confirm) {
      // 用户确认更新 → 后台下载安装
      downloadAndInstall(latestVersion._id);
    } else if (!isForce) {
      // 用户跳过可选更新 → 记录跳过状态
      uni.setStorageSync("skipUpdateVersionCode", currentVersionCode);
    }

    return true;
  } catch (error) {
    // 静默模式下不提示错误，避免阻塞启动
    if (!silent) {
      uni.showToast({ title: "检查更新失败", icon: "none" });
    }
    console.error("checkForUpdate error:", error);
    return false;
  }
}
