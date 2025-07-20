<template>
    <el-divider 
        :content-position="props.contentPosition">
        {{ props.content }}
        <slot>
            <el-icon><ElementPlus /></el-icon>
        </slot>
    </el-divider>
</template>
<script setup> 
import {ElementPlus} from  '@element-plus/icons-vue'

const props = defineProps({
    contentPosition: {
        type: String,
        default: 'left'
    },
    content:{
        type: String,
        default: '标题'
    }

})
</script>