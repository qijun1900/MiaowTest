/**
 * 缓存工具类
 * 提供统一的缓存管理功能
 */
class CacheManager {
  constructor() {
    this.defaultExpiryTime = 30 * 60 * 1000; // 默认30分钟缓存过期时间
  }

  get(key, expiryTime = this.defaultExpiryTime) {
    try {
      const cacheStr = uni.getStorageSync(key);
      if (!cacheStr) return null;

      const cacheData = JSON.parse(cacheStr);
      const now = Date.now();

      if (now - cacheData.timestamp > expiryTime) {
        this.remove(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('读取缓存失败:', error);
      return null;
    }
  }

  set(key, data) {
    try {
      const cacheData = {
        data: data,
        timestamp: Date.now()
      };
      uni.setStorageSync(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('设置缓存失败:', error);
    }
  }

  remove(key) {
    try {
      uni.removeStorageSync(key);
    } catch (error) {
      console.error('移除缓存失败:', error);
    }
  }

  clear() {
    try {
      uni.clearStorageSync();
    } catch (error) {
      console.error('清除缓存失败:', error);
    }
  }

  has(key, expiryTime = this.defaultExpiryTime) {
    return this.get(key, expiryTime) !== null;
  }
}

export const cacheManager = new CacheManager();

export default CacheManager;
