<template>
  <view>
    <view v-if="isWrongBookMode" class="custom-divider">
      <text class="divider-text">{{ analysisText }}</text>
      <view class="add-image-btn" @click="$emit('addImage')">
        <uni-icons type="image" size="18" color="#07c160"></uni-icons>
        <text class="add-image-text">添加图片</text>
      </view>
    </view>
    <ThemeDivider v-else :text="analysisText" />
  </view>
</template>

<script setup>
import ThemeDivider from '../../core/ThemeDivider.vue';

defineProps({
  isWrongBookMode: {
    type: Boolean,
    default: false
  },
  analysisText: {
    type: String,
    default: '题目解析(可选)'
  }
})

defineEmits(['addImage'])
</script>

<style scoped>
.custom-divider {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
}

.divider-text {
  font-size: 30rpx;
  font-weight: 550;
  color: #333;
}

.add-image-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  border-radius: 30rpx;
}

.add-image-text {
  font-size: 26rpx;
  color: #07c160;
}
</style>
