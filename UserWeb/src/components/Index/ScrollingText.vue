<template>
    <!-- 原生横向滚动<div class="ticker-container">
        <div class="ticker-content">
            <span v-for="(item, index) in notices" :key="index" class="ticker-item">
                {{ item }} <span v-if="index !== notices.length -1" class="divider">|</span>
            </span>
        </div>
    </div> -->
    <van-notice-bar 
        left-icon="volume-o" 
        :scrollable="false"
        color="rgb(255, 255, 255)"
        background="rgb(250, 195, 75)"
        >
    <van-swipe
        vertical
        class="notice-swipe"
        :autoplay="3000"
        :touchable="false"
        :show-indicators="false"
    >
        <van-swipe-item v-for="(item,index) in notices" :key="index"  > 
                {{  item.content || item }}
        </van-swipe-item>
    </van-swipe>
    </van-notice-bar>
</template>

<script setup>
import getNoticeInfo from '@/API/Index/getNoticeInfo';
import { ref,onMounted } from 'vue'
const props = defineProps({
    defaultText:{
        type:String,
    }
})
const notices = ref([])
onMounted(async () => {
    const res = await getNoticeInfo()
    if(res.length == 0){
        notices.value = props.defaultText
    }else{
        notices.value = res 
    } 
})

</script>
<style scoped>
.van-notice-bar{
    overflow: hidden; 
    border-radius: 5px; 
    height: 36px;
    line-height: 36px;
}
.notice-swipe {
    height: 40px;
    line-height: 40px;
    font-size: 15px;
  }
/*
.ticker-container {
    background-color: rgb(254, 190, 51); /* 橙色背景 
    color: rgb(255, 255, 255); /* 白色字体 
    padding: 3px 0px; 上下内边距 
    overflow: hidden;  溢出隐藏 
    border-radius: 4px;  圆角;
}


.ticker-content {
    display: inline-block;
    white-space: nowrap;  不换行 
   animation: marquee 20s linear infinite; 滚动动画 
}

.ticker-item {
    display: inline-block;
    margin-right: 40px;
}

.divider {
    margin: 0 20px;
    opacity: 0.6;
}

@keyframes marquee {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
}
*/
</style>