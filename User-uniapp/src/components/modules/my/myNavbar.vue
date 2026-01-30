<template>
  <view class="navigation-container">
    <view class="nav-grid">
      <view 
        v-for="(item, index) in navItems" 
        :key="index" 
        class="nav-item"
        hover-class="nav-item-hover"
        :hover-stay-time="100"
        @click="handleNavClick(item)">
        <view class="nav-icon-wrapper" :class="'icon-bg-' + index">
          <image 
            class="nav-icon" 
            :src="item.icon" 
            mode="aspectFit"
          />
        </view>
        <text class="nav-title">{{ item.title }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import checkLogin from '../../../util/checkLogin'

// 导航项数据
const navItems = ref([
  {
    title: '我的收藏',
    icon: '/static/navMy/my-fav.png',
    path: '/pages/my/MyFavoriteView'
  },
  {
    title: '我的错题',
    icon: '/static/navMy/my-wro.png',
    path: '/pages/my/MyWrongView'
  },
  {
    title: '我的笔记',
    icon: '/static/navMy/my-note.png',
    path: '/pages/my/MyNoteView',
  },
  {
    title: '我的题库',
    icon: '/static/other/my-questionbank.png',
    path: '/pages/my/UserQuestionBankView'
  }
])

// 导航点击处理
const handleNavClick = async (item) => {
  // 检查是否需要登录
    const loginResult = await checkLogin();
    if (!loginResult) {
      return;
    }
  // 如果是 tabBar 页面，使用 switchTab
  if (item.istabBar) {
    uni.switchTab({ url: item.path })
  } 
  // 否则使用 navigateTo
  else if (item.path) {
    uni.navigateTo({ url: item.path })
  }
}
</script>

<style scoped lang="scss">
.navigation-container {
  margin: 20rpx 10rpx;
  padding: 30rpx 0;
  background-color: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.nav-grid {
  display: flex;
  justify-content: space-between;
  padding: 0 10rpx;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
}

/* 交互反馈：点击时的微小缩放 */
.nav-item-hover {
  transform: scale(0.95);
  opacity: 0.9;
}

.nav-icon-wrapper {
  width: 96rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 32rpx; /* 圆润的方形（超椭圆视觉） */
  margin-bottom: 16rpx;
  transition: box-shadow 0.3s ease;
}

.nav-icon {
  width: 48rpx;
  height: 48rpx;
  filter: brightness(0) invert(1); /* 确保图标为纯白色 */
}

.nav-title {
  font-size: 26rpx;
  color: #333333;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0.5rpx;
}

/* 
  色彩方案：清晰的纯色搭配
  分别为：紫色(收藏)、红色(错题)、蓝色(笔记)、青色(题库)
*/
.icon-bg-0 {
  background-color: #7b61ff; /* 鲜明的紫色 */
  box-shadow: 0 8rpx 20rpx rgba(123, 97, 255, 0.2);
}

.icon-bg-1 {
  background-color: #ff5252; /* 活力的红色 */
  box-shadow: 0 8rpx 20rpx rgba(255, 82, 82, 0.2);
}

.icon-bg-2 {
  background-color: #448aff; /* 清晰的蓝色 */
  box-shadow: 0 8rpx 20rpx rgba(68, 138, 255, 0.2);
}

.icon-bg-3 {
  background-color: #00bfa5; /* 清新的青色 */
  box-shadow: 0 8rpx 20rpx rgba(0, 191, 165, 0.2);
}

/* 响应式适配 */
@media screen and (max-width: 320px) {
  .nav-icon-wrapper {
    width: 80rpx;
    height: 80rpx;
    border-radius: 28rpx;
  }
  
  .nav-icon {
    width: 40rpx;
    height: 40rpx;
  }
  
  .nav-title {
    font-size: 24rpx;
  }
}
</style>