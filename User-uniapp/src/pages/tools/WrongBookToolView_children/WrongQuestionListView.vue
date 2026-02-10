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

    <!-- 错题列表 -->
    <view class="question-list">
      <view 
        v-for="(item, index) in questionList" 
        :key="index"
        class="question-card"
      >
        <!-- 卡片头部 -->
        <view class="card-header">
          <view class="tags-row">
            <view 
              v-for="(tag, tagIndex) in item.tags" 
              :key="tagIndex"
              class="tag"
              :class="`tag-${tag.type}`"
            >
              {{ tag.text }}
            </view>
            <view class="status-tag" :class="`status-${item.status}`">
              {{ item.statusText }}
            </view>
          </view>
        </view>

        <!-- 题目内容 -->
        <view class="question-content">
          <text class="question-text">{{ item.question }}</text>
        </view>

        <!-- 日期和复习次数 -->
        <view class="question-meta">
          <text class="meta-text">{{ item.date }} · 复习 {{ item.reviewCount }} 次</text>
          <view class="answer-status" @click="toggleAnswer(index)">
            <text :class="item.showAnswer ? 'status-show' : 'status-hide'">
              {{ item.showAnswer ? '收起答案' : '查看答案' }}
            </text>
            <uni-icons 
              :type="item.showAnswer ? 'up' : 'down'" 
              size="14" 
              :color="item.showAnswer ? '#67c23a' : '#909399'"
            ></uni-icons>
          </view>
        </view>

        <!-- 答案区域（可展开） -->
        <view v-if="item.showAnswer" class="answer-section">
          <!-- 我的错误答案 -->
          <view class="answer-title">我的错解</view>
          <view class="answer-block wrong-answer">
            <text class="answer-text">{{ item.wrongAnswer }}</text>
          </view>

          <!-- 正确答案 -->
          <view class="answer-title">正确答案</view>
          <view class="answer-block correct-answer">
            <text class="answer-text">{{ item.correctAnswer }}</text>
          </view>

          <!-- 解析/笔记 -->
          <view v-if="item.note" class="note-wrapper">
            <view class="answer-title">解析 / 笔记</view>
            <view class="note-block">
              <text class="note-text">{{ item.note }}</text>
            </view>
          </view>
        </view>

        <!-- 底部操作栏 -->
        <view class="card-footer">
          <view class="footer-left">
            <uni-icons type="trash" size="18" color="#909399"></uni-icons>
            <text class="footer-text">删除</text>
          </view>
          <view class="footer-right">
            <view class="footer-btn" @click="reviewQuestion(item)">
              <text class="btn-text">查看习题</text>
            </view>
            <view 
              class="footer-btn primary" 
              :class="{ 'disabled': item.status === 'mastered' }"
              @click="markAsMastered(item)"
            >
              <text class="btn-text">{{ item.status === 'mastered' ? '已掌握' : '已掌握' }}</text>
            </view>
          </view>
        </view>
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
  { label: '全部', value: 'all', count: 5 },
  { label: '选择题', value: 'select', count: 2 },
  { label: '判断题', value: 'judge', count: 0 },
  { label: '填空题', value: 'blank', count: 1 },
  { label: '简答题', value: 'short', count: 2 }
]);

// 假数据
const questionList = ref([
  {
    id: 1,
    tags: [
      { text: '数学', type: 'blue' },
      { text: '简单', type: 'green' },
      { text: '#代数', type: 'gray' },
      { text: '#一元二次', type: 'gray' }
    ],
    status: 'reviewing',
    statusText: '已复习',
    question: '解方程: 2x + 5 = 15',
    date: '2023/10/01',
    reviewCount: 3,
    showAnswer: false,
    wrongAnswer: 'x = 10',
    correctAnswer: 'x = 5',
    note: '两边同时减去5得到 2x = 10，然后除以2。'
  },
  {
    id: 2,
    tags: [
      { text: '数学', type: 'blue' },
      { text: '中等', type: 'yellow' },
      { text: '#微积分', type: 'gray' },
      { text: '#导数', type: 'gray' }
    ],
    status: 'reviewing',
    statusText: '复习中',
    question: 'f(x) = x^2 的导数是多少？',
    date: '2023/10/05',
    reviewCount: 1,
    showAnswer: false,
    wrongAnswer: 'f\'(x) = x',
    correctAnswer: 'f\'(x) = 2x',
    note: '幂函数求导公式：x^n 的导数是 n·x^(n-1)'
  },
  {
    id: 3,
    tags: [
      { text: '英语', type: 'red' },
      { text: '简单', type: 'green' },
      { text: '#语法', type: 'gray' },
      { text: '#一般一致', type: 'gray' }
    ],
    status: 'new',
    statusText: '新题',
    question: '找出错误: "She don\'t like apples."',
    date: '2023/10/10',
    reviewCount: 0,
    showAnswer: false,
    wrongAnswer: 'apples 应该是 apple',
    correctAnswer: 'don\'t 应该改为 doesn\'t',
    note: '第三人称单数用 doesn\'t，不用 don\'t。'
  },
  {
    id: 4,
    tags: [
      { text: '物理', type: 'purple' },
      { text: '中等', type: 'yellow' },
      { text: '#力学', type: 'gray' },
      { text: '#牛顿定律', type: 'gray' }
    ],
    status: 'reviewing',
    statusText: '复习中',
    question: '牛顿第二定律是什么？',
    date: '2023/10/12',
    reviewCount: 0,
    showAnswer: false,
    wrongAnswer: 'F = ma^2',
    correctAnswer: 'F = ma',
    note: '力等于质量乘以加速度，这是牛顿第二定律的基本表达式。'
  }
]);

