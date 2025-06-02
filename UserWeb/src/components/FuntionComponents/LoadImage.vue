<template>
    <div>
        <van-image 
            :src="props.src" 
            lazy-load 
            :alt="props.alt">
            <template v-slot:loading>
                <van-loading type="spinner" size="20" />
            </template>
            <template v-slot:error>
                <div class="image-error">
                    <van-icon name="photo-fail" size="40" />
                    <p>图片加载失败</p>
                </div>
            </template>
        </van-image>
    </div>
</template>
<script setup>
const props = defineProps({
    src: { // 图片的 URL
            type: String,
            required: true 
    }, 
    alt: { 
            type: String, 
            default: '图片加载' 
    } // 图片的替代文本
})  


</script>
<style scoped>
.van-image {
    height: 188px;
    border-radius: 6px;
    overflow: hidden;
}
.image-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #969799;
    font-size: 14px;
}
</style>