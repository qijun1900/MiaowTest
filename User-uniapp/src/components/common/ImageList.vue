<template>
  <view v-if="images.length > 0" class="image-list">
    <view 
      v-for="(img, index) in images" 
      :key="getImageUrl(img) + index"
      class="image-item"
    >
      <image 
        :src="getImageUrl(img)" 
        mode="aspectFill" 
        class="preview-image" 
        @click="previewImage(index)"
        @error="handleImageError(index)"
      />
      <view class="delete-image-btn" @click="handleRemove(index)">
        <uni-icons type="close" size="14" color="#ffffff"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  images: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['remove', 'error']);

/**
 * 获取图片URL（支持字符串或对象格式）
 */
const getImageUrl = (img) => {
  if (!img) return '';
  // 如果是对象格式 { _id, url }，返回 url
  if (typeof img === 'object' && img.url) {
    return img.url;
  }
  // 如果是字符串，直接返回
  return img;
};

const handleRemove = (index) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        emit('remove', index);
      }
    }
  });
};

const handleImageError = (index) => {
  console.error('图片加载失败:', props.images[index]);
  emit('error', index);
};

const previewImage = (index) => {
  // 提取所有有效的图片URL
  const validImages = props.images
    .map(img => getImageUrl(img))
    .filter(url => url && url.trim());
  
  if (validImages.length === 0) {
    uni.showToast({
      title: '图片加载失败',
      icon: 'none'
    });
    return;
  }
  
  uni.previewImage({
    urls: validImages,
    current: getImageUrl(props.images[index]),
    fail: (err) => {
      console.error('预览失败:', err);
      uni.showToast({
        title: '图片预览失败',
        icon: 'none'
      });
    }
  });
};
</script>

<style scoped>
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 20rpx;
}

.image-item {
  position: relative;
  width: 150rpx;
  height: 150rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #f5f5f5;
}

.preview-image {
  width: 100%;
  height: 100%;
  display: block;
}

.delete-image-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
</style>
