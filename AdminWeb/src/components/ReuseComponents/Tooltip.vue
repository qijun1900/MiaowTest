<template>
        <el-tooltip
            effect="dark"
            :content="props.content"
            :placement="props.placement"> 
            <slot name="description"></slot>
      </el-tooltip>
</template>
<script setup>

const props = defineProps({
    content: {
        type: String,
        default: 'Top Center prompts info'
    },
    placement: {
        type: String,
        default: 'top'
    }
})



</script>