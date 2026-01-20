<template>
    <uni-search-bar 
        :focus="props.focus" 
        v-model="searchValue" 
        cancelButton="none"
        :placeholder="props.placeholder"
        radius="15"
        :bgColor="props.bgColor"
        :disabled="props.disabled">
        <template v-slot:searchIcon>
            <uni-icons color="#007aff"  type="search" size="24" class="search-icon"/>
        </template>
	</uni-search-bar>
</template>

<script setup>
import { ref, watch } from 'vue'

const searchValue = ref('')
const emit = defineEmits(['update:searchText', 'search'])
const props = defineProps({
    placeholder: {
        type: String,
        default: '自定placeholder'
    },
    bgColor: {
        type: String,
        default: '#F8F8F8'
    },
    searchText: {
        type: String,
        default: ''
    },
    focus: {// 是否自动获取焦点
        type: Boolean,
        default: false
    },
    disabled: {// 是否禁用搜索框
        type: Boolean,
        default: true
    }
})

// 监听searchValue变化，通知父组件
watch(searchValue, (newValue) => {
  emit('update:searchText', newValue)
  emit('search', newValue)
})

// 监听props.searchText变化，同步到本地
watch(() => props.searchText, (newValue) => {
    if (newValue !== searchValue.value) {
        searchValue.value = newValue
    }
})

</script>

<style scoped>
/* 搜索栏容器样式 */
:deep(.uni-searchbar) {
  outline: none !important;
  -webkit-tap-highlight-color: transparent !important;
  user-select: none !important;
  background: transparent !important;
}

/* 搜索框样式 */
:deep(.uni-searchbar__box) {
  outline: none !important;
  -webkit-tap-highlight-color: transparent !important;
  transition: all 0.3s ease !important;
  background: linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%) !important;
  border: 2rpx solid #e0e8f0 !important;
  box-shadow: 0 2rpx 8rpx rgba(77, 148, 255, 0.1) !important;
  height: 80rpx !important;
}

/* 搜索输入框样式 */
:deep(.uni-searchbar__text-input) {
  outline: none !important;
  -webkit-tap-highlight-color: transparent !important;
  pointer-events: none !important;
  font-size: 28rpx !important;
  color: #333333 !important;
  background: transparent !important;
}

/* 搜索图标样式 */
.search-icon {
  transition: all 0.3s ease;
  animation: searchIconPulse 2s infinite;
}

/* 搜索框占位符样式 */
:deep(.uni-searchbar__placeholder) {
  font-size: 28rpx !important;
  color: #999999 !important;
}

/* 搜索框点击效果 */
:deep(.uni-searchbar__box):active {
  transform: scale(0.98) !important;
  box-shadow: 0 1rpx 4rpx rgba(77, 148, 255, 0.15) !important;
}

/* 搜索图标脉冲动画 */
@keyframes searchIconPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}
</style>