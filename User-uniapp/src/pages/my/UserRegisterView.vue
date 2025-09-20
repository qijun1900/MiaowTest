<template>
  <view class="login-container">
    <!-- 顶部背景装饰 -->
    <view class="header-decoration">
      <view class="decoration-circle"></view>
      <view class="decoration-wave"></view>
    </view>
    
    <!-- 登录表单区域 -->
    <view class="login-content">
      <!-- 标题区域 -->
      <view class="title-section">
        <view class="login-icon">
          <up-icon name="account" size="48" color="#5DADE2"></up-icon>
        </view>
        <text class="login-title">注册账户</text>
        <text class="login-subtitle">请输入您的邮箱完成注册</text>
      </view>
      
      <!-- 表单区域 -->
      <view class="form-section">
        <!-- 邮箱输入 -->
        <view class="form-item">
          <view class="input-wrapper">
            <up-icon name="email" size="20" color="#AED6F1" class="input-icon"></up-icon>
            <input 
              class="form-input"
              type="text"
              v-model="email"
              placeholder="请输入邮箱地址"
              placeholder-style="color: #AED6F1; font-size: 28rpx;"
              @input="onEmailInput"
            />
          </view>
        </view>
        
        <!-- 验证码输入 -->
        <view class="form-item">
          <view class="input-wrapper verify-wrapper">
            <up-icon name="attach" size="20" color="#AED6F1" class="input-icon"></up-icon>
            <input 
              class="form-input verify-input"
              type="text"
              v-model="verifyCode"
              placeholder="请输入验证码"
              placeholder-style="color: #AED6F1; font-size: 28rpx;"
              maxlength="6"
            />
            <up-button 
              :text="verifyBtnText" 
              size="small"
              :color="verifyBtnColor"
              class="verify-btn"
              :disabled="isCountingDown || !isEmailValid"
              @click="sendVerifyCode"
            ></up-button>
          </view>
        </view>
        
        <!-- 密码输入 -->
        <view class="form-item">
          <view class="input-wrapper">
            <up-icon name="lock-open" size="20" color="#AED6F1" class="input-icon"></up-icon>
            <up-input 
              placeholder="请设置登录密码" 
              type="password"
              v-model="password"
              placeholder-style="color: #AED6F1; font-size: 28rpx;"
              :show-password="false"
            ></up-input>
          </view>
        </view>
        
        <!-- 确认密码输入 -->
        <view class="form-item">
          <view class="input-wrapper">
            <up-icon name="lock" size="20" color="#AED6F1" class="input-icon"></up-icon>
            <up-input 
              placeholder="请再次确认密码" 
              type="password"
              v-model="confirmPassword"
              placeholder-style="color: #AED6F1; font-size: 28rpx;"
              :show-password="false"
            ></up-input>
          </view>
        </view>
      </view>
      
      <!-- 登录按钮 -->
      <view class="button-section">
        <up-button 
          text="立即注册" 
          color="#5DADE2"
          size="large"
          class="login-btn"
          shape="circle"
          :disabled="!canSubmit"
          @click="handleLogin"
        ></up-button>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { UserRegister } from '../../API/My/UserLoginAPI';

// 表单数据
const email = ref('');
const verifyCode = ref('');
const password = ref('');
const confirmPassword = ref('');

// 验证码相关状态
const isCountingDown = ref(false);
const countdown = ref(0);
const countdownTimer = ref(null);

// 邮箱验证
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value);
});

// 验证码按钮文本
const verifyBtnText = computed(() => {
  if (isCountingDown.value) {
    return `${countdown.value}秒后重试`;
  }
  return '获取验证码';
});

// 验证码按钮颜色
const verifyBtnColor = computed(() => {
  if (isCountingDown.value) {
    return '#95A5A6';
  }
  return '#5DADE2';
});

// 是否可以提交表单
const canSubmit = computed(() => {
  return email.value && 
         verifyCode.value && 
         password.value
});

// 邮箱输入处理
const onEmailInput = (e) => {
  email.value = e.detail.value;
};

