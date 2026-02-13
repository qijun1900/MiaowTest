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
    
    <!-- 已上传的图片列表 -->
    <view v-if="imageList.length > 0" class="image-list">
      <view 
        v-for="(img, index) in imageList" 
        :key="index"
        class="image-item"
      >
        <image :src="img" mode="aspectFill" class="preview-image" />
        <view class="delete-image-btn" @click="removeImage(index)">
          <uni-icons type="close" size="14" color="#ffffff"></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
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

const emit = defineEmits(['update:modelValue', 'update:images']);

const imageList = ref([]);

// 处理输入
const handleInput = (value) => {
  emit('update:modelValue', value);
};

// 添加图片
const handleAddImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      imageList.value.push(tempFilePath);
      emit('update:images', imageList.value);
      
      uni.showToast({
        title: '图片添加成功',
        icon: 'success'
      });
    },
    fail: (err) => {
      console.error('选择图片失败:', err);
      uni.showToast({
        title: '图片选择失败',
        icon: 'none'
      });
    }
  });
};

// 删除图片
const removeImage = (index) => {
  imageList.value.splice(index, 1);
  emit('update:images', imageList.value);
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

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 20rpx;
}

.image-item {
  position: relative;
  width: 150rpx;
  height: 150rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.delete-image-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
