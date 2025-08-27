<template>
    <view class="container">
        <view class="question-bank-item" 
        v-for="(item, index) in questionBanks" 
        :key="index" 
        @click="handleClick(item)">
            <!-- 左边静态图片 -->
            <image 
                class="bank-image" 
                src="/static/other/my-questionbank.png" 
                mode="aspectFill">
            </image>
            
            <!-- 右边题库信息 -->
            <view class="bank-info">
                <text class="bank-name">{{ item.name }}</text>
                <view class="bank-details">
                    <text class="question-count">{{ item.questionCount }}题</text>
                    <text class="time">{{ item.time }}</text>
                </view>
            </view>
            
            <!-- 最右侧指示图标 -->
            <view class="more-section">
                <text class="arrow-icon">›</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'

// 假数据
const questionBanks = ref([
    {
        name: 'JavaScript基础题库',
        questionCount: 50,
        time: '120分钟'
    },
    {
        name: 'Vue.js进阶题库',
        questionCount: 30,
        time: '90分钟'
    },
    {
        name: 'React实战题库',
        questionCount: 40,
        time: '100分钟'
    }
])

// 点击事件处理
const handleClick = (item) => {
    console.log('点击题库:', item.name)
    // 这里可以添加跳转逻辑
}
</script>

<style scoped>
.container {
    padding: 10rpx;
}

.question-bank-item {
    display: flex;
    align-items: center;
    padding: 25rpx;
    margin-bottom: 20rpx;
    background-color: #ffffff;
    border-radius: 12rpx;
}

.bank-image {
    width: 85rpx;
    height: 85rpx;
    border-radius: 8rpx;
    margin-right: 30rpx;
}

.bank-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.bank-name {
    font-size: 27rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 15rpx;
}

.bank-details {
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.question-count {
    font-size: 24rpx;
    color: #666666;
}

.time {
    font-size: 25rpx;
    color: #999999;
}

.more-section {
    display: flex;
    align-items: center;
}

.arrow-icon {
    font-size: 26rpx;
    color: #007AFF;
    font-weight: bold;
}
</style>
