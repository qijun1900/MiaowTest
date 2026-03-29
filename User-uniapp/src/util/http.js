import escconfig from "../config/esc.config";
import { UserInfoStore } from "../stores/modules/UserinfoStore";
import logSDK from "./logSDK";
import showModal from "./showModal";
const baseURl = escconfig.useTunnel
  ? escconfig.tunnelUrl
  : `http://${escconfig.serverHost}:${escconfig.serverPort}`;

const CLOUD_READY_CHECK_PATH = "/health";
const CLOUD_READY_CHECK_INTERVAL = 2000;
const CLOUD_READY_CHECK_TIMEOUT = 45000;

let cloudWakeupPromise = null;

// 统一的HTTP请求封装
// 适用于uni-app的http请求封装，支持小程序和H5平台和APP
// 支持拦截器，支持Promise化
// 支持自动添加baseURL，支持自动添加token，支持自动添加客户端标识，支持自动添加平台标识
// 支持自动处理错误，支持自动处理超时，支持自动处理网络错误，支持自动处理401错误
//支持小程序云托管
//自动检测运行环境，支持H5和小程序和APP，自动添加客户端和平台标识

// 检测当前运行环境
const getPlatform = () => {
  try {
    // 使用 uni.getAppBaseInfo 替代 uni.getSystemInfoSync
    const appBaseInfo = uni.getAppBaseInfo();
    const uniPlatform = appBaseInfo.uniPlatform;

    if (uniPlatform === "web") {
      return "h5";
    } else if (uniPlatform === "mp-weixin") {
      return "miniapp";
    } else if (
      uniPlatform === "app" ||
      uniPlatform === "app-plus" ||
      uniPlatform === "app-android" ||
      uniPlatform === "app-ios"
    ) {
      return "app";
    }

    // 兜底：App 端通常存在 plus 对象
    if (typeof plus !== "undefined") {
      return "app";
    }

    // 默认按小程序处理
    return "miniapp";
  } catch (e) {
    // 如果获取系统信息失败，优先按 App 端兜底
    console.error("获取系统信息失败:", e);
    if (typeof plus !== "undefined") {
      return "app";
    }
    return "miniapp";
  }
};

//添加拦截器
const httpInterceptor = {
  invoke(options) {
    //非http开头的，添加baseURL
    if (!options.url.startsWith("http")) {
      options.url = baseURl + options.url;
    }
    //超时设置，默认40s
    options.timeout = 40000;

    //根据平台添加不同的客户端标识
    const platform = getPlatform(); //获取平台 h5/miniapp/app
    const clientHeader =
      platform === "h5" ? "web" : platform === "app" ? "app" : "miniapp";

    options.header = {
      ...options.header,
      "source-client": clientHeader, //客户端来源 web/miniapp/app
      platform: platform, //平台 h5/miniapp/app
    };
    //添加token
    const token = uni.getStorageSync("token"); //从本地获取token
    if (token) {
      options.header = {
        ...options.header,
        Authorization: `Bearer ${token}`,
      };
    }
  },
};
uni.addInterceptor("request", httpInterceptor);
uni.addInterceptor("uploadFile", httpInterceptor);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCloudErrorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  return String(error.message || error.errMsg || "");
}

function getResponseErrorMessage(data) {
  if (!data || typeof data !== "object") return "";
  return String(data.message || data.msg || "");
}

function isCloudWakeupRelatedStatus(statusCode) {
  return [502, 503, 504].includes(Number(statusCode));
}

function isCloudWakeupRelatedResponse(response) {
  if (!response) return false;
  if (isCloudWakeupRelatedStatus(response.statusCode)) return true;

  const message = getResponseErrorMessage(response.data).toLowerCase();
  if (!message) return false;

  return /(upstream|bad gateway|service unavailable|timeout|timed out|cold|starting)/.test(
    message,
  );
}

function isCloudWakeupRelatedError(error) {
  const message = getCloudErrorMessage(error).toLowerCase();
  if (!message) return false;

  return /(timeout|timed out|econnreset|bad gateway|service unavailable|upstream|502|503|504|connect|disconnect|reset)/.test(
    message,
  );
}

function isWechatCloudRuntime() {
  return (
    escconfig.useCloudContainer &&
    typeof wx !== "undefined" &&
    !!wx.cloud &&
    getPlatform() === "miniapp"
  );
}

