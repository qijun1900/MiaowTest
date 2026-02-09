<template>
  <view 
    class="tools-container" 
    :style="{ paddingTop: paddingTop }">
    <!-- 循环渲染工具卡片 -->
    <view 
      v-for="(tool, index) in toolsList"
      :key="index"
      class="tool-card" 
      @tap="handleToolClick(tool)">
      <view class="tool-info">
        <view class="tool-title">{{ tool.title }}</view>
        <view class="tool-desc">{{ tool.desc }}</view>
      </view>
      <view class="tool-icon">
        <image
          :src="tool.icon"
          mode="aspectFit"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// 定义 props
const props = defineProps({
  // 工具列表数据
  toolsList: {
    type: Array,
    default: () => []
  },
  // 顶部内边距
  paddingTop: {
    type: String,
    default: '0px'
  }
});

// 定义 emits
const emit = defineEmits(['toolClick']);

// 工具点击处理
const handleToolClick = (tool) => {
  emit('toolClick', tool);
};
</script>

<style scoped>
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

.tool-icon image {
  width: 100%;
  height: 100%;
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
