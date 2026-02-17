import { ref } from 'vue';

export function useImageUpload() {
  const imageList = ref([]);
  
  /**
   * 选择图片（不上传）
   */
  const addImage = () => {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        // 保存到本地永久路径（避免临时文件失效）
        saveToLocalFile(tempFilePath);
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
   * 将临时文件保存到本地永久路径
   */
  const saveToLocalFile = (tempFilePath) => {
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
          position:'top',
          icon: 'none'
        });
      },
      fail: (err) => {
        console.error('保存图片失败:', err);
        // 如果保存失败，直接使用临时路径
        imageList.value.push(tempFilePath);
        
        uni.showToast({
          title: '图片已添加',
          position:'top',
          icon: 'none'
        });
      }
    });
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
   * 批量上传所有图片到服务器
   */
  const uploadAllImages = async (uploadUrl = '/uniappAPI/upload/image') => {
    if (imageList.value.length === 0) {
      return [];
    }

    const results = [];

    for (const item of imageList.value) {
      // 如果是已上传到OSS的远程URL（带_id的对象），直接使用
      if (isRemoteUrl(item)) {
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
   * 上传单张图片
   */
  const uploadSingleImage = (filePath, uploadUrl) => {
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
              // 返回包含 _id 和 url 的对象
              resolve({
                _id: data.data._id,
                url: data.data.url
              });
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
      
      // 支持对象格式 { _id, url } 或字符串格式
      if (typeof imageItem === 'object' && imageItem._id) {
        requestData._id = imageItem._id;
        requestData.path = imageItem.url;
      } else {
        requestData.path = typeof imageItem === 'string' ? imageItem : imageItem.url;
      }
      
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
  };

  /**
   * 删除指定索引的图片
   */
  const removeImage = async (index) => {
    if (index >= 0 && index < imageList.value.length) {
      const item = imageList.value[index];

      if (isRemoteUrl(item)) {
        try {
          await deleteRemoteImage(item);
        } catch (error) {
          console.warn('远程图片删除失败:', error);
        }
      } else {
        // 本地文件路径
        const filePath = typeof item === 'string' ? item : item.url;
        if (filePath && filePath.includes(wx.env.USER_DATA_PATH)) {
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
      }

      imageList.value.splice(index, 1);
    }
  };

  /**
   * 清空所有图片
   */
  const clearImages = () => {
    // 清理本地文件
    imageList.value.forEach(item => {
      const filePath = typeof item === 'string' ? item : item.url;
      if (filePath && filePath.includes(wx.env.USER_DATA_PATH)) {
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

  return {
    imageList,
    addImage,
    uploadAllImages,
    removeImage,
    clearImages,
    setImages
  };
}
