<template>
  <view class="empty-container">
    <image class="empty-image" 
        :src="props.imagePath" 
        mode="aspectFit" 
        v-if="imagePath"></image>
    <text class="empty-text">{{ props.description }}</text>
  </view>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  imagePath: {
    type: String,
    default: '/static/other/empty.png'
  },
  description: {
    type: String,
    default: '暂无数据'
  }
})
</script>

<style scoped>
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  text-align: center;
}
</style>