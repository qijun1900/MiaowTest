<template>
<view class="noticeBar">
    <uni-notice-bar
        v-if="displayText"
        color="#2979FF"
        background-color="#e4eeff" 
        show-icon 
        scrollable		
        :text="displayText" 
        showIcon
        single 
        />
    </view>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps({
    noticeData: {
        type: Array,
        default: () => []
    }
})

const displayText = computed(() => {
    if (props.noticeData && props.noticeData.length > 0) {
        // 取第一条通知的content字段，移除HTML标签
        const firstNotice = props.noticeData[0];
        if (firstNotice.content) {
            // 移除HTML标签
            return firstNotice.content.replace(/<[^>]*>/g, '');
        }
        return firstNotice.title || '';
    }
    return '服务器为微信云托管，可能出现服务器自动关闭导致网络请求失败，请耐心等待服务器自动启动。';
})
</script>
