<template>
    <view class="container">
        <scroll-view class="hot-exam-scroll" scroll-x="true" scroll-left="0">
            <view class="hot-exam-list">
                <view class="exam-item" 
                    v-for="(exam, index) in hotExamList" 
                    :key="index" @click="handleExamClick(exam)">
                    <image 
                        class="exam-cover" 
                        :src="exam.cover" 
                        mode="aspectFill">
                    </image>
                    <view class="exam-title">{{ exam.title }}</view>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { ref } from 'vue'

const hotExamList = ref([
    {
        id: 1,
        title: '计算机等级考试',
        cover: 'https://img.freepik.com/free-photo/computer-programming-coding-screen_53876-120412.jpg'
    },
    {
        id: 2,
        title: '英语四级模拟考试',
        cover: 'https://img.freepik.com/free-photo/english-language-learning-concept_23-2151144166.jpg'
    },
    {
        id: 3,
        title: '数学建模竞赛',
        cover: 'https://img.freepik.com/free-photo/mathematics-formula-chalkboard_23-2148157415.jpg'
    },
    {
        id: 4,
        title: '普通话水平测试',
        cover: 'https://img.freepik.com/free-photo/teacher-holding-class_23-2149378302.jpg'
    },
    {
        id: 5,
        title: '教师资格证考试',
        cover: 'https://img.freepik.com/free-photo/education-day-arrangement-with-desk_23-2149378287.jpg'
    }
])

const handleExamClick = (exam) => {
    console.log('点击考试:', exam)
    // 这里可以添加跳转到考试详情页的逻辑
    // uni.navigateTo({
    //     url: `/pages/exam/detail?id=${exam.id}`
    // })
}
</script>

<style scoped>
.container {
    padding: 0;
    background-color: transparent;
    border-radius: 0;
    margin: 0;
}

.hot-exam-scroll {
    width: 100%;
    white-space: nowrap;
}

.hot-exam-list {
    display: flex;
    flex-direction: row;
    padding: 10rpx 0;
}

.exam-item {
    flex-shrink: 0;
    width: 300rpx;
    margin-right: 20rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
}

.exam-item:active {
    transform: scale(0.98);
}

.exam-cover {
    width: 100%;
    height: 200rpx;
    background-color: #e0e0e0;
}

.exam-title {
    padding: 16rpx;
    font-size: 28rpx;
    color: #333333;
    text-align: center;
    white-space: normal;
    line-height: 1.4;
    height: 38rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
}
</style>