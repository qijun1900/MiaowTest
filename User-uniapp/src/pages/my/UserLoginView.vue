<template>
  <view class="login-container">
    <!-- 自定义 添加返回按钮 -->
    <view class="back-btn" :style="{ top: backBtnTop }" @click="goBack">
      <u-icon name="arrow-left" color="#3c9cff" size="24"></u-icon>
      <text class="back-text">返回</text>
    </view>
    
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
    
    <!-- 添加微信登录按钮 -->
    <!-- #ifdef MP-WEIXIN -->
    <view class="wechat-login-section">
      <view class="divider">
        <text class="divider-text">其他登录方式</text>
      </view>
      <view class="wechat-login-container">
        <view class="wechat-login-btn" @click="handleUseWXLogin">
          <u-icon name="weixin-fill" color="#ffffff" size="28"></u-icon>
        </view>
        <text class="wechat-login-text">微信一键登录</text>
      </view>
    </view>
    <!-- #endif -->
    
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
import { ref, reactive, onMounted, computed } from 'vue';
import { UserAccountLogin } from '../../API/My/UserLoginAPI';
import { UserInfoStore } from '../../stores/modules/UserinfoStore';
import { wechatLogin } from '../../util/wechatLogin';
import navBarHeightUtil from '../../util/navBarHeight';

const showPassword = ref(true);
const rememberMe = ref([]);
const userInfoStore = UserInfoStore();
const navBarInfo = ref(0);// 导航栏高度信息

// 计算返回按钮的top位置
const backBtnTop = computed(() => {
  // 根据导航栏高度信息计算返回按钮位置
  return navBarInfo.value ? navBarInfo.value + 'rpx' : '75rpx';
});

const formData = reactive({
  email: '',
  password: ''
});

// 返回上一页的方法
const goBack = () => {
  uni.switchTab({
    url: '/pages/my/my'
  });
};

const handleLogin = async () => {
  try {
    const response = await UserAccountLogin({
      account: formData.email,
      password: formData.password
    });
    
    // 处理登录成功的情况
    if(response.code === 200 && response.success){
      uni.showToast({
        title: '登录成功',
        icon:'success',
        duration:2000
      });
      uni.setStorageSync('token',response.data.token); // 存储 Token
      userInfoStore.setUserInfo(response.data.userInfo); // 存储用户信息
      
      // 登录成功后返回上一页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/my/my'
        })
      }, 1500);
      return;
    }
    
    // 处理各种错误情况
    if(response.code === 404) {
      // 账号尚未注册
      uni.showModal({
        title: '提示',
        content: response.message || '账号尚未注册',
        confirmText: '去注册',
        success: function (res) {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/my/UserRegisterView'
            });
          }
        }
      });
    } else if(response.code === 401) {
      // 密码或账号错误
      uni.showToast({
        title: response.message || '密码或账号错误',
        icon: 'none',
        duration: 2000
      });
    } else {
      // 其他错误
      uni.showToast({
        title: response.message || '登录失败，请稍后重试',
        icon: 'none',
        duration: 2000
      });
    }
  }catch (error) {
    // 网络错误或其他异常
    uni.showToast({
      title: error.message || '网络异常，请稍后重试',
      icon: 'none',
      duration: 2000
    });
  }
};

// 微信登录方法 - 使用工具函数
const handleUseWXLogin = async () => {
  try {
    await wechatLogin();
  } catch (error) {
    console.error('微信登录失败', error);
    uni.showToast({
      title: '微信登录失败',
      icon: 'none'
    })
  }
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

// 计算导航栏高度
onMounted(() => {
  const info = navBarHeightUtil.getNavBarInfo();
  navBarInfo.value = info.totalHeight;
});

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
  
  // 返回按钮样式
  .back-btn {
    position: absolute;
    left: 20rpx;
    display: flex;
    align-items: center;
    gap: 10rpx;
    z-index: 10;
    padding: 10rpx 20rpx;
    border-radius: 20rpx;
    background-color: rgba(255, 255, 255, 0.8);
    
    .back-text {
      font-size: 28rpx;
      color: #3c9cff;
    }
  }
  
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

// 微信登录部分样式
.wechat-login-section {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  
  .divider {
    width: 100%;
    text-align: center;
    margin-bottom: 50rpx;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #e5e5e5;
    }
    
    .divider-text {
      font-size: 26rpx;
      color: #909193;
      background-color: #f5f9ff;
      padding: 0 20rpx;
      position: relative;
      z-index: 1;
    }
  }
  
  .wechat-login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .wechat-login-btn {
    width: 120rpx;
    height: 120rpx;
    background: linear-gradient(135deg, #09BB07, #07C160);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 8rpx 25rpx rgba(9, 187, 7, 0.4);
    transition: all 0.3s ease;
    margin-bottom: 10rpx;
    
    &:active {
      transform: scale(0.95);
      box-shadow: 0 4rpx 15rpx rgba(9, 187, 7, 0.4);
    }
  }
  
  .wechat-login-text {
    font-size: 26rpx;
    color: #666666;
    margin-top: 5rpx;
  }
}

.tips-section {
  margin-top: auto;
  margin-bottom: 10rpx;
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