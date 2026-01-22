<template>
  <view class="container">
    <!-- 固定头部区域 -->
    <view class="fixed-header">
      <!-- 搜索栏 -->
      <view class="search-section">
        <uniSearch placeholder="搜索单词" v-model="searchText"/>
      </view>

      <!-- 分类标签栏 -->
      <!-- <scroll-view 
        class="category-scroll" 
        scroll-x 
        show-scrollbar="false">
        <view class="category-container">
          <view 
            v-for="(category, index) in categories" 
            :key="index"
            :class="['category-item', { 'category-active': activeCategory === category }]"
            @click="selectCategory(category)"
          >
            <text class="category-text">{{ category }}</text>
          </view>
        </view>
      </scroll-view> -->
    </view>

    <!-- 单词列表 -->
    <scroll-view 
      class="word-list-container" 
      scroll-y 
      @scrolltolower="loadMore"
      show-scrollbar="false">
      <!-- 单词卡片 -->
      <view 
        v-for="(word, index) in filteredWords" 
        :key="index"
        class="word-card"
      >
        <!-- 单词标题行 -->
        <view class="word-title-row">
          <text class="word-name">{{ word.headWord }}</text>
          <view 
            class="audio-btn" 
            @click="playAudio(word)">
            <uni-icons
              color="#9ca3af" 
              type="sound-filled" 
              size="30"></uni-icons>
          </view>
        </view>

        <!-- 音标和词性行 -->
        <view class="word-info-row">
          <text class="word-phonetic">{{ word.phonetic }}</text>
          <view class="word-type-badge">
            <text class="word-type-text">{{ word.pos }}</text>
          </view>
        </view>

        <!-- 中文翻译 -->
        <view class="word-translation-row">
          <text class="word-translation">{{ word.cn }}</text>
        </view>

        <!-- 英文释义 -->
        <view class="word-definition-row">
          <text class="word-definition">{{ word.en }}</text>
        </view>

        <!-- 例句 -->
        <view class="word-example-row">
          <text class="word-example">"{{ word.sentence }}"</text>
        </view>

        <!-- 标签组 -->
        <view class="word-tags-row">
          <view 
            v-for="(tag, tagIndex) in word.tags" 
            :key="tagIndex"
            class="word-tag"
          >
            <text class="tag-icon">🏷️</text>
            <text class="tag-text">{{ tag }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态提示 -->
      <view v-if="filteredWords.length === 0 && !isLoading" class="empty-state">
        <text class="empty-icon">📚</text>
        <text class="empty-text">暂无单词</text>
      </view>

      <!-- 加载中 -->
      <view v-if="isLoading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 没有更多数据 -->
      <view v-if="!hasMore && filteredWords.length > 0" class="no-more-state">
        <text class="no-more-text">没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import uniSearch from '../../../components/core/uniSearch.vue';
import { WordBookListAPI } from '../../../API/Vocabulary/WordBooksAPI';

// 搜索文本
const searchText = ref('');
//  当前选中的分类
// const activeCategory = ref('All');
// 分类列表
// const categories = ref(['All']);

// 单词数据
const words = ref([]);

// 分页状态
const bookId = ref('');
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const hasMore = ref(true);
const isLoading = ref(false);

// 过滤后的单词列表
const filteredWords = computed(() => {
  let result = words.value;
    
  // // 按分类过滤  
  // if (activeCategory.value !== 'All') {
  //   result = result.filter(word => 
  //     word.tags && word.tags.includes(activeCategory.value)
  //   );
  // }
  
  // // 按搜索文本过滤
  // if (searchText.value.trim()) {
  //   const search = searchText.value.toLowerCase().trim();
  //   result = result.filter(word => 
  //     word.headword.toLowerCase().includes(search) ||
  //     word.cn.includes(search) ||
  //     word.en.toLowerCase().includes(search)
  //   );
  // }
  
  return result;
});

// TODO 选择分类
// const selectCategory = (category) => {
//   activeCategory.value = category;
// };

// 播放音频
const playAudio = (word) => {
  uni.showToast({
    title: `播放: ${word.word}`,
    icon: 'none',
    duration: 1500
  });
};

// 加载单词数据
const loadWords = async () => {
  if (isLoading.value || !hasMore.value) return;

  isLoading.value = true;

  try {
    const res = await WordBookListAPI(bookId.value, page.value, pageSize.value);

    if (res.code === 200) {
      const { list, total: totalCount, hasMore: hasMoreData } = res.data;

      if (page.value === 1) {
        words.value = list;
      } else {
        words.value = [...words.value, ...list];
      }

      total.value = totalCount;
      hasMore.value = hasMoreData;

      console.log('单词书数据:', res);
    }
  } catch (err) {
    console.error('加载单词书失败:', err);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
  }
};

// 加载更多
const loadMore = () => {
  if (!isLoading.value && hasMore.value) {
    page.value++;
    loadWords();
  }
};

// 页面加载
onLoad((options) => {
  if (options && options.bookId) {
    bookId.value = options.bookId;
    page.value = 1;
    loadWords();
  }
});
</script>
<style scoped>
/* 容器 */
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: #f7f8fa;
}

