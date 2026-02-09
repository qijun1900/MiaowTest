<template>
  <view class="container">
    <view class="book-list">
      <view 
        class="book-card" 
        v-for="book in wrongBooks" 
        :key="book.id"
        :style="{ backgroundColor: book.color }"
      >
        <!-- 顶部菜单 -->
        <view class="card-header">
          <view class="menu-icon">
            <uni-icons type="more-filled" size="20" color="#fff"></uni-icons>
          </view>
        </view>

        <!-- 科目名称 -->
        <view class="subject-name">{{ book.name }}</view>

        <!-- 年份 -->
        <view class="year">
          <uni-icons type="calendar" size="16" color="rgba(255, 255, 255, 0.9)"></uni-icons>
          <text>{{ book.year }}</text>
        </view>

        <!-- 底部统计信息 -->
        <view class="card-footer">
          <view class="stats-item">
            <uni-icons type="list" size="16" color="rgba(255, 255, 255, 0.9)"></uni-icons>
            <text class="stats-text">{{ book.count }} 题</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 假数据
const wrongBooks = ref([
  {
    id: 1,
    icon: 'EN',
    name: '英语语法专项',
    year: '2023年',
    count: 89,
    color: '#4CAF50',
    iconBg: '#FFFFFF40'
  },
  {
    id: 2,
    icon: 'PH',
    name: '物理力学整理',
    year: '2023年',
    count: 56,
    color: '#2196F3',
    iconBg: '#FFFFFF40'
  },
  {
    id: 3,
    icon: 'CH',
    name: '化学方程式默写',
    year: '2024年',
    count: 230,
    color: '#00BCD4',
    iconBg: '#FFFFFF40'
  },
  {
    id: 4,
    icon: 'PO',
    name: '政治核心考点',
    year: '2024年',
    count: 45,
    color: '#E91E63',
    iconBg: '#FFFFFF40'
  },
  {
    id: 5,
    icon: 'MA',
    name: '数学函数专题',
    year: '2024年',
    count: 128,
    color: '#FF9800',
    iconBg: '#FFFFFF40'
  },
  {
    id: 6,
    icon: 'HI',
    name: '历史重点事件',
    year: '2023年',
    count: 67,
    color: '#9C27B0',
    iconBg: '#FFFFFF40'
  }
])
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 30rpx 20rpx;
}

.book-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.book-card {
  border-radius: 28rpx;
  padding: 32rpx 28rpx;
  position: relative;
  height: 380rpx;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
}

.book-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 200rpx;
  height: 200rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(50%, -50%);
}

.book-card:active {
  transform: scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 24rpx;
  position: relative;
  z-index: 1;
}

.menu-icon {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10rpx);
  transition: all 0.2s ease;
}

.menu-icon:active {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(0.95);
}

.subject-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 32rpx;
  backdrop-filter: blur(10rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.subject-name {
  color: #fff;
  font-size: 38rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  line-height: 1.4;
  position: relative;
  z-index: 1;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.year {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: rgba(255, 255, 255, 0.95);
  font-size: 26rpx;
  margin-bottom: auto;
  position: relative;
  z-index: 1;
}

.card-footer {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stats-text {
  color: rgba(255, 255, 255, 0.95);
  font-size: 28rpx;
  font-weight: 500;
}
</style>