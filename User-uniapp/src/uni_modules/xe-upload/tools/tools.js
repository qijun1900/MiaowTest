// eslint-disable
export const isObject = (obj) => {
  return obj
    ? Object.prototype.toString.call(obj) === "[object Object]"
    : false;
};
export const isArray = (arr) => {
  return arr ? Array.isArray(arr) : false;
};
/**
 * handle async await
 * @param {*} promise promise
 */
export const awaitWrap = (promise) =>
  promise.then((res) => [null, res]).catch((err) => [err, {}]);
/**
 * 深拷贝
 * @param {*} source
 */
export const deepClone = (source) => {
  if (!isObject(source) && !isArray(source)) return source;
  const targetObj = isArray(source) ? [] : {}; // 判断复制的目标是数组还是对象
  for (let keys in source) {
    // 遍历目标
    if (source.hasOwnProperty(keys)) {
      if (source[keys] && typeof source[keys] === "object") {
        // 如果值是对象，就递归一下
        targetObj[keys] = isArray(source[keys]) ? [] : {};
        targetObj[keys] = deepClone(source[keys]);
      } else {
        // 如果不是，就直接赋值
        targetObj[keys] = source[keys];
      }
    }
  }
  return targetObj;
};
/**
 * @description JS对象深度合并
 * @param {object} target 需要拷贝的对象
 * @param {object} source 拷贝的来源对象
 * @returns {object|boolean} 深度合并后的对象或者false（入参有不是对象）
 */
export const deepMerge = (target = {}, source = {}) => {
  target = deepClone(target);
  if (typeof target !== "object" || typeof source !== "object") return false;
  for (const prop in source) {
    if (!source.hasOwnProperty(prop)) continue;
    if (prop in target) {
      if (typeof target[prop] !== "object") {
        target[prop] = source[prop];
      } else if (typeof source[prop] !== "object") {
        target[prop] = source[prop];
      } else if (target[prop].concat && source[prop].concat) {
        target[prop] = target[prop].concat(source[prop]);
      } else {
        target[prop] = deepMerge(target[prop], source[prop]);
      }
    } else {
      target[prop] = source[prop];
    }
  }
  return target;
};
/**
 * 将File对象转为 Blob Url
 * @param {File} File对象
 * @returns Blob Url
 */
export const fileToBlob = (file) => {
  if (!file) return;
  const fileType = file.type;
  const blob = new Blob([file], { type: fileType || 'application/*' });
  const blobUrl = window.URL.createObjectURL(blob);
  return blobUrl;
};
/**
 * 将File对象转为 base64
 * @param {File} File对象
 * @returns base64
 */
export const fileToBase64 = (file) => {
  if (!file) return;
  return new Promise((r, j) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      r(base64String);
    };
    reader.onerror = () => {
      j({ mode: 'fileToBase64', data: { errMsg: 'File to base64 fail.' } });
    };
    reader.readAsDataURL(file);
  });
};
/**
 * base64转临时路径(改自https://github.com/zhetengbiji/image-tools/blob/master/index.js)
 * @param base64
 * @returns
 */
function dataUrlToBase64(str) {
  var array = str.split(',');
  return array[array.length - 1];
};
function biggerThan(v1, v2) {
  var v1Array = v1.split('.');
  var v2Array = v2.split('.');
  var update = false;
  for (var index = 0; index < v2Array.length; index++) {
    var diff = v1Array[index] - v2Array[index];
    if (diff !== 0) {
      update = diff > 0;
      break;
    }
  }
  return update;
};
var index = 0;
function getNewFileId() {
  return Date.now() + String(index++);
};
export const base64ToPath = (base64, name = '') => {
  return new Promise((r, j) => {
    if (typeof plus !== 'object') {
      return j(new Error('not support'));
    }
    var fileName = '';
    if (name) {
      const names = name.split('.');
      const extName = names.splice(-1);
      fileName = `${names.join('.')}-${getNewFileId()}.${extName}`;
    } else {
      const names = base64.split(',')[0].match(/data\:\S+\/(\S+);/);
      if (!names) {
        j(new Error('base64 error'));
      }
      const extName = names[1];
      fileName = `${getNewFileId()}.${extName}`;
    }
    var basePath = '_doc';
    var dirPath = 'uniapp_temp';
    var filePath = `${basePath}/${dirPath}/${fileName}`;
    if (!biggerThan(plus.os.name === 'Android' ? '1.9.9.80627' : '1.9.9.80472', plus.runtime.innerVersion)) {
      plus.io.resolveLocalFileSystemURL(basePath, function (entry) {
        entry.getDirectory(dirPath, {
          create: true,
          exclusive: false,
        }, function (entry) {
          entry.getFile(fileName, {
            create: true,
            exclusive: false,
          }, function (entry) {
            entry.createWriter(function (writer) {
              writer.onwrite = function () {
                r(filePath);
              }
              writer.onerror = j;
              writer.seek(0);
              writer.writeAsBinary(dataUrlToBase64(base64));
            }, j)
          }, j)
        }, j)
      }, j)
      return;
    }
    var bitmap = new plus.nativeObj.Bitmap(fileName);
    bitmap.loadBase64Data(base64, function () {
      bitmap.save(filePath, {}, function () {
        bitmap.clear();
        r(filePath);
      }, function (error) {
        bitmap.clear();
        j(error);
      });
    }, function (error) {
      bitmap.clear();
      j(error);
    });
  });
};
