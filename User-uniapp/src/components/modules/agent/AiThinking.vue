<template>
    <view class="ai-thinking-indicator">
        <view class="ai-thinking-circle"></view>
        <view class="ai-thinking-pulse"></view>
    </view>
</template>

<script setup>
</script>

<style scoped>
.ai-thinking-indicator {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 8rpx 0;
    position: relative;
    width: 80rpx;
    height: 80rpx;
}

.ai-thinking-circle {
    width: 36rpx;
    height: 36rpx;
    border-radius: 50%;
    background: #d1d5db;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
}

.ai-thinking-pulse {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: #d1d5db;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    animation: ai-pulse 1.5s ease-in-out infinite;
}

@keyframes ai-pulse {
    0% {
        opacity: 0.6;
        transform: translate(-50%, -50%) scale(0.5);
    }
    50% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1.2);
    }
    100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1.2);
    }
}
</style>
