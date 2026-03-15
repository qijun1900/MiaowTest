<template>
  <view v-if="show" class="cropper-overlay">
    <!-- 顶部栏 -->
    <view class="cropper-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="header-title">截取图片</text>
      <text class="header-hint">拖动选择要截取的区域</text>
    </view>

    <!-- 图片区域 -->
    <view
      class="cropper-body"
      id="cropperBody"
      @touchstart.prevent="onTouchStart"
      @touchmove.prevent="onTouchMove"
      @touchend.prevent="onTouchEnd"
    >
      <image
        :src="imagePath"
        class="source-image"
        mode="aspectFit"
        @load="onImageLoad"
      />

      <!-- 选区外的暗色遮罩 -->
      <template v-if="hasSelection">
        <view class="crop-mask" :style="topMaskStyle" />
        <view class="crop-mask" :style="bottomMaskStyle" />
        <view class="crop-mask" :style="leftMaskStyle" />
        <view class="crop-mask" :style="rightMaskStyle" />
        <!-- 选区边框 -->
        <view class="selection-border" :style="selectionBorderStyle">
          <view class="corner tl" />
          <view class="corner tr" />
          <view class="corner bl" />
          <view class="corner br" />
        </view>
      </template>
      <template v-else>
        <view class="crop-mask full-mask" />
      </template>
    </view>

    <!-- 底部操作栏 -->
    <view class="cropper-footer">
      <view class="footer-btn" @click="handleCancel">
        <text class="btn-text cancel-text">取消</text>
      </view>
      <view class="footer-btn" @click="handleUseOriginal">
        <text class="btn-text original-text">使用原图</text>
      </view>
      <view
        class="footer-btn confirm-btn"
        :class="{ disabled: !hasSelection || cropping }"
        @click="handleConfirm"
      >
        <text class="btn-text confirm-text">{{ cropping ? '截取中...' : '确认截取' }}</text>
      </view>
    </view>

    <!-- 隐藏的canvas用于裁剪 -->
    <canvas
      canvas-id="cropCanvas"
      id="cropCanvas"
      class="hidden-canvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
    />
  </view>
</template>

<script setup>
import { ref, reactive, computed, nextTick, getCurrentInstance, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  imagePath: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['confirm', 'cancel', 'useOriginal']);

const instance = getCurrentInstance();

// 系统信息
const systemInfo = uni.getSystemInfoSync();
const statusBarHeight = systemInfo.statusBarHeight || 0;

// 原始图片尺寸
const originalWidth = ref(0);
const originalHeight = ref(0);

// 容器信息
const containerRect = reactive({ left: 0, top: 0, width: 0, height: 0 });

// 图片在容器内的实际显示区域（aspectFit模式下可能有留白）
const imageDisplay = reactive({ left: 0, top: 0, width: 0, height: 0 });

// 触摸状态
const startPoint = reactive({ x: 0, y: 0 });
const selectionRect = reactive({ left: 0, top: 0, width: 0, height: 0 });
const isSelecting = ref(false);
const hasSelection = ref(false);

// Canvas 尺寸
const canvasWidth = ref(10);
const canvasHeight = ref(10);

// 裁剪中状态
const cropping = ref(false);

// 本地图片路径（用于 canvas 绘制，兼容远程URL）
const localImagePath = ref('');

// 当 show 变为 false 时重置状态
watch(() => props.show, (val) => {
  if (!val) {
    resetState();
  }
});

/**
 * 图片加载完成
 */
const onImageLoad = () => {
  uni.getImageInfo({
    src: props.imagePath,
    success: (info) => {
      originalWidth.value = info.width;
      originalHeight.value = info.height;
      // 保存本地路径，确保 canvas drawImage 兼容远程URL
      localImagePath.value = info.path || props.imagePath;

      nextTick(() => {
        uni.createSelectorQuery().in(instance.proxy)
          .select('#cropperBody')
          .boundingClientRect((rect) => {
            if (!rect) return;
            containerRect.left = rect.left;
            containerRect.top = rect.top;
            containerRect.width = rect.width;
            containerRect.height = rect.height;

            // 计算 aspectFit 模式下图片的实际显示区域
            const imgRatio = info.width / info.height;
            const containerRatio = rect.width / rect.height;

            if (imgRatio > containerRatio) {
              // 宽度受限
              imageDisplay.width = rect.width;
              imageDisplay.height = rect.width / imgRatio;
              imageDisplay.left = 0;
              imageDisplay.top = (rect.height - imageDisplay.height) / 2;
            } else {
              // 高度受限
              imageDisplay.height = rect.height;
              imageDisplay.width = rect.height * imgRatio;
              imageDisplay.left = (rect.width - imageDisplay.width) / 2;
              imageDisplay.top = 0;
            }
          })
          .exec();
      });
    }
  });
};