/* ========== 固定头部区域 ========== */
.fixed-header {
  position: sticky; 
  /* 
  固定在顶部
  - fixed 会脱离文档流 → 需手动添加padding避免遮挡
  - sticky 保留文档流 → 自动无遮挡问题
  */
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: #ffffff;
}

/* ========== 搜索栏区域 ========== */
.search-section {
  padding: 10rpx 12rpx 6rpx 12rpx;
  background-color: #ffffff;
}

/* ========== 分类标签栏 ========== */
.category-scroll {
  background-color: #ffffff;
  white-space: nowrap;
  border-bottom: 2rpx solid #f0f0f0;
}

.category-container {
  display: inline-flex;
  padding: 12rpx 32rpx 20rpx; 
}

.category-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14rpx 36rpx;
  margin-right: 16rpx;
  border-radius: 48rpx;
  background-color: #f5f5f5;
  transition: all 0.3s ease;
}

.category-item:last-child {
  margin-right: 0;
}

.category-active {
  background-color: #2979ff;
}

.category-text {
  font-size: 28rpx;
  color: #666666;
  white-space: nowrap;
}

.category-active .category-text {
  color: #ffffff;
  font-weight: 500;
}

/* ========== 单词列表区域 ========== */
.word-list-container {
  flex: 1;
  height: 0;
  padding: 24rpx 30rpx 40rpx;
  box-sizing: border-box;
}

/* 单词卡片 */
.word-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 18rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  width: 100%;
  box-sizing: border-box;
}

/* 单词标题行 */
.word-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8rpx;
  width: 100%;
}

.word-name {
  font-size: 42rpx;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
  padding-right: 16rpx;
}

.audio-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  margin-left: 16rpx;
  flex-shrink: 0;
  background-color: #f5f5f5;
  border-radius: 50%;
}


/* 音标和词性行 */
.word-info-row {
  display: flex;
  align-items: center;
  margin-bottom: 14rpx;
}

.word-phonetic {
  font-size: 30rpx;
  color: #666666;
  margin-right: 16rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

.word-type-badge {
  padding: 4rpx 16rpx;
  background-color: #e3f2fd;
  border-radius: 8rpx;
}

.word-type-text {
  font-size: 24rpx;
  color: #2979ff;
  font-weight: 600;
}

/* 中文翻译行 */
.word-translation-row {
  margin-bottom: 16rpx;
}

.word-translation {
  font-size: 36rpx;
  color: #1a1a1a;
  font-weight: 700;
  line-height: 1.4;
}

/* 英文释义行 */
.word-definition-row {
  margin-bottom: 16rpx;
}

.word-definition {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
}

/* 例句行 */
.word-example-row {
  margin-bottom: 14rpx;
  padding: 12rpx 15rpx;
  background-color: #ffffff;
  border-radius: 4rpx;
  border-left: 6rpx solid #e0e0e0;
}

.word-example {
  font-size: 26rpx;
  font-weight: 550;
  color: #888888;
  font-style: italic;
  line-height: 1.6;
}

/* 标签行 */
.word-tags-row {
  display: flex;
  flex-wrap: wrap; 
  gap: 12rpx;
}

.word-tag {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 32rpx;
  border: 2rpx solid #e8e8e8;
}

.tag-icon {
  font-size: 24rpx;
  margin-right: 6rpx;
}

.tag-text {
  font-size: 24rpx;
  color: #666666;
}

/* ========== 空状态 ========== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}

/* ========== 加载中 ========== */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999999;
}

/* ========== 没有更多 ========== */
.no-more-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}

.no-more-text {
  font-size: 24rpx;
  color: #cccccc;
}
</style>
