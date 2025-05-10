<template>
    <div>
        <div class="search"><Search/></div>
        <div class="scrollingtext"><ScrollingText/></div>
        <div><Navbar/></div>
        <div class="SwipeContainer"><Swipe/></div>
        <div class="icon_font">
            <van-icon name="fire" color="#ee0a24" size="24" class="icon"/>
            <span class="font">大家都在练习</span>
            <div> <ExamContainer/></div>
        </div>
        <van-floating-bubble icon="chat" />
    </div>
</template>
<script setup>
import Search from '@/components/Index/Search.vue';
import ScrollingText from '@/components/Index/ScrollingText.vue';
import Navbar from '@/components/Index/Navbar.vue';
import Swipe from '@/components/Index/Swipe.vue';
import ExamContainer from '@/components/Index/ExamContainer.vue';


</script>
<style scoped> 
.search{
margin-top: 4px;
}
.SwipeContainer{
    padding: 0px 8px 6px 8px;/* 上右下左内边距 */;
}
.icon_font{
    margin-top: 10px;

}
.icon{
    margin-left: 5px; /* 设置左边距 */ 
}
.font{
    font-size: 18px; /* 设置字体大小 */
    color: #000000; /* 设置字体颜色 */
    margin-left: 3px; /* 设置左边距 */
    font-family: "Arial", "Helvetica", sans-serif;
    font-weight: 550;/* 设置字体粗细 */
    line-height: 2;

}

</style>