function buildCloudHeaders(customHeader = {}) {
  const platform = getPlatform();
  const clientHeader =
    platform === "h5" ? "web" : platform === "app" ? "app" : "miniapp";

  const headers = {
    ...customHeader,
    "source-client": clientHeader,
    platform: platform,
  };

  const token = uni.getStorageSync("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return {
    "X-WX-SERVICE": escconfig.cloudService,
    ...headers,
  };
}

function callCloudContainer(options) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error("请在微信小程序环境下使用云托管API"));
      return;
    }

    wx.cloud.callContainer({
      config: {
        env: escconfig.cloudEnv,
      },
      path: options.url,// 注意：path应该使用原始URL，而不是处理后的URL
      header: buildCloudHeaders(options.header),
      method: options.method || "GET",
      data: options.data || {},
      timeout: options.timeout || 15000,
      success: (res) => resolve(res),
      fail: (err) => reject(err),
    });
  });
}

async function probeCloudReady() {
  try {
    const res = await callCloudContainer({
      url: CLOUD_READY_CHECK_PATH,
      method: "GET",
      timeout: 5000,
      header: {
        "x-cloud-probe": "1",
      },
    });

    return (
      res.statusCode >= 200 &&
      res.statusCode < 300 &&
      (res?.data?.status === "ok" || res?.data?.database === "connected")
    );
  } catch {
    return false;
  }
}

async function waitForCloudReady() {
  const deadline = Date.now() + CLOUD_READY_CHECK_TIMEOUT;
  while (Date.now() < deadline) {
    const ready = await probeCloudReady();
    if (ready) return;
    await sleep(CLOUD_READY_CHECK_INTERVAL);
  }

  const timeoutError = new Error("服务启动时间较长，请稍后再试");
  timeoutError.code = "CLOUD_WAKEUP_TIMEOUT";
  throw timeoutError;
}

function ensureCloudReadyWithPrompt() {
  if (cloudWakeupPromise) {
    return cloudWakeupPromise;
  }

  cloudWakeupPromise = (async () => {
    const modalRes = await showModal({
      title: "服务启动中",
      content:
        "当前云托管服务正在自动启动，预计需要 30~60 秒。是否等待服务恢复后自动重试？",
      confirmText: "等待恢复",
      cancelText: "稍后再试",
      showCancel: true,
    });

    if (!modalRes?.confirm) {
      const cancelError = new Error("已取消等待服务启动");
      cancelError.code = "CLOUD_WAKEUP_CANCEL";
      throw cancelError;
    }

    await waitForCloudReady();
    uni.showToast({
      title: "服务已恢复，正在重试",
      icon: "none",
      mask: true,
    });
  })().finally(() => {
    cloudWakeupPromise = null;
  });

  return cloudWakeupPromise;
}

function handle401(options, reject, responsePayload) {
  logSDK.track("AUTH_TOKEN_REFRESH", {
    result: logSDK.results.FAIL,
    errorCode: "401",
    errorMessage: "登录过期，请重新登录",
    metadata: { trigger: "cloud_http_401", path: options.url },
  });
  uni.removeStorageSync("token");
  const userInfoStore = UserInfoStore();
  userInfoStore.clearUserInfo();
  uni.navigateTo({ url: "/pages/my/my" });
  reject("登录过期，请重新登录", responsePayload);
}

// 云托管请求封装
function cloudRequest(options) {
  const requestOptions = { ...options };
  const hasWakeupRetry = Boolean(requestOptions.__cloudWakeupRetried);
  delete requestOptions.__cloudWakeupRetried;

  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error("请在微信小程序环境下使用云托管API"));
      return;
    }

    callCloudContainer(requestOptions)
      .then(async (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }

        if (res.statusCode === 401) {
          handle401(requestOptions, reject, res);
          return;
        }

        if (
          isWechatCloudRuntime() &&
          !hasWakeupRetry &&
          isCloudWakeupRelatedResponse(res)
        ) {
          try {
            await ensureCloudReadyWithPrompt();
            const retryData = await cloudRequest({
              ...requestOptions,
              __cloudWakeupRetried: true,
            });
            resolve(retryData);
          } catch (error) {
            if (
              error?.code === "CLOUD_WAKEUP_TIMEOUT" ||
              error?.code === "CLOUD_WAKEUP_CANCEL"
            ) {
              uni.showToast({
                title: getCloudErrorMessage(error) || "服务启动中，请稍后重试",
                icon: "none",
                mask: true,
              });
            }
            reject(error);
          }
          return;
        }

        uni.showToast({
          title: getResponseErrorMessage(res.data) || "请求错误",
          icon: "none",
          mask: true,
        });
        reject(res);
      })
      .catch(async (err) => {
        if (
          isWechatCloudRuntime() &&
          !hasWakeupRetry &&
          isCloudWakeupRelatedError(err)
        ) {
          try {
            await ensureCloudReadyWithPrompt();
            const retryData = await cloudRequest({
              ...requestOptions,
              __cloudWakeupRetried: true,
            });
            resolve(retryData);
          } catch (error) {
            if (
              error?.code === "CLOUD_WAKEUP_TIMEOUT" ||
              error?.code === "CLOUD_WAKEUP_CANCEL"
            ) {
              uni.showToast({
                title: getCloudErrorMessage(error) || "服务启动中，请稍后重试",
                icon: "none",
                mask: true,
              });
            }
            reject(error);
          }
          return;
        }

        uni.showToast({
          title: "网络异常，请稍后重试",
          icon: "none",
          mask: true,
        });
        reject(err);
      });
  });
}