/**
 * 触摸开始
 */
const onTouchStart = (e) => {
  if (!containerRect.width) return;
  const touch = e.touches[0];
  const x = touch.clientX - containerRect.left;
  const y = touch.clientY - containerRect.top;

  startPoint.x = x;
  startPoint.y = y;
  selectionRect.left = x;
  selectionRect.top = y;
  selectionRect.width = 0;
  selectionRect.height = 0;
  isSelecting.value = true;
  hasSelection.value = false;
};

/**
 * 触摸移动
 */
const onTouchMove = (e) => {
  if (!isSelecting.value) return;
  const touch = e.touches[0];
  const x = touch.clientX - containerRect.left;
  const y = touch.clientY - containerRect.top;

  // 限制在容器范围内
  const clampedX = Math.max(0, Math.min(x, containerRect.width));
  const clampedY = Math.max(0, Math.min(y, containerRect.height));

  selectionRect.left = Math.min(startPoint.x, clampedX);
  selectionRect.top = Math.min(startPoint.y, clampedY);
  selectionRect.width = Math.abs(clampedX - startPoint.x);
  selectionRect.height = Math.abs(clampedY - startPoint.y);

  // 拖动超过10px才认为有效选区
  hasSelection.value = selectionRect.width > 10 && selectionRect.height > 10;
};

/**
 * 触摸结束
 */
const onTouchEnd = () => {
  isSelecting.value = false;
  hasSelection.value = selectionRect.width > 10 && selectionRect.height > 10;
};

/**
 * 遮罩样式
 */
const topMaskStyle = computed(() => ({
  top: '0px',
  left: '0px',
  width: '100%',
  height: selectionRect.top + 'px'
}));

const bottomMaskStyle = computed(() => {
  const bottom = selectionRect.top + selectionRect.height;
  return {
    top: bottom + 'px',
    left: '0px',
    width: '100%',
    bottom: '0px'
  };
});

const leftMaskStyle = computed(() => ({
  top: selectionRect.top + 'px',
  left: '0px',
  width: selectionRect.left + 'px',
  height: selectionRect.height + 'px'
}));

const rightMaskStyle = computed(() => {
  const right = selectionRect.left + selectionRect.width;
  return {
    top: selectionRect.top + 'px',
    left: right + 'px',
    right: '0px',
    height: selectionRect.height + 'px'
  };
});

/**
 * 选区边框样式
 */
const selectionBorderStyle = computed(() => ({
  top: selectionRect.top + 'px',
  left: selectionRect.left + 'px',
  width: selectionRect.width + 'px',
  height: selectionRect.height + 'px'
}));

/**
 * 确认截取
 */
