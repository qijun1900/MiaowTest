<template>
    <uni-transition name="fade" mode="out-in" :show="showAnalysis">
        <view class="question-explanation-container" key="explanation">
            <view class="question-explanation-header">
                <text class="explanation-label">解析:</text>
                <uni-icons 
                    type="help"
                    size="21" 
                    class="explanation-icon"
                    color="#6f89ff"></uni-icons>
            </view>
            <view class="question-explanation-content">
                <rich-text v-if="analysis && analysis !== ''" :nodes="props.analysis"></rich-text>
                <text v-else>暂无解析</text>
            </view>
        </view>
    </uni-transition>
</template>

<script setup>

const props = defineProps({
    analysis: {
        type: String,
        default: ''
    },
    showAnalysis: {
        type: Boolean,
        default: false
    }
});
</script>
<style lang="scss" scoped>
/* 解析容器样式 */
.question-explanation-container {
    margin-top: 45rpx;
    padding: 30rpx 20rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    margin-bottom: 15rpx;
}
.question-explanation-header {
    margin-bottom: 20rpx;
}
.explanation-label {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
}
.question-explanation-content {
    font-size: 28rpx;
    color: #303030;
    font-weight: 580;
}
</style>