<template>
    <up-divider 
        :text="props.text" 
        :textPosition="props.textPosition"  
        textColor="#007AFF"
        lineColor="#86bbf5">
    </up-divider>
</template>
<script setup>
const props = defineProps({
    text: { // 标题文字
        type: String,
        default: '文字文字'
    },
    textPosition: { // 文字位置
        type: String,
        default: 'left' // 可选值：left、right
    }
})
</script>