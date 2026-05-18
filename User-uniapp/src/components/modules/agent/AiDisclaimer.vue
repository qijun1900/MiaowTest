<template>
    <view class="ai-disclaimer">
        <text class="disclaimer-text">内容由AI生成，请仔细甄别</text>
    </view>
</template>

<script setup>
</script>

<style scoped>
.ai-disclaimer {
    display: flex;
    justify-content: flex-end;
    padding: 12rpx 24rpx 4rpx;
    opacity: 0;
    animation: disclaimer-fade-in 0.6s ease forwards;
}

@keyframes disclaimer-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

.disclaimer-text {
    font-size: 20rpx;
    color: rgba(176, 125, 79, 0.45);
    line-height: 1.4;
}
</style>
