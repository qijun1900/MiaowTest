<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" 
      :style="{ height: navBarInfo.totalHeight + 'px', paddingTop: navBarInfo.statusBarHeight + 'px' }">
      <!-- 导航栏标题 -->
      <view class="navbar-title">所有工具</view>
    </view>
    
    <!-- 工具列表区域 -->
    <view class="tools-container" :style="{ marginTop: (navBarInfo.totalHeight + 20) + 'px' }">
      <!-- 工具分类卡片 -->

    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import navBarHeightUtil from '../../util/navBarHeight.js';

const navBarInfo = ref({});

// 获取导航栏高度信息
onMounted(() => {
  navBarInfo.value = navBarHeightUtil.getNavBarInfo();
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  height: 100vh;
  overflow-y: auto;
  background: linear-gradient(to bottom, #c1e0ff 0%, #FFFFFF 100%);
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
  padding-bottom: 30rpx;
}
</style>
