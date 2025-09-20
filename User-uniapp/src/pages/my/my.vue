<template>
  <view class="container">
    <!-- 用户信息区域 -->
    <view class="user-info">
      <view class="avatar-wrapper">
        <image 
          class="avatar" 
          :src="  isLoggedIn ? '/static/other/default-avatar.png' : '/static/other/default-user.png'" 
          mode="aspectFill"
        ></image>
      </view>
      <view class="user-detail" @click="handleUserinfo">
        <view class="user-info-content">
          <view class="login-btn" v-if="!isLoggedIn">点击登录</view>
          <view class="username" v-else>{{ userInfoStore.userInfo?.nickname ||  `第${91}位喵宝` }}</view>
          <view class="user-desc" v-if="!isLoggedIn">登录后可享受更多服务</view>
          <view class="user-openid" v-else><text class="openid-data">{{ userInfoStore.userInfo?.uid || '欢迎回来' }}</text></view>
        </view>
        <view class="arrow-right" v-if="isLoggedIn"><up-icon name="arrow-right" size="14px"></up-icon></view>
      </view>
    </view>
    
    <uviewOverlay v-model:show="overlayShow">
      <template #overlaycontent>
        <view class="rect">
          <view class="overlay-header">
            <view class="overlay-title">你还没登录</view>
            <text class="login-tips">请选择下面任意一种方式登录</text>
          </view>
          <view class="login-but">
            <!-- #ifdef H5 -->
            <up-button type="primary" icon="fingerprint" @click="handleUseAccountLogin">账号登录</up-button>
            <!-- #endif -->
            <!-- #ifdef MP-WEIXIN -->
            <up-button type="primary" icon="fingerprint" @click="handleUseAccountLogin">账号登录</up-button>
            <up-button color="#09B83E" type="success" icon="weixin-fill" @click="handleUseWXLogin">微信登录</up-button>
            <!-- #endif -->
            <!-- #ifndef H5 || MP-WEIXIN --> 
            <up-button type="primary" icon="fingerprint" @click="handleUseAccountLogin">账号登录</up-button>
            <up-button color="#09B83E" type="success" icon="weixin-fill" @click="handleUseWXLogin">微信登录</up-button>
            <!-- #endif -->
          </view>
          <view class="login-cancel">
            <up-button @click="handleCancelLogin">暂不登录</up-button>
          </view>
        </view>
      </template>
    </uviewOverlay>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import uviewOverlay from '../../components/core/uviewOverlay.vue';
import { UserInfoStore } from '../../stores/modules/UserinfoStore';
import { wechatLogin } from '../../util/wechatLogin';

const overlayShow = ref(false);
const userInfoStore = UserInfoStore();

// 使用计算属性来判断用户是否已登录
const isLoggedIn = computed(() => {
  return !!userInfoStore.userInfo && Object.keys(userInfoStore.userInfo).length > 0;
});

const handleUserinfo = () => {
  if (!isLoggedIn.value) {
    overlayShow.value = true;
  }else{
    uni.navigateTo({
      url: '/pages/my/UserInfoView'
    });
  }
};

const handleCancelLogin = () => {
  overlayShow.value = false;
};

// 微信程序端登录 - 使用工具函数
const handleUseWXLogin = async () => {
  overlayShow.value = false;
  try {
    await wechatLogin({
      onSuccess: () => {
        // 登录成功后关闭弹窗
        overlayShow.value = false;
      }
    });
  } catch (error) {
    console.error('微信登录失败', error);
  }
};

// 处理账号登录 h5端和小程序端
const handleUseAccountLogin = () => {
  overlayShow.value = false;
  uni.navigateTo({
    url: '/pages/my/UserLoginView'
  });
}

onMounted(() => {
  // 检查本地存储中是否有 token
  const token = uni.getStorageSync('token');
  // 如果有 token 但没有用户信息，可能需要重新获取用户信息
  if (token && !isLoggedIn.value) {
    console.log("Token exists but no user info, may need to fetch user data");
  }
});
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
  background: linear-gradient(135deg,#f5f5f5, #ecf9ff 100%);
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info-content {
  flex: 1;
}

.arrow-right {
  margin-left: 10rpx;
  flex-shrink: 0;
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
.user-openid {
  font-size: 25rpx;
  color: #333333;
}
.openid-data{
  font-size: 23rpx;
  color: #929292;
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