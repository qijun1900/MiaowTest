<template>
  <view class="container">
    <view class="header">
      <text class="title">所有考试科目</text>
      <view class="refresh-btn" @click="handleRefresh">
        <uni-icons type="refresh" size="14" color="#ffffff"></uni-icons>
        <text class="refresh-text">刷新考试</text>
      </view>
    </view>
    
    <!-- 搜索框 -->
    <view class="search-container">
      <navigator 
        url="/pages/exam/searchview" 
        hover-class="navigator-hover" 
        animation-type="pop-in" 
        animation-duration="300">
        <uniSearch placeholder="搜索考试科目~" />
      </navigator>
    </view>
    
    <view class="exam-list">
      <view v-if="loading" class="loading">
        <uni-load-more status="loading" />
      </view>
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

    <up-divider text="已经到底了" :dashed="true"></up-divider>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getExamSubjects, clearExamSubjectsCache } from '../../API/Exam/ExamAPI';
import BackToTop from '../../components/core/BackToTop.vue';
import escconfig from '../../config/esc.config';
import { onPageScroll } from '@dcloudio/uni-app';
import formatTime from '../../util/formatTime';
import uniSearch from '../../components/core/uniSearch.vue';

// 响应式数据
const examSubjects = ref([]);
const loading = ref(false);
const backToTopRef = ref();

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
      coverImage: `http://${escconfig.serverHost}:${escconfig.serverPort}${item.cover}`,
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

// 刷新按钮点击事件
const handleRefresh = () => {
  // 清除缓存并重新获取数据
  clearExamSubjectsCache();
  fetchExamSubjects(true);
};

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
});

</script>

<style scoped lang="scss">
.container {
  padding: 20rpx;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
  padding: 0 10rpx;
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #f5f5f5;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.refresh-btn {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  background-color: #007AFF;
  border-radius: 30rpx;
  transition: background-color 0.2s ease;
  margin-bottom: 10rpx;
}

.refresh-btn:active {
  background-color: #0056b3;
}

.refresh-text {
  font-size: 24rpx;
  color: #ffffff;
  margin-left: 8rpx;
}

.search-container {
  margin-bottom: 12rpx;
}

.exam-list {
  width: 100%;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
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
  color: #999999;
  font-weight: bold;
  margin-left: 20rpx;
}
</style>