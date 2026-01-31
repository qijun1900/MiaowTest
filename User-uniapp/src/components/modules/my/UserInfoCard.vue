<template>
  <view 
    class="user-info-card" 
    :style="{ marginTop: marginTop }">
    <!-- 背景装饰元素 -->
    <view class="card-bg-decoration">
      <view class="decoration-circle circle-1"></view>
      <view class="decoration-circle circle-2"></view>
      <view class="decoration-wave"></view>
    </view>
    
    <!-- 主内容区 -->
    <view class="user-info-main" @click="handleClick">
      <!-- 头像区域 -->
      <view class="avatar-section">
        <view class="avatar-container">
          <!-- 头像装饰边框 -->
          <view class="avatar-ring"></view>
          <!-- 头像 -->
          <userAvatar :showOnline="false" :width="110" :height="110" />
        </view>
      </view>
      
      <!-- 用户信息区域 -->
      <view class="user-detail-section">
        <view class="user-info-wrapper">
          <!-- 未登录状态 -->
          <template v-if="!isLoggedIn">
            <view class="login-prompt">
              <text class="login-title">点击登录</text>
              <view class="login-badge">
                <text class="badge-text">新用户</text>
              </view>
            </view>
            <view class="login-desc">
              <text class="desc-icon">✨</text>
              <text class="desc-text">登录后可享受更多服务</text>
            </view>
          </template>
          
          <!-- 已登录状态 -->
          <template v-else>
            <view class="user-name-row">
              <text class="username-text">
                {{ userInfo?.nickname || `第${userInfo?.userCount}位哈基米` }}
              </text>
              <!-- VIP标识（可选） -->
              <view class="vip-badge" v-if="showVip">
                <text class="vip-text">VIP</text>
              </view>
            </view>
            <view class="user-id-row">
              <text class="id-label">ID:</text>
              <text class="id-value">{{ userInfo?.uid || '欢迎回来' }}</text>
            </view>
          </template>
        </view>
        
        <!-- 箭头指示器 -->
        <view class="arrow-indicator" v-if="isLoggedIn">
          <view class="arrow-icon">
            <up-icon name="arrow-right" size="16px" color="#999"></up-icon>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部状态栏（可选） -->
    <view class="user-status-bar" v-if="isLoggedIn && showStatusBar">
      <view class="status-item">
        <text class="status-value">{{ userInfo?.examCount || 0 }}</text>
        <text class="status-label">考试</text>
      </view>
      <view class="status-divider"></view>
      <view class="status-item">
        <text class="status-value">{{ userInfo?.favoriteCount || 0 }}</text>
        <text class="status-label">收藏</text>
      </view>
      <view class="status-divider"></view>
      <view class="status-item">
        <text class="status-value">{{ userInfo?.noteCount || 0 }}</text>
        <text class="status-label">笔记</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { UserInfoStore } from '../../../stores/modules/UserinfoStore';
import userAvatar from '../../core/userAvatar.vue';

// Props
const props = defineProps({
  // 顶部边距
  marginTop: {
    type: String,
    default: '0px'
  },
  // 是否显示VIP标识
  showVip: {
    type: Boolean,
    default: false
  },
  // 是否显示底部状态栏
  showStatusBar: {
    type: Boolean,
    default: true
  }
});

// Emits
const emit = defineEmits(['click']);

// Store
const userInfoStore = UserInfoStore();

// Computed
const isLoggedIn = computed(() => userInfoStore.isLoggedIn);
const userInfo = computed(() => userInfoStore.userInfo);

// Methods
const handleClick = () => {
  emit('click', { isLoggedIn: isLoggedIn.value, userInfo: userInfo.value });
};
</script>

<style scoped>
/* ==================== 用户信息卡片 - 美化版 ==================== */
.user-info-card {
  position: relative;
  margin: 0 0 30rpx 0;
  border-radius: 24rpx;
  overflow: hidden;
  background: linear-gradient(135deg, 
    #FFFFFF 0%, 
    #F8FBFF 50%,
    #F0F7FF 100%
  );
  box-shadow: 
    0 8rpx 32rpx rgba(66, 133, 244, 0.08),
    0 2rpx 8rpx rgba(66, 133, 244, 0.04),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  border: 1rpx solid rgba(255, 255, 255, 0.9);
  z-index: 9999;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 卡片点击效果 */
.user-info-card:active {
  transform: scale(0.98);
  box-shadow: 
    0 4rpx 16rpx rgba(66, 133, 244, 0.12),
    0 1rpx 4rpx rgba(66, 133, 244, 0.08);
}

/* 背景装饰元素 */
.card-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(66, 133, 244, 0.08) 0%, transparent 70%);
}

