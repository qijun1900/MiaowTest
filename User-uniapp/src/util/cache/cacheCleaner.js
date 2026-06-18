// 清除缓存工具函数

export const clearExamCache = () => {
  try {
    const res = uni.getStorageInfoSync();
    const keys = res.keys || [];

    const userKeys = ['token', 'userinfo'];

    keys.forEach(key => {
      if (!userKeys.includes(key)) {
        uni.removeStorageSync(key);
      }
    });
    return {
      isClear: true,
      message: "缓存清除成功"
    };
  } catch (error) {
    console.error('清理缓存时出错:', error);
  }
};

export const clearUserInfo = () => {
  try {
    uni.removeStorageSync('token');
    uni.removeStorageSync('userinfo');
    return {
      isClear: true,
      message: "用户信息清除成功"
    };
  } catch (error) {
    console.error('清除用户信息时出错:', error);
  }
};
