<template>
    <el-popconfirm 
        :title="props.title"
        @confirm="$emit('confirm')">
        <template #reference>
            <slot></slot>
        </template>
    </el-popconfirm>
</template>
<script setup>
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
    title: {
        type: String,
        default: '默认提示'
    }
})

defineEmits(['confirm'])
</script>