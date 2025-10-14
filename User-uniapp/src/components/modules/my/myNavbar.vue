<template>
  <view class="navigation-container">
    <view class="nav-grid">
      <view 
        v-for="(item, index) in navItems" 
        :key="index" 
        class="nav-item"
        @click="handleNavClick(item)">
        <view class="nav-icon-wrapper">
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

// 导航项数据 - 使用不同的图标
//TODO我的页面导航栏功能
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
    title: '所有考试',
    icon: '/static/tabBar/exam-active.png',
    path: '/pages/exam/exam',
    istabBar: true
  },
  {
    title: '意见反馈',
    icon: '/static/tabBar/function-active.png',
    path: '/pages/user/index'
  }
])

// 导航点击处理
const handleNavClick = (item) => {
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
  padding: 30rpx 5rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
  border-radius: 20rpx;
  margin: 0 5rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx 10rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3rpx;
    background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-4rpx);
    box-shadow: 0 8rpx 25rpx rgba(79, 172, 254, 0.15);
    
    &::before {
      transform: scaleX(1);
    }
    
    .nav-icon-wrapper {
      transform: scale(1.1);
    }
  }
  
  &:active {
    transform: translateY(-2rpx);
    transition: transform 0.1s ease;
  }
}

.nav-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  margin-bottom: 15rpx;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
}

.nav-icon {
  width: 40rpx;
  height: 40rpx;
  filter: brightness(0) invert(1);
}

.nav-title {
  font-size: 24rpx;
  color: #333;
  font-weight: 600;
  text-align: center;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.nav-item:hover .nav-title {
  color: #4facfe;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .nav-grid {
    gap: 15rpx;
  }
  
  .nav-item {
    padding: 15rpx 8rpx;
  }
  
  .nav-icon-wrapper {
    width: 70rpx;
    height: 70rpx;
  }
  
  .nav-icon {
    width: 35rpx;
    height: 35rpx;
  }
  
  .nav-title {
    font-size: 22rpx;
  }
}

/* 针对不同导航项的特殊样式 */
.nav-item:nth-child(1) .nav-icon-wrapper {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.nav-item:nth-child(2) .nav-icon-wrapper {
  background: linear-gradient(135deg, #f6a2ff 0%, #ff6277 100%);
}

.nav-item:nth-child(3) .nav-icon-wrapper {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.nav-item:nth-child(4) .nav-icon-wrapper {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}
</style>