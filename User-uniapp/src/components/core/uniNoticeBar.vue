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
    return 'uni-app 版正式发布，开发一次，同时发布iOS、Android、H5、微信小程序、支付宝小程序、百度小程序、头条小程序等7大平台。';
})
</script>
