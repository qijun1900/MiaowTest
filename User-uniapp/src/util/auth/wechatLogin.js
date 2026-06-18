import { Userlogin, BindWechat } from "../../API/My/UserLoginAPI";
import { UserInfoStore } from "../../stores/modules/UserinfoStore";
import logSDK from "../log/sdk";

/**
 * 微信登录工具函数
 */
export const wechatLogin = async (options = {}) => {
  const { navigateToMy = true, onSuccess, onError } = options;

  try {
    const loginData = await new Promise((resolve, reject) => {
      uni.login({
        provider: "weixin",
        success: (data) => resolve(data),
        fail: (err) => reject(err),
      });
    });

    const response = await Userlogin(loginData.errMsg, loginData.code);

    if (response.code === 200) {
      uni.showToast(
        {
          title: "登录成功",
          icon: "success",
        },
        1000,
      );

      const userInfoStore = UserInfoStore();
      userInfoStore.setUserInfo(response.data.userInfo);
      uni.setStorageSync("token", response.data.token);

      logSDK.track("AUTH_LOGIN", {
        result: logSDK.results.SUCCESS,
        metadata: { method: "wechat" },
      });

      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(response);
      }

      if (navigateToMy) {
        uni.switchTab({
          url: "/pages/tab/my",
        });
      }

      return response;
    } else {
      const errorMessage = response.message || "登录失败，请重试";
      uni.showToast({
        title: errorMessage,
        icon: "none",
      });

      logSDK.track("AUTH_LOGIN", {
        result: logSDK.results.FAIL,
        errorCode: String(response.code || ""),
        errorMessage: errorMessage,
        metadata: { method: "wechat" },
      });

      if (onError && typeof onError === "function") {
        onError(response);
      }

      return response;
    }
  } catch (error) {
    console.error("微信登录失败", error);
    const errorMessage = "登录失败，请重试";
    uni.showToast({
      title: errorMessage,
      icon: "none",
    });

    logSDK.track("AUTH_LOGIN", {
      result: logSDK.results.FAIL,
      errorMessage: error?.message || errorMessage,
      metadata: { method: "wechat" },
    });

    if (onError && typeof onError === "function") {
      onError(error);
    }

    throw error;
  }
};

export default wechatLogin;

/**
 * 已登录态下绑定微信
 */
export const wechatBind = async (options = {}) => {
  const { onSuccess, onError } = options;

  try {
    const loginData = await new Promise((resolve, reject) => {
      uni.login({
        provider: "weixin",
        success: (data) => resolve(data),
        fail: (err) => reject(err),
      });
    });

    if (!loginData?.code) {
      throw new Error("未获取到微信登录凭证");
    }

    const response = await BindWechat(loginData.code);

    if (response.code === 200) {
      uni.showToast({ title: "微信绑定成功", icon: "success" });
      logSDK.track("AUTH_BIND_WECHAT", {
        result: logSDK.results.SUCCESS,
      });
      if (typeof onSuccess === "function") onSuccess(response);
      return response;
    }

    const errorMessage = response.message || "绑定失败，请重试";
    uni.showToast({ title: errorMessage, icon: "none", duration: 2500 });
    logSDK.track("AUTH_BIND_WECHAT", {
      result: logSDK.results.FAIL,
      errorCode: String(response.code || ""),
      errorMessage,
    });
    if (typeof onError === "function") onError(response);
    return response;
  } catch (error) {
    console.error("绑定微信失败", error);
    const errorMessage = error?.message || "绑定失败，请重试";
    uni.showToast({ title: errorMessage, icon: "none" });
    logSDK.track("AUTH_BIND_WECHAT", {
      result: logSDK.results.FAIL,
      errorMessage,
    });
    if (typeof onError === "function") onError(error);
    throw error;
  }
};
