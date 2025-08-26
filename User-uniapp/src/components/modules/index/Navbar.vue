<template>
  <view class="navigation-container">
    <uni-grid :column="4" :showBorder="false" :square="false">
      <uni-grid-item v-for="(item, index) in navItems" :key="index">
        <view class="grid-item">
          <!-- 使用图片替代SVG -->
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

<style scoped>
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
}

.nav-title {
  font-size: 24rpx;
  color: #333;
  font-weight: bold;
  text-align: center;
  margin-top: 10rpx;
}
</style>