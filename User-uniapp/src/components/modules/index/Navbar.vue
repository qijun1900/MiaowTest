<template>
  <view class="navigation-container">
    <uni-grid :column="4" :showBorder="false" :square="false">
      <uni-grid-item v-for="(item, index) in navItems" :key="index">
        <view class="grid-item">
          <image 
            v-if="item.icon === 'github-cat'" 
            src="/static/navBar/github-cat.png"
            :style="{width: '40px', height: '40px'}"
            mode="aspectFit" />
          <text class="nav-title">
            {{ item.title }}
          </text>
        </view>
      </uni-grid-item>
    </uni-grid>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 导航项数据
const navItems = ref([
  {
    title: '项目地址',
    icon: 'github-cat',
    path: '/pages/index/index'
  },
  {
    title: '题库制作',
    icon: 'github-cat',
    path: '/pages/exam/index'
  },
  {
    title: '所有考试',
    icon: 'github-cat',
    path: '/pages/score/index'
  },
  {
    title: '意见反馈',
    icon: 'github-cat',
    path: '/pages/user/index'
  }
])

</script>

<style scoped lang="scss">
.navigation-container {
  padding: 20rpx;
  background-color: #e6eeff;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rpx 0;
  /* 添加以下样式确保H5端正确显示 */
  width: 100%;
  box-sizing: border-box;
}

.nav-title {
  font-size: 24rpx;
  color: #333;
  font-weight: bold;
  text-align: center;
  margin-top: 10rpx;
}

/* 针对H5端的特殊样式 */
/* #ifdef H5 */
.navigation-container ::v-deep .uni-grid {
  display: grid !important;
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 10rpx !important;
}

.navigation-container ::v-deep .uni-grid-item {
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
}
/* #endif */
</style>