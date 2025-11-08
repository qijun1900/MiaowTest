<template>
  <view class="custom-navbar" :style="{ paddingTop: navBarInfo.statusBarHeight + 'px' }">
    <view class="navbar-content" :style="{ height: navBarInfo.navBarHeight + 'px' }">
      <!-- #ifdef H5 -->
      <view class="nav-left">
        <text class="nav-title">{{ title }}</text>
      </view>
      <view class="nav-right">
        <view 
          v-if="showRefresh" 
          class="refresh-btn" 
          @click="handleRefresh" 
          :class="{ 'refreshing': loading }">
          <uni-icons type="refreshempty" size="14" color="#ffffff" :class="{ 'rotating': loading }"></uni-icons>
          <text class="refresh-text">{{ refreshText }}</text>
        </view>
        <slot name="right-content"></slot>
      </view>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <view class="nav-center">
        <text class="nav-title">{{ title }}</text>
      </view>
      <!-- #endif -->
    </view>
    
    <!-- 搜索框集成到头部中 -->
    <view v-if="showSearch" class="search-container">
      <navigator 
        :url="searchUrl" 
        hover-class="none" 
        animation-type="pop-in" 
        animation-duration="300">
        <uniSearch :placeholder="searchPlaceholder" />
      </navigator>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import uniSearch from './uniSearch.vue';
import navBarHeightUtil from '../../util/navBarHeight';

// 组件属性定义
const props = defineProps({
  // 导航栏标题
  title: {
    type: String,
    default: '标题'
  },
  // 是否显示刷新按钮
  showRefresh: {
    type: Boolean,
    default: false
  },
  // 刷新按钮文本
  refreshText: {
    type: String,
    default: '刷新'
  },
  // 是否显示搜索框
  showSearch: {
    type: Boolean,
    default: false
  },
  // 搜索框占位符
  searchPlaceholder: {
    type: String,
    default: '搜索...'
  },
  // 搜索页面路径
  searchUrl: {
    type: String,
    default: '/pages/public/searchview'
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  }
});

// 自定义事件
const emit = defineEmits(['refresh']);

// 导航栏信息
const navBarInfo = ref(navBarHeightUtil.getNavBarInfo());

// 刷新处理
const handleRefresh = () => {
  emit('refresh');
};

// 计算内容区域的 padding-top，确保不被导航栏遮挡
const contentPaddingTop = computed(() => {
  // 导航栏总高度 + 搜索框高度 + 一些边距
  return navBarInfo.value.totalHeight + (props.showSearch ? 80 : 0);
});

// 暴露给父组件的方法和数据
defineExpose({
  contentPaddingTop
});
</script>

<style scoped lang="scss">
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  // 根据规范，使用匹配的多段式渐变色，确保无缝过渡
  background: linear-gradient(135deg, 
    #E0F2FF 0%,
    #E8F4FF 25%, 
    #F0F8FF 50%, 
    #F8FCFF 75%,
    #FCFEFF 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.3);
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20rpx;
}

/* #ifdef H5 */
.nav-left {
  flex: 1;
}

.nav-right {
  display: flex;
  align-items: center;
}

// 根据规范，刷新采用与主题色匹配的三段渐变背景
.refresh-btn {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, #007AFF 0%, #0056b3 50%, #003d82 100%);
  border-radius: 30rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3), 
              inset 0 1rpx 0 rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  
  // 流光动画效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.4), 
      transparent);
    transition: left 0.5s ease;
  }
  
  // 点击按压效果
  &:active {
    transform: scale(0.95) translateY(1rpx);
    box-shadow: 0 2rpx 6rpx rgba(0, 122, 255, 0.2), 
                inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
                
    &::before {
      left: 100%;
    }
  }
  
  // 加载状态样式
  &.refreshing {
    opacity: 0.8;
    pointer-events: none;
  }
}

.refresh-text {
  font-size: 24rpx;
  color: #ffffff;
  margin-left: 8rpx;
  font-weight: 500;
}

// 旋转动画
.rotating {
  animation: rotate360 1s linear infinite;
}

@keyframes rotate360 {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
/* #endif */

/* #ifndef H5 */
.nav-center {
  flex: 1;
  text-align:left;
}
/* #endif */

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

// 搜索框样式（集成在导航栏中）
.search-container {
  padding: 0 20rpx 20rpx 20rpx;
}
</style>