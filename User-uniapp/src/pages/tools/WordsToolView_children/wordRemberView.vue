<template>
    <view class="word-remember-container">
        <view v-if="iSshowGuide">
          <WordsRemGuide @complete="handleGuideComplete" />
        </view>
        <view v-else>
            <!-- 顶部用户信息栏 -->
            <view class="top-header">
                <view class="user-info">
                    <image class="avatar" src="/static/other/default-avatar.png" mode="aspectFill"></image>
                    <view class="online-dot"></view>
                    <text class="greeting">早上好</text>
                    <text class="username">同学</text>
                </view>
                <view class="streak-info">
                    <view class="streak-badge">
                        <text class="fire-icon">🔥</text>
                        <text class="streak-days">12 天</text>
                    </view>
                    <view class="notification-icon">🔔</view>
                </view>
            </view>

            <!-- 主标题区域 -->
            <view class="main-title">
                <text class="title">坚持第 12 天</text>
                <text class="subtitle">每天进步一点点，未来大不同</text>
            </view>

            <!-- 进度卡片 -->
            <view class="progress-card">
                <view class="progress-content">
                    <!-- 圆形进度条 -->
                    <view class="progress-circle">
                        <view class="circle-container">
                            <!-- 背景圆环 -->
                            <view class="circle-bg"></view>
                            <!-- 进度圆环 -->
                            <view class="circle-progress"></view>
                            <!-- 中心内容 -->
                            <view class="circle-content">
                                <view class="percentage-container">
                                    <text class="percentage">70</text>
                                    <text class="percent-sign">%</text>
                                </view>
                            </view>
                        </view>
                    </view>

                    <!-- 进度信息 -->
                    <view class="progress-info">
                        <text class="current">35</text>
                        <text class="separator">/</text>
                        <text class="total">50</text>
                        <text class="unit">词</text>
                    </view>
                    <text class="progress-label">今日目标</text>
                </view>

                <!-- 继续学习按钮 -->
                <view class="continue-btn">
                    <text class="btn-text">继续学习</text>
                    <text class="arrow">→</text>
                </view>
            </view>

            <!-- 统计数据区域 -->
            <view class="stats-section">
                <view class="stat-item">
                    <view class="stat-icon blue-icon">📚</view>
                    <text class="stat-number">15</text>
                    <text class="stat-label">新词学习</text>
                </view>
                <view class="stat-item">
                    <view class="stat-icon purple-icon">📖</view>
                    <text class="stat-number">20</text>
                    <text class="stat-label">待复习</text>
                </view>
                <view class="stat-item">
                    <view class="stat-icon green-icon">✅</view>
                    <text class="stat-number">850</text>
                    <text class="stat-label">已掌握</text>
                    <view class="badge">1</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue';
import WordsRemGuide from '../../../components/modules/tools/WordsRemGuide.vue';

// 控制是否显示引导页
const iSshowGuide = ref(true);

// 处理引导完成事件
const handleGuideComplete = (settings) => {
    console.log('引导完成，设置:', settings);
    iSshowGuide.value = false;
    // 这里可以保存用户设置
};
</script>

<style scoped>
.word-remember-container {
    min-height: 100vh;
    background: linear-gradient(180deg, #E3F2FD 0%, #F5F5F5 50%);
    padding: 0 20rpx;
    box-sizing: border-box;
}

/* 顶部用户信息栏 */
.top-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10rpx 20rpx 40rpx 20rpx;
}

.user-info {
    display: flex;
    align-items: center;
    position: relative;
}

.avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
}

.online-dot {
    position: absolute;
    left: 60rpx;
    top: 60rpx;
    width: 20rpx;
    height: 20rpx;
    background: #4CAF50;
    border-radius: 50%;
    border: 4rpx solid #fff;
}

.greeting {
    font-size: 28rpx;
    color: #666;
    margin-right: 10rpx;
}

.username {
    font-size: 32rpx;
    color: #333;
    font-weight: 600;
}