const handleConfirm = async () => {
  if (!hasSelection.value || cropping.value) return;

  try {
    cropping.value = true;

    // 将选区坐标映射到原始图片像素坐标
    const scaleX = originalWidth.value / imageDisplay.width;
    const scaleY = originalHeight.value / imageDisplay.height;

    const imgSelLeft = (selectionRect.left - imageDisplay.left) * scaleX;
    const imgSelTop = (selectionRect.top - imageDisplay.top) * scaleY;
    const imgSelWidth = selectionRect.width * scaleX;
    const imgSelHeight = selectionRect.height * scaleY;

    // 限制在图片范围内
    const cropX = Math.max(0, Math.round(imgSelLeft));
    const cropY = Math.max(0, Math.round(imgSelTop));
    const cropW = Math.min(Math.round(imgSelWidth), originalWidth.value - cropX);
    const cropH = Math.min(Math.round(imgSelHeight), originalHeight.value - cropY);

    if (cropW <= 0 || cropH <= 0) {
      uni.showToast({ title: '请在图片区域内选择', icon: 'none' });
      cropping.value = false;
      return;
    }

    // 限制 canvas 尺寸，避免性能问题
    const MAX_SIZE = 1500;
    const ratio = Math.min(1, MAX_SIZE / Math.max(cropW, cropH));
    canvasWidth.value = Math.max(1, Math.round(cropW * ratio));
    canvasHeight.value = Math.max(1, Math.round(cropH * ratio));

    await nextTick();

    // 使用 canvas 绘制裁剪区域
    const ctx = uni.createCanvasContext('cropCanvas', instance.proxy);
    ctx.drawImage(
      localImagePath.value,
      cropX, cropY, cropW, cropH,
      0, 0, canvasWidth.value, canvasHeight.value
    );

    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath({
          canvasId: 'cropCanvas',
          width: canvasWidth.value,
          height: canvasHeight.value,
          destWidth: cropW,
          destHeight: cropH,
          fileType: 'jpg',
          quality: 0.9,
          success: (res) => {
            cropping.value = false;
            emit('confirm', res.tempFilePath);
          },
          fail: (err) => {
            cropping.value = false;
            console.error('裁剪导出失败:', err);
            uni.showToast({ title: '截取失败，请重试', icon: 'none' });
          }
        }, instance.proxy);
      }, 300);
    });

  } catch (error) {
    cropping.value = false;
    console.error('截取出错:', error);
    uni.showToast({ title: '截取失败', icon: 'none' });
  }
};

/**
 * 使用原图
 */
const handleUseOriginal = () => {
  emit('useOriginal');
};

/**
 * 取消
 */
const handleCancel = () => {
  emit('cancel');
};

/**
 * 重置状态
 */
const resetState = () => {
  selectionRect.left = 0;
  selectionRect.top = 0;
  selectionRect.width = 0;
  selectionRect.height = 0;
  hasSelection.value = false;
  isSelecting.value = false;
  cropping.value = false;
  localImagePath.value = '';
};
</script>

<style scoped>
.cropper-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: #000;
  display: flex;
  flex-direction: column;
}

.cropper-header {
  padding: 20rpx 30rpx;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-title {
  font-size: 34rpx;
  color: #fff;
  font-weight: 600;
}

.header-hint {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 6rpx;
}

.cropper-body {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #000;
}

.source-image {
  width: 100%;
  height: 100%;
}

/* 遮罩层 */
.crop-mask {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.55);
  pointer-events: none;
}

.full-mask {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 选区边框 */
.selection-border {
  position: absolute;
  border: 3rpx solid #fff;
  pointer-events: none;
  box-shadow: 0 0 0 1rpx rgba(0, 0, 0, 0.3);
}

/* 四角标记 */
.corner {
  position: absolute;
  width: 30rpx;
  height: 30rpx;
  border-color: #fff;
  border-style: solid;
  border-width: 0;
}

.corner.tl {
  top: -3rpx;
  left: -3rpx;
  border-top-width: 6rpx;
  border-left-width: 6rpx;
}

.corner.tr {
  top: -3rpx;
  right: -3rpx;
  border-top-width: 6rpx;
  border-right-width: 6rpx;
}

.corner.bl {
  bottom: -3rpx;
  left: -3rpx;
  border-bottom-width: 6rpx;
  border-left-width: 6rpx;
}

.corner.br {
  bottom: -3rpx;
  right: -3rpx;
  border-bottom-width: 6rpx;
  border-right-width: 6rpx;
}

/* 底部操作栏 */
.cropper-footer {
  display: flex;
  padding: 24rpx 30rpx;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24rpx);
  background: rgba(0, 0, 0, 0.85);
  gap: 20rpx;
}

.footer-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  background: rgba(255, 255, 255, 0.15);
}

.footer-btn:active {
  opacity: 0.7;
}

.confirm-btn {
  background: #07c160;
}

.confirm-btn.disabled {
  background: rgba(255, 255, 255, 0.1);
  opacity: 0.5;
}

.btn-text {
  font-size: 28rpx;
}

.cancel-text {
  color: rgba(255, 255, 255, 0.8);
}

.original-text {
  color: #fff;
}

.confirm-text {
  color: #fff;
  font-weight: 500;
}

/* 隐藏的 canvas */
.hidden-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
}
</style>
