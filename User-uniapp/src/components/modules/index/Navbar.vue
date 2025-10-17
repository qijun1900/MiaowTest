<template>
  <view class="navigation-container">
    <uni-grid :column="4" :showBorder="false" :square="false">
      <uni-grid-item v-for="(item, index) in navItems" :key="index">
        <view class="grid-item"
         @click="handleNavClick(item)">
          <image 
            :src="item.imageSrc"
            :style="{width: '40px', height: '40px'}"
            mode="aspectFit"/>
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
import  handleCopy from "../../../util/copy"

// 导航项数据
const navItems = ref([
  {
    title: '开源地址',
    path: '/pages/index/index',
    imageSrc: '/static/navBar/github-cat.png'
  },
  {
    title: '题库制作',
    path: '/pages/exam/crquestionbankView',
    imageSrc: '/static/navBar/make-bank.png'
  },
  {
    title: '所有考试',
    path: '/pages/exam/exam',
    imageSrc: '/static/navBar/all-exam.png'
  },
  {
    title: '意见反馈',
    path: '/pages/user/index',
    imageSrc: '/static/navBar/feedback-cat.png'
  }
])
// 处理导航项点击事件
const handleNavClick = (item) => {
  if (item.title==='开源地址') {
    handleCopy("https://github.com/qijun1900/MiaowTest")
    return;
  }
  if (item.title==='所有考试') {
    uni.switchTab({
      url: item.path
    })
    return;
  }
  if (item.title==='题库制作') {
    uni.navigateTo({
      url: item.path
    })
  }
  //TODO 反馈问题页面
  if (item.title==='意见反馈') {
    uni.showToast({
      title: '功能开发中',
      icon: 'none'
    })
    // uni.navigateTo({
    //   url: item.path
    // })
    return;
  }

}


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