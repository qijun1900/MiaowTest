<template>
  <view class="container">
    <!-- 固定头部区域 -->
    <view class="fixed-header">
      <!-- 搜索栏 -->
      <view class="search-section">
        <view class="search-box">
          <uni-icons type="search" size="20" color="#ff9555" class="search-icon"></uni-icons>
          <input 
            class="search-input" 
            v-model="searchKeyword"
            placeholder="搜索题目内容..."
            placeholder-class="search-placeholder"
            @input="handleSearch"
          />
          <uni-icons 
            v-if="searchKeyword" 
            type="clear" 
            size="18" 
            color="#999999" 
            class="clear-icon" 
            @click="clearSearch"
          ></uni-icons>
        </view>
      </view>
      
      <!-- 分类标签栏 -->
      <view class="category-tabs">
        <scroll-view class="tabs-scroll" scroll-x :show-scrollbar="false">
          <view class="tabs-wrapper">
            <view 
              v-for="(tab, index) in tabs" 
              :key="index"
              class="tab-item"
              :class="{ 'tab-active': activeTab === tab.value }"
              @click="switchTab(tab.value)"
            >
              <text class="tab-text">{{ tab.label }}</text>
              <view v-if="tab.count !== undefined" class="tab-badge">{{ tab.count }}</view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const bookId = ref('');
const searchKeyword = ref('');
const activeTab = ref('all');

const tabs = ref([
  { label: '全部', value: 'all', count: 0 },
  { label: '选择题', value: 'select', count: 0 },
  { label: '判断题', value: 'judge', count: 0 },
  { label: '填空题', value: 'blank', count: 0 },
  { label: '简答题', value: 'short', count: 0 }
]);

const handleSearch = () => {
  // 搜索逻辑
  console.log('搜索:', searchKeyword.value);
};

const clearSearch = () => {
  searchKeyword.value = '';
  handleSearch();
};

const switchTab = (value) => {
  activeTab.value = value;
  // 切换标签逻辑
  console.log('切换到:', value);
};

onLoad(async (options) => {
  if (options.id) {
    bookId.value = options.id;
  } else {
    uni.showToast({
      title: '参数错误',
      icon: 'error'
    });
    setTimeout(() => uni.navigateBack(), 1000);
  }
});
</script>
<style scoped>
.container {
  min-height: 100vh;
  background: #fff9f2;
}

.fixed-header {
  position: sticky;
  top: 0;
  background: #fff9f2;
  flex-shrink: 0;
  z-index: 100;
  padding-bottom: 8rpx;
}

/* 搜索栏样式 */
.search-section {
  padding: 24rpx 32rpx 16rpx;
}

.search-box {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 48rpx;
  padding: 20rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 149, 85, 0.08);
  border: 2rpx solid #ffe8d6;
}

.search-icon {
  margin-right: 16rpx;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  height: 40rpx;
  line-height: 40rpx;
}

.search-placeholder {
  color: #cccccc;
}

.clear-icon {
  padding: 8rpx;
  margin-right: -8rpx;
  display: flex;
  align-items: center;
  cursor: pointer;
}

/* 分类标签栏样式 */
.category-tabs {
  padding: 0 32rpx;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-wrapper {
  display: inline-flex;
  gap: 16rpx;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  padding: 16rpx 32rpx;
  background: #ffffff;
  border-radius: 40rpx;
  border: 2rpx solid #ffe8d6;
  transition: all 0.3s ease;
  position: relative;
}

.tab-item.tab-active {
  background: #ff9555;
  border-color: #ff9555;
  box-shadow: 0 4rpx 12rpx rgba(255, 149, 85, 0.25);
}

.tab-text {
  font-size: 28rpx;
  color: #666666;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.tab-active .tab-text {
  color: #ffffff;
  font-weight: 500;
}

.tab-badge {
  margin-left: 8rpx;
  background: #ffe8d6;
  color: #ff9555;
  font-size: 22rpx;
  padding: 2rpx 12rpx;
  border-radius: 20rpx;
  min-width: 32rpx;
  text-align: center;
  font-weight: 500;
}

.tab-active .tab-badge {
  background: rgba(255, 255, 255, 0.3);
  color: #ffffff;
}
</style>