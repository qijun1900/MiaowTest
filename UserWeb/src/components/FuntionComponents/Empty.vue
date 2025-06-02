<template>
     <van-empty
        :image="props.ImageSrc"
        :image-size="props.ImageSize"
        :description="props.Description"/>
</template>
<script setup>
const props = defineProps({
    ImageSrc: {
        type: String,
        default: 'https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png'
    },
    ImageSize: {
        type: Number, 
        default: 90
    },
    Description: {
        type: String,
        default: '描述文字'
    }
})
</script>