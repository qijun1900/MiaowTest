<template>
    <uni-transition name="fade" mode="out-in" :show="props.showAnalysis">
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
                <up-markdown :content="analysis" v-if="analysis && analysis !== ''"></up-markdown>
                <text v-else>暂无解析</text>
            </view>
            <view class="AI-warning" v-if="isAIanswer">
                <up-icon name="error" color="#f4ae2c" size="15px"></up-icon>
                <text class="AI-warning-lable">本解析由 AI 生成，内容仅供参考，请仔细甄别!</text>
            </view>
        </view>
    </uni-transition>
</template>

<script setup>
import {computed} from 'vue'
const props = defineProps({
    analysis: {
        type: String,
        default: ''
    },
    showAnalysis: {
        type: Boolean,
        default: false
    },
    isAIanswer: {
        type: Boolean,
        default: false
    }
});

const analysis = computed(() => {
    return props.analysis;
})
</script>
<style lang="scss" scoped>
/* 解析容器样式 */
.question-explanation-container {
    margin-top: 45rpx;
    padding: 30rpx 20rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    margin-bottom: 30rpx;
}

.explanation-label {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
}
.question-explanation-content {
    font-size: 26rpx;
    color: #303030;
    font-weight: 538;
}
.AI-warning{
    display: flex;
    align-items: center;
}
.AI-warning-lable{
    font-size: 24rpx;
    color: #898989;
    font-weight: 580;
}
</style>