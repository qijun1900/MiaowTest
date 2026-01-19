<template>
  <view class="container">
    <view class="content">
      <!-- 当前正在学习的词书卡片 -->
      <view class="current-book-card">
        <view class="current-header">
          <text class="current-label">当前正在学习</text>
        </view>
        <view class="current-content">
          <view class="current-book-cover-wrapper">
            <image 
              src="https://camo.githubusercontent.com/6aee9290f9f24d62fd55c02efbd8e5b36d0cdbce43bce50f6e281b42f41b208a/68747470733a2f2f6e6f732e6e6574656173652e636f6d2f79647363686f6f6c2d6f6e6c696e652f31343936363332373237323030434554346c75616e5f312e6a7067" 
              class="current-book-cover" 
              mode="aspectFill"
            />
          </view>
          <view class="current-book-info">
            <text class="current-book-title">雅思核心词汇</text>
            <view class="current-stats">
              <view class="stat-item">
                <text class="stat-value">3500</text>
                <text class="stat-label">词</text>
              </view>
              <view class="stat-divider"></view>
              <view class="stat-item">
                <text class="stat-label">词书总量</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="setting-card">
        <view class="card-header">
          <view class="header-icon">
            <uni-icons type="bars" size="25" color="#2196F3"></uni-icons>
          </view>
          <text class="card-title">所有词书</text>
        </view>

        <view class="book-selector">
          <scroll-view scroll-y class="book-list">
            <ThemeLoading v-if="loading" text="正在加载词书..."/>
            <view 
              v-else
              v-for="(book) in wordBooks" :key="book._id" class="book-option"
              :class="{ active: selectedBook && selectedBook._id === book._id }" @click="selectBook(book)">
              <view class="book-cover-wrapper">
                <image 
                :src="baseImageUrl + book.cover" 
                class="book-cover" mode="aspectFill"/>
              </view>
              <view class="book-info">
                <text class="book-title">{{ book.title }}</text>
                <view class="book-meta">
                  <view class="meta-item">
                    <uni-icons type="compose" size="16" color="#999"></uni-icons>
                    <text class="meta-text">{{ book.words }}词</text>
                  </view>
                  <view class="tags-wrapper">
                    <view v-for="(tag, tagIndex) in book.tags" :key="tagIndex" class="book-tag">
                      {{ tag }}
                    </view>
                  </view>
                </view>
              </view>
              <view class="check-icon">
                <uni-icons :type="selectedBook && selectedBook._id === book._id ? 'checkbox-filled' : 'circle'"
                  size="24" :color="selectedBook && selectedBook._id === book._id ? '#2196F3' : '#ddd'" />
              </view>
            </view>

            <view v-if="wordBooks.length === 0" class="empty-state">
              <image class="empty-image" src="/static/other/empty.png" mode="aspectFit" />
              <text class="empty-text">暂无词书</text>
            </view>
          </scroll-view>
        </view>
      </view>

      <view class="setting-card">
        <view class="card-header">
          <view class="header-icon">
            <uni-icons type="flag-filled" size="29" color="#FF9800"></uni-icons>
          </view>
          <text class="card-title">每日目标</text>
        </view>

        <view class="goal-section">
          <view class="goal-preview">
            <text class="goal-number">{{ dailyGoal }}</text>
            <text class="goal-unit">词/天</text>
          </view>

          <view class="slider-container">
            <view class="goal-options">
              <view v-for="goal in goalOptions" :key="goal" class="goal-option" :class="{ active: dailyGoal === goal }"
                @click="selectGoal(goal)">
                <text class="goal-option-text">{{ goal }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="save-section">
        <view class="save-btn" @click="handleSave">
          <view class="btn-shine"></view>
          <text class="btn-text">保存设置</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getWordBooksAPI } from '../../../API/Vocabulary/WordBooksAPI';
import escconfig from '../../../config/esc.config';
import { setWordRember } from '../../../API/Vocabulary/WordRemberAPI';
import ThemeLoading from '../../../components/core/ThemeLoading.vue';

const wordBooks = ref([]);
const selectedBook = ref(null);
const dailyGoal = ref(20);
const goalOptions = [10, 20, 30, 50, 80, 100];
const loading = ref(true);
const baseImageUrl = escconfig.ossDomain;

const fetchWordBooks = async () => {
  try {
    const response = await getWordBooksAPI();
    if (response.code === 200) {
      wordBooks.value = response.data.wordBooks;
      loading.value = false;
    }
  } catch (error) {
    console.error('获取词书失败:', error);
  }
};

const selectBook = (book) => {
  selectedBook.value = book;
  uni.vibrateShort({ type: 'light' });
};

const selectGoal = (goal) => {
  dailyGoal.value = goal;
  uni.vibrateShort({ type: 'light' });
};

