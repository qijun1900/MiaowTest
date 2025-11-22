<template>
  <view class="tips-section">
    <view class="tips-content">
      <view class="tips-text">登录即表示您同意</view>
      <view class="tips-link" @click="showUserAgreement">《用户协议》</view>
      <view class="tips-text">和</view>
      <view class="tips-link" @click="showPrivacyPolicy">《隐私政策》</view>
    </view>
  </view>
</template>

<script setup>
// 定义事件
const emit = defineEmits(['showUserAgreement', 'showPrivacyPolicy']);

// 显示用户服务协议
const showUserAgreement = () => {
  emit('showUserAgreement');
};

// 显示隐私政策
const showPrivacyPolicy = () => {
  emit('showPrivacyPolicy');
};
</script>

<style lang="scss" scoped>
.tips-section {
  margin-top: 20rpx;
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