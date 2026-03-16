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
        @click="handleImageClick(index)"
        @error="handleImageError(index)"
      />
      <!-- 裁剪小图标 -->
      <view class="crop-image-btn" @click.stop="startCrop(index)">
        <uni-icons type="compose" size="14" color="#ffffff"></uni-icons>
      </view>
      <view class="delete-image-btn" @click="handleRemove(index)">
        <uni-icons type="close" size="14" color="#ffffff"></uni-icons>
      </view>
    </view>
  </view>

  <!-- 图片裁剪器 -->
  <ImageCropper
    :show="cropperVisible"
    :image-path="cropImagePath"
    @confirm="onCropConfirm"
    @cancel="onCropCancel"
    @use-original="onCropCancel"
  />
</template>

<script setup>
import { ref } from 'vue';
import ImageCropper from './ImageCropper.vue';

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['remove', 'error', 'crop']);

// 裁剪状态
const cropperVisible = ref(false);
const cropImagePath = ref('');
const cropIndex = ref(-1);

/**
 * 获取图片URL（支持字符串或对象格式）
 */
const getImageUrl = (img) => {
  if (!img) return '';
  if (typeof img === 'object' && img.url) {
    return img.url;
  }
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

/**
 * 点击图片 - 弹出操作菜单
 */
const handleImageClick = (index) => {
  uni.showActionSheet({
    itemList: ['预览图片', '裁剪图片'],
    success: (res) => {
      if (res.tapIndex === 0) {
        previewImage(index);
      } else if (res.tapIndex === 1) {
        startCrop(index);
      }
    }
  });
};

/**
 * 开始裁剪
 */
const startCrop = (index) => {
  const url = getImageUrl(props.images[index]);
  if (!url) return;
  cropIndex.value = index;
  cropImagePath.value = url;
  cropperVisible.value = true;
};

/**
 * 裁剪完成
 */
const onCropConfirm = (croppedPath) => {
  cropperVisible.value = false;
  emit('crop', { index: cropIndex.value, tempFilePath: croppedPath });
};

/**
 * 裁剪取消
 */
const onCropCancel = () => {
  cropperVisible.value = false;
};

const previewImage = (index) => {
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

.crop-image-btn {
  position: absolute;
  top: 8rpx;
  left: 8rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: rgba(255, 149, 85, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
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
