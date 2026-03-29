import { Userlogin } from "../API/My/UserLoginAPI";
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
          url: "/pages/my/my",
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
