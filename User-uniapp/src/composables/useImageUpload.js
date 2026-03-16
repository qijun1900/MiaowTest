import { ref } from 'vue';
import { deleteCloudFiles, httpUpload } from '../util/http';
import escconfig from '../config/esc.config';
import { UserInfoStore } from '../stores/modules/UserinfoStore';

/**
 * 上传单个图片文件（独立函数，不依赖 composable 实例）
 * @param {string} filePath - 本地图片路径
 * @returns {Promise<{_id: string, url: string}>}
 */
export function uploadSingleFile(filePath) {
  const ext = filePath.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const userInfoStore = UserInfoStore();
  const uid = userInfoStore.userInfo?.uid || 'anonymous';
  const cloudPath = `user/wrong_question/${uid}/${timestamp}_${random}.${ext}`;

  if (escconfig.useCloudContainer) {
    return httpUpload({
      filePath,
      url: '/uniappAPI/upload/cloudImage',
      cloudPath
    }).then(data => {
      if (data.code === 200) {
        return { _id: data.data._id, url: data.data.url };
      }
      throw new Error(data.message || '上传失败');
    });
  }

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: '/uniappAPI/upload/image',
      filePath,
      name: 'file',
      fileType: 'image',
      success: (uploadRes) => {
        try {
          const data = JSON.parse(uploadRes.data);
          if (data.code === 200) {
            resolve({ _id: data.data._id, url: data.data.url });
          } else {
            reject(new Error(data.message || '上传失败'));
          }
        } catch (e) {
          reject(new Error('解析响应失败'));
          console.error('上传响应解析失败:', e, '原始响应:', uploadRes.data);
        }
      },
      fail: reject
    });
  });
}

