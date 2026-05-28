import { Userlogin, BindWechat } from "../API/My/UserLoginAPI";
import { UserInfoStore } from "../stores/modules/UserinfoStore";
import logSDK from "./logSDK";

/**
 * 微信登录工具函数
 * @param {Object} options - 配置选项
 * @param {boolean} options.navigateToMy - 登录成功后是否跳转到我的页面，默认为true
 * @param {Function} options.onSuccess - 登录成功后的回调函数
 * @param {Function} options.onError - 登录失败后的回调函数
 * @returns {Promise<Object>} 返回登录结果
 */
export const wechatLogin = async (options = {}) => {
  const { navigateToMy = true, onSuccess, onError } = options;

  try {
    // 将 uni.login 封装为 Promise, 以便使用 await
    const loginData = await new Promise((resolve, reject) => {
      uni.login({
        provider: "weixin",
        success: (data) => resolve(data),
        fail: (err) => reject(err),
      });
    });

    // 使用 await 等待 Userlogin 完成
    const response = await Userlogin(loginData.errMsg, loginData.code);

    if (response.code === 200) {
      // 登录成功
      uni.showToast(
        {
          title: "登录成功",
          icon: "success",
        },
        1000,
      );

      const userInfoStore = UserInfoStore();
      userInfoStore.setUserInfo(response.data.userInfo); // 存储用户信息
      uni.setStorageSync("token", response.data.token); // 存储 Token

      // 埋点：微信登录成功
      logSDK.track("AUTH_LOGIN", {
        result: logSDK.results.SUCCESS,
        metadata: { method: "wechat" },
      });

      // 执行成功回调
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(response);
      }

      // 跳转到我的页面
      if (navigateToMy) {
        uni.switchTab({
          url: "/pages/tab/my",
        });
      }

      return response;
    } else {
      // 处理登录失败情况
      const errorMessage = response.message || "登录失败，请重试";
      uni.showToast({
        title: errorMessage,
        icon: "none",
      });

      // 埋点：微信登录失败（服务端返回非 200）
      logSDK.track("AUTH_LOGIN", {
        result: logSDK.results.FAIL,
        errorCode: String(response.code || ""),
        errorMessage: errorMessage,
        metadata: { method: "wechat" },
      });

      // 执行错误回调
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

    // 埋点：微信登录异常（网络错误或 uni.login 失败）
    logSDK.track("AUTH_LOGIN", {
      result: logSDK.results.FAIL,
      errorMessage: error?.message || errorMessage,
      metadata: { method: "wechat" },
    });

    // 执行错误回调
    if (onError && typeof onError === "function") {
      onError(error);
    }

    throw error;
  }
};

export default wechatLogin;

/**
 * 已登录态下绑定微信：调 uni.login 拿 code → BindWechat → 提示结果
 * 当前账号始终保留，若 openid 已属于另一账号则后端会把对方数据合并过来。
 * 仅在支持微信原生登录的平台（mp-weixin / 集成微信SDK的App）调用。
 *
 * @param {{ onSuccess?: Function, onError?: Function }} options
 * @returns {Promise<Object>} 后端响应
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
