<template>
    <view
        class="user-info-card"
        :style="{ marginTop: marginTop }"
        hover-class="card-hover"
        :hover-stay-time="150"
        @click="handleClick"
    >
        <!-- 极简流体背景装饰 -->
        <view class="card-bg-decoration">
            <view class="fluid-shape shape-1"></view>
            <view class="fluid-shape shape-2"></view>
            <view class="fluid-shape shape-3"></view>
            <view class="glass-overlay"></view>
        </view>

        <!-- 核心用户信息交互区 -->
        <view class="user-info-main">
            <!-- 头像区域 -->
            <view class="avatar-section">
                <view class="avatar-container">
                    <userAvatar
                        :showOnline="false"
                        :width="112"
                        :height="112"
                    />
                </view>
                <!-- VIP皇冠挂件（如果在登录且VIP状态） -->
                <view class="vip-crown" v-if="isLoggedIn && showVip">
                    <up-icon name="level" color="#FFE14C" size="14px"></up-icon>
                </view>
            </view>

            <!-- 信息文本区域 -->
            <view class="user-detail-section">
                <view class="user-info-wrapper">
                    <!-- 未登录状态 -->
                    <template v-if="!isLoggedIn">
                        <view class="login-prompt">
                            <text class="login-title">未登录 / 注册</text>
                        </view>
                        <view class="login-desc">
                            <text class="desc-text"
                                >点击登录，开启云端同步学习</text
                            >
                        </view>
                    </template>

                    <!-- 已登录状态 -->
                    <template v-else>
                        <view class="user-name-row">
                            <text class="username-text">
                                {{
                                    userInfo?.nickname ||
                                    `第${userInfo?.userCount || 0}位哈基米`
                                }}
                            </text>
                            <!-- 高级质感VIP标识 -->
                            <view class="pro-badge" v-if="showVip">
                                <text class="pro-text">PRO</text>
                            </view>
                        </view>
                        <view class="user-id-row">
                            <view class="id-capsule">
                                <text class="id-label">UID</text>
                                <text class="id-value">{{
                                    userInfo?.uid || "88888"
                                }}</text>
                            </view>
                        </view>
                    </template>
                </view>
            </view>

            <!-- 极简箭头指示器 -->
            <view class="arrow-indicator">
                <view class="arrow-circle">
                    <up-icon
                        name="arrow-right"
                        size="14px"
                        color="#fff"
                    ></up-icon>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { computed } from "vue";
import { UserInfoStore } from "../../../stores/modules/UserinfoStore";
import userAvatar from "../../core/userAvatar.vue";

// Props
const props = defineProps({
    // 顶部边距
    marginTop: {
        type: String,
        default: "0px",
    },
    // 是否显示VIP标识
    showVip: {
        type: Boolean,
        default: false,
    },
    // 是否显示底部状态栏
    showStatusBar: {
        type: Boolean,
        default: true,
    },
});

// Emits
const emit = defineEmits(["click"]);

// Store
const userInfoStore = UserInfoStore();

// Computed
const isLoggedIn = computed(() => userInfoStore.isLoggedIn);
const userInfo = computed(() => userInfoStore.userInfo);

// Methods
const handleClick = () => {
    emit("click", { isLoggedIn: isLoggedIn.value, userInfo: userInfo.value });
};
</script>

<style scoped>
/* ==================== 极致美化版用户信息卡片 ==================== */
.user-info-card {
    position: relative;
    margin: 0 10rpx 40rpx 10rpx;
    border-radius: 36rpx;
    background: #ffffff;
    box-shadow: 0 20rpx 40rpx -12rpx rgba(66, 133, 244, 0.15),
        0 8rpx 16rpx -8rpx rgba(66, 133, 244, 0.08); /* 高级弥散阴影 */
    z-index: 10000;
    /* 移除 overflow: hidden 允许头像突破卡片上方 */
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border: 1px solid rgba(255, 255, 255, 0.8);
}

.card-hover {
    transform: translateY(2rpx) scale(0.99);
    box-shadow: 0 10rpx 20rpx -8rpx rgba(66, 133, 244, 0.12),
        0 4rpx 8rpx -4rpx rgba(66, 133, 244, 0.05);
}

/* ====== 流体背景与玻璃态 ====== */
.card-bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden; /* 保留截断内部气泡效果 */
    pointer-events: none;
    z-index: 0;
    border-radius: 36rpx;
}

