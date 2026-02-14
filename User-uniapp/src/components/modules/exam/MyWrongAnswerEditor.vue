<template>
  <view v-if="show" class="my-wrong-answer-section">
    <view class="wrong-answer-header">
      <text class="wrong-answer-title">我的错解 (选填)</text>
      <view class="add-image-btn" @click="handleAddImage">
        <uni-icons type="image" size="18" color="#07c160"></uni-icons>
        <text class="add-image-text">添加图片</text>
      </view>
    </view>
    
    <!-- 错解输入框 -->
    <view class="wrong-answer-input-wrapper">
      <uniEditor 
        :placeholder="placeholder" 
        :modelValue="modelValue"
        @update:modelValue="handleInput"
        :height="props.height" 
        :id="editorId"
      />
    </view>
  </view>
</template>

<script setup>
import uniEditor from '../../core/uniEditor.vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '记录当时做错的答案...'
  },
  height: {
    type: String,
    default: '150rpx'
  },
  editorId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'add-image']);

// 处理输入
const handleInput = (value) => {
  emit('update:modelValue', value);
};

// 触发添加图片事件
const handleAddImage = () => {
  emit('add-image');
};
</script>

<style scoped>
.my-wrong-answer-section {
  margin: 30rpx 0;
}

.wrong-answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.wrong-answer-title {
  font-size: 28rpx;
  color: #ff4d4f;
  font-weight: 500;
}

.add-image-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  cursor: pointer;
}

.add-image-text {
  font-size: 28rpx;
  color: #07c160;
}

.wrong-answer-input-wrapper {
  width: 100%;
  background-color: #fff9f9;
  border-radius: 12rpx;
  border: 2rpx solid #d9d9d9;
  overflow: hidden;
}
</style>
