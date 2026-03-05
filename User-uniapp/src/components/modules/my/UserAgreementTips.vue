<template>
  <view class="tips-section">
    <view class="tips-content" @click="toggleAgreed">
      <!-- 自定义复选框 -->
      <view class="custom-checkbox" :class="{ checked: modelValue }"></view>
      <view class="tips-text">我已阅读并同意</view>
      <view class="tips-link" @click.stop="showUserAgreement">《用户协议》</view>
      <view class="tips-text">和</view>
      <view class="tips-link" @click.stop="showPrivacyPolicy">《隐私政策》</view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'showUserAgreement', 'showPrivacyPolicy']);

const toggleAgreed = () => {
  emit('update:modelValue', !props.modelValue);
};

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

    .custom-checkbox {
      flex-shrink: 0;
      width: 34rpx;
      height: 34rpx;
      border-radius: 6rpx;
      border: 2rpx solid #c0c4cc;
      background-color: #fff;
      margin-right: 10rpx;
      position: relative;

      &.checked {
        background-color: #3c9cff;
        border-color: #3c9cff;

        &::after {
          content: '';
          position: absolute;
          left: 8rpx;
          top: 3rpx;
          width: 10rpx;
          height: 18rpx;
          border-right: 3rpx solid #fff;
          border-bottom: 3rpx solid #fff;
          transform: rotate(45deg);
        }
      }
    }

    .tips-text {
      font-size: 24rpx;
      color: #909193;
    }

    .tips-link {
      font-size: 24rpx;
      color: #3c9cff;
      margin: 0 4rpx;
    }
  }
}
</style>