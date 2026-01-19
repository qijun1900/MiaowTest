<template>
    <view class="word-remember-container">
        <view v-if="iSshowGuide">
            <WordsRemGuide @complete="handleGuideComplete" />
        </view>
        <view v-else>
            <!-- 顶部用户信息栏 -->
            <view class="top-header">
                <view class="user-info">
                    <userAvatar
                        :width="80"
                        :height="80"
                        :show-online="true"
                        />
                    <text class="greeting">{{ getGreetingInfo().text }}</text>
                    <text class="username">同学</text>
                </view>
                <view class="streak-info">
                    <view class="streak-badge">
                        <text class="fire-icon">🔥</text>
                        <text class="streak-days">12 天</text>
                    </view>
                    <view class="notification-icon">
                        <uni-icons type="gear-filled" size="26" color="#FF9800"></uni-icons>
                    </view>
                </view>
            </view>

            <!-- 主标题区域 -->
            <view class="main-title">
                <text class="title">坚持第 12 天</text>
                <text class="subtitle">每天进步一点点，未来大不同</text>
            </view>

            <!-- 进度卡片 -->
            <view class="progress-card">
                <!-- 装饰性背景元素 -->
                <view class="card-decoration">
                    <view class="decoration-circle decoration-1"></view>
                    <view class="decoration-circle decoration-2"></view>
                    <view class="decoration-circle decoration-3"></view>
                </view>

                <view class="progress-content">
                    <!-- 圆形进度条 -->
                    <view class="progress-circle">
                        <view class="circle-container">
                            <!-- 外层光晕效果 -->
                            <view class="circle-glow"></view>
                            
                            <!-- 背景圆环 -->
                            <view class="circle-bg"></view>
                            
                            <!-- 进度圆环 -->
                            <view class="circle-progress">
                                <!-- 进度端点装饰 -->
                                <view class="progress-dot"></view>
                            </view>
                            
                            <!-- 中心内容 -->
                            <view class="circle-content">
                                <view class="percentage-container">
                                    <text class="percentage">70</text>
                                    <text class="percent-sign">%</text>
                                </view>
                                <!-- 完成度文字 -->
                                <text class="completion-text">完成度</text>
                            </view>
                            
                            <!-- 装饰性星星 -->
                            <view class="star-decoration star-1">⭐</view>
                            <view class="star-decoration star-2">✨</view>
                        </view>
                    </view>

                    <!-- 进度信息 -->
                    <view class="progress-info-wrapper">
                        <view class="progress-info">
                            <text class="current">35</text>
                            <text class="separator">/</text>
                            <text class="total">50</text>
                            <text class="unit">词</text>
                        </view>
                        <view class="progress-bar-mini">
                            <view class="progress-bar-fill" style="width: 70%"></view>
                        </view>
                        <view class="progress-label-wrapper">
                            <text class="progress-label">今日目标</text>
                            <text class="progress-tip">还差 15 词就完成啦！</text>
                        </view>
                    </view>
                </view>
                <!-- 继续学习按钮 -->
                <view class="continue-btn">
                    <view class="btn-shine"></view>
                    <text class="btn-text">继续学习</text>
                    <text class="arrow">→</text>
                </view>
            </view>

            <!-- 统计数据区域 -->
            <view class="stats-section">
                <view class="stat-item">
                    <view class="stat-glow stat-glow-blue"></view>
                    <view class="stat-icon blue-icon">
                        <image
                            class="stat-icon-image"
                            src="/static/tools/tools-view-words.png"
                            mode="aspectFit"
                        />
                    </view>
                    <text class="stat-number">15</text>
                    <text class="stat-label">新词学习</text>
                </view>
                <view class="stat-item">
                    <view class="stat-glow stat-glow-purple"></view>
                    <view class="stat-icon purple-icon">
                         <image
                            class="stat-icon-image"
                            src="/static/tools/tools-view-review.png"
                            mode="aspectFit"
                        />
                    </view>
                    <text class="stat-number">20</text>
                    <text class="stat-label">待复习</text>
                </view>
                <view class="stat-item">
                    <view class="stat-glow stat-glow-green"></view>
                    <view class="stat-icon green-icon">
                        <image
                            class="stat-icon-image"
                            src="/static/other/right.png"
                            mode="aspectFit"
                        />
                    </view>
                    <text class="stat-number">850</text>
                    <text class="stat-label">已掌握</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue';
