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
const props = defineProps({
    title: {
        type: String,
        default: '默认提示'
    }
})

defineEmits(['confirm'])
</script>