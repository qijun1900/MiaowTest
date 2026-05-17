import axios from "axios";

/**
 * 文件上传工具
 * @param {string} path - 上传路径
 * @param {object} userForm - 表单数据
 * @param {object} options - 配置选项
 * @param {function} options.onUploadProgress - 上传进度回调
 * @returns {Promise}
 */
function upload(path, userForm, options = {}) {
  const params = new FormData();
  for (let i in userForm) {
    params.append(i, userForm[i]);
  }
  return axios
    .post(path, params, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: options.onUploadProgress,
    })
    .then((res) => res.data);
}
export default upload;
