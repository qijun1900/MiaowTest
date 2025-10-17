/**
 * 缓存工具类
 * 提供统一的缓存管理功能
 */
class CacheManager {
  constructor() {
    this.defaultExpiryTime = 30 * 60 * 1000; // 默认30分钟缓存过期时间
  }

  /**
   * 获取缓存数据
   * @param {string} key 缓存键
   * @param {number} expiryTime 过期时间（毫秒），可选
   * @returns {any} 缓存的数据或null
   */
  get(key, expiryTime = this.defaultExpiryTime) {
    try {
      const cacheStr = uni.getStorageSync(key);
      if (!cacheStr) return null;
      
      const cacheData = JSON.parse(cacheStr);
      const now = Date.now();
      
      // 检查缓存是否过期
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

  /**
   * 设置缓存数据
   * @param {string} key 缓存键
   * @param {any} data 要缓存的数据
   */
  set(key, data) {
    try {
      const cacheData = {
        data: data,// 缓存的数据
        timestamp: Date.now()// 记录缓存时间
      };
      uni.setStorageSync(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('设置缓存失败:', error);
    }
  }

  /**
   * 移除缓存数据
   * @param {string} key 缓存键
   */
  remove(key) {
    try {
      uni.removeStorageSync(key);
    } catch (error) {
      console.error('移除缓存失败:', error);
    }
  }

  /**
   * 清除所有缓存
   */
  clear() {
    try {
      uni.clearStorageSync();
    } catch (error) {
      console.error('清除缓存失败:', error);
    }
  }

  /**
   * 检查缓存是否存在且未过期
   * @param {string} key 缓存键
   * @param {number} expiryTime 过期时间（毫秒），可选
   * @returns {boolean} 是否存在有效缓存
   */
  has(key, expiryTime = this.defaultExpiryTime) {
    return this.get(key, expiryTime) !== null;
  }
}

// 导出单例实例
export const cacheManager = new CacheManager();

// 导出类（如果需要创建多个实例）
export default CacheManager;