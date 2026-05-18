<template>
    <view class="ai-thinking-indicator">
        <!-- 中心呼吸核心 -->
        <view class="core"></view>
        <!-- 轨道粒子 -->
        <view class="orbit">
            <view class="particle"></view>
            <view class="particle"></view>
            <view class="particle"></view>
        </view>
        <!-- 扩散涟漪 -->
        <view class="ripple ripple-1"></view>
        <view class="ripple ripple-2"></view>
    </view>
</template>

<script setup>
</script>

<style scoped>
.ai-thinking-indicator {
    position: relative;
    width: 100rpx;
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8rpx 0;
}

/* ── 中心核心：呼吸缩放 ── */
.core {
    width: 24rpx;
    height: 24rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #e8845c, #d4694a);
    z-index: 3;
    animation: core-breathe 2s ease-in-out infinite;
}

@keyframes core-breathe {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.25); opacity: 1; }
}

/* ── 轨道：整体旋转 ── */
.orbit {
    position: absolute;
    width: 70rpx;
    height: 70rpx;
    animation: orbit-spin 3s linear infinite;
}

@keyframes orbit-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* ── 轨道粒子 ── */
.particle {
    position: absolute;
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    background: #e8845c;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
}

.particle:nth-child(2) {
    top: auto;
    left: 0;
    bottom: 4rpx;
    background: #d4694a;
    animation: particle-pulse 2s ease-in-out infinite 0.3s;
}

.particle:nth-child(3) {
    top: auto;
    left: auto;
    right: 0;
    bottom: 4rpx;
    background: #c75f42;
    animation: particle-pulse 2s ease-in-out infinite 0.6s;
}

@keyframes particle-pulse {
    0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(0.8); }
    50% { opacity: 1; transform: translateX(-50%) scale(1.2); }
}

/* ── 扩散涟漪 ── */
.ripple {
    position: absolute;
    border-radius: 50%;
    border: 2rpx solid #e8845c;
    animation: ripple-expand 2.5s ease-out infinite;
}

.ripple-1 {
    width: 50rpx;
    height: 50rpx;
    animation-delay: 0s;
}

.ripple-2 {
    width: 50rpx;
    height: 50rpx;
    border-color: #d4694a;
    animation-delay: 1.25s;
}

@keyframes ripple-expand {
    0% {
        transform: scale(0.5);
        opacity: 0.6;
    }
    100% {
        transform: scale(2);
        opacity: 0;
    }
}
</style>
