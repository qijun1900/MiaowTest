<template>
  <view class="theme-loading-container">
    <view class="loading-spinner"></view>
    <text class="loading-text">{{ text }}</text>
  </view>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '正在加载...'
  }
})
</script>

<style scoped>
/* Loading 动画样式 */
.theme-loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 150rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #e6f2ff;
  border-top: 4rpx solid #4d94ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 30rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
  text-align: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>