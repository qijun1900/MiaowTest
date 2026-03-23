<template>
    <view class="vip-card">
        <!-- 背景动画层 -->
        <view class="bg-animation"></view>
        <view class="bg-particles"></view>
        <view class="bg-shine"></view>

        <!-- 左侧内容区域 -->
        <view class="vip-content">
            <view class="vip-title">
                <text class="vip-main-title">会员VIP</text>
                <text class="vip-sub-title" :class="{ 'is-member': isMember }">
                    {{
                        isMember
                            ? "您已经是会员，享受更多权益"
                            : "成为会员，享受更多权益"
                    }}
                </text>
            </view>
        </view>

        <!-- 右侧按钮区域 -->
        <view class="vip-action">
            <view class="vip-button" :class="{ 'member-button': isMember }">
                <text class="button-text">{{
                    isMember ? "续费会员" : "立即开通"
                }}</text>
                <view class="button-glow"></view>
                <view class="button-pulse"></view>
                <view class="button-shine"></view>
            </view>
        </view>

        <!-- 装饰元素 -->
        <view class="decoration crown">
            <text>👑</text>
        </view>
        <view class="decoration sparkle sparkle-1">✨</view>
        <view class="decoration sparkle sparkle-2">✨</view>
        <view class="decoration sparkle sparkle-3">✨</view>
        <view class="decoration sparkle sparkle-4">✨</view>
    </view>
</template>

<script setup>
import { ref } from "vue";

// 会员状态 - 暂时设为false，你可以根据需要修改
const isMember = ref(false);
</script>

<style scoped lang="scss">
.vip-card {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 40rpx;
    background: linear-gradient(135deg, #f8f4f0 0%, #f0e6d9 100%);
    border-radius: 24rpx;
    margin: 20rpx 10rpx;
    height: 120rpx;
    box-shadow:
        0 8rpx 32rpx rgba(139, 69, 19, 0.15),
        inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
    border: 1rpx solid rgba(205, 133, 63, 0.3);
    overflow: hidden;
    animation: cardFloat 6s ease-in-out infinite;

    // 浅棕色边框效果
    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 24rpx;
        padding: 2rpx;
        background: linear-gradient(
            135deg,
            rgba(205, 133, 63, 0.4) 0%,
            rgba(210, 180, 140, 0.4) 25%,
            rgba(205, 133, 63, 0.4) 50%,
            rgba(210, 180, 140, 0.4) 75%,
            rgba(205, 133, 63, 0.4) 100%
        );
        -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
        mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
    }
}

// 背景动画层
.bg-animation {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
        radial-gradient(
            circle at 20% 80%,
            rgba(205, 133, 63, 0.1) 0%,
            transparent 50%
        ),
        radial-gradient(
            circle at 80% 20%,
            rgba(161, 136, 127, 0.1) 0%,
            transparent 50%
        ),
        radial-gradient(
            circle at 40% 40%,
            rgba(139, 115, 85, 0.05) 0%,
            transparent 50%
        );
    animation: bgPulse 8s ease-in-out infinite;
    z-index: 1;
}

// 背景粒子效果
.bg-particles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    &::before,
    &::after {
        content: "";
        position: absolute;
        width: 3rpx;
        height: 3rpx;
        background: rgba(205, 133, 63, 0.6);
        border-radius: 50%;
        animation: particleFloat 4s ease-in-out infinite;
    }

    &::before {
        top: 25%;
        left: 20%;
        animation-delay: 0s;
    }

    &::after {
        top: 65%;
        right: 25%;
        animation-delay: 2s;
    }
}

// 背景闪光效果
.bg-shine {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(255, 255, 255, 0.08) 50%,
        transparent 70%
    );
    animation: shineRotate 6s linear infinite;
    z-index: 1;
}

.vip-content {
    flex: 1;
    z-index: 2;
    animation: contentSlideIn 0.8s ease-out;
}

.vip-title {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
}

.vip-main-title {
    font-size: 36rpx;
    font-weight: 700;
    background: linear-gradient(135deg, #8b7355 0%, #a1887f 50%, #8b7355 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 2rpx 4rpx rgba(139, 115, 85, 0.2);
    animation: titleGlow 3s ease-in-out infinite;
}

.vip-sub-title {
    font-size: 24rpx;
    color: #8d6e63;
    font-weight: 500;
    transition: all 0.3s ease;
    animation: subtitleFadeIn 1s ease-out;

    &.is-member {
        color: #795548;
        text-shadow: 0 0 6rpx rgba(121, 85, 72, 0.3);
        animation: memberTextGlow 2s ease-in-out infinite;
    }
}

.vip-action {
    z-index: 2;
    animation: actionSlideIn 0.8s ease-out 0.2s both;
}

.vip-button {
    position: relative;
    padding: 14rpx 28rpx;
    background: linear-gradient(135deg, #a1887f 0%, #bcaaa4 100%);
    border-radius: 50rpx;
    box-shadow:
        0 4rpx 16rpx rgba(161, 136, 127, 0.3),
        0 8rpx 24rpx rgba(161, 136, 127, 0.2),
        inset 0 1rpx 0 rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
    animation: buttonBounce 0.6s ease-out 0.4s both;

    // 3D立体效果
    transform: perspective(500px) rotateX(5deg);

    &:hover {
        transform: perspective(500px) rotateX(5deg) scale(1.05);
        box-shadow:
            0 6rpx 20rpx rgba(161, 136, 127, 0.4),
            0 12rpx 30rpx rgba(161, 136, 127, 0.3),
            inset 0 1rpx 0 rgba(255, 255, 255, 0.6);
    }

    &:active {
        transform: perspective(500px) rotateX(5deg) scale(0.95);
        box-shadow:
            0 2rpx 8rpx rgba(161, 136, 127, 0.25),
            inset 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
    }

    &.member-button {
        background: linear-gradient(135deg, #a1887f 0%, #bcaaa4 100%);
        box-shadow:
            0 4rpx 16rpx rgba(120, 144, 156, 0.3),
            0 8rpx 24rpx rgba(120, 144, 156, 0.2),
            inset 0 1rpx 0 rgba(255, 255, 255, 0.5);

        &:hover {
            box-shadow:
                0 6rpx 20rpx rgba(120, 144, 156, 0.4),
                0 12rpx 30rpx rgba(120, 144, 156, 0.3),
                inset 0 1rpx 0 rgba(255, 255, 255, 0.6);
        }

        &:active {
            box-shadow:
                0 2rpx 8rpx rgba(120, 144, 156, 0.25),
                inset 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
        }
    }
}

.button-text {
    font-size: 26rpx;
    font-weight: 600;
    color: #ffffff;
    position: relative;
    z-index: 2;
    animation: textPulse 2s ease-in-out infinite;
}

.button-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.4) 50%,
        transparent 100%
    );
    transition: left 0.6s ease;
}