const handleSearch = () => {
  console.log('搜索:', searchKeyword.value);
};

const clearSearch = () => {
  searchKeyword.value = '';
  handleSearch();
};

const switchTab = (value) => {
  activeTab.value = value;
  console.log('切换到:', value);
};

const toggleAnswer = (index) => {
  questionList.value[index].showAnswer = !questionList.value[index].showAnswer;
};

const reviewQuestion = (item) => {
  console.log('查看习题:', item.id);
  uni.showToast({
    title: '查看习题',
    icon: 'none'
  });
};

const markAsMastered = (item) => {
  if (item.status === 'mastered') return;
  
  item.status = 'mastered';
  item.statusText = '已掌握';
  uni.showToast({
    title: '已标记为掌握',
    icon: 'success'
  });
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
  padding-top: 0;
}

.fixed-header {
  position: sticky;
  top: 0;
  background: #fff9f2;
  z-index: 100;
  padding-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(255, 149, 85, 0.05);
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

/* 错题列表样式 */
.question-list {
  padding: 24rpx 32rpx;
}

.question-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 149, 85, 0.06);
  border: 2rpx solid #ffe8d6;
}

/* 卡片头部 */
.card-header {
  margin-bottom: 20rpx;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  align-items: center;
}

.tag {
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.tag-blue {
  background: #e3f2fd;
  color: #2196f3;
}

.tag-green {
  background: #e8f5e9;
  color: #4caf50;
}

.tag-yellow {
  background: #fff8e1;
  color: #ffa726;
}

.tag-red {
  background: #ffebee;
  color: #f44336;
}

.tag-purple {
  background: #f3e5f5;
  color: #9c27b0;
}

.tag-gray {
  background: #f5f5f5;
  color: #757575;
}

.status-tag {
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  font-weight: 500;
  margin-left: auto;
}

.status-new {
  background: #fff3e0;
  color: #ff9800;
}

.status-reviewing {
  background: #e3f2fd;
  color: #2196f3;
}

.status-mastered {
  background: #e8f5e9;
  color: #4caf50;
}

/* 题目内容 */
.question-content {
  margin-bottom: 20rpx;
}

.question-text {
  font-size: 30rpx;
  color: #333333;
  line-height: 1.6;
}

/* 元信息 */
.question-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.meta-text {
  font-size: 24rpx;
  color: #999999;
}

.answer-status {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
  cursor: pointer;
}

.status-show {
  font-size: 24rpx;
  color: #67c23a;
}

.status-hide {
  font-size: 24rpx;
  color: #909399;
}

/* 答案区域 */
.answer-section {
  margin-top: 24rpx;
}

.answer-title {
  font-size: 28rpx;
  color: #333333;
  font-weight: 600;
  margin-bottom: 16rpx;
  margin-top: 28rpx;
}

.answer-title:first-child {
  margin-top: 0;
}

.answer-block {
  padding: 24rpx 32rpx;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
  position: relative;
  padding-left: 40rpx;
}

.answer-block::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8rpx;
  border-radius: 12rpx 0 0 12rpx;
}

.wrong-answer {
  background: #fef0f0;
}

.wrong-answer::before {
  background: #f56c6c;
}

.correct-answer {
  background: #f0f9ff;
}

.correct-answer::before {
  background: #67c23a;
}

.answer-text {
  font-size: 28rpx;
  line-height: 1.8;
  color: #333333;
}

/* 笔记区域 */
.note-wrapper {
  margin-top: 28rpx;
}

.note-block {
  padding: 20rpx 28rpx;
  background: #fafafa;
  border-radius: 12rpx;
  border-left: 4rpx solid #e0e0e0;
}

.note-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.8;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #f5f5f5;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
  cursor: pointer;
}

.footer-text {
  font-size: 24rpx;
  color: #909399;
}

.footer-right {
  display: flex;
  gap: 16rpx;
}

.footer-btn {
  padding: 12rpx 28rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
  cursor: pointer;
}

.footer-btn.primary {
  background: #ff9555;
}

.footer-btn.primary.disabled {
  background: #e8f5e9;
}

.footer-btn .btn-text {
  font-size: 24rpx;
  color: #666666;
}

.footer-btn.primary .btn-text {
  color: #ffffff;
}

.footer-btn.primary.disabled .btn-text {
  color: #4caf50;
}
</style>