.circle-1 {
  width: 200rpx;
  height: 200rpx;
  top: -80rpx;
  right: -60rpx;
  animation: float 6s ease-in-out infinite;
}

.circle-2 {
  width: 150rpx;
  height: 150rpx;
  bottom: -50rpx;
  left: -40rpx;
  animation: float 8s ease-in-out infinite reverse;
}

.decoration-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60rpx;
  background: linear-gradient(90deg, 
    rgba(66, 133, 244, 0.03) 0%, 
    rgba(66, 133, 244, 0.05) 50%, 
    rgba(66, 133, 244, 0.03) 100%
  );
  border-radius: 50% 50% 0 0;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20rpx) scale(1.05);
  }
}

/* 主内容区 */
.user-info-main {
  position: relative;
  display: flex;
  align-items: center;
  padding: 32rpx 28rpx;
  z-index: 1;
}

/* 头像区域 */
.avatar-section {
  margin-right: 24rpx;
  flex-shrink: 0;
}

.avatar-container {
  position: relative;
  width: 110rpx;
  height: 110rpx;
}

/* 头像装饰环*/
.avatar-ring {
  position: absolute;
  top: -6rpx;
  left: -8rpx;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 2rpx solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #4285F4, #34A853, #FBBC04, #EA4335) border-box;
  animation: rotate 3s linear infinite;
  z-index: 0;
}

.avatar-container :deep(.avatar-container) {
  position: relative;
  z-index: 1;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 用户信息区域 */
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
}

/* 未登录状态 */
.login-prompt {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
  gap: 12rpx;
}

.login-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 0.5rpx;
}

.login-badge {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 12rpx;
  background: linear-gradient(135deg, #4285F4 0%, #34A853 100%);
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(66, 133, 244, 0.25);
}

.badge-text {
  font-size: 20rpx;
  font-weight: 500;
  color: #FFFFFF;
  letter-spacing: 0.5rpx;
}

.login-desc {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.desc-icon {
  font-size: 24rpx;
  line-height: 1;
}

.desc-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.4;
}

/* 已登录状态 */
.user-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
  gap: 12rpx;
}

.username-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 0.5rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400rpx;
}

.vip-badge {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 12rpx;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(255, 215, 0, 0.3);
}

.vip-text {
  font-size: 20rpx;
  font-weight: 600;
  color: #FFFFFF;
  letter-spacing: 1rpx;
}

.user-id-row {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.id-label {
  font-size: 24rpx;
  color: #999999;
  font-weight: 500;
}

.id-value {
  font-size: 24rpx;
  color: #666666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 350rpx;
}

/* 箭头指示器 */
.arrow-indicator {
  margin-left: 16rpx;
  flex-shrink: 0;
}

.arrow-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  background: rgba(66, 133, 244, 0.06);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.user-info-main:active .arrow-icon {
  background: rgba(66, 133, 244, 0.12);
  transform: translateX(4rpx);
}

/* 底部状态栏 */
.user-status-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 24rpx 28rpx;
  border-top: 1rpx solid rgba(66, 133, 244, 0.08);
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.5) 0%, 
    rgba(248, 251, 255, 0.8) 100%
  );
  z-index: 1;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  flex: 1;
  transition: transform 0.3s ease;
}

.status-item:active {
  transform: scale(0.95);
}

.status-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #4285F4;
  line-height: 1;
}

.status-label {
  font-size: 24rpx;
  color: #999999;
  line-height: 1;
}

.status-divider {
  width: 1rpx;
  height: 40rpx;
  background: linear-gradient(180deg, 
    transparent 0%, 
    rgba(66, 133, 244, 0.15) 50%, 
    transparent 100%
  );
}
</style>