export const http = (options) => {
  if (escconfig.useCloudContainer) {
    // 云托管请求
    return cloudRequest(options);
  } else {
    // 本地/隧道请求
    return new Promise((resolve, reject) => {
      uni.request({
        ...options,
        success(res) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else if (res.statusCode === 401) {
            // 埋点：token 过期导致被动登出
            logSDK.track("AUTH_TOKEN_REFRESH", {
              result: logSDK.results.FAIL,
              errorCode: "401",
              errorMessage: "登录过期，请重新登录",
              metadata: { trigger: "uni_http_401", path: options.url },
            });
            uni.removeStorageSync("token");
            const userInfoStore = UserInfoStore();
            userInfoStore.clearUserInfo();
            uni.navigateTo({ url: "/pages/my/my" });
            reject("登录过期，请重新登录", res);
          } else {
            uni.showToast({
              title: res.data.message || "请求错误",
              icon: "none",
              mask: true,
            });
            reject(res);
          }
        },
        fail(err) {
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

/**
 * 读取本地文件为 base64（仅小程序环境）
 */
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

/**
 * 从文件路径提取扩展名
 */
function getFileExtension(filePath) {
  const parts = filePath.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "jpg";
}

/**
 * 云托管 - 云对象存储上传
 * 使用 wx.cloud.uploadFile 上传文件到云托管对象存储
 */
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

/**
 * 统一的文件上传方法
 * 云托管模式下支持两种上传方式（由 useCloudStorage 配置控制）：
 *   1. 云托管云对象存储（useCloudStorage=true）：wx.cloud.uploadFile 上传到云存储，再 callContainer 通知后端记录 fileID
 *   2. base64 中转 OSS（useCloudStorage=false）：读取文件为 base64，通过 callContainer 发给后端，后端上传到 OSS（大小不能超过 100KB）
 * 普通模式：使用 uni.uploadFile 直接上传到后端
 * @param {object} options - 上传选项
 * @param {string} options.filePath - 本地文件路径
 * @param {string} options.url - 后端接口路径
 * @param {string} options.name - 文件字段名，默认 'file'
 * @param {string} options.cloudPath - 云存储路径（云对象存储模式下使用）
 * @param {object} options.formData - 额外的表单数据（可选）
 * @param {function} options.onProgress - 上传进度回调（云对象存储模式可用）
 * @returns {Promise<object>} 返回后端响应数据
 */
export const httpUpload = (options) => {
  if (escconfig.useCloudContainer) {
    if (escconfig.useCloudStorage) {
      // 方式1：云对象存储 — 先上传到云存储，再通知后端记录 fileID
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
      // 方式2：base64 中转 OSS — 读取文件为 base64，通过 callContainer 发给后端上传到 OSS
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
    // 普通模式：直接使用 uni.uploadFile
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

/**
 * 云托管 - 删除云对象存储文件
 *
 * 使用场景：
 * 1. 删除题目时，自动删除题目中的所有云存储图片
 * 2. 编辑题目时，删除被移除的图片
 *
 * 工作流程：
 * 1. 后端删除题目时，返回需要删除的云存储 fileID 列表
 * 2. 前端收到响应后，调用此方法删除云存储文件
 * 3. 云存储文件必须在小程序端删除（需要 wx.cloud API）
 *
 * @param {string[]} fileList - 需要删除的 fileID 列表（cloud:// 格式）
 * @returns {Promise<object>} 微信云返回结果
 *
 * @example
 * // 删除单个文件
 * deleteCloudFiles(['cloud://xxx.jpg'])
 *
 * // 删除多个文件
 * deleteCloudFiles(['cloud://xxx.jpg', 'cloud://yyy.png'])
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