.glass-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(255, 255, 255, 0.6) 100%
    );
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 2;
}

.fluid-shape {
    position: absolute;
    filter: blur(30px);
    opacity: 0.6;
    border-radius: 50%;
    z-index: 1;
    animation: shapeMove 10s ease-in-out infinite alternate;
}

.shape-1 {
    width: 240rpx;
    height: 240rpx;
    background: radial-gradient(
        circle,
        #d4e4ff 0%,
        rgba(212, 228, 255, 0) 70%
    );
    top: -40rpx;
    right: -40rpx;
    animation-delay: 0s;
}

.shape-2 {
    width: 300rpx;
    height: 300rpx;
    background: radial-gradient(
        circle,
        #e1f0ff 0%,
        rgba(225, 240, 255, 0) 70%
    );
    bottom: -100rpx;
    left: -80rpx;
    animation-delay: -3s;
}

.shape-3 {
    width: 180rpx;
    height: 180rpx;
    background: radial-gradient(
        circle,
        #ebf5ff 0%,
        rgba(235, 245, 255, 0) 70%
    );
    top: 50%;
    left: 30%;
    transform: translateY(-50%);
    animation-delay: -5s;
}

@keyframes shapeMove {
    0% {
        transform: translate(0, 0) scale(1);
    }
    50% {
        transform: translate(20rpx, 15rpx) scale(1.1);
    }
    100% {
        transform: translate(-10rpx, 25rpx) scale(0.95);
    }
}

/* ====== 主信息区域 ====== */
.user-info-main {
    position: relative;
    display: flex;
    align-items: center;
    padding: 36rpx 36rpx;
    z-index: 3;
}

/* --- 头像 --- */
.avatar-section {
    position: relative;
    margin-right: 32rpx;
    flex-shrink: 0;
}

.avatar-container {
    border-radius: 50%;
    /* 弱化后的轻量级悬浮立体阴影 */
    box-shadow: 0 8rpx 20rpx -6rpx rgba(66, 133, 244, 0.15), 
                0 2rpx 8rpx -2rpx rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ffffff; /* 确保背景纯净，避免PNG透明底漏出阴影重叠 */
}

.vip-crown {
    position: absolute;
    bottom: -4rpx;
    right: -4rpx;
    width: 40rpx;
    height: 40rpx;
    background: linear-gradient(135deg, #333, #1a1a1a);
    border: 4rpx solid #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.15);
}

/* --- 用户信息 --- */
.user-detail-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
}

.user-info-wrapper {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

/* 未登录 */
.login-title {
    font-size: 40rpx;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 8rpx;
    display: block;
}

.login-desc .desc-text {
    font-size: 26rpx;
    color: #8c9aaf;
}

/* 已登录 */
.user-name-row {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
    gap: 16rpx;
}

.username-text {
    font-size: 38rpx;
    font-weight: 700;
    color: #1a2332;
    letter-spacing: 0.5rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 320rpx;
}

.pro-badge {
    padding: 4rpx 14rpx;
    background: linear-gradient(135deg, #2c3e50, #000000);
    border-radius: 8rpx 20rpx 8rpx 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
}

.pro-text {
    font-size: 20rpx;
    font-weight: 800;
    color: #d4af37;
    font-style: italic;
    line-height: 1.2;
}

.user-id-row {
    display: flex;
    align-items: center;
}

.id-capsule {
    display: inline-flex;
    align-items: center;
    background: rgba(66, 133, 244, 0.08);
    border: 1px solid rgba(66, 133, 244, 0.15);
    border-radius: 100rpx;
    padding: 4rpx 16rpx;
}

.id-label {
    font-size: 22rpx;
    color: #4285f4;
    font-weight: 600;
    margin-right: 8rpx;
}

.id-value {
    font-size: 22rpx;
    color: #64748b;
    font-family: "Courier New", Courier, monospace;
    font-weight: 500;
    letter-spacing: 0.5rpx;
}

/* --- 箭头 --- */
.arrow-indicator {
    margin-left: 20rpx;
    flex-shrink: 0;
}

.arrow-circle {
    width: 52rpx;
    height: 52rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #4285f4, #3b76e2);
    box-shadow: 0 6rpx 16rpx rgba(66, 133, 244, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.user-info-card:active .arrow-circle {
    transform: scale(0.9) translateX(4rpx);
}
</style>
