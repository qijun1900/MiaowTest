// 清除缓存工具函数

// 清除所有缓存（包括 题目信息、主观题、客观题、考试科目...）
// 但保留用户信息（token 和 userinfo）
export const clearExamCache = () => {
  try {
    // 获取所有缓存键
    const res = uni.getStorageInfoSync();
    const keys = res.keys || [];
    
    // 需要保留的用户信息键
    const userKeys = ['token', 'userinfo'];
    
    // 遍历所有键，清除除了用户信息之外的缓存
    keys.forEach(key => {
      if (!userKeys.includes(key)) {
        uni.removeStorageSync(key);
      }
    });
    return{
      isClear:true,
      message: "缓存清除成功"
    }
  } catch (error) {
    console.error('清理缓存时出错:', error);
  }
};

// 只清除用户信息的函数
export const clearUserInfo = () => {
  try {
    uni.removeStorageSync('token');
    uni.removeStorageSync('userinfo');
    return{
      isClear:true,
      message: "用户信息清除成功"
    }
  } catch (error) {
    console.error('清除用户信息时出错:', error);
  }
};