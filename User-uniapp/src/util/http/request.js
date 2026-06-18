import escconfig from "../../config/esc.config";
import { UserInfoStore } from "../../stores/modules/UserinfoStore";
import logSDK from "../log/sdk";
import "./interceptor";
import {
  callCloudContainer,
  ensureCloudReadyWithPrompt,
  getCloudErrorMessage,
  getResponseErrorMessage,
  isCloudWakeupRelatedError,
  isCloudWakeupRelatedResponse,
  isWechatCloudRuntime,
} from "./cloud";

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
  uni.switchTab({ url: "/pages/tab/my" });
  reject("登录过期，请重新登录", responsePayload);
}

export function cloudRequest(options) {
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
    return cloudRequest(options);
  } else {
    return new Promise((resolve, reject) => {
      uni.request({
        ...options,
        success(res) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else if (res.statusCode === 401) {
            logSDK.track("AUTH_TOKEN_REFRESH", {
              result: logSDK.results.FAIL,
              errorCode: "401",
              errorMessage: "登录过期，请重新登录",
              metadata: { trigger: "uni_http_401", path: options.url },
            });
            uni.removeStorageSync("token");
            const userInfoStore = UserInfoStore();
            userInfoStore.clearUserInfo();
            uni.switchTab({ url: "/pages/tab/my" });
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
