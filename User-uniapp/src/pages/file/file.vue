<template>
  <view class="container">
    <view class="exam-detail">
      <!-- 左侧考试封面 -->
      <view class="exam-cover">
        <image :src="examInfo.coverImage" mode="aspectFill" class="cover-image"></image>
      </view>

      <!-- 右侧考试信息 -->
      <view class="exam-info">
        <view class="info-item">
          <image src="/static/other/subject-name.png" class="info-icon"></image>
          <text class="info-title">考试名称：</text>
          <text class="info-content">{{ examInfo.name }}</text>
        </view>

        <view class="info-item">
          <image src="/static/other/year.png" class="info-icon"></image>
          <text class="info-title">考试年份：</text>
          <text class="info-content">{{ examInfo.year }}</text>
        </view>

        <view class="info-item">
          <image src="/static/other/time.png" class="info-icon"></image>
          <text class="info-title">更新时间：</text>
          <text class="info-content">{{ examInfo.updateTime }}</text>
        </view>

        <view class="info-item">
          <image src="/static/other/open-time.png" class="info-icon"></image>
          <text class="info-title">开考时间：</text>
          <text class="info-content">{{ examInfo.startTime }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

// 使用ref创建响应式数据
const examInfo = ref({
  coverImage: '/static/other/cover.jpg',
  name: '高等数学',
  year: '2023年',
  updateTime: '2023-06-15',
  startTime: '2023-07-01 09:00'
});
</script>

<style scoped>
.container {
  padding: 0rpx 12rpx;
  background-color: #ffffff;
}

.exam-detail {
  display: flex;
  flex-direction: row;
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  margin-top: 8rpx;
}

.exam-cover {
  margin-right: 15rpx;
  flex-shrink: 0;
}

.cover-image {
  width: 120px;
  height: 160px;
  border-radius: 6px;
  object-fit: cover;
}

.exam-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  flex-shrink: 0;
}

.info-title {
  font-weight: bold;
  color: #333333;
  margin-right: 6px;
  font-size: 14px;
  flex-shrink: 0;
}

.info-content {
  color: #666666;
  font-size: 14px;
  flex: 1;
  word-break: break-all;
}
</style>