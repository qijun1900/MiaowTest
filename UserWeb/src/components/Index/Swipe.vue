<template>
    <van-swipe 
        class="my-swipe" 
        :autoplay="3000" 
        indicator-color="white" 
        lazy-render
        :height>
        <van-swipe-item>1</van-swipe-item>
        <van-swipe-item>2</van-swipe-item>
        <van-swipe-item>3</van-swipe-item>
        <van-swipe-item>4</van-swipe-item>
    </van-swipe>
</template>
<script setup>
import { ref } from 'vue'
const height = ref(165)
</script>
<style scoped>
  .my-swipe .van-swipe-item {
    color: #d1cccc;
    font-size: 20px;
    line-height: 150px;
    text-align: center;
    background-color: #62bbf1;
  }
</style>