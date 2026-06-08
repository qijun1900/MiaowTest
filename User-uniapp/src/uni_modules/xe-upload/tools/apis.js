// eslint-disable
import { awaitWrap } from './tools';
/**
 * 从本地相册选择图片或使用相机拍照
 * @param {object} config 参数详情 => https://uniapp.dcloud.net.cn/api/media/image.html#chooseimage
 * @returns
 */
export const chooseImage = (config) => {
  return awaitWrap(
    new Promise((r, j) => {
      uni.chooseImage({
        ...config,
        success: (res) => {
          const tmpFiles = res?.tempFiles.map((e) => ({
            tempFilePath: e.path,
            tempFile: e,
            size: e.size,
            name: e.name,
            type: e.type,
            fileType: 'image',
          }));
          return r({ type: 'image', ...res, tempFiles: tmpFiles });
        },
        fail: (err) => j({ mode: 'chooseImage', data: err }),
      });
    })
  );
};

/**
 * 拍摄视频或从手机相册中选视频，返回视频的临时文件路径
 * @param {object} config 参数详情 => https://uniapp.dcloud.net.cn/api/media/video.html#choosevideo
 * @returns
 */
export const chooseVideo = (config) => {
  return awaitWrap(
    new Promise((r, j) => {
      uni.chooseVideo({
        ...config,
        success: (res) => {
          const tmpFiles = [{
            ...res,
            tempFilePath: res.tempFilePath,
            tempFile: res.tempFile ?? {},
            size: res.size,
            name: res.name,
            type: res.tempFile?.type,
            fileType: 'video',
          }];
          return r({ type: 'video', tempFiles: tmpFiles });
        },
        fail: (err) => j({ mode: 'chooseVideo', data: err }),
      });
    })
  );
};

/**
 * 拍摄或从手机相册中选择图片或视频
 * @param {object} config 参数详情 => https://uniapp.dcloud.net.cn/api/media/video.html#choosemedia
 * @returns
 */
export const chooseMedia = (type, config) => {
  if (!type) return console.error('chooseMedia type cannot be empty');
  if (!uni.chooseMedia && type === 'image') return chooseImage(config);
  if (!uni.chooseMedia && type === 'video') return chooseVideo(config);
  return awaitWrap(
    new Promise((r, j) => {
      uni.chooseMedia({
        ...config,
        mediaType: [type],
        success: (res) => r(res),
        fail: (err) => j({ mode: 'chooseMedia', data: err }),
      });
    })
  );
};

/**
 * 从本地选择文件(h5)
 * @param {object} config 参数详情 => https://uniapp.dcloud.net.cn/api/media/file.html#wx-choosemessagefile
 * @returns
 */
export const chooseFile = (config) => {
  return awaitWrap(
    new Promise((r, j) => {
      uni.chooseFile({
        ...config,
        success: (res) => {
          const tmpFiles = res?.tempFiles.map((e) => {
            let tmpType = 'file';
            if (e.type.includes('image')) {
              tmpType = 'image';
            }
            if (e.type.includes('video')) {
              tmpType = 'video';
            }
            return {
              tempFilePath: e.path,
              tempFile: e,
              size: e.size,
              name: e.name,
              type: e.type,
              fileType: tmpType,
            };
          });
          return r({ type: 'file', ...res, tempFiles: tmpFiles });
        },
        fail: (err) => j({ mode: 'chooseFile', data: err }),
      });
    })
  );
};

/**
 * 从本地选择文件(微信小程序)
 * @param {object} config 参数详情 => https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.chooseMessageFile.html
 * @returns
 */
export const chooseMessageFile = (config) => {
  return awaitWrap(
    new Promise((r, j) => {
      wx.chooseMessageFile({
        ...config,
        success: (res) => {
          const tmpFiles = res?.tempFiles.map((e) => ({
            ...e,
            tempFilePath: e.path,
            fileType: e.type ?? 'file',
          }));
          return r({ type: 'file', ...res, tempFiles: tmpFiles });
        },
        fail: (err) => j({ mode: 'chooseMessageFile', data: err }),
      });
    })
  );
};

/**
 * 上传
 * @param {object} config 参数详情 => https://uniapp.dcloud.net.cn/api/request/network-file.html#uploadfile
 * @param {object} exts 选择的文件的数据
 * @returns {object} exts + response
 */
export const uploadFile = (config, exts = {}) => {
  return new Promise((r, j) => {
    uni.uploadFile({
      ...config,
      success: (res) => r({ ...exts, response: JSON.parse(res.data) }),
      fail: (err) => j({ mode: 'uploadFile', data: err }),
    });
  });
};

export const appUploadFile = (config, exts = {}, onprogress) => {
  const { url, header, formData } = config;
  return new Promise((r, j) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    for (let key in header) {
      xhr.setRequestHeader(key, header[key]);
    }
    if (onprogress) {
      xhr.upload.onprogress = onprogress;
    }
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          r({ ...exts, response: JSON.parse(xhr.responseText) });
        } else {
          j({ mode: 'uploadFile', data: { data: xhr.responseText, errMsg: 'uploadFile fail.' } });
        }
      }
    }
    xhr.send(formData);
  });
};
