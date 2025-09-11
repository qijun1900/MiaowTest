<template>
    <uni-search-bar 
        :focus="false" 
        v-model="searchValue" 
        cancelButton="none"
        :placeholder="props.placeholder"
        radius="8"
        :bgColor="props.bgColor">
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
/* 添加组件样式 */
</style>