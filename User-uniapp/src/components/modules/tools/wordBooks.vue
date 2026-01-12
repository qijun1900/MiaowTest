<template>
<view class="container">
    <view>
        <view class="books-header">
            <text class="books-title">默认单词本</text>
            <text class="books-count">
                <text class="count-number">6</text> 本
            </text>
        </view>
        
            <view class="book-item" v-for="(book, index) in books" :key="index">
                <image :src="book.image" class="book-image"></image>
                <view class="book-info">
                    <text class="book-title">{{ book.title }}</text>
                    <text class="book-words">{{ book.words }} words</text>
                    <view class="book-progress">
                        <text class="progress-label">Progress</text>
                        <view class="progress-container">
                            <view class="progress-bar">
                                <view class="progress-fill" :style="{ width: book.progress + '%' }"></view>
                            </view>
                            <text class="progress-percentage">{{ book.progress }}%</text>
                        </view>
                    </view>
                </view>
                <view class="book-actions">
                    <view class="click-indicator">
                        <text class="click-text">查看单词</text>
                    </view>
                </view>
                <up-tag :text="book.category" plain size="mini" type="warning" plainFill></up-tag>
            </view>
    </view>
</view>
</template>
<script setup>
const books = [
    {
        image: 'https://camo.githubusercontent.com/6aee9290f9f24d62fd55c02efbd8e5b36d0cdbce43bce50f6e281b42f41b208a/68747470733a2f2f6e6f732e6e6574656173652e636f6d2f79647363686f6f6c2d6f6e6c696e652f31343936363332373237323030434554346c75616e5f312e6a7067',
        category: '四级',
        title: 'Magical Potions',
        words: 120,
        progress: 45,
    },
    {
        image: 'https://camo.githubusercontent.com/d41826ebb9e3721c7eeccea2fd659456fa88aecb7e91fcade8792910ca957274/68747470733a2f2f6e6f732e6e6574656173652e636f6d2f79647363686f6f6c2d6f6e6c696e652f31343936363535333832393236434554366c75616e5f312e6a7067',
        category: '六级',
        title: 'Space Explorers',
        words: 85,
        progress: 10,
    },
    {
        image: 'https://camo.githubusercontent.com/0bac08b7a00a2cfc7ae50987d8f20d6db4cadad67de9ff5bd87d61e74e3aa0b3/68747470733a2f2f6e6f732e6e6574656173652e636f6d2f79647363686f6f6c2d6f6e6c696e652f313439313033373730333335394c6576656c385f312e6a7067',
        category: '八级',
        title: 'Cute Zoo Animals',
        words: 50,
        progress: 90,
    }
];
</script>
<style scoped>
.container {
    padding: 32rpx;
    background-color: #f0f8ff;
    min-height: 100vh;
}

.books-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;
    padding: 24rpx 32rpx;
    background-color: #ffffff;
    border-radius: 24rpx;
    border: 4rpx solid #74b9ff;
    box-shadow: 0 6rpx 0 #0984e3;
}

.books-title {
    font-size: 36rpx;
    font-weight: 900;
    color: #0984e3;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    text-shadow: 2rpx 2rpx 0 #74b9ff;
}

.books-count {
    font-size: 28rpx;
    color: #ffffff;
    background-color: #0984e3;
    padding: 12rpx 28rpx;
    border-radius: 30rpx;
    font-weight: bold;
    box-shadow: 0 4rpx 0 #0652DD;
}

.count-number {
    color: #ffffff;
    font-weight: 900;
    text-shadow: 1rpx 1rpx 0 rgba(0,0,0,0.2);
}


.book-item {
    display: flex;
    background-color: #ffffff;
    border-radius: 28rpx;
    padding: 32rpx;
    border: 4rpx solid #81c8ec;
    box-shadow: 8rpx 8rpx 0 #00a1ce;
    align-items: flex-start;
    gap: 32rpx;
    margin-bottom: 32rpx;
    position: relative;
}

.book-image {
    width: 180rpx;
    height: 250rpx;
    border-radius: 20rpx;
    object-fit: cover;
    border: 4rpx solid #ffeb69;
    box-shadow: 0 6rpx 0 #e1e1e1;
}

.book-info {
    flex: 1; 
    display: flex; 
    flex-direction: column;
    gap: 16rpx;
}

.book-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #2d3436;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    letter-spacing: 1rpx;
}

.book-words {
    font-size: 28rpx;
    color: #636e72;
    display: flex;
    align-items: center;
    gap: 8rpx;
    background-color: #e8f4fd;
    padding: 8rpx 16rpx;
    border-radius: 16rpx;
    width: fit-content;
}

.book-words::before {
    content: '📚';
    font-size: 28rpx;
}

.book-progress {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    margin-top: 8rpx;
    background-color: #e8f4fd;
    padding: 20rpx;
    border-radius: 16rpx;
    border: 2rpx solid #74b9ff;
}

.progress-label {
    font-size: 26rpx;
    color: #2d3436;
    font-weight: bold;
    background-color: #0984e3;
    color: #ffffff;
    padding: 4rpx 16rpx;
    border-radius: 12rpx;
    width: fit-content;
    box-shadow: 0 3rpx 0 #0652DD;
}

.progress-container {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.progress-bar {
    flex: 1;
    height: 24rpx;
    background-color: #e8f4fd;
    border-radius: 12rpx;
    overflow: hidden;
    border: 3rpx solid #74b9ff;
    box-shadow: inset 0 2rpx 4rpx rgba(0,0,0,0.1);
}

.progress-fill {
    height: 100%;
    background: repeating-linear-gradient(
        90deg,
        #0984e3 0rpx,
        #0984e3 16rpx,
        #0652DD 16rpx,
        #0652DD 32rpx
    );
    border-radius: 10rpx;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2rpx 8rpx rgba(9, 132, 227, 0.4);
    position: relative;
}

.progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%);
    border-radius: 10rpx 10rpx 0 0;
}

.progress-percentage {
    font-size: 26rpx;
    color: #0984e3;
    font-weight: 900;
    min-width: 75rpx;
    text-align: right;
    background-color: #e8f4fd;
    padding: 6rpx 12rpx;
    border-radius: 10rpx;
    border: 2rpx solid #0984e3;
}
.book-actions {
    position: absolute;
    right: 24rpx;
    bottom: 185rpx;
}

.click-indicator {
    display: flex;
    align-items: center;
    gap: 8rpx;
    background: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%);
    padding: 10rpx 20rpx;
    border-radius: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(9, 132, 227, 0.4);
}

.click-text {
    font-size: 24rpx;
    color: #ffffff;
    font-weight: bold;
    letter-spacing: 2rpx;
}
</style>