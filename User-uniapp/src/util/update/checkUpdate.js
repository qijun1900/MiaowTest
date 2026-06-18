import { checkAppUpdate } from "../../API/Application/UpdateAPI";
import { getPlatform } from "../http/platform";
import escconfig from "../../config/esc.config";
import { showProgress, showComplete, clear as clearNotification } from "../ui/notification";
import { showUpdateDialog } from "../ui/updateDialog";

function downloadAndInstall(versionId) {
  const base = escconfig.useTunnel
    ? escconfig.tunnelUrl
    : `http://${escconfig.serverHost}:${escconfig.serverPort}`;
  const url = `${base}/uniappAPI/AppVersion/download?id=${versionId}`;

  uni.showToast({ title: "开始下载更新包...", icon: "none", duration: 1500 });
  showProgress("正在下载更新包", 0);

  const downloadTask = uni.downloadFile({
    url,
    success: (res) => {
      if (res.statusCode === 200) {
        if (uni.getSystemInfoSync().platform === "ios") {
          clearNotification();
          plus.runtime.openURL(url);
        } else {
          showComplete("下载完成", "正在安装...");
          plus.runtime.install(
            res.tempFilePath,
            { force: true },
            () => {
              clearNotification();
              plus.runtime.restart();
            },
            (err) => {
              clearNotification();
              uni.showToast({ title: "安装失败: " + err.message, icon: "none", duration: 3000 });
            },
          );
        }
      } else {
        clearNotification();
        uni.showToast({ title: `下载失败(${res.statusCode})`, icon: "none" });
      }
    },
    fail: () => {
      clearNotification();
      uni.showToast({ title: "下载失败，请检查网络", icon: "none" });
    },
  });

  let lastNotifiedProgress = -1;
  downloadTask.onProgressUpdate((res) => {
    if (import.meta.env.DEV) console.log(`[checkUpdate] 下载进度: ${res.progress}%`);
    if (res.progress - lastNotifiedProgress >= 5 || res.progress === 100) {
      lastNotifiedProgress = res.progress;
      showProgress("正在下载更新包", res.progress);
    }
  });
}

export async function checkForUpdate({ silent = true } = {}) {
  if (getPlatform() !== "app") return false;

  try {
    const currentVersionCode = plus.runtime.versionCode;
    const currentVersionName = plus.runtime.version;
    const platform = uni.getSystemInfoSync().platform;

    const result = await checkAppUpdate(platform, currentVersionCode);
    if (!result || !result.data) return false;

    const { hasUpdate, latestVersion } = result.data;

    if (!hasUpdate) {
      if (!silent) uni.showToast({ title: "当前已是最新版本", icon: "none" });
      return false;
    }

    const isForce = latestVersion.forceUpdate;

    if (!isForce) {
      const skippedCode = uni.getStorageSync("skipUpdateVersionCode");
      if (skippedCode === currentVersionCode) return false;
    }

    const changelog = latestVersion.changelog || "发现新版本，建议立即更新";
    const content = `当前版本: v${currentVersionName}\n最新版本: v${latestVersion.versionName}\n\n更新内容:\n${changelog}`;

    const modalRes = await showUpdateDialog({
      title: "发现新版本",
      content,
      confirmText: "立即更新",
      showCancel: !isForce,
      cancelText: "稍后再说",
    });

    if (modalRes.confirm) {
      downloadAndInstall(latestVersion._id);
    } else if (!isForce) {
      uni.setStorageSync("skipUpdateVersionCode", currentVersionCode);
    }

    return true;
  } catch (error) {
    console.error("[checkUpdate] 检查更新异常:", error.message);
    if (!silent) uni.showToast({ title: "检查更新失败", icon: "none" });
    return false;
  }
}
