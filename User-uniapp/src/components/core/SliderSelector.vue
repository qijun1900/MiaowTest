<template>
  <view class="selector-container">
    <!-- 滑块背景 -->
    <view 
      class="slider-bg" 
      :style="sliderStyle">
    </view>
    
    <!-- 选项列表 -->
    <view 
      v-for="(item, index) in options" 
      :key="item.value"
      class="type-item"
      :class="{ 'active': modelValue === item.value }"
      @click="selectItem(index)">
      <text class="type-label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  modelValue: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const currentIndex = ref(0)

// 计算滑块样式
const sliderStyle = computed(() => {
  const count = props.options.length
  if (count === 0) return {}
  
  // 容器内部可用宽度百分比（100% 表示整个容器内容区域）
  const itemWidth = 100 / count
  
  // 滑块位置：当前索引 * 每项宽度
  const left = currentIndex.value * itemWidth
  
  return {
    width: `${itemWidth}%`,
    left: `${left}%`
  }
})

const selectItem = (index) => {
  currentIndex.value = index
  const selectedValue = props.options[index].value
  emit('update:modelValue', selectedValue)
  emit('change', {
    value: selectedValue,
    label: props.options[index].label,
    index
  })
}

// 初始化滑块位置
watch(() => props.modelValue, (newValue) => {
  const index = props.options.findIndex(item => item.value === newValue)
  if (index !== -1) {
    currentIndex.value = index
  }
}, { immediate: true })
</script>

<style scoped>
.selector-container {
  position: relative;
  display: flex;
  background: #f5f5f5;
  border-radius: 16rpx;
  padding: 8rpx;
  gap: 4rpx;
}

.slider-bg {
  position: absolute;
  top: 8rpx;
  bottom: 8rpx;
  background: white;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.type-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 12rpx;
  position: relative;
  z-index: 2;
  cursor: pointer;
  transition: all 0.3s ease;
  /* 去掉点击时的蓝色高亮 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.type-item:active {
  opacity: 0.8;
}

.type-label {
  font-size: 30rpx;
  color: #666;
  font-weight: 400;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.type-item.active .type-label {
  color: #333;
  font-weight: 600;
}
</style>
