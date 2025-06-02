<template>
    <van-pull-refresh
        v-model="loading"
        @refresh="onRefresh">
        <div>
            <div class="search">
                <SearchOverlay/>
            </div>
            <div class="ScrollingText">
                <ScrollingText/>
            </div>
            <div>
                <Navbar/>
            </div>
            <div class="SwipeContainer">
                <Swipe/>
            </div>
            <div class="icon_font">
                <div class="title-row">
                    <van-icon name="fire" color="#ee0a24" size="24" class="icon"/>
                    <span class="font">大家都在练习</span>
                    <div class="right-container" @click="RouterPush('/ExamList')">
                        <span class="font_right">更多考试</span>
                        <van-icon name="arrow"/>
                    </div>
                </div>
                <div> 
                    <HotExamContainer 
                    :IsHotExamContainer="true" 
                    :Ishasborder="false"
                    :GutterNumber="6"/>
                </div>
            </div>
        </div>
    </van-pull-refresh>
</template>
<script setup>
import SearchOverlay from '@/components/Index/SearchOverlay.vue';
import ScrollingText from '@/components/Index/ScrollingText.vue';
import Navbar from '@/components/Index/Navbar.vue';
import Swipe from '@/components/Index/Swipe.vue';
import HotExamContainer from '@/components/Index/ExamContainer.vue';
import RouterPush from '@/util/RouterPush';
import { ref } from 'vue';
import { showToast } from 'vant';
const loading = ref(false);//下拉刷新
const onRefresh = () => {
      setTimeout(() => {
        showToast('刷新成功');
        loading.value = false;
      }, 1000);
    };
</script>
<style scoped> 
.search{
margin-top: 2px;
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
.title-row {
    display: flex;
    align-items: center;
}
.right-container {
    display: flex;
    align-items: center;
    margin-left: auto;
    margin-right: 15px;
}
.font_right{
    font-size: 14px;
    color: #6b6969;
    font-weight: 600;
}
.van-pull-refresh {
    min-height: 100vh;
}
.ScrollingText{
    padding: 0px 5px 0px 5px;/* 上右下左内边距 */
}
</style>
