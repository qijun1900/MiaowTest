<template>
  <view class="question-content-display">
    <!-- 富文本内容 -->
    <view v-if="content.text" class="content-text">
      <rich-text :nodes="content.text"></rich-text>
    </view>
    
    <!-- 图片列表 -->
    <view v-if="content.images && content.images.length > 0" class="content-images">
      <view 
        v-for="(image, index) in content.images" 
        :key="index"
        class="image-container"
      >
        <view 
          class="image-wrapper"
          :class="{ 'expanded': expandedImages[index] }"
          @click="toggleImage(index)"
        >
          <image 
            :src="image.url" 
            :mode="expandedImages[index] ? 'widthFix' : 'aspectFill'"
            class="content-image"
            :class="{ 'thumbnail': !expandedImages[index] }"
            :lazy-load="true"
            @error="handleImageError(index)"
            @load="handleImageLoad(index)"
          />
          
          <!-- 缩略图遮罩层 -->
          <view v-if="!expandedImages[index] && !imageErrorStates[index]" class="thumbnail-mask">
            <view class="mask-content">
              <uni-icons type="eye" size="24" color="#ffffff"></uni-icons>
              <text class="mask-text">点击查看</text>
            </view>
          </view>
          
          <!-- 加载中占位 -->
          <view v-if="imageLoadingStates[index]" class="image-loading">
            <view class="loading-spinner"></view>
          </view>
          
          <!-- 加载失败提示 -->
          <view v-if="imageErrorStates[index]" class="image-error">
            <uni-icons type="image" size="40" color="#cccccc"></uni-icons>
            <text class="error-text">图片加载失败</text>
          </view>
        </view>
        
        <!-- 全屏按钮 - 仅在展开时显示 -->
        <view 
          v-if="expandedImages[index] && !imageErrorStates[index]" 
          class="fullscreen-btn"
          hover-class="fullscreen-btn-hover"
          @click.stop="openFullscreen(index)"
        >
          <uni-icons type="scan" size="18" color="#ff9555"></uni-icons>
          <text class="fullscreen-text">全屏查看</text>
        </view>
      </view>
    </view>
    
    <!-- 全屏查看弹窗 -->
    <view v-if="fullscreenVisible" class="fullscreen-modal" @click="closeFullscreen">
      <view class="fullscreen-content">
        <image 
          :src="currentFullscreenImage" 
          mode="aspectFit"
          class="fullscreen-image"
          @click.stop
        />
        
        <!-- 关闭按钮 -->
        <view class="close-btn" hover-class="close-btn-hover" @click.stop="closeFullscreen">
          <uni-icons type="closeempty" size="28" color="#ffffff"></uni-icons>
        </view>
        
        <!-- 图片序号指示器 -->
        <view v-if="content.images.length > 1" class="image-indicator">
          <text class="indicator-text">{{ currentFullscreenIndex + 1 }} / {{ content.images.length }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';

const props = defineProps({
  // 内容对象 { text: string, images: [{url: string}] }
  content: {
    type: Object,
    required: true,
    default: () => ({
      text: '',
      images: []
    })
  }
});

// 图片加载状态
const imageLoadingStates = reactive({});
const imageErrorStates = reactive({});
const expandedImages = reactive({}); // 图片展开状态

// 全屏查看状态
const fullscreenVisible = ref(false);
const currentFullscreenImage = ref('');
const currentFullscreenIndex = ref(0);

// 初始化所有图片为加载中状态和收起状态
if (props.content.images && props.content.images.length > 0) {
  props.content.images.forEach((_, index) => {
    imageLoadingStates[index] = true;
    imageErrorStates[index] = false;
    expandedImages[index] = false; // 默认收起
  });
}

// 图片加载成功
const handleImageLoad = (index) => {
  imageLoadingStates[index] = false;
  imageErrorStates[index] = false;
};

// 图片加载失败
const handleImageError = (index) => {
  imageLoadingStates[index] = false;
  imageErrorStates[index] = true;
};

// 切换图片展开/收起状态
const toggleImage = (index) => {
  if (imageErrorStates[index]) return; // 加载失败的图片不操作
  expandedImages[index] = !expandedImages[index];
};

// 打开全屏查看
const openFullscreen = (index) => {
  currentFullscreenImage.value = props.content.images[index].url;
  currentFullscreenIndex.value = index;
  fullscreenVisible.value = true;
};

// 关闭全屏查看
const closeFullscreen = () => {
  fullscreenVisible.value = false;
};
</script>

<style scoped>
.question-content-display {
  width: 100%;
}

.content-text {
  font-size: 30rpx;
  color: #333333;
  line-height: 1.6;
  margin-bottom: 20rpx;
  word-break: break-word;
}

.content-images {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.image-container {
  width: 100%;
}

.image-wrapper {
  position: relative;
  width: 100%;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 缩略图模式 - 固定高度 */
.image-wrapper:not(.expanded) {
  height: 200rpx;
}

/* 展开模式 - 自适应高度 */
.image-wrapper.expanded {
  height: auto;
}

.content-image {
  width: 100%;
  display: block;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

/* 缩略图样式 */
.content-image.thumbnail {
  height: 200rpx;
  object-fit: cover;
}

/* 缩略图遮罩层 */
.thumbnail-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.image-wrapper:active .thumbnail-mask {
  background: rgba(0, 0, 0, 0.5);
}

.mask-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.mask-text {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 500;
}

.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  z-index: 10;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #ffe8d6;
  border-top-color: #ff9555;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.image-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  gap: 16rpx;
  z-index: 10;
}

.error-text {
  font-size: 24rpx;
  color: #999999;
}

/* 全屏按钮 */
.fullscreen-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-top: 12rpx;
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #fff8f0 0%, #ffe8d6 100%);
  border: 2rpx solid #ff9555;
  border-radius: 48rpx;
  transition: all 0.3s ease;
}

.fullscreen-btn-hover {
  background: linear-gradient(135deg, #ffedd9 0%, #ffd4a3 100%);
  transform: scale(0.98);
}

.fullscreen-text {
  font-size: 26rpx;
  color: #ff9555;
  font-weight: 500;
}

/* 全屏查看弹窗 */
.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fullscreen-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.fullscreen-image {
  width: 100%;
  height: 100%;
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 60rpx;
  right: 40rpx;
  width: 80rpx;
  height: 80rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10000;
}

.close-btn-hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(0.95);
}

/* 图片序号指示器 */
.image-indicator {
  position: absolute;
  bottom: 60rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 16rpx 32rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 48rpx;
  z-index: 10000;
}

.indicator-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
}
</style>
