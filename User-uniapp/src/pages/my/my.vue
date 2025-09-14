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
    <view class="logout-btn" v-if="isLoggedIn">退出登录</view>

    <uviewOverlay v-model:show="overlayShow">
      <template #overlaycontent>
        <view class="rect">
          <view class="overlay-header">
            <view class="overlay-title">你还没登录</view>
            <text class="login-tips">请选择下面任意一种方式登录</text>
          </view>
          <view class="login-but">
            <up-button type="primary" icon="fingerprint">账号登录</up-button>
            <up-button color="#09B83E" type="success" icon="weixin-fill" @click="handleUseWXLogin">微信登录</up-button>
          </view>
          <view class="login-cancel">
            <up-button @click="handleCancelLogin">暂不登录</up-button>
          </view>
        </view>

      </template>
    </uviewOverlay>
    
    <uviewPopup 
      v-model:show="popupShow"
      :round="30">
        <template #popupcontent>
          <view>展示</view>

        </template>
    </uviewPopup>


  </view>
</template>

<script setup>
import { ref } from 'vue';
import uviewOverlay from '../../components/core/uviewOverlay.vue';
import uviewPopup from '../../components/core/uviewPopup.vue';
import { Userlogin } from '../../API/My/UserLoginAPI';
const overlayShow = ref(false)
const popupShow = ref(false)

const isLoggedIn = false; // 默认未登录状态

const handleLogin = () => {
  overlayShow.value = true;

}
const handleCancelLogin = () => {
  overlayShow.value = false;
}
const handleUseWXLogin = () => {
  overlayShow.value = false;
  // 在这里处理微信登录逻辑
  console.log('使用微信登录');
  uni.login({
    provider: 'weixin',
    success: (data) => {
      console.log('微信登录成功', data);
      const response = Userlogin(data.errMsg,data.code)
      console.log(response)
    },
    fail: (err) => {
      console.error('微信登录失败', err);
    }
  })
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
  width: 600rpx;
  height: 380rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}
.overlay-header{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15rpx 30rpx;
}
.overlay-title{
  font-size: 32rpx;
  font-weight: 580;
  color: #333333;
}
.login-tips{
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 10rpx;
}
.login-but {
  display: flex; /* 使用flex布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  gap: 20rpx; /* 添加按钮之间的间距 */
  padding: 10rpx 20rpx;
}
.login-cancel{
  padding: 15rpx 30rpx;
}
</style>