<template>
  <view class="container">
    <!-- 自定义导航栏组件 -->
    <PageHead
      ref="pageHeadRef"
      title="所有考试科目" 
      :show-refresh="true"
      refresh-text="刷新考试"
      :show-search="true"
      search-placeholder="搜索考试科目~"
      :loading="loading"
      @refresh="handleRefresh"
    />
    
    <!-- 内容区域 -->
    <view class="content" :style="{ paddingTop: pageHeadRef?.contentPaddingTop + 'px' }">
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
      <up-divider 
        text="已经到底了" 
        :dashed="true" 
        v-if="examSubjects.length>0 && !loading">
      </up-divider>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getExamSubjects, clearExamSubjectsCache } from '../../API/Exam/ExamAPI';
import BackToTop from '../../components/core/BackToTop.vue';
import PageHead from '../../components/core/PageHead.vue';
import escconfig from '../../config/esc.config';
import { onPageScroll, onPullDownRefresh } from '@dcloudio/uni-app';
import formatTime from '../../util/formatTime';
import ThemeLoading from '../../components/core/ThemeLoading.vue';
import showShareMenu from '../../util/wechatShare.js';
import checkLogin  from '../../util/checkLogin.js';

// 响应式数据
const examSubjects = ref([]);
const loading = ref(false);
const backToTopRef = ref();
const pageHeadRef = ref();

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

const handleSubjectClick = async (subject) => {
  // 跳转到考试详情页，传递完整科目数据作为参数
  const isLoggedIn = await checkLogin("请登录后再操作");
  if (!isLoggedIn) {
    return;
  }
  uni.navigateTo({
    url: `/pages/exam/subjectdetailview?data=${encodeURIComponent(JSON.stringify(subject))}`
  });
};

// #ifdef H5
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