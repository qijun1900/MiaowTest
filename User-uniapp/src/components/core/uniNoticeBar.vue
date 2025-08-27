<template>
<view class="noticeBar">
    <uni-notice-bar
        v-if="text"
        color="#2979FF"
        background-color="#e4eeff" 
        show-icon 
        scrollable		
        :text="props.text" 
        showIcon
        single 
        />
    </view>
</template>
<script setup>
const props = defineProps({
    text: {
        type: String,
        default: 'uni-app 版正式发布，开发一次，同时发布iOS、Android、H5、微信小程序、支付宝小程序、百度小程序、头条小程序等7大平台。'
    } 
})

</script>
<style lang="scss" >



</style>