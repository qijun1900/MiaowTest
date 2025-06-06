<template>
    <van-notice-bar 
        left-icon="volume-o" 
        :scrollable="false"
        color=" #f0f6ff"
        background="#75b2ff"
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
import getNoticeInfo from '@/API/getNoticeInfo';
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
    border-radius: 7px; 
    height: 36px;
    line-height: 36px;
}
.notice-swipe {
    height: 40px;
    line-height: 40px;
    font-size: 15.5px;
    font-weight: 550;
  }

</style>