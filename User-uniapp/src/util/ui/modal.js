/**
 * 封装 uni.showModal 为 Promise
 */
const showModal = (options) => {
  return new Promise((resolve) => {
    uni.showModal({
      ...options,
      success: (res) => {
        resolve(res);
      },
      fail: () => {
        resolve({ confirm: false });
      }
    });
  });
};

export default showModal;
