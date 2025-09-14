<template>
  <view class="container">
    <!-- 用户信息区域 -->
    <view class="user-info">
      <view class="avatar-wrapper">
        <image class="avatar" src="/static/other/default-avatar.png" mode="aspectFill"></image>
      </view>
      <view class="user-detail" @click="handleLogin">
        <view class="login-btn" v-if="!isLoggedIn">点击登录</view>
        <view class="username" v-else>用户名</view>
        <view class="user-desc">登录后可享受更多服务</view>
      </view>
    </view>
    <!-- 退出登录按钮 -->
    <view class="logout-btn" v-if="isLoggedIn">退出登录</view>
      <uviewOverlay v-model:show="overlayShow">
        <template #overlaycontent>
          <view class="rect">
          </view>
          
        </template>
      </uviewOverlay>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import uviewOverlay from '../../components/core/uviewOverlay.vue';
const overlayShow = ref(false)

const isLoggedIn = false; // 默认未登录状态

const handleLogin = () => {
  overlayShow.value = true;



}




</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.avatar-wrapper {
  margin-right: 30rpx;
}

.avatar {
  width: 110rpx;
  height: 110rpx;
  border-radius: 60rpx;
  background-color: #eaeaea;
}

.user-detail {
  flex: 1;
}

.login-btn {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.user-desc {
  font-size: 26rpx;
  color: #999999;
}

.logout-btn {
  background-color: #ffffff;
  border-radius: 16rpx;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 32rpx;
  color: #ff4d4f;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}
.warp {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.rect {
  width: 120px;
  height: 120px;
  background-color: #fff;
}

</style>