<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" 
      :style="{ height: navBarInfo.totalHeight + 'px', paddingTop: navBarInfo.statusBarHeight + 'px' }">
      <!-- 导航栏标题 -->
      <view class="navbar-title">所有工具</view>
    </view>
    
    <!-- 工具列表区域 -->
    <view class="tools-container" :style="{ paddingTop: contentPaddingTop + 'px' }">
      <!-- 计时器工具卡片 -->
      <view class="tool-card" @tap="navigateToTimer">
        <view class="tool-info">
          <view class="tool-title">计时器</view>
          <view class="tool-desc">精确计时，支持倒计时和正计时模式</view>
        </view>
        <view class="tool-icon">
          <TimerIcon :size="0.31" />
        </view>
      </view>
      
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted,computed } from 'vue';
import navBarHeightUtil from '../../util/navBarHeight.js';
import TimerIcon from '../../components/icons/TimerIcon.vue';
import showShareMenu from '../../util/wechatShare.js';

const navBarInfo = ref({});
// 计算内容区域的 padding-top，确保不被导航栏遮挡
const contentPaddingTop = computed(() => {
  // 导航栏总高度 + 搜索框高度 + 一些边距
  return navBarInfo.value.totalHeight + 51; 
});

// 导航到计时器页面
const navigateToTimer = () => {
  uni.navigateTo({
    url: '/pages/tools/TimerToolView'
  });
};

// 获取导航栏高度信息
onMounted(() => {
  navBarInfo.value = navBarHeightUtil.getNavBarInfo();
  showShareMenu();
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  height: 100vh;
  overflow-y: auto;
  background: linear-gradient(to bottom, #deeeff 0%, #FFFFFF 100%);
  position: relative;
}

/* 自定义导航栏样式 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  padding-left: 30rpx;
  transition: all 0.3s ease;
}

.navbar-title {
  font-size: 34rpx;
  font-weight: 500;
  color: #2c3e50;
  text-shadow: 0 1rpx 2rpx rgba(255, 255, 255, 0.7);
  opacity: 0.85;
}

.tools-container {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 0 30rpx 30rpx 30rpx;
  width: 100%;
  box-sizing: border-box;
}

/* 工具卡片样式 */
.tool-card {
  background-color: #ffffff;
  border-radius: 8rpx;
  padding: 25rpx 40rpx 25rpx 25rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 12rpx 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  min-height: 120rpx;
  border: 2px solid #ebeef5;
}

.tool-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

/* 确保容器在小程序和H5环境下都能正常显示 */
/* #ifdef MP-WEIXIN */
.tools-container {
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
}
/* #endif */

/* #ifdef H5 */
.tools-container {
  padding-bottom: 30rpx;
}
/* #endif */

.tool-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: #ffffff;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-left: 10rpx;
}

.icon {
  font-size: 50rpx;
  color: #409eff;
}

.cat-decoration {
  position: absolute;
  bottom: -5rpx;
  right: -5rpx;
  font-size: 30rpx;
  opacity: 0.8;
}

.tool-info {
  flex: 1;
}

.tool-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8rpx;
}

.tool-desc {
  font-size: 25rpx;
  color: #a0a5a5;
}

/* 响应式设计 - 小屏幕设备 */
@media screen and (max-width: 750rpx) {
  .tool-card {
    padding: 20rpx;
    min-height: 100rpx;
  }
  
  .tool-icon {
    width: 60rpx;
    height: 60rpx;
    margin-left: 15rpx;
  }
  
  .tool-title {
    font-size: 30rpx;
  }
  
  .tool-desc {
    font-size: 24rpx;
  }
}

/* 响应式设计 - 大屏幕设备 */
@media screen and (min-width: 1200rpx) {
  .tools-container {
    max-width: 900rpx;
    margin-left: auto;
    margin-right: auto;
  }
  
  .tool-card {
    padding: 30rpx;
    min-height: 140rpx;
  }
  
  .tool-icon {
    width: 100rpx;
    height: 100rpx;
    margin-left: 25rpx;
  }
  
  .tool-title {
    font-size: 36rpx;
  }
  
  .tool-desc {
    font-size: 28rpx;
  }
}
</style>
