import escconfig from "../../config/esc.config";

/**
 * 将微信云存储 cloud:// fileID 转换为可通过 HTTP 访问的 URL
 */
export function cloudFileToHttpUrl(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('cloud://')) {
    return url;
  }

  const withoutProtocol = url.slice('cloud://'.length);
  const firstSlash = withoutProtocol.indexOf('/');
  if (firstSlash === -1) return url;

  const hostPart = withoutProtocol.slice(0, firstSlash);
  const filePath = withoutProtocol.slice(firstSlash + 1);

  const dotIndex = hostPart.indexOf('.');
  if (dotIndex === -1) return url;

  const cosId = hostPart.slice(dotIndex + 1);

  return `https://${cosId}.tcb.qcloud.la/${filePath}`;
}

/**
 * 云托管 - 删除云对象存储文件
 */
export function deleteCloudFiles(fileList = []) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(fileList) || fileList.length === 0) {
      resolve({ fileList: [] });
      return;
    }
    if (!wx.cloud) {
      reject(new Error("请在微信小程序环境下使用云托管删除"));
      return;
    }
    wx.cloud.deleteFile({
      fileList,
      config: { env: escconfig.cloudEnv },
      success: (res) => {
        console.log("云存储文件删除成功:", res);
        resolve(res);
      },
      fail: (err) => {
        console.error("云存储文件删除失败:", err);
        reject(err);
      },
    });
  });
}
