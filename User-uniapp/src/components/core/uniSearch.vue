<template>
    <uni-search-bar 
        :focus="props.focus" 
        v-model="searchValue" 
        cancelButton="none"
        :placeholder="props.placeholder"
        radius="8"
        :bgColor="props.bgColor"
        :disabled="props.disabled">
        <template v-slot:searchIcon>
            <uni-icons color="#007aff"  type="search"/>
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
/* 移除点击效果样式 */
:deep(.uni-searchbar) {
  outline: none !important;
  -webkit-tap-highlight-color: transparent !important;
  user-select: none !important;
}

:deep(.uni-searchbar__box) {
  outline: none !important;
  -webkit-tap-highlight-color: transparent !important;
  transition: none !important;
}

:deep(.uni-searchbar__text-input) {
  outline: none !important;
  -webkit-tap-highlight-color: transparent !important;
  pointer-events: none !important;
}
</style>