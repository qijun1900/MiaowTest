<template>
    <div>
        <div class="search"><Search/></div>
        <div class="scrollingtext"><ScrollingText/></div>
        <div><Navbar/></div>
        <div class="SwipeContainer"><Swipe/></div>
    </div>
</template>
<script setup>
import Search from '@/components/Index/Search.vue';
import ScrollingText from '@/components/Index/ScrollingText.vue';
import Navbar from '@/components/Index/Navbar.vue';
import Swipe from '@/components/Index/Swipe.vue';

</script>
<style scoped> 
.search{
margin-top: 4px;
}
.SwipeContainer{
    padding: 0px 8px 6px 8px;/* 上右下左内边距 */;
}

</style>