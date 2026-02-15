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
   * 批量上传所有图片到服务器
   */
  const uploadAllImages = async (uploadUrl = '/uniappAPI/upload/image') => {
    if (imageList.value.length === 0) {
      return [];
    }

    const uploadPromises = imageList.value.map((filePath) => {
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
                resolve(data.data.url);
              } else {
                reject(new Error(data.message || '上传失败'));
              }
            } catch (e) {
              reject(new Error('解析响应失败'));
              console.error('上传响应解析失败:', e);
            }
          },
          fail: (err) => {
            reject(err);
          }
        });
      });
    });

    return Promise.all(uploadPromises);
  };

  /**
   * 删除指定索引的图片
   */
  const removeImage = (index) => {
    if (index >= 0 && index < imageList.value.length) {
      const filePath = imageList.value[index];
      
      // 尝试删除本地文件
      const fs = uni.getFileSystemManager();
      if (filePath.includes(wx.env.USER_DATA_PATH)) {
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
      
      imageList.value.splice(index, 1);
    }
  };

  /**
   * 清空所有图片
   */
  const clearImages = () => {
    // 清理本地文件
    imageList.value.forEach(filePath => {
      if (filePath.includes(wx.env.USER_DATA_PATH)) {
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

  return {
    imageList,
    addImage,
    uploadAllImages,
    removeImage,
    clearImages
  };
}
