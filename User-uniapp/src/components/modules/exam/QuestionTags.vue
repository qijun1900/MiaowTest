<template>
  <view v-if="show" class="tags-section">
    <view class="tags-title">标签</view>
    
    <!-- 已选标签 -->
    <view v-if="selectedTags.length > 0" class="selected-tags">
      <view 
        v-for="(tag, index) in selectedTags" 
        :key="index"
        class="tag-item selected"
      >
        <text>{{ tag }}</text>
        <view class="tag-close" @click="removeTag(index)">
          <uni-icons type="close" size="14" color="#ffffff"></uni-icons>
        </view>
      </view>
    </view>
    
    <!-- 自定义标签输入 -->
    <view class="custom-tag-input">
      <input 
        class="tag-input" 
        v-model="customTagInput"
        placeholder="在此标签..."
        @confirm="addCustomTag"
      />
      <view class="add-tag-btn" @click="addCustomTag">
        <uni-icons type="plus" size="20" color="#ff9a76"></uni-icons>
      </view>
    </view>
    
    <!-- 推荐标签 -->
    <view class="recommended-tags">
      <view 
        v-for="(tag, index) in recommendedTags" 
        :key="index"
        class="tag-item recommended"
        :class="{ 'added': selectedTags.includes(tag) }"
        @click="addRecommendedTag(tag)"
      >
        <uni-icons type="plus" size="12" color="#999"></uni-icons>
        <text>{{ tag }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

const customTagInput = ref('');
const recommendedTags = ref([
  '公式',
  '概念',
  '计算错误',
  '审题不清',
  '粗心',
  '解题方法',
  '其他'
]);

const selectedTags = computed({
  get: () => [...props.modelValue],
  set: (val) => emit('update:modelValue', [...val])
});

// 添加自定义标签
const addCustomTag = () => {
  const tag = customTagInput.value.trim();
  const currentTags = [...props.modelValue];
  if (tag && !currentTags.includes(tag)) {
    emit('update:modelValue', [...currentTags, tag]);
    customTagInput.value = '';
  } else if (currentTags.includes(tag)) {
    uni.showToast({
      title: '标签已存在',
      icon: 'none'
    });
  }
};

// 添加推荐标签
const addRecommendedTag = (tag) => {
  const currentTags = [...props.modelValue];
  if (!currentTags.includes(tag)) {
    emit('update:modelValue', [...currentTags, tag]);
  } else {
    uni.showToast({
      title: '标签已存在',
      icon: 'none'
    });
  }
};

// 移除标签
const removeTag = (index) => {
  const currentTags = [...props.modelValue];
  currentTags.splice(index, 1);
  emit('update:modelValue', currentTags);
};
</script>

<style scoped>
.tags-section {
  margin: 30rpx 0;
  padding: 30rpx;
  background: #fffbf7;
  border-radius: 16rpx;
  border: 1rpx solid #ffe8d6;
}

.tags-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #8b5a3c;
  margin-bottom: 20rpx;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx;
  border-radius: 50rpx;
  font-size: 26rpx;
  transition: all 0.3s;
}

.tag-item.selected {
  background: linear-gradient(135deg, #f4a460 0%, #e8956f 100%);
  color: #ffffff;
  gap: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(232, 149, 111, 0.25);
}

.tag-close {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-tag-input {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.tag-input {
  flex: 1;
  padding: 20rpx 30rpx;
  font-size: 28rpx;
  color: #8b5a3c;
  border: 2rpx solid #ffb88c;
  border-radius: 12rpx;
  background: #ffffff;
}

.tag-input::placeholder {
  color: #d4a574;
}

.add-tag-btn {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff9a76;
}

.recommended-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.tag-item.recommended {
  background: #fff5eb;
  color: #a67c52;
  gap: 6rpx;
  border: 1rpx solid #ffe0c7;
  padding: 12rpx 20rpx;
  font-size: 24rpx;
}

.tag-item.recommended.added {
  background: #ffe8d6;
  color: #d4a574;
  border-color: #ffd4b3;
}

.tag-item.recommended:active {
  background: #ffecd6;
}

.tag-item.recommended uni-icons {
  transform: scale(0.9);
}
</style>
