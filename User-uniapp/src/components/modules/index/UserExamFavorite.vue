<template>
    <view class="container">
        <view v-if="favoriteExam.length > 0">
            <view class="question-bank-item" v-for="(item, index) in questionBanks" :key="index"
                @click="handleClick(item)">
            </view>
        </view>

        <!-- 空状态显示 -->
        <view v-else class="empty-state">
            <image class="empty-image" src="/static/other/exam-favorite.png" mode="aspectFit"></image>
            <text class="empty-text">暂无收藏考试</text>
            <text class="empty-desc">快去收藏你的第一个考试吧！</text>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserFavorites } from '../../../API/My/FavoriteAPI'

const favoriteExam = ref([])

const fetchFavoriteExam = async () => {
    try {
        const response = await getUserFavorites()
        if (response.code === 200) {
            favoriteExam.value = response.data
            console.log(favoriteExam.value)
        }
    } catch (error) {
        console.log(error)

    }
}
onMounted(() => {
    fetchFavoriteExam()
})
// 点击事件处理
const handleClick = (item) => {
    console.log('点击题库:', item.name)
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

/* 空状态样式 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80rpx 40rpx;
    background-color: #ffffff;
    border-radius: 12rpx;
}

.empty-image {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 30rpx;
    opacity: 0.79;
}

.empty-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #666666;
    margin-bottom: 20rpx;
}

.empty-desc {
    font-size: 26rpx;
    color: #999999;
    text-align: center;
}
</style>