.streak-info {
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.streak-badge {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    padding: 12rpx 20rpx;
    border-radius: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.fire-icon {
    font-size: 28rpx;
    margin-right: 8rpx;
}

.streak-days {
    font-size: 28rpx;
    color: #333;
    font-weight: 600;
}

.notification-icon {
    font-size: 32rpx;
    background: rgba(255, 255, 255, 0.9);
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

/* 主标题区域 */
.main-title {
    text-align: center;
    margin-bottom: 60rpx;
}

.title {
    display: block;
    font-size: 48rpx;
    color: #333;
    font-weight: 700;
    margin-bottom: 20rpx;
}

.subtitle {
    display: block;
    font-size: 28rpx;
    color: #666;
}

/* 进度卡片 */
.progress-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 40rpx;
    padding: 60rpx 40rpx;
    margin: 0 20rpx 60rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10rpx);
}

.progress-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 60rpx;
}

.progress-circle {
    position: relative;
    margin-bottom: 40rpx;
}

.circle-container {
    position: relative;
    width: 320rpx;
    height: 320rpx;
}

.circle-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(145deg, #ffffff, #f0f2f5);
    box-shadow:
        20rpx 20rpx 40rpx rgba(0, 0, 0, 0.1),
        -20rpx -20rpx 40rpx rgba(255, 255, 255, 0.8),
        inset 0 0 0 2rpx rgba(255, 255, 255, 0.3);
}

.circle-progress {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(from -90deg,
            #2196F3 0deg,
            #2196F3 252deg,
            transparent 252deg,
            transparent 360deg);
    mask: radial-gradient(circle at center, transparent 110rpx, black 110rpx, black 140rpx, transparent 140rpx);
    -webkit-mask: radial-gradient(circle at center, transparent 110rpx, black 110rpx, black 140rpx, transparent 140rpx);
}


.circle-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.9) 100%);
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    box-shadow:
        0 8rpx 32rpx rgba(0, 0, 0, 0.08),
        inset 0 2rpx 8rpx rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8rpx);
}

.percentage-container {
    display: flex;
    align-items: baseline;
    justify-content: center;
}

.percentage {
    font-size: 85rpx;
    color: #1A202C;
    font-weight: 900;
    line-height: 1;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #2C3E50 0%, #34495E 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.percent-sign {
    font-size: 48rpx;
    color: #718096;
    font-weight: 600;
    margin-left: 6rpx;
    opacity: 0.8;
}


.progress-info {
    display: flex;
    align-items: baseline;
    margin-bottom: 10rpx;
}

.current {
    font-size: 36rpx;
    color: #2196F3;
    font-weight: 600;
}

.separator {
    font-size: 32rpx;
    color: #999;
    margin: 0 8rpx;
}

.total {
    font-size: 32rpx;
    color: #666;
}

.unit {
    font-size: 28rpx;
    color: #666;
    margin-left: 8rpx;
}

.progress-label {
    font-size: 28rpx;
    color: #666;
}

.continue-btn {
    background: linear-gradient(135deg, #2196F3, #1976D2);
    border-radius: 30rpx;
    padding: 24rpx 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(33, 150, 243, 0.3);
}

.btn-text {
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    margin-right: 12rpx;
}

.arrow {
    color: #fff;
    font-size: 28rpx;
}

/* 统计数据区域 */
.stats-section {
    display: flex;
    justify-content: space-between;
    padding: 0 40rpx;
    margin-bottom: 120rpx;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.stat-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    margin-bottom: 20rpx;
}

.blue-icon {
    background: rgba(33, 150, 243, 0.1);
}

.purple-icon {
    background: rgba(156, 39, 176, 0.1);
}

.green-icon {
    background: rgba(76, 175, 80, 0.1);
}

.stat-number {
    font-size: 40rpx;
    color: #333;
    font-weight: 700;
    margin-bottom: 8rpx;
}

.stat-label {
    font-size: 24rpx;
    color: #666;
}

.badge {
    position: absolute;
    top: -8rpx;
    right: -8rpx;
    background: #FF5722;
    color: #fff;
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20rpx;
    font-weight: 600;
}
</style>