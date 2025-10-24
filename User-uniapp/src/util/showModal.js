/**
 * 封装 uni.showModal 为 Promise
 * @param {Object} options - uni.showModal 的配置选项
 * @returns {Promise<Object>} 返回一个 Promise，resolve 包含用户操作结果的对象
 */
const showModal = (options) => {
  return new Promise((resolve) => {
    uni.showModal({
      ...options,
      success: (res) => {
        resolve(res);
      },
      fail: () => {
        resolve({ confirm: false }); // 如果用户关闭模态框，返回确认为 false
      }
    });
  });
};

export default showModal;