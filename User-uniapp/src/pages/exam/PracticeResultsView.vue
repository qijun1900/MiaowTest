<template>
   <view class="container">
        <view class="animation">
            <firework-effect ref="fireworkRef"></firework-effect>
        </view>
        <view class="data-container">

        </view>
   </view>
</template>

<script setup>
import FireworkEffect from '@/components/plug-in/firework-effect/firework-effect.vue'//特效
import { ref, onMounted } from 'vue'

const fireworkRef = ref(null)

onMounted(() => {
    // 页面加载完成后触发烟花效果
    if (fireworkRef.value) {
        fireworkRef.value.handleShowEffect({ type: 'fireworks' })
    }
})
</script>
<style scoped>

.container{
    padding: 10rpx 10rpx;

}

</style>