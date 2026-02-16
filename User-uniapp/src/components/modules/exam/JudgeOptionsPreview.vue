<template>
  <view class="judge-options-section">
    <view v-if="showTitle" class="section-title">
      <uni-icons type="help" color="#007aff" size="18"></uni-icons>
      <text class="section-title-text">判断选项</text>
    </view>
    
    <view 
      v-for="(option, index) in judgeOptions" 
      :key="index" 
      class="judge-option-item" 
      :class="{
        'correct-option': isCorrectOption(index),
        'user-wrong-option': isUserWrongOption(index)
      }"
    >
      <view class="judge-option-wrapper">
        <text class="option-tag">{{ getOptionLabel(index) }}</text>
        <text class="option-content">{{ option }}</text>
        <view class="option-status">
          <uni-icons 
            v-if="isCorrectOption(index)" 
            type="checkmarkempty" 
            color="#4caf50" 
            size="18"
          ></uni-icons>
          <uni-icons 
            v-else-if="isUserWrongOption(index)" 
            type="closeempty" 
            color="#f44336" 
            size="18"
          ></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  // 正确答案（字符串，可以是 "A"/"B" 或 "正确"/"错误"）
  correctAnswer: {
    type: String,
    required: true,
    default: 'A'
  },
  // 用户的错误答案（字符串，可以是 "A"/"B" 或 "正确"/"错误"）
  userWrongAnswer: {
    type: String,
    default: ''
  },
  // 是否显示标题
  showTitle: {
    type: Boolean,
    default: true
  }
});

// 判断题选项固定为 ['正确', '错误']
const judgeOptions = ['正确', '错误'];

// 获取选项标签（A, B）
const getOptionLabel = (index) => {
  return String.fromCharCode(65 + index) + '.';
};

// 将答案标准化为选项文本（"正确" 或 "错误"）
const normalizeAnswer = (answer) => {
  if (!answer) return '';
  const trimmed = answer.trim();
  
  // 如果是字母格式
  if (trimmed === 'A') return '正确';
  if (trimmed === 'B') return '错误';
  
  // 如果已经是中文格式，直接返回
  return trimmed;
};

// 判断是否是正确选项
const isCorrectOption = (index) => {
  const optionText = judgeOptions[index]; // "正确" 或 "错误"
  const normalizedCorrect = normalizeAnswer(props.correctAnswer);
  return normalizedCorrect === optionText;
};

// 判断是否是用户的错误选项
const isUserWrongOption = (index) => {
  if (!props.userWrongAnswer) return false;
  const optionText = judgeOptions[index]; // "正确" 或 "错误"
  const normalizedWrong = normalizeAnswer(props.userWrongAnswer);
  return normalizedWrong === optionText;
};
</script>

<style scoped>
/* 判断题选项样式 */
.judge-options-section {
  margin-bottom: 24rpx;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.section-title-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.judge-option-item {
  margin-bottom: 12rpx;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  background-color: #f8f9fa;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.judge-option-item.correct-option {
  background-color: #e8f5e9;
  border: 2rpx solid #4caf50;
}

.judge-option-item.user-wrong-option {
  background-color: #ffebee;
  border: 2rpx solid #f44336;
}

.judge-option-wrapper {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.option-tag {
  font-size: 26rpx;
  font-weight: bold;
  color: #007aff;
  min-width: 40rpx;
}

.option-content {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
}

.option-status {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40rpx;
}
</style>