export function useImageUpload(options = {}) {
  const imageList = ref([]);

  // 默认配置：最大 10MB
  const maxSize = options.maxSize || 10 * 1024 * 1024;

  // 裁剪器状态
  const cropperVisible = ref(false);
  const pendingCropImage = ref('');

  /**
   * 选择图片 → 打开裁剪器
   */
  const addImage = () => {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        // 先展示裁剪器，让用户选择截取区域或使用原图
        pendingCropImage.value = tempFilePath;
        cropperVisible.value = true;
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        uni.showToast({
          title: '图片选择失败',
          position: 'top',
          icon: 'none'
        });
      }
    });
  };

  /**
   * 裁剪完成，保存裁剪后的图片
   */
  const completeCrop = (croppedPath) => {
    cropperVisible.value = false;
    pendingCropImage.value = '';
    checkFileSize(croppedPath);
  };

  /**
   * 跳过裁剪，使用原图
   */
  const skipCrop = () => {
    const originalPath = pendingCropImage.value;
    cropperVisible.value = false;
    pendingCropImage.value = '';
    checkFileSize(originalPath);
  };

  /**
   * 取消裁剪
   */
  const cancelCrop = () => {
    cropperVisible.value = false;
    pendingCropImage.value = '';
  };

  /**
   * 检查文件大小
   */
  const checkFileSize = (filePath) => {
    uni.getFileInfo({
      filePath: filePath,
      success: (res) => {
        const fileSize = res.size; // 字节
        
        if (fileSize > maxSize) {
          const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
          const currentSizeMB = (fileSize / (1024 * 1024)).toFixed(1);
          
          uni.showToast({
            title: `图片过大(${currentSizeMB}MB)，限制${maxSizeMB}MB`,
            position: 'top',
            icon: 'none',
            duration: 2500
          });
          return;
        }
        
        // 大小符合要求，保存文件
        saveToLocalFile(filePath);
      },
      fail: (err) => {
        console.error('获取文件信息失败:', err);
        // 如果获取失败，仍然允许保存（降级处理）
        saveToLocalFile(filePath);
      }
    });
  };

  /**
   * 将临时文件保存到本地永久路径
   */
  const saveToLocalFile = (tempFilePath) => {
    // #ifdef APP-PLUS
    // APP端直接使用临时路径，wx对象不存在于APP平台
    imageList.value.push(tempFilePath);
    uni.showToast({
      title: '图片已添加',
      position: 'top',
      icon: 'none'
    });
    // #endif

    // #ifdef MP-WEIXIN
    const fs = uni.getFileSystemManager();
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2);
    const fileName = `${timestamp}_${random}.jpg`;
    const savedFilePath = `${wx.env.USER_DATA_PATH}/${fileName}`;

    fs.saveFile({
      tempFilePath: tempFilePath,
      filePath: savedFilePath,
      success: (res) => {
        const savedPath = res.savedFilePath;
        imageList.value.push(savedPath);
        uni.showToast({
          title: '图片已添加',
          position: 'top',
          icon: 'none'
        });
      },
      fail: (err) => {
        console.error('保存图片失败:', err);
        imageList.value.push(tempFilePath);
        uni.showToast({
          title: '图片已添加',
          position: 'top',
          icon: 'none'
        });
      }
    });
    // #endif
  };

  /**
   * 检查是否为已上传到OSS的远程URL
   */
  const isRemoteUrl = (item) => {
    if (!item) return false;
    
    // 支持字符串或对象格式
    const url = typeof item === 'string' ? item : item.url;
    if (!url) return false;
    
    // 检查是否以 OSS 域名开头
    const ossDomain = import.meta.env.VITE_OSS_DOMAIN;
    return ossDomain && url.startsWith(ossDomain);
  };

  /**
   * 检查是否为云存储 fileID
   */
  const isCloudFileId = (item) => {
    if (!item) return false;
    const url = typeof item === 'string' ? item : item.url;
    return typeof url === 'string' && url.startsWith('cloud://');
  };

  /**
   * 检查是否为已上传的远程资源（OSS或云存储）
   */
  const isUploadedResource = (item) => {
    return isRemoteUrl(item) || isCloudFileId(item);
  };

  /**
   * 批量上传所有图片到服务器
   */
  const uploadAllImages = async (uploadUrl = '/uniappAPI/upload/image') => {
    if (imageList.value.length === 0) {
      return [];
    }

    const results = [];

    for (const item of imageList.value) {
      // 如果是已上传的远程资源（OSS URL 或云存储 fileID），直接使用
      if (isUploadedResource(item)) {
        results.push(item);
        continue;
      }

      // 本地文件路径：尝试上传
      const localPath = typeof item === 'string' ? item : item.url;
      
      try {
        const uploadResult = await uploadSingleImage(localPath, uploadUrl);
        results.push(uploadResult); // { _id, url }
      } catch (error) {
        console.warn('图片上传失败或文件不存在，跳过:', localPath, error.message);
      }
    }

    return results;
  };

  /**
   * 生成云存储路径（包含用户 UID）
   */
  const generateCloudPath = (filePath) => {
    const ext = filePath.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    
    // 获取当前用户 UID
    const userInfoStore = UserInfoStore();
    const uid = userInfoStore.userInfo?.uid || 'anonymous';
    
    return `user/wrong_question/${uid}/${timestamp}_${random}.${ext}`;
  };

  /**
   * 上传单张图片
   */
  const uploadSingleImage = (filePath, uploadUrl) => {
    return new Promise((resolve, reject) => {
      // 上传前再次检查文件大小
      uni.getFileInfo({
        filePath: filePath,
        success: (fileInfo) => {
          const fileSize = fileInfo.size;
          
          // 检查文件大小
          if (fileSize > maxSize) {
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
            const currentSizeMB = (fileSize / (1024 * 1024)).toFixed(1);
            const errorMsg = `图片过大(${currentSizeMB}MB)，限制${maxSizeMB}MB`;
            
            reject(new Error(errorMsg));
            
            uni.showToast({
              title: errorMsg,
              position: 'top',
              icon: 'none',
              duration: 2500
            });
            return;
          }
          
          // 大小符合要求，开始上传
          doUpload(filePath, uploadUrl).then(resolve).catch(reject);
        },
        fail: (err) => {
          console.warn('获取文件信息失败，跳过大小检查，直接上传:', err);
          // 如果获取文件信息失败，仍然尝试上传（降级处理）
          doUpload(filePath, uploadUrl).then(resolve).catch(reject);
        }
      });
    });
  };

  /**
   * 实际执行上传
   */
  const doUpload = (filePath, uploadUrl) => {
    // 云托管模式：通过 httpUpload 统一处理（内部自动区分云对象存储 / base64中转OSS）
    if (escconfig.useCloudContainer) {
      const cloudPath = generateCloudPath(filePath);
      return httpUpload({
        filePath: filePath,
        url: '/uniappAPI/upload/cloudImage',
        cloudPath: cloudPath
      }).then(data => {
        if (data.code === 200) {
          return { _id: data.data._id, url: data.data.url };
        } else {
          throw new Error(data.message || '上传失败');
        }
      });
    }

    // 普通模式：使用 uni.uploadFile
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: uploadUrl,
        filePath: filePath,
        name: 'file',
        fileType: 'image',
        success: (uploadRes) => {
          try {
            const data = JSON.parse(uploadRes.data);
            if (data.code === 200) {
              resolve({ _id: data.data._id, url: data.data.url });
            } else {
              reject(new Error(data.message || '上传失败'));
            }
          } catch (e) {
            reject(new Error('解析响应失败'));
            console.error('上传响应解析失败:', e, '原始响应:', uploadRes.data);
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  };

  /**
   * 删除服务器上的图片
   */
  const deleteRemoteImage = async (imageItem) => {
    return new Promise((resolve, reject) => {
      const requestData = {};

      const imagePath = typeof imageItem === 'string' ? imageItem : imageItem.url;

      // 云存储文件先在小程序端删除，再通知后端清理数据库记录
      const preDeletePromise = (escconfig.useCloudContainer && escconfig.useCloudStorage && isCloudFileId(imageItem))
        ? deleteCloudFiles([imagePath]).catch((err) => {
            console.warn('删除云存储文件失败，将继续删除数据库记录:', err);
            return null;
          })
        : Promise.resolve(null);
      
      // 支持对象格式 { _id, url } 或字符串格式
      if (typeof imageItem === 'object' && imageItem._id) {
        requestData._id = imageItem._id;
        requestData.path = imageItem.url;
      } else {
        requestData.path = imagePath;
      }

      preDeletePromise.then(() => {
        uni.request({
          url: '/uniappAPI/delete/image',
          method: 'POST',
          data: requestData,
          success: (res) => {
            if (res.data.code === 200) {
              uni.showToast({
                title: '图片已删除',
                position:'top',
                icon: 'none'
              });
              resolve(true);
            } else {
              reject(new Error(res.data.message || '删除失败'));
            }
          },
          fail: (err) => {
            reject(err);
          }
        });
      });
    });
  };

  /**
   * 删除指定索引的图片
   */
  const removeImage = async (index) => {
    if (index >= 0 && index < imageList.value.length) {
      const item = imageList.value[index];

      if (isRemoteUrl(item) || isCloudFileId(item)) {
        try {
          await deleteRemoteImage(item);
        } catch (error) {
          console.warn('远程图片删除失败:', error);
        }
      } else {
        // 本地文件路径
        const filePath = typeof item === 'string' ? item : item.url;
        // #ifdef MP-WEIXIN
        if (filePath && wx.env && filePath.includes(wx.env.USER_DATA_PATH)) {
          const fs = uni.getFileSystemManager();
          fs.unlink({
            filePath: filePath,
            success: () => {
              console.log('本地文件已删除:', filePath);
            },
            fail: (err) => {
              console.warn('删除本地文件失败:', err);
            }
          });
        }
        // #endif
      }

      imageList.value.splice(index, 1);
    }
  };

  /**
   * 清空所有图片
   */
  const clearImages = () => {
    // 清理本地文件
    // #ifdef MP-WEIXIN
    imageList.value.forEach(item => {
      const filePath = typeof item === 'string' ? item : item.url;
      if (filePath && wx.env && filePath.includes(wx.env.USER_DATA_PATH)) {
        const fs = uni.getFileSystemManager();
        fs.unlink({
          filePath: filePath,
          success: () => {
            console.log('本地文件已删除:', filePath);
          },
          fail: () => {}
        });
      }
    });
    // #endif
    
    imageList.value = [];
  };

  /**
   * 设置已有图片（从API加载）
   * @param {Array} images - 图片数组，每项可为 string、{ url } 或 { _id, url } 对象
   */
  const setImages = (images) => {
    if (!images || !Array.isArray(images)) return;
    
    imageList.value = images.map(img => {
      // 支持三种格式：string、{ url } 或 { _id, url }
      if (typeof img === 'string') {
        return img;
      } else if (img._id && img.url) {
        return { _id: img._id, url: img.url };
      } else if (img.url) {
        return img.url;
      }
      return null;
    }).filter(item => item);
  };

  /**
   * 替换指定索引的图片（裁剪后替换），如果旧图是远程资源则先删除
   */
  const replaceImage = async (index, newPath) => {
    if (index >= 0 && index < imageList.value.length) {
      const oldItem = imageList.value[index];

      // 如果旧图是已上传的远程资源，先删除服务器上的旧图
      if (isUploadedResource(oldItem)) {
        try {
          await deleteRemoteImage(oldItem);
        } catch (error) {
          console.warn('替换时删除旧远程图片失败:', error);
        }
      }

      imageList.value.splice(index, 1, newPath);
    }
  };

  return {
    imageList,
    addImage,
    uploadAllImages,
    removeImage,
    replaceImage,
    clearImages,
    setImages,
    // 裁剪器状态
    cropperVisible,
    pendingCropImage,
    completeCrop,
    skipCrop,
    cancelCrop
  };
}