const handleSave = () => {
  if (!selectedBook.value) {
    uni.showToast({
      title: '请选择词书',
      icon: 'none'
    });
    return;
  }

  uni.vibrateShort({ type: 'medium' });

  const settings = {
    currentBook_id: selectedBook.value._id,
    dailyGoal: dailyGoal.value,
    currentBookTitle: selectedBook.value.title,
  };

  setWordRember({
    currentBook_id: settings.currentBook_id,
    dailyGoal: settings.dailyGoal,
    currentBookTitle: settings.currentBookTitle,
  }).then(res => {
    if(res.code === 200){
      uni.showToast({
        title: '设置成功',
        icon: 'none'
      });
      uni.$emit('updateWordRember', settings); //更新词数据
    }
  }).then(() => {
    setTimeout(() => {
      uni.navigateBack();
    }, 1000);
  }).catch(() => {
    uni.showToast({
      title: '设置失败',
      icon: 'none'
    }); 
  })
};

onMounted(() => {
  fetchWordBooks();
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f5ff 0%, #F5F5F5 100%);
}

.content {
  padding: 20rpx 24rpx 120rpx;
}

/* 当前正在学习的词书卡片 */
.current-book-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #cee9ff 100%);
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(33, 150, 243, 0.15);
  position: relative;
  overflow: hidden;
}

.current-book-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200rpx;
  height: 200rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent);
  border-radius: 50%;
}

.current-header {
  margin-bottom: 24rpx;
}

.current-label {
  font-size: 26rpx;
  color: #1976D2;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.current-content {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.current-book-cover-wrapper {
  width: 100rpx;
  height: 140rpx;
  border-radius: 12rpx;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
  border: 3rpx solid rgba(255, 255, 255, 0.8);
}

.current-book-cover {
  width: 100%;
  height: 100%;
}

.current-book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.current-book-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1565C0;
  line-height: 1.3;
}

.current-stats {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 900;
  color: #FF9800;
  line-height: 1;
}

.stat-label {
  font-size: 24rpx;
  color: #64B5F6;
  font-weight: 500;
}

.stat-divider {
  width: 2rpx;
  height: 32rpx;
  background: rgba(33, 150, 243, 0.3);
}

.setting-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20rpx);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 32rpx;
  padding-bottom: 24rpx;
  border-bottom: 2rpx solid rgba(0, 0, 0, 0.05);
}

.header-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

.book-selector {
  position: relative;
}

.book-list {
  max-height: 600rpx;
}

.book-option {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
  background: linear-gradient(135deg, #f8f9fa, #fff);
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.book-option.active {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.08), rgba(33, 150, 243, 0.03));
  border-color: #2196F3;
  box-shadow: 0 4rpx 16rpx rgba(33, 150, 243, 0.15);
}

.book-option:active {
  transform: scale(0.98);
}

.book-cover-wrapper {
  width: 110rpx;
  height: 150rpx;
  border-radius: 12rpx;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.book-cover {
  width: 100%;
  height: 100%;
}

.book-info {
  flex: 1;
  min-width: 0;
}

.book-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #999;
}

.tags-wrapper {
  display: flex;
  gap: 8rpx;
}

.book-tag {
  padding: 4rpx 12rpx;
  background: rgba(255, 152, 0, 0.1);
  border-radius: 8rpx;
  font-size: 20rpx;
  color: #FF9800;
}

.check-icon {
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
}

.empty-image {
  width: 160rpx;
  height: 160rpx;
  opacity: 0.5;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.goal-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40rpx;
}

.goal-preview {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.goal-number {
  font-size: 80rpx;
  font-weight: 900;
  background: linear-gradient(135deg, #FF9800, #F57C00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.goal-unit {
  font-size: 28rpx;
  color: #666;
}

.slider-container {
  width: 100%;
}

.goal-options {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.goal-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #f8f9fa, #fff);
  border: 2rpx solid #e0e0e0;
  transition: all 0.3s ease;
}

.goal-option.active {
  background: linear-gradient(135deg, #FF9800, #F57C00);
  border-color: #FF9800;
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 20rpx rgba(255, 152, 0, 0.3);
}

.goal-option:active {
  transform: scale(0.95);
}

.goal-option-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #666;
  transition: color 0.3s ease;
}

.goal-option.active .goal-option-text {
  color: #fff;
}

.save-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.save-btn {
  position: relative;
  background: linear-gradient(135deg, #2196F3, #1976D2);
  border-radius: 28rpx;
  padding: 28rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(33, 150, 243, 0.3);
  overflow: hidden;
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: btnShine 3s infinite;
}

@keyframes btnShine {
  0% {
    left: -100%;
  }

  50%,
  100% {
    left: 150%;
  }
}

.btn-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  position: relative;
  z-index: 1;
}
</style>