// 发送验证码
const sendVerifyCode = async () => {

  if (isCountingDown.value) {
    return;
  }

  try {
    // 发送验证码请求
    uni.showLoading({
      title: '发送中...',
      mask: true
    });

    // 这里应该调用实际的API发送验证码
    // 例如: await api.sendVerifyCode(email.value);
    
    uni.hideLoading();
    
    uni.showToast({
      title: '验证码已发送',
      icon: 'success',
      duration: 2000
    });
    
    // 开始倒计时
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

// 处理登录
// 简化后的 handleLogin 函数
const handleLogin = async () => {
  try {
    // 检查表单是否可提交
    if (!canSubmit.value) {
      uni.showToast({
        title: '请填写完整信息',
        icon: 'none',
        duration: 2000
      });
      throw new Error('表单填写不完整');
    }

    // 检查密码是否一致
    if (password.value !== confirmPassword.value) {
      await new Promise((resolve) => {
        uni.showModal({
          title: '密码不一致',
          content: '两次输入的密码不一致，请重新输入',
          showCancel: false,
          success: () => {
            password.value = '';
            confirmPassword.value = '';
            resolve();// 确保密码输入框被清空
          }
        });
      });
      throw new Error('密码不一致');
    }

    // 调用注册 API
    const result = await UserRegister({
      account: email.value,
      verifyCode: verifyCode.value,
      password: password.value,
    });
    if (result.code === 200) {
      uni.showToast({
        title: result.message,
        icon: 'success',
        duration: 2000
      });
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/my/UserLoginView' });
      }, 1500);
    }


  } catch (error) {
    console.error('注册异常:', error);
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

// 组件卸载时清理定时器
onUnmounted(() => {
  stopCountdown();
});
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #E8F6F3 0%, #D6EAF8 100%);
  position: relative;
  overflow: hidden;
}

/* 顶部装饰 */
.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  top: -100rpx;
  right: -100rpx;
  width: 300rpx;
  height: 300rpx;
  background: rgba(93, 173, 226, 0.1);
  border-radius: 50%;
}

.decoration-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: linear-gradient(45deg, transparent 30%, rgba(93, 173, 226, 0.05) 70%);
  border-radius: 0 0 50% 50%;
}

/* 登录内容区域 */
.login-content {
  position: relative;
  z-index: 2;
  padding: 80rpx 60rpx 40rpx;
}

/* 标题区域 */
.title-section {
  text-align: center;
  margin-bottom: 80rpx;
}

.login-icon {
  margin-bottom: 30rpx;
}

.login-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #2C3E50;
  margin-bottom: 16rpx;
}

.login-subtitle {
  display: block;
  font-size: 28rpx;
  color: #7F8C8D;
}

/* 表单区域 */
.form-section {
  margin-bottom: 60rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(93, 173, 226, 0.1);
  border: 2rpx solid rgba(93, 173, 226, 0.2);
}

/* 验证码输入区域样式优化 */
.verify-wrapper {
  padding-right: 15rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.verify-input {
  flex: 1;
  margin-right: 10rpx;
  min-width: 0; /* 允许flex项目收缩 */
}

.verify-btn {
  margin-left: 0;
  min-width: 180rpx;
  max-width: 220rpx; /* 限制按钮最大宽度 */
  height: 70rpx;
  font-size: 24rpx; /* 减小字体大小以适应更小的按钮 */
  font-weight: 500;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(93, 173, 226, 0.2);
  transition: all 0.3s ease;
  flex-shrink: 0; /* 防止按钮被压缩 */
}

/* 按钮禁用状态 */
.verify-btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 按钮点击效果 */
.verify-btn:active:not([disabled]) {
  transform: scale(0.98);
}

.input-icon {
  margin-right: 20rpx;
  flex-shrink: 0; /* 防止图标被压缩 */
}

.form-input {
  flex: 1;
  font-size: 30rpx;
  color: #2C3E50;
  height: 40rpx;
  line-height: 40rpx;
}



/* 按钮区域 */
.button-section {
  margin-bottom: 40rpx;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  font-size: 32rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 20rpx rgba(93, 173, 226, 0.3);
  transition: all 0.3s ease;
}

</style>