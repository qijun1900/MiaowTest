<template>
  <view class="subject-filter" v-if="showFilter">
    <scroll-view scroll-x="true" class="subject-scroll" :show-scrollbar="false">
      <view class="subject-list">
        <view 
          class="subject-item" 
          :class="{ active: selectedValue === '全部' }"
          @click="selectValue('全部')">
          全部
        </view>
        <view 
          v-for="item in filterList" 
          :key="item"
          class="subject-item" 
          :class="{ active: selectedValue === item }"
          @click="selectValue(item)">
          {{ item }}
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // 筛选列表数据
  filterList: {
    type: Array,
    default: () => []
  },
  // 当前选中的值
  modelValue: {
    type: String,
    default: '全部'
  },
  // 是否显示筛选器
  showFilter: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue']);

// 当前选中的值
const selectedValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});

// 选择筛选项
const selectValue = (value) => {
  selectedValue.value = value;
};
</script>

<style scoped>
.subject-filter {
  background-color: #ffffff;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.subject-scroll {
  white-space: nowrap;
}

.subject-list {
  display: flex;
  padding: 0 20rpx;
}

.subject-item {
  flex-shrink: 0;
  padding: 12rpx 30rpx;
  margin-right: 20rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #666666;
  background-color: #f5f5f5;
  transition: all 0.3s ease;
}

.subject-item.active {
  color: #ffffff;
  background-color: #1e6bff;
  font-weight: 500;
}

.subject-item:last-child {
  margin-right: 0;
}
</style>