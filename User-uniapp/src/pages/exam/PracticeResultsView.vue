<template>
   <view class="container">
        <view class="animation">
            <firework-effect ref="fireworkRef"></firework-effect>
        </view>
        <view class="accuracy">
            <view class="accuracy-circle">
                <text class="accuracy-percent">68%</text>
                <text class="accuracy-text">正确率</text>
            </view>
        </view>
        <view class="data-container">
            <view class="data-title">
                <text class="data-label">练习详情</text>
            </view>
            <view class="data-content">
                <view class="data-item">
                    <view class="data-info">
                        <text class="data-value">10</text>
                        <text class="data-label">正确数</text>
                    </view>
                </view>
                <view class="data-item">
                    <view class="data-info">
                        <text class="data-value">2</text>
                        <text class="data-label">错误数</text>
                    </view>
                </view>
                <view class="data-item">
                    <view class="data-info">
                        <text class="data-value">8</text>
                        <text class="data-label">未作答</text>
                    </view>
                </view>
            </view>
        </view>
        <view class="answer-sheet-container">
            <view class="data-title">
                <text class="data-label">答题情况</text>
            </view>
            <AnswerSheet 
            :questions="QuestionStore.UserChooseQuestion">
        </AnswerSheet>
        </view>
   </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import FireworkEffect from '@/components/plug-in/firework-effect/firework-effect.vue'//特效
import AnswerSheet from '../../components/modules/exam/AnswerSheet.vue'
import { useQuestionStore } from '../../stores/modules/QuestionStore'

const fireworkRef = ref(null)
const QuestionStore = useQuestionStore()

onMounted(() => {
    // 页面加载完成后触发烟花效果
    if (fireworkRef.value) {
        fireworkRef.value.handleShowEffect({ type: 'fireworks' })
    }
})
</script>
<style scoped>
.container{
    padding:10rpx 20rpx;
    background-color: #f8f8f8;
}

.accuracy{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 40rpx 0;
}

.accuracy-circle {
    width: 220rpx;
    height: 220rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #1330e9 0%, #2575fc 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 20rpx rgba(37, 117, 252, 0.3);
    position: relative;
    overflow: hidden;
}

.accuracy-circle::before {
    content: '';
    position: absolute;
    top: -10rpx;
    left: -10rpx;
    right: -10rpx;
    bottom: -10rpx;
    background: linear-gradient(135deg, #1768ff 0%, #2575fc 100%);
    border-radius: 50%;
    opacity: 0.4;
    z-index: -1;
    filter: blur(15rpx);
}

.accuracy-percent{
    font-size: 80rpx;
    font-weight: bold;
    color: #ffffff;
    line-height: 1;
    margin-bottom: 10rpx;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.accuracy-text{
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
}

.data-container {
    background-color: #ffffff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin: 20rpx 0;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.data-title {
    padding-bottom: 20rpx;
}

.data-title .data-label {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
}

.data-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 15rpx;
}

.data-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 10rpx;
    border-radius: 12rpx;
    transition: all 0.3s ease;
    flex: 1; /* 每个项目占据相等的空间 */
    background-color: #f9f9f9;
}

.data-item:active {
    background-color: #f0f0f0;
    transform: scale(0.98);
}

.data-info {
    display: flex; 
    flex-direction: column;
    align-items: center;
}

.data-value {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 5rpx;
}

.data-label {
    font-size: 26rpx;
    color: #666666;
}
.answer-sheet-container{
    background-color: #ffffff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin: 20rpx 0 0 0;
}
</style>