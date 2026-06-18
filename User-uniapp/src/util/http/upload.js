import escconfig from "../../config/esc.config";
import { cloudRequest } from "./request";

function readFileAsBase64(filePath) {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager();
    fs.readFile({
      filePath: filePath,
      encoding: "base64",
      success: (res) => resolve(res.data),
      fail: (err) => reject(new Error("读取文件失败: " + (err.errMsg || err))),
    });
  });
}

function getFileExtension(filePath) {
  const parts = filePath.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "jpg";
}

function cloudUploadFile(filePath, cloudPath, onProgress) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error("请在微信小程序环境下使用云托管上传"));
      return;
    }
    const task = wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      config: { env: escconfig.cloudEnv },
      success: (res) => resolve(res.fileID),
      fail: (err) => {
        const info = err.toString();
        reject(
          new Error(
            info.indexOf("abort") !== -1 ? "文件上传已中断" : "文件上传失败",
          ),
        );
      },
    });
    if (onProgress && task) {
      task.onProgressUpdate((res) => {
        if (onProgress(res) === false) task.abort();
      });
    }
  });
}

export const httpUpload = (options) => {
  if (escconfig.useCloudContainer) {
    if (escconfig.useCloudStorage) {
      return cloudUploadFile(
        options.filePath,
        options.cloudPath,
        options.onProgress,
      ).then((fileID) => {
        return cloudRequest({
          url: options.url,
          method: "POST",
          data: {
            fileID: fileID,
            ...options.formData,
          },
        });
      });
    } else {
      const ext = getFileExtension(options.filePath);
      return readFileAsBase64(options.filePath).then((base64Data) => {
        return cloudRequest({
          url: options.url,
          method: "POST",
          data: {
            base64Data: base64Data,
            fileExt: ext,
            ...options.formData,
          },
        });
      });
    }
  } else {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: options.url,
        filePath: options.filePath,
        name: options.name || "file",
        fileType: "image",
        formData: options.formData,
        success: (uploadRes) => {
          try {
            const data = JSON.parse(uploadRes.data);
            resolve(data);
          } catch (e) {
            reject(new Error("解析响应失败"));
            console.error("上传响应解析失败:", e, "原始响应:", uploadRes.data);
          }
        },
        fail: (err) => {
          uni.showToast({
            title: "网络异常，请稍后重试",
            icon: "none",
            mask: true,
          });
          reject(err);
        },
      });
    });
  }
};
