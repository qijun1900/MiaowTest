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
      <text class="title">{{ bindMode ? '绑定账号' : '注册账户' }}</text>
      <text class="subtitle">{{ bindMode ? '请输入您的账号完成绑定' : '请输入您的邮箱完成注册' }}</text>
    </view>
    
    <view class="login-form">
      <u-form :model="formData" ref="uForm">
        <!-- 邮箱输入 -->
        <u-form-item prop="email">
          <u-input
            v-model="formData.email"
            placeholder="请输入邮箱地址"
            prefixIcon="email"
            prefixIconStyle="font-size: 22px;color: #909399"
            clearable
          ></u-input>
        </u-form-item>
        
        <!-- 验证码输入 -->
        <u-form-item prop="verifyCode">
          <view class="verify-wrapper">
            <view class="verify-input-wrap">
              <u-input
                v-model="formData.verifyCode"
                placeholder="请输入验证码"
                prefixIcon="attach"
                prefixIconStyle="font-size: 22px;color: #909399"
                maxlength="6"
              ></u-input>
            </view>
            <u-button 
              :text="verifyBtnText" 
              size="small"
              type="primary"
              class="verify-btn"
              :disabled="isCountingDown || !isEmailValid"
              @click="sendVerifyCode"
            ></u-button>
          </view>
        </u-form-item>
        
        <!-- 密码输入 -->
        <u-form-item prop="password">
          <u-input
            v-model="formData.password"
            placeholder="请设置登录密码"
            prefixIcon="lock-open"
            prefixIconStyle="font-size: 22px;color: #909399"
            :password="showPassword"
          ></u-input>
        </u-form-item>
        
        <!-- 确认密码输入 -->
        <u-form-item prop="confirmPassword">
          <u-input
            v-model="formData.confirmPassword"
            placeholder="请再次确认密码"
            prefixIcon="lock"
            prefixIconStyle="font-size: 22px;color: #909399"
            :password="showConfirmPassword"
          ></u-input>
        </u-form-item>
        
        <u-button type="primary" class="login-btn" :disabled="!canSubmit" @click="handleLogin">
          <u-icon name="arrow-rightward" color="#ffffff" size="18"></u-icon>
          <text class="btn-text">{{ bindMode ? '立即绑定' : '立即注册' }}</text>
        </u-button>
        
        <view class="register-link">
          <text>已有账号？</text>
          <text class="link-text" @click="goToLogin">去登录</text>
          <u-icon name="arrow-rightward" color="#3c9cff" size="14"></u-icon>
        </view>
      </u-form>
    </view>
    
    <!-- 底部提示 - 使用通用组件 -->
    <UserAgreementTips 
      v-model="agreed"
      @showUserAgreement="showUserAgreement" 
      @showPrivacyPolicy="showPrivacyPolicy" />
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { UserRegister, BindAccount } from '../../API/My/UserLoginAPI';
import navBarHeightUtil from '../../util/navBarHeight';
import UserAgreementTips from '../../components/modules/my/UserAgreementTips.vue';

// 绑定模式状态
const bindMode = ref(false);
const showPassword = ref(true);
const showConfirmPassword = ref(true);
const agreed = ref(false);
const navBarInfo = ref(0);


// 表单数据
const formData = reactive({
  email: '',
  verifyCode: '',
  password: '',
  confirmPassword: ''
});

// 验证码相关状态
const isCountingDown = ref(false);
const countdown = ref(0);
const countdownTimer = ref(null);

// 邮箱验证
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(formData.email);
});

// 验证码按钮文本
const verifyBtnText = computed(() => {
  if (isCountingDown.value) {
    return `${countdown.value}s`;
  }
  return '获取验证码';
});

// 是否可以提交表单
const canSubmit = computed(() => {
  return formData.email && 
         formData.verifyCode && 
         formData.password &&
         formData.confirmPassword
});

// 跳转登录页
const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/my/UserLoginView'
  });
};

// 发送验证码
const sendVerifyCode = async () => {
  if (isCountingDown.value) {
    return;
  }

  try {
    uni.showLoading({
      title: '发送中...',
      mask: true
    });

    // 这里应该调用实际的API发送验证码
    // 例如: await api.sendVerifyCode(formData.email);
    
    uni.hideLoading();
    
    uni.showToast({
      title: '验证码已发送',
      icon: 'success',
      duration: 2000
    });
    
    startCountdown();
    
  } catch (error) {
    console.error('验证码发送失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: '发送失败，请重试',
      icon: 'none',
      duration: 2000
    });
  }
};

// 处理注册/绑定
const handleLogin = async () => {
  if (!agreed.value) {
    uni.showToast({ title: '请先阅读并同意用户协议和隐私政策', icon: 'none', duration: 2000 });
    return;
  }

  try {
    if (!canSubmit.value) {
      uni.showToast({
        title: '请填写完整信息',
        icon: 'none',
        duration: 2000
      });
      throw new Error('表单填写不完整');
    }

    if (formData.password !== formData.confirmPassword) {
      await new Promise((resolve) => {
        uni.showModal({
          title: '密码不一致',
          content: '两次输入的密码不一致，请重新输入',
          showCancel: false,
          success: () => {
            formData.password = '';
            formData.confirmPassword = '';
            resolve();
          }
        });
      });
      throw new Error('密码不一致');
    }

    let result;
    if (bindMode.value) {
      result = await BindAccount({
        account: formData.email,
        verifyCode: formData.verifyCode,
        password: formData.password,
      });
    } else {
      result = await UserRegister({
        account: formData.email,
        verifyCode: formData.verifyCode,
        password: formData.password,
      });
    }
    
    if (result.code === 200) {
      uni.showToast({
        title: result.message,
        icon: 'success',
        duration: 2000
      });
      
      if (bindMode.value) {
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } else {
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/my/UserLoginView' });
        }, 1500);
      }
    }
  } catch (error) {
    console.error(bindMode.value ? '绑定异常:' : '注册异常:', error);
    const errorMsg = error.message || '网络异常，请稍后重试';
    uni.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 2000
    });
    throw error;
  }
};

// 开始倒计时
const startCountdown = () => {
  isCountingDown.value = true;
  countdown.value = 60;
  
  countdownTimer.value = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      stopCountdown();
    }
  }, 1000);
};

// 停止倒计时
const stopCountdown = () => {
  isCountingDown.value = false;
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
  }
};

// 用户服务协议
const showUserAgreement = () => {
  uni.navigateTo({
    url: '/pages/public/UserAgreementView'
  });
};

// 隐私政策
const showPrivacyPolicy = () => {
  uni.navigateTo({
    url: '/pages/public/PrivacyPolicyView'
  });
};

onLoad((options) => {
  if(options.isBind === "true"){
    bindMode.value = true;
  }
});

onMounted(() => {
  const info = navBarHeightUtil.getNavBarInfo();
  navBarInfo.value = info.totalHeight;
});

onUnmounted(() => {
  stopCountdown();
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
  
  .verify-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    
    .verify-input-wrap {
      flex: 1;
      min-width: 0;
    }
    
    .verify-btn {
      margin-left: 20rpx;
      flex-shrink: 0;
      width: 200rpx;
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
</style>