import WordsRemGuide from '../../../components/modules/tools/WordsRemGuide.vue';
import { getGreetingInfo } from '../../../util/greet';
import userAvatar from '../../../components/core/userAvatar.vue';
import {setWordRember} from '../../../API/Vocabulary/WordRemberAPI.js';

// 控制是否显示引导页
const iSshowGuide = ref(true);

// 处理引导完成事件
const handleGuideComplete = (settings) => {
    iSshowGuide.value = false;
    // 调用设置接口
    setWordRember({
        currentBook_id: settings.selectedBook._id,
        dailyGoal: settings.dailyGoal,
        currentBookTitle: settings.selectedBook.title,
    }).then(res => {
       if(res.code===200){
        // 显示成功提示
        uni.showToast({
            title: '设置成功',
            icon: 'success',
            duration: 1000
        });
        // 添加触觉反馈
        uni.vibrateShort({
            type: 'medium'
        });
       }else{
        // 显示失败提示
        uni.showToast({
            title: '设置失败',
            icon: 'none',
            duration: 1200
        });
       }
    });
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


.greeting {
    font-size: 28rpx;
    color: #666;
    margin-right: 10rpx;
    margin-left: 15rpx;
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

.header-setting-icon{
    width: 46rpx;
    height: 46rpx;
}

/* 主标题区域 */
.main-title {
    text-align: center;
    margin-bottom: 30rpx;
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
    position: relative;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 40rpx;
    padding: 60rpx 40rpx;
    margin: 0 20rpx 60rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10rpx);
    overflow: hidden;
}

/* 装饰性背景元素 */
.card-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
}

.decoration-circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.05;
}

.decoration-1 {
    width: 200rpx;
    height: 200rpx;
    background: linear-gradient(135deg, #2196F3, #1976D2);
    top: -50rpx;
    right: -50rpx;
    animation: float 6s ease-in-out infinite;
}

.decoration-2 {
    width: 150rpx;
    height: 150rpx;
    background: linear-gradient(135deg, #9C27B0, #7B1FA2);
    bottom: 50rpx;
    left: -30rpx;
    animation: float 8s ease-in-out infinite reverse;
}

.decoration-3 {
    width: 100rpx;
    height: 100rpx;
    background: linear-gradient(135deg, #4CAF50, #388E3C);
    top: 50%;
    right: 20rpx;
    animation: float 7s ease-in-out infinite;
}

@keyframes float {
    0%, 100% {
        transform: translateY(0) rotate(0deg);
    }
    50% {
        transform: translateY(-20rpx) rotate(180deg);
    }
}

.progress-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 35rpx;
    position: relative;
    z-index: 1;
}

.progress-circle {
    position: relative;
    margin-bottom: 34rpx;
}

.circle-container {
    position: relative;
    width: 320rpx;
    height: 320rpx;
}

/* 外层光晕效果 */
.circle-glow {
    position: absolute;
    top: -20rpx;
    left: -20rpx;
    width: calc(100% + 40rpx);
    height: calc(100% + 40rpx);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(33, 150, 243, 0.2) 0%, transparent 70%);
    animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 0.5;
    }
    50% {
        transform: scale(1.05);
        opacity: 0.8;
    }
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
            #64B5F6 126deg,
            #2196F3 252deg,
            transparent 252deg,
            transparent 360deg);
    mask: radial-gradient(circle at center, transparent 110rpx, black 110rpx, black 140rpx, transparent 140rpx);
    -webkit-mask: radial-gradient(circle at center, transparent 110rpx, black 110rpx, black 140rpx, transparent 140rpx);
    animation: progressRotate 2s ease-out;
}

