<template>
  <view class="login-container">
    <!-- 装饰性背景元素 -->
    <view class="bg-decoration top-left"></view>
    <view class="bg-decoration top-right"></view>
    <view class="bg-decoration bottom-left"></view>
    
    <view class="login-header">
      <view class="logo-container">
        <image class="logo" src="/static/other/login-cat.png" mode="aspectFit"></image>
        <view class="logo-bg">
          <u-icon name="account-fill" color="#ffffff" size="40"></u-icon>
        </view>
      </view>
      <text class="title">用户登录</text>
      <text class="subtitle">欢迎回来，请登录您的账号</text>
    </view>
    
    <view class="login-form">
      <u-form :model="formData" ref="uForm">
        <u-form-item prop="email">
          <u-input
            v-model="formData.email"
            placeholder="请输入邮箱"
            prefixIcon="email"
            prefixIconStyle="font-size: 22px;color: #909399"
            clearable
          ></u-input>
        </u-form-item>
        
        <u-form-item prop="password">
          <u-input
            v-model="formData.password"
            placeholder="请输入密码"
            prefixIcon="lock"
            prefixIconStyle="font-size: 22px;color: #909399"
            :password="showPassword"
            :suffixIconStyle="`font-size: 22px;color: #909399`"
            @clickSuffixIcon="showPassword = !showPassword"
          ></u-input>
        </u-form-item>
        
        <view class="form-options">
          <u-checkbox-group v-model="rememberMe">
            <u-checkbox :name="true" label="记住我"></u-checkbox>
          </u-checkbox-group>
          <text class="forget-pwd">忘记密码？</text>
        </view>
        
        <u-button type="primary" class="login-btn" @click="handleLogin">
          <u-icon name="arrow-rightward" color="#ffffff" size="18"></u-icon>
          <text class="btn-text">登录</text>
        </u-button>
        
        <view class="register-link">
          <text>还没有账号？</text>
          <text class="link-text" @click="goToRegister">立即注册</text>
          <u-icon name="arrow-rightward" color="#3c9cff" size="14"></u-icon>
        </view>
      </u-form>
    </view>
    
    <!-- 底部提示 - 改进兼容性 -->
    <view class="tips-section">
      <view class="tips-content">
        <view class="tips-text">登录即表示您同意</view>
        <view class="tips-link" @tap="showUserAgreement">《用户服务协议》</view>
        <view class="tips-text">和</view>
        <view class="tips-link" @tap="showPrivacyPolicy">《隐私政策》</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';

const showPassword = ref(true);
const rememberMe = ref([]);

const formData = reactive({
  email: '',
  password: ''
});

const handleLogin = () => {
  // 登录逻辑
  console.log('登录', formData);
};

const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/my/UserRegisterView'
  });
};

// 显示用户服务协议
const showUserAgreement = () => {
  uni.showModal({
    title: '用户服务协议',
    content: '用户服务协议内容...\n\n这里是用户服务协议的详细内容，包括服务条款、使用规则、责任限制等相关信息。',
    showCancel: false
  });
};

// 显示隐私政策
const showPrivacyPolicy = () => {
  uni.showModal({
    title: '隐私政策',
    content: '隐私政策内容...\n\n这里是隐私政策的详细内容，包括信息收集、使用、保护等相关政策。',
    showCancel: false
  });
};
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background-color: #f5f9ff;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  
  // 装饰性背景元素
  .bg-decoration {
    position: absolute;
    border-radius: 50%;
    z-index: 0;
    
    &.top-left {
      width: 200rpx;
      height: 200rpx;
      background: linear-gradient(135deg, rgba(60, 156, 255, 0.1), rgba(60, 156, 255, 0.05));
      top: -50rpx;
      left: -50rpx;
    }
    
    &.top-right {
      width: 150rpx;
      height: 150rpx;
      background: linear-gradient(135deg, rgba(60, 156, 255, 0.08), rgba(60, 156, 255, 0.03));
      top: 100rpx;
      right: -30rpx;
    }
    
    &.bottom-left {
      width: 180rpx;
      height: 180rpx;
      background: linear-gradient(135deg, rgba(60, 156, 255, 0.06), rgba(60, 156, 255, 0.02));
      bottom: 100rpx;
      left: -40rpx;
    }
  }
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60rpx;
  margin-bottom: 60rpx;
  position: relative;
  z-index: 1;
  
  .logo-container {
    position: relative;
    margin-bottom: 30rpx;
    
    .logo {
      width: 160rpx;
      height: 160rpx;
      border-radius: 30rpx;
      box-shadow: 0 10rpx 30rpx rgba(60, 156, 255, 0.2);
    }
    
    .logo-bg {
      position: absolute;
      bottom: -10rpx;
      right: -10rpx;
      width: 60rpx;
      height: 60rpx;
      background-color: #3c9cff;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4rpx 10rpx rgba(60, 156, 255, 0.3);
    }
  }
  
  .title {
    font-size: 44rpx;
    font-weight: bold;
    color: #3c9cff;
    margin-bottom: 10rpx;
  }
  
  .subtitle {
    font-size: 28rpx;
    color: #909193;
  }
}

.login-form {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 30rpx rgba(60, 156, 255, 0.1);
  position: relative;
  z-index: 1;
  
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 30rpx 0;
    
    .forget-pwd {
      color: #3c9cff;
      font-size: 28rpx;
    }
  }
  
  .login-btn {
    width: 100%;
    height: 90rpx;
    margin-top: 30rpx;
    background-color: #3c9cff;
    border-radius: 45rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10rpx;
    
    .btn-text {
      color: #ffffff;
      font-size: 32rpx;
      font-weight: bold;
    }
  }
  
  .register-link {
    text-align: center;
    margin-top: 40rpx;
    font-size: 28rpx;
    color: #909193;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6rpx;
    
    .link-text {
      color: #3c9cff;
    }
  }
}

.tips-section {
  margin-top: auto;
  margin-bottom: 50rpx;
  position: relative;
  z-index: 1;
  
  .tips-content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    
    .tips-text {
      font-size: 24rpx;
      color: #909193;
    }
    
    .tips-link {
      font-size: 24rpx;
      color: #3c9cff;
      margin: 0 6rpx;
    }
  }
}
</style>