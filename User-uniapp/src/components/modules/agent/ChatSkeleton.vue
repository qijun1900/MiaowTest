<template>
    <view class="skeleton-wrapper">
        <view class="skeleton-row skeleton-row-start">
            <view class="skeleton-bubble skeleton-bubble-ai">
                <view class="skeleton-line" style="width: 85%"></view>
                <view class="skeleton-line" style="width: 55%"></view>
            </view>
        </view>
        <view class="skeleton-row skeleton-row-end">
            <view class="skeleton-bubble skeleton-bubble-user">
                <view class="skeleton-line skeleton-line-light" style="width: 50%"></view>
            </view>
        </view>
        <view class="skeleton-row skeleton-row-start">
            <view class="skeleton-bubble skeleton-bubble-ai">
                <view class="skeleton-line" style="width: 70%"></view>
                <view class="skeleton-line" style="width: 45%"></view>
            </view>
        </view>
    </view>
</template>

<script setup>
</script>

<style scoped>
.skeleton-wrapper {
    padding: 24rpx;
}

.skeleton-row {
    display: flex;
    margin-bottom: 24rpx;
}

.skeleton-row-start {
    justify-content: flex-start;
}

.skeleton-row-end {
    justify-content: flex-end;
}

.skeleton-bubble {
    border-radius: 16rpx;
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.skeleton-bubble-ai {
    width: 75%;
    background: var(--app-bg-container);
}

.skeleton-bubble-user {
    width: 55%;
    background: var(--app-border);
}

.skeleton-line {
    height: 24rpx;
    border-radius: 8rpx;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 400% 100%;
    animation: skeleton-shimmer 1.8s ease-in-out infinite;
}

.skeleton-line-light {
    background: linear-gradient(90deg, #d8d8d8 25%, #cbcbcb 50%, #d8d8d8 75%);
    background-size: 400% 100%;
}

@keyframes skeleton-shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
}
</style>
