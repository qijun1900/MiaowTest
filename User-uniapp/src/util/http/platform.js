// 检测当前运行环境
export const getPlatform = () => {
  try {
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

    if (typeof plus !== "undefined") {
      return "app";
    }

    return "miniapp";
  } catch (e) {
    console.error("获取系统信息失败:", e);
    if (typeof plus !== "undefined") {
      return "app";
    }
    return "miniapp";
  }
};

export const getClientHeader = () => {
  const platform = getPlatform();
  return platform === "h5" ? "web" : platform === "app" ? "app" : "miniapp";
};
