<template>
    <Bubble
        :header="props.header" 
        :placement="props.placement" 
        :content="props.content" 
        :typing="{ step: props.typingstep, interval: props.typinginterval, suffix: props.typingsuffix }"
        :variant="props.shadow"
        :loading="props.loading"
        :messageRender="renderMarkdown"
        :shape="props.corner">
        <template #avatar>
           <slot name="bubbleAvatar"></slot>
        </template>
        <template #footer="{ content }">
            <Space>
                <Button 
                    type="text" 
                    size="small" 
                    :icon="h(CopyOutlined)"
                    @click="Copy(content)"
                    v-if="showButton"/>
            </Space>
        </template>
</Bubble>

</template>
<script setup>
import { Bubble } from 'ant-design-x-vue';
import { renderMarkdown } from '@/util/formatInfo';
import { Button, Space } from 'ant-design-vue';
import Copy from '@/util/Copy';
import {h,onMounted,ref} from 'vue'
import { CopyOutlined } from '@ant-design/icons-vue';
const showButton = ref(false) // 新增响应式变量
const props = defineProps({
    header: {
        type: String,
    },
    placement: { 
        type: String, 
        default: 'end'
    },
    content: {
        type: String,
    },
    typingstep: {
        type: Number,
        default: 1
    },
    typinginterval: {
        type: Number,
        default: 50
    },
    typingsuffix: {
        type: String,
    },
    shadow: {
        type: String,
        default: 'shadow'
    },
    corner: {
        type: String,
        default: 'round' 
    } ,
    loading: {
        type: Boolean,
        default: false 
    },
    isShowButton: {
        type: Boolean,
        default: true
    }
})


// 组件挂载时，延迟3秒显示按钮
onMounted(() => {
    setTimeout(() => {
        showButton.value = props.isShowButton
    }, 2000)
})


</script>
<style scoped>

:deep(.ant-bubble-content) {
    margin-bottom: 0;
    padding-bottom: 0;
}
</style>