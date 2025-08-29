<template>
    <uni-search-bar 
        @confirm="search" 
        :focus="false" 
        v-model="searchValue" 
        @blur="blur" 
        @focus="focus" 
        @input="input"
        cancelButton="none"
        :placeholder="props.placeholder">
        <template v-slot:searchIcon>
            <uni-icons color="#007aff"  type="search"/>
        </template>
	</uni-search-bar>
</template>

<script setup>
import { ref } from 'vue'

const searchValue = ref('')
const props = defineProps({
    placeholder: {
        type: String,
        default: '自定placeholder'
    } 
})

const search = () => {
    // 搜索确认事件处理
    console.log('搜索:', searchValue.value)
}

const blur = () => {
    // 失去焦点事件处理
    console.log('搜索框失去焦点')
}

const focus = () => {
    // 获取焦点事件处理
    console.log('搜索框获取焦点')
}

const input = (value) => {
    // 输入事件处理
    console.log('输入内容:', value)
}

</script>

<style scoped>
/* 添加组件样式 */
</style>