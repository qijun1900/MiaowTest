<template>
    <Bubble 
        :placement="props.placement" 
        :content="props.content" 
        :typing="{ step: props.typingstep, interval: props.typinginterval, suffix: props.typingsuffix }"
        :variant="props.shadow"
        :loading="loading"
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
                    v-if="isShow"/>
            </Space>
        </template>
</Bubble>

</template>
<script setup>
import { Bubble } from 'ant-design-x-vue';
import { renderMarkdown } from '@/util/formatInfo';
import { Button, Space } from 'ant-design-vue';
import Copy from '@/util/Copy';
import {h,ref} from 'vue'
import { CopyOutlined } from '@ant-design/icons-vue';

const loading = ref(false)
const isShow = ref(false)

const props = defineProps({
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
    }
})
setTimeout(() => {
    isShow.value = true
},2000)

</script>
<style scoped>

:deep(.ant-bubble-content) {
    margin-bottom: 0;
    padding-bottom: 0;
}
</style>