.button-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 2s ease-out infinite;
}

.button-shine {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
        45deg,
        transparent 40%,
        rgba(255, 255, 255, 0.2) 50%,
        transparent 60%
    );
    animation: buttonShine 3s ease-in-out infinite;
}

.vip-button:hover .button-glow {
    left: 100%;
}

// 装饰元素
.decoration {
    position: absolute;
    z-index: 1;
}

.crown {
    top: 15rpx;
    left: 25rpx;
    font-size: 22rpx;
    opacity: 0.6;
    filter: brightness(0.9);
    animation: crownRotate 8s ease-in-out infinite;
}

.sparkle {
    font-size: 18rpx;
    opacity: 0;
    animation: sparkle 3s ease-in-out infinite;
    filter: brightness(0.9);
}

.sparkle-1 {
    top: 35rpx;
    right: 110rpx;
    animation-delay: 0.5s;
}
.sparkle-2 {
    bottom: 25rpx;
    right: 70rpx;
    animation-delay: 1.5s;
}
.sparkle-3 {
    top: 50rpx;
    left: 90rpx;
    animation-delay: 2.5s;
}
.sparkle-4 {
    bottom: 40rpx;
    left: 140rpx;
    animation-delay: 3.5s;
}

// 动画定义
@keyframes cardFloat {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-3rpx);
    }
}

@keyframes bgPulse {
    0%,
    100% {
        opacity: 0.7;
        transform: scale(1);
    }
    50% {
        opacity: 1;
        transform: scale(1.05);
    }
}

@keyframes particleFloat {
    0%,
    100% {
        transform: translateY(0) scale(1);
        opacity: 0.6;
    }
    50% {
        transform: translateY(-15rpx) scale(1.2);
        opacity: 1;
    }
}

@keyframes shineRotate {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

@keyframes contentSlideIn {
    0% {
        opacity: 0;
        transform: translateX(-30rpx);
    }
    100% {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes actionSlideIn {
    0% {
        opacity: 0;
        transform: translateX(30rpx);
    }
    100% {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes buttonBounce {
    0% {
        opacity: 0;
        transform: scale(0.8) perspective(500px) rotateX(5deg);
    }
    70% {
        opacity: 1;
        transform: scale(1.1) perspective(500px) rotateX(5deg);
    }
    100% {
        opacity: 1;
        transform: scale(1) perspective(500px) rotateX(5deg);
    }
}

@keyframes titleGlow {
    0%,
    100% {
        text-shadow: 0 2rpx 4rpx rgba(139, 115, 85, 0.2);
    }
    50% {
        text-shadow: 0 2rpx 8rpx rgba(139, 115, 85, 0.4);
    }
}

@keyframes subtitleFadeIn {
    0% {
        opacity: 0;
        transform: translateY(10rpx);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes memberTextGlow {
    0%,
    100% {
        text-shadow: 0 0 6rpx rgba(121, 85, 72, 0.3);
    }
    50% {
        text-shadow: 0 0 12rpx rgba(121, 85, 72, 0.6);
    }
}

@keyframes textPulse {
    0%,
    100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

@keyframes pulse {
    0% {
        width: 0;
        height: 0;
        opacity: 1;
    }
    100% {
        width: 150rpx;
        height: 150rpx;
        opacity: 0;
    }
}

@keyframes buttonShine {
    0% {
        transform: rotate(0deg) translateX(-100%);
    }
    100% {
        transform: rotate(0deg) translateX(100%);
    }
}

@keyframes crownRotate {
    0%,
    100% {
        transform: rotate(0deg);
    }
    25% {
        transform: rotate(5deg);
    }
    75% {
        transform: rotate(-5deg);
    }
}

@keyframes sparkle {
    0%,
    100% {
        opacity: 0;
        transform: scale(0.5) rotate(0deg);
    }
    50% {
        opacity: 0.8;
        transform: scale(1.2) rotate(180deg);
    }
}

// 响应式设计
@media (max-width: 750rpx) {
    .vip-card {
        padding: 24rpx 32rpx;
        margin: 15rpx 8rpx;
        height: 100rpx;
    }

    .vip-main-title {
        font-size: 32rpx;
    }

    .vip-sub-title {
        font-size: 22rpx;
    }

    .vip-button {
        padding: 12rpx 24rpx;
    }

    .button-text {
        font-size: 24rpx;
    }
}
</style>
