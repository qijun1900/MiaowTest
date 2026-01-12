<template>
  <view class="container">
    <!-- 使用PageHead组件 -->
    <PageHead 
      ref="pageHeadRef"
      title="所有工具" 
    />
    <!-- TODO 工具拖拽 -->
     
    <!-- 工具列表区域 -->
    <view 
      class="tools-container" 
      :style="{ paddingTop: pageHeadRef?.contentPaddingTop + 10 +'px' }">
      <!-- 计时器工具卡片 -->
      <view 
        class="tool-card" 
        @tap="navigateToTimer">
        <view class="tool-info">
          <view class="tool-title">计时器</view>
          <view class="tool-desc">精确计时，支持倒计时和正计时模式</view>
        </view>
        <view class="tool-icon">
          <image
            src="/static/tools/tools-timer.png"
            mode="aspectFit"
          />
        </view>
      </view>
      <!-- 计划日程表 -->
      <view 
        class="tool-card" 
        @click="navigateToTodo">
        <view class="tool-info">
          <view class="tool-title">TODO</view>
          <view class="tool-desc">记录待办事项，管理学习任务，制定学习计划</view>
        </view>
        <view class="tool-icon">
          <image
            src="/static/tools/tools-todo.png"
            mode="aspectFit"
          />
        </view>
      </view>
      <!-- 喵喵单词 -->
      <view 
        class="tool-card" 
        @click="navigateToWords">
        <view class="tool-info">
          <view class="tool-title">喵喵单词</view>
          <view class="tool-desc">
            单词记忆工具，帮助你快速学习单词
          </view>
        </view>
        <view class="tool-icon">
          <image
            src="/static/tools/tools-words.png"
            mode="aspectFit"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import PageHead from '../../components/core/PageHead.vue';
import showShareMenu from '../../util/wechatShare.js';
import checkLogin from '../../util/checkLogin.js';

const pageHeadRef = ref();

// 导航到计时器页面
const navigateToTimer = () => {
  uni.navigateTo({
    url: '/pages/tools/TimerToolView'
  });
};
// 导航到TODO页面
const navigateToTodo = async () => {
  const isLoggedIn = await checkLogin("请登录后再操作");
  if (!isLoggedIn) return;
  
  uni.navigateTo({
    url: '/pages/tools/TodoToolView'
  });
};
// 导航到喵喵单词页面
const navigateToWords = async () => {
  const isLoggedIn = await checkLogin("请登录后再操作");
  if (!isLoggedIn) return;

  uni.navigateTo({
    url: '/pages/tools/WordsToolView'
  });
};

// 页面加载时执行
onMounted(() => {
  //#ifdef MP-WEIXIN
  showShareMenu();
  //#endif
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
