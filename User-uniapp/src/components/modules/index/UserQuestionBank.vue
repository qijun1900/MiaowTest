<template>
    <view class="container">
        <!-- 加载状态 -->
        <ThemeLoading v-if="isLoading" text="正在加载题库..." />
        
        <!-- 有题库数据时显示题库列表 -->
        <view v-else-if="questionBanks.length > 0">
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
                    <text class="bank-name">{{ item.bankName }}</text>
                    <view class="bank-details">
                        <text class="question-count">{{ item.questionCount }}题</text>
                        <text class="time">{{formatTime.getTime2(item.createTime)}}</text>
                    </view>
                </view>
                
                <!-- 最右侧指示图标 -->
                <view class="more-section">
                    <text class="arrow-icon">›</text>
                </view>
            </view>
        </view>
        
        <!-- 空状态显示 -->
        <view v-else class="empty-state">
            <image class="empty-image" src="/static/other/my-questionbank.png" mode="aspectFit"></image>
            <text class="empty-text">暂无题库</text>
            <text class="empty-desc">快去创建你的第一个题库吧！</text>
        </view>
    </view>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import { getUserBankList } from '../../../API/Exam/ExamAPI' 
import formatTime from '../../../util/formatTime'
import ThemeLoading from '../../core/ThemeLoading.vue'

// 假数据
const questionBanks = ref([])
const isLoading = ref(false)

// 点击事件处理
const handleClick = (item) => {
    uni.navigateTo({
        url: `/pages/exam/UserBankView?data=${encodeURIComponent(JSON.stringify(item))}`
    })
}
onMounted(async ()=>{
    try {
        isLoading.value = true
        const res = await getUserBankList()
        questionBanks.value = res.data
    } catch (error) {
        console.error('获取题库失败:', error)
    } finally {
        isLoading.value = false
    }
})
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
    font-size: 32rpx;
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
    opacity: 0.65;
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
