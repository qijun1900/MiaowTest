<template>
    <van-swipe 
        class="my-swipe" 
        :autoplay="3000" 
        indicator-color="white" 
        lazy-render
        height="166">
        <van-swipe-item 
          v-for="item in SwipeNews" 
          :key="item._id">
            <img 
            width="100%"
            height="166px"
            :src="`http://${escconfig.serverHost}:${escconfig.serverPort}${item.cover}`" >
        </van-swipe-item>
    </van-swipe>
</template>
<script setup>
import { ref,onMounted } from 'vue'
import getSwipeNews from '@/API/GetSwipeNews'
import escconfig from '@/config/esc.config'

const SwipeNews = ref([])

const fetchData = async () => {
   const res = await getSwipeNews()
   SwipeNews.value = res
}

onMounted(() => {
    fetchData() 
})
</script>
<style scoped>
  .my-swipe .van-swipe-item {
    color: #d1cccc;
    font-size: 20px;
    line-height: 150px;
    text-align: center;
    background-color: #ffffff;
  }
</style>