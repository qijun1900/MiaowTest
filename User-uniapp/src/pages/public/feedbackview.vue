<template>
  <view class="feedback-container">
    <view class="form-container" v-if="!isSuccess">
      <view >
      <!-- 反馈类型 -->
      <view class="form-item">
        <text class="label">反馈类型 <text class="required">*</text></text>
        <radio-group 
          @change="onTypeChange">
          <label 
            class="radio-item" 
            v-for="(item, index) in feedbackTypes" 
            :key="index">
            <radio :value="item.value.toString()" :checked="type === item.value" />
            <text class="radio-text">{{ item.label }}</text>
          </label>
        </radio-group>
      </view>
      
      <!-- 反馈内容 -->
      <view class="form-item">
        <text class="label">反馈内容 <text class="required">*</text></text>
        <textarea 
          v-model="content" 
          placeholder="请详细描述您遇到的问题或建议帮助我们改进" 
          class="textarea"
          maxlength="500"
        />
        <text class="char-count">{{ content.length }}/500</text>
      </view>
      
      <!-- 联系方式 -->
      <view class="form-item">
        <text class="label">联系方式(可选)</text>
        <input 
          v-model="contactInfo" 
          placeholder="请输入您的手机号或邮箱，方便我们联系您(可选)" 
          class="input"
        />
      </view>
      
      <!-- 提交按钮 -->
      <button 
        v-if="!isSuccess"
        class="submit-btn" 
        @click="submitFeedback" 
        :disabled="isSubmitting">
        {{ isSubmitting ? '提交中...' : '提交反馈' }}
      </button>
      </view>
    </view>
    <!-- 显示提交成功页面 -->
    <view v-if="isSuccess" class="success-content">
      <image src="/static/other/feedback.png" mode="aspectFit"></image>
      <text class="success-text">
        感谢您的反馈！我们会尽快处理您的问题。
      </text>
      <button 
        class="resubmit-btn" 
        @click="resubmitFeedback">
        再次提交
      </button>
      <button 
        class="back-btn" 
        @click="backTo">
        返回
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref} from 'vue';
import { submitFeedbackAPI } from '../../API/public/FeedbackAPI';
import { onLoad } from '@dcloudio/uni-app';
// 反馈类型选项
const feedbackTypes = [
  { value: 1, label: '系统反馈' },
  { value: 2, label: '题目反馈' },
  { value: 3, label: '功能建议' },
  { value: 4, label: '其他' }
];

// 表单数据
const type = ref(1); // 默认选择系统反馈
const content = ref('');// 反馈内容
const contactInfo = ref('');// 联系方式
const isSubmitting = ref(false);// 提交状态
const isSuccess = ref(false);// 提交成功状态

// 反馈类型改变
const onTypeChange = (e) => {
  type.value = parseInt(e.detail.value);
};

// 提交反馈
const submitFeedback = async () => {
  // 表单验证
  if (!content.value.trim()) {
    uni.showToast({
      title: '请填写反馈内容',
      icon: 'error'
    });
    return;
  }
  
  try {
    isSubmitting.value = true;
    isSuccess.value = false;
     
    // 准备提交数据
    const feedbackData = {
      type: type.value,
      content: content.value.trim(),
      contactInfo: contactInfo.value.trim()
    };

    // 调用API提交反馈
    const result = await submitFeedbackAPI(feedbackData);
    if (result.code === 200) {
      isSuccess.value = true;
      uni.showToast({
        title: result.message,
        icon: 'success'
      });
    }else{
      uni.showToast({
        title: result.message,
        icon:'error'
      });
    }
  
  } catch (error) {
    console.error('提交反馈失败:', error);
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    });
  } finally {
    isSubmitting.value = false;
  }
};

// 再次提交反馈
const resubmitFeedback = () => {
  isSuccess.value = false;
  // 重置表单
  content.value = '';
  contactInfo.value = '';
  type.value = 1;
};

// 返回上一页
const backTo = () => {
  uni.navigateBack({
    delta: 1
  })
};

onLoad((option) => {
  // 页面加载时执行的逻辑
  console.log('FeedbackView页面加载',option);
  if(option.type){
    type.value = Number(option.type);
  }

  if(option.content){
    content.value = option.content;
    
  } 

})

</script>

<style scoped>
.feedback-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.form-container {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  font-size: 30rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: bold;
}

.required {
  color: #ff4d4f;
}

.radio-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.radio-text {
  margin-left: 20rpx;
  font-size: 28rpx;
  color: #333;
}

.textarea {
  width: 100%;
  height: 300rpx;
  border: 1rpx solid #d9d9d9;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #d9d9d9;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  background-color: #007aff;
  color: #fff;
  border-radius: 8rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40rpx;
}

.submit-btn[disabled] {
  background-color: #ccc;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.success-content image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 40rpx;
}

.success-text {
  font-size: 32rpx;
  color: #333;
  text-align: center;
  margin-bottom: 60rpx;
  line-height: 1.5;
}

.resubmit-btn, .back-btn {
  width: 80%;
  height: 80rpx;
  border-radius: 8rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.resubmit-btn {
  background-color: #007aff;
  color: #fff;
}

.back-btn {
  background-color: #f5f5f5;
  color: #333;
}
</style>