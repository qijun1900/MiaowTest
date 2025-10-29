<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="{ paddingTop: navBarInfo.statusBarHeight + 'px' }">
      <view class="navbar-content" :style="{ height: navBarInfo.navBarHeight + 'px' }">
        <!-- #ifdef H5 -->
        <view class="nav-left">
          <text class="nav-title">所有考试科目</text>
        </view>
        <view class="nav-right">
          <view class="refresh-btn" @click="handleRefresh" :class="{ 'refreshing': loading }">
            <uni-icons type="refreshempty" size="14" color="#ffffff" :class="{ 'rotating': loading }"></uni-icons>
            <text class="refresh-text">刷新考试</text>
          </view>
        </view>
        <!-- #endif -->
        <!-- #ifndef H5 -->
        <view class="nav-center">
          <text class="nav-title">所有考试科目</text>
        </view>
        <!-- #endif -->
      </view>
      
      <!-- 搜索框集成到头部中 -->
      <view class="search-container">
        <navigator 
          url="/pages/public/searchview" 
          hover-class="none" 
          animation-type="pop-in" 
          animation-duration="300">
          <uniSearch placeholder="搜索考试科目~" />
        </navigator>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content" :style="{ paddingTop: contentPaddingTop + 'px' }">
      <!-- 考试列表 -->
      <view class="exam-list">
        <ThemeLoading v-if="loading" text="正在加载考试科目..." />
        <view v-else class="subject-list">
          <view 
            v-for="subject in examSubjects" 
            :key="subject._id" 
            class="subject-item"
            @click="handleSubjectClick(subject)"
          >
            <view class="subject-icon">
              <image 
                :src="subject.coverImage " 
                mode="aspectFill"
                class="subject-image"
              />
            </view>
            <view class="subject-info">
              <text class="subject-name">{{ subject.name }}</text>
              <text class="update-time">更新时间:{{ formatTime.getTime2(subject.updateTime) }}</text>
            </view>
            <view class="subject-arrow">›</view>
          </view>
        </view>
      </view>
      
      <!-- 回到顶部组件 -->
      <BackToTop 
        ref="backToTopRef" 
        position="bottom-right"/>
      <up-divider text="已经到底了" :dashed="true" v-if="examSubjects.length>0 && !loading"></up-divider>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getExamSubjects, clearExamSubjectsCache } from '../../API/Exam/ExamAPI';
import BackToTop from '../../components/core/BackToTop.vue';
import escconfig from '../../config/esc.config';
import { onPageScroll, onPullDownRefresh } from '@dcloudio/uni-app';
import formatTime from '../../util/formatTime';
import uniSearch from '../../components/core/uniSearch.vue';
import ThemeLoading from '../../components/core/ThemeLoading.vue';
import navBarHeightUtil from '../../util/navBarHeight';
import showShareMenu from '../../util/wechatShare.js';

// 响应式数据
const examSubjects = ref([]);
const loading = ref(false);
const backToTopRef = ref();
const navBarInfo = ref(navBarHeightUtil.getNavBarInfo());

// 计算内容区域的 padding-top，确保不被导航栏遮挡
const contentPaddingTop = computed(() => {
  // 导航栏总高度 + 搜索框高度 + 一些边距
  return navBarInfo.value.totalHeight + 80; // 80rpx 是搜索框高度 + 边距
});

/**
 * 获取考试科目数据
 * @param {boolean} forceRefresh 是否强制刷新
 */
const fetchExamSubjects = async (forceRefresh = false) => {
  loading.value = true;
  try {
    const data = await getExamSubjects(forceRefresh);
    examSubjects.value = data.data.map(item => ({
      id: item._id,
      name: item.name,
      coverImage: `${escconfig.useTunnel ? escconfig.tunnelUrl : `http://${escconfig.serverHost}:${escconfig.serverPort}`}${item.cover}`,
      updateTime: item.createdTime,
      ...item
    }));
  } catch (error) {
    console.error('获取考试科目失败:', error);
    uni.showToast({
      title: '获取考试科目失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

const handleSubjectClick = (subject) => {
  // 跳转到考试详情页，传递完整科目数据作为参数
  uni.navigateTo({
    url: `/pages/exam/subjectdetailview?data=${encodeURIComponent(JSON.stringify(subject))}`
  });
};

// #ifdef H5
// H5端刷新
const handleRefresh = async () => {
  // 清除缓存并重新获取数据
  clearExamSubjectsCache();
  await fetchExamSubjects(true);
};
// #endif

// 下拉刷新事件
onPullDownRefresh(async () => {
  // 清除缓存并重新获取数据
  clearExamSubjectsCache();
  await fetchExamSubjects(true);
  // 停止下拉刷新动画
  uni.stopPullDownRefresh();
});

// 页面滚动事件
onPageScroll((e) => {
  // 调用BackToTop组件的滚动处理方法
  if (backToTopRef.value) {
    backToTopRef.value.handlePageScroll(e);
  }
});

// 页面加载时获取数据
onMounted(() => {
  fetchExamSubjects();
  showShareMenu(); // 显示分享菜单
});

</script>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  background-color: #F8F8F8;
}

// 自定义导航栏样式
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

// 内容区域样式
.content {
  padding: 0 20rpx 20rpx 20rpx;
}

.exam-list {
  width: 100%;
}

.subject-list {
  width: 100%;
}

.subject-item {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 29rpx;
  margin-bottom: 13rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.subject-item:active {
  transform: scale(0.98);
}

.subject-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 30rpx;
  flex-shrink: 0;
  overflow: hidden;
}

.subject-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.subject-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.subject-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.update-time {
  font-size: 24rpx;
  color: #999999;
}

.subject-arrow {
  font-size: 32rpx;
  color: #007AFF;
  font-weight: bold;
  margin-left: 20rpx;
}
</style>