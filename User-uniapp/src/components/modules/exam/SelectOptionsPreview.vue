<template>
    <view class="select-options-section">
        <view v-if="showTitle" class="section-title">
            <uni-icons type="list" color="#007aff" size="18"></uni-icons>
            <text class="section-title-text">题目选项</text>
        </view>

        <view
            v-for="(option, optionIndex) in options"
            :key="optionIndex"
            class="option-item"
            :class="{
                'correct-option': option.isCorrect,
                'user-wrong-option': isUserWrongOption(optionIndex),
            }"
        >
            <view class="option-wrapper">
                <text class="option-tag">{{
                    getOptionLabel(optionIndex)
                }}</text>
                <text class="option-content">{{ option.content }}</text>
                <view class="option-status">
                    <uni-icons
                        v-if="option.isCorrect"
                        type="checkmarkempty"
                        color="#4caf50"
                        size="18"
                    ></uni-icons>
                    <uni-icons
                        v-else-if="isUserWrongOption(optionIndex)"
                        type="closeempty"
                        color="#f44336"
                        size="18"
                    ></uni-icons>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
const props = defineProps({
    // 选项数组
    options: {
        type: Array,
        required: true,
        default: () => [],
    },
    // 用户的错误答案（字符串，如 "A,B" 或 "A"）
    userWrongAnswer: {
        type: String,
        default: "",
    },
    // 是否显示标题
    showTitle: {
        type: Boolean,
        default: true,
    },
});

// 获取选项标签（A, B, C, D...）
const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index) + ".";
};

// 判断是否是用户的错误选项
const isUserWrongOption = (optionIndex) => {
    if (!props.userWrongAnswer) return false;
    const optionLetter = String.fromCharCode(65 + optionIndex);
    const wrongAnswers = props.userWrongAnswer.split(",").map((a) => a.trim());
    return wrongAnswers.includes(optionLetter);
};
</script>

<style scoped>
/* 选择题选项样式 */
.select-options-section {
    margin-bottom: 24rpx;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 16rpx;
}

.section-title-text {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    font-weight: 600;
    color: var(--app-text-primary);
}

.option-item {
    margin-bottom: 12rpx;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    background-color: var(--app-bg-secondary);
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
}

.option-item.correct-option {
    background-color: var(--app-success-light);
    border: 2rpx solid var(--app-success);
}

.option-item.user-wrong-option {
    background-color: var(--app-danger-light);
    border: 2rpx solid #f44336;
}

.option-wrapper {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.option-tag {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    font-weight: bold;
    color: var(--app-brand);
    min-width: 40rpx;
}

.option-content {
    flex: 1;
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    line-height: 1.6;
}

.option-status {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40rpx;
}
</style>