@keyframes progressRotate {
    from {
        transform: rotate(-90deg);
        opacity: 0;
    }
    to {
        transform: rotate(0deg);
        opacity: 1;
    }
}

/* 进度端点装饰 */
.progress-dot {
    position: absolute;
    top: 20rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 24rpx;
    height: 24rpx;
    background: linear-gradient(135deg, #2196F3, #1976D2);
    border-radius: 50%;
    box-shadow: 0 4rpx 12rpx rgba(33, 150, 243, 0.5);
    animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
    0%, 100% {
        transform: translateX(-50%) scale(1);
    }
    50% {
        transform: translateX(-50%) scale(1.2);
    }
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
    margin-bottom: 8rpx;
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
    animation: numberCount 1.5s ease-out;
}

@keyframes numberCount {
    from {
        opacity: 0;
        transform: scale(0.5);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.percent-sign {
    font-size: 48rpx;
    color: #718096;
    font-weight: 600;
    margin-left: 6rpx;
    opacity: 0.8;
}

.completion-text {
    font-size: 22rpx;
    color: #999;
    letter-spacing: 2rpx;
}

/* 装饰性星星 */
.star-decoration {
    position: absolute;
    font-size: 32rpx;
    animation: starTwinkle 2s ease-in-out infinite;
}

.star-1 {
    top: 10rpx;
    right: 30rpx;
    animation-delay: 0s;
}

.star-2 {
    bottom: 20rpx;
    left: 20rpx;
    animation-delay: 1s;
}

@keyframes starTwinkle {
    0%, 100% {
        opacity: 0.3;
        transform: scale(1) rotate(0deg);
    }
    50% {
        opacity: 1;
        transform: scale(1.2) rotate(180deg);
    }
}


/* 进度信息包装器 */
.progress-info-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
}

.progress-info {
    display: flex;
    align-items: baseline;
}

.current {
    font-size: 40rpx;
    color: #FF9800;
    font-weight: 700;
    animation: numberSlide 1s ease-out;
}

@keyframes numberSlide {
    from {
        opacity: 0;
        transform: translateY(-20rpx);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
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

/* 迷你进度条 */
.progress-bar-mini {
    width: 200rpx;
    height: 8rpx;
    background: rgba(33, 150, 243, 0.1);
    border-radius: 4rpx;
    overflow: hidden;
    position: relative;
}

.progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #2196F3, #64B5F6);
    border-radius: 4rpx;
    transition: width 1s ease-out;
    position: relative;
    overflow: hidden;
}

.progress-bar-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}

.progress-label-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
}

.progress-label {
    font-size: 28rpx;
    color: #666;
}

.progress-tip {
    font-size: 24rpx;
    color: #2196F3;
    font-weight: 500;
}

/* 学习时长统计 */
.time-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 40rpx;
    padding: 30rpx 0;
    margin-bottom: 30rpx;
    background: linear-gradient(135deg, rgba(33, 150, 243, 0.05), rgba(33, 150, 243, 0.02));
    border-radius: 20rpx;
    position: relative;
    z-index: 1;
}

.time-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.time-icon {
    font-size: 28rpx;
}

.time-value {
    font-size: 32rpx;
    color: #333;
    font-weight: 700;
}

.time-unit {
    font-size: 24rpx;
    color: #666;
}

.time-divider {
    width: 2rpx;
    height: 40rpx;
    background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.1), transparent);
}

.continue-btn {
    position: relative;
    background: linear-gradient(135deg, #2196F3, #1976D2);
    border-radius: 30rpx;
    padding: 28rpx 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(33, 150, 243, 0.3);
    overflow: hidden;
    transition: all 0.3s ease;
    z-index: 1;
}

.continue-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #64B5F6, #2196F3);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.continue-btn:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(33, 150, 243, 0.4);
}

.continue-btn:active::before {
    opacity: 1;
}

/* 按钮光泽效果 */
.btn-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: btnShine 3s infinite;
    z-index: 1;
}

@keyframes btnShine {
    0% {
        left: -100%;
    }
    50%, 100% {
        left: 150%;
    }
}

.btn-text {
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    margin-right: 12rpx;
    position: relative;
    z-index: 2;
}

