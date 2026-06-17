<template>
    <view class="tips-section">
        <view class="tips-content" @click="toggleAgreed">
            <!-- 自定义复选框 -->
            <view
                class="custom-checkbox"
                :class="{ checked: modelValue }"
            ></view>
            <view class="tips-text">我已阅读并同意</view>
            <view class="tips-link" @click.stop="showUserAgreement"
                >《用户协议》</view
            >
            <view class="tips-text">和</view>
            <view class="tips-link" @click.stop="showPrivacyPolicy"
                >《隐私政策》</view
            >
        </view>
    </view>
</template>

<script setup>
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits([
    "update:modelValue",
    "showUserAgreement",
    "showPrivacyPolicy",
]);

const toggleAgreed = () => {
    emit("update:modelValue", !props.modelValue);
};

// 显示用户服务协议
const showUserAgreement = () => {
    emit("showUserAgreement");
};

// 显示隐私政策
const showPrivacyPolicy = () => {
    emit("showPrivacyPolicy");
};
</script>

<style lang="scss" scoped>
.tips-section {
    margin-top: 20rpx;
    margin-bottom: 10rpx;
    position: relative;
    z-index: 1;

    .tips-content {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;

        .custom-checkbox {
            flex-shrink: 0;
            width: 34rpx;
            height: 34rpx;
            border-radius: 6rpx;
            border: 2rpx solid #c0c4cc;
            background-color: var(--app-bg-container);
            margin-right: 10rpx;
            position: relative;

            &.checked {
                background-color: var(--app-brand);
                border-color: var(--app-brand);

                &::after {
                    content: "";
                    position: absolute;
                    left: 8rpx;
                    top: 3rpx;
                    width: 10rpx;
                    height: 18rpx;
                    border-right: 3rpx solid var(--app-bg-container);
                    border-bottom: 3rpx solid var(--app-bg-container);
                    transform: rotate(45deg);
                }
            }
        }

        .tips-text {
            font-size: calc(24rpx * var(--app-font-scale, 1));
            color: var(--app-text-secondary);
        }

        .tips-link {
            font-size: calc(24rpx * var(--app-font-scale, 1));
            color: var(--app-brand);
            margin: 0 4rpx;
        }
    }
}
</style>
