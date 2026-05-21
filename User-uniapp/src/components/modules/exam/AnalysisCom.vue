<template>
    <uni-transition name="fade" mode="out-in" :show="props.showAnalysis">
        <view class="question-explanation-container" key="explanation">
            <view class="question-explanation-header">
                <text class="explanation-label">解析:</text>
                <uni-icons
                    type="help"
                    size="21"
                    class="explanation-icon"
                    color="#6f89ff"
                ></uni-icons>
            </view>
            <view class="question-explanation-content">
                <ContentRenderer
                    :content="analysis"
                    :is-markdown="true"
                    v-if="analysis && analysis !== ''"
                />
                <text v-else>暂无解析</text>
            </view>
            <AiDisclaimer v-if="isAIanswer" style="padding-top: 16rpx;" />
        </view>
    </uni-transition>
</template>

<script setup>
import { computed } from "vue";
import ContentRenderer from "@/components/common/ContentRenderer.vue";
import AiDisclaimer from "@/components/modules/agent/AiDisclaimer.vue";
const props = defineProps({
    analysis: {
        type: String,
        default: "",
    },
    showAnalysis: {
        type: Boolean,
        default: false,
    },
    isAIanswer: {
        type: Boolean,
        default: false,
    },
});

const analysis = computed(() => {
    return props.analysis;
});
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
</style>