.arrow {
    color: #fff;
    font-size: 28rpx;
    position: relative;
    z-index: 2;
    animation: arrowMove 1.5s ease-in-out infinite;
}

@keyframes arrowMove {
    0%, 100% {
        transform: translateX(0);
    }
    50% {
        transform: translateX(8rpx);
    }
}

/* 统计数据区域 */
.stats-section {
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
    padding: 0rpx 20rpx;
    margin-bottom: 120rpx;
}

/* 光晕效果 */
.stat-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    border-radius: 50%;
    opacity: 0;
    filter: blur(30rpx);
    transition: opacity 0.6s ease;
    pointer-events: none;
    z-index: 0;
}

.stat-glow-blue {
    background: radial-gradient(circle, rgba(33, 150, 243, 0.4), transparent);
}

.stat-glow-purple {
    background: radial-gradient(circle, rgba(156, 39, 176, 0.4), transparent);
}

.stat-glow-green {
    background: radial-gradient(circle, rgba(76, 175, 80, 0.4), transparent);
}

.stat-item:active .stat-glow {
    opacity: 1;
}

.stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
    backdrop-filter: blur(20rpx);
    -webkit-backdrop-filter: blur(20rpx);
    border-radius: 28rpx;
    padding: 40rpx 20rpx 32rpx;
    margin: 0 4rpx;
    box-shadow: 
        0 8rpx 32rpx rgba(0, 0, 0, 0.08),
        0 2rpx 8rpx rgba(0, 0, 0, 0.04),
        inset 0 1rpx 2rpx rgba(255, 255, 255, 1);
    border: 1rpx solid rgba(255, 255, 255, 0.6);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

.stat-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease;
}

.stat-item::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    opacity: 0;
    transition: all 0.6s ease;
    pointer-events: none;
}

.stat-item:active {
    transform: translateY(-6rpx) scale(0.98);
    box-shadow: 
        0 12rpx 40rpx rgba(0, 0, 0, 0.12),
        0 4rpx 12rpx rgba(0, 0, 0, 0.06),
        inset 0 1rpx 2rpx rgba(255, 255, 255, 1);
}

.stat-item:active::before {
    opacity: 1;
}

.stat-item:active::after {
    opacity: 1;
    top: -25%;
    left: -25%;
}

.stat-icon {
    width: 100rpx;
    height: 100rpx;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    margin-bottom: 24rpx;
    position: relative;
    box-shadow: 
        0 4rpx 16rpx rgba(0, 0, 0, 0.06),
        inset 0 1rpx 1rpx rgba(255, 255, 255, 0.8);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-icon::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 24rpx;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, transparent 50%);
    pointer-events: none;
}

.stat-item:active .stat-icon {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 
        0 6rpx 20rpx rgba(0, 0, 0, 0.1),
        inset 0 2rpx 4rpx rgba(255, 255, 255, 1);
}

.blue-icon {
    background: linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(33, 150, 243, 0.08));
    border: 1rpx solid rgba(33, 150, 243, 0.2);
}

.purple-icon {
    background: linear-gradient(135deg, rgba(156, 39, 176, 0.15), rgba(156, 39, 176, 0.08));
    border: 1rpx solid rgba(156, 39, 176, 0.2);
}

.green-icon {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.08));
    border: 1rpx solid rgba(76, 175, 80, 0.2);
}

.stat-icon-image {
    width: 52rpx;
    height: 52rpx;
}

.stat-number {
    font-size: 44rpx;
    color: #333;
    font-weight: 700;
    margin-bottom: 12rpx;
    line-height: 1;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
    background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: numberFadeIn 0.6s ease-out;
}

@keyframes numberFadeIn {
    from {
        opacity: 0;
        transform: translateY(10rpx);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.stat-label {
    font-size: 24rpx;
    color: #666;
    letter-spacing: 0.5rpx;
    opacity: 0.9;
    font-weight: 500;
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
    box-shadow: 0 2rpx 8rpx rgba(255, 87, 34, 0.4);
}
</style>