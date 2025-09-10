<template>
    <uni-search-bar 
        :focus="false" 
        v-model="searchValue" 
        @blur="blur" 
        @focus="focus" 
        @input="input"
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
import { ref } from 'vue'

const searchValue = ref('')
const props = defineProps({
    placeholder: {
        type: String,
        default: '自定placeholder'
    },
    bgColor: {
        type: String,
        default: '#F8F8F8'
    }
})


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