<template>
    <div class="page-container">
        <TopBack 
            title="AI智答"
            navBarIconColor="#000000" 
            navBarBackground="#f9fdff"
           />
           <div>
            <div class="welcome">
                <AntWelcome 
                title="你可以向我提问题!"
                description="基于组件Ant Design X Vue 与大模型服务平台百炼，实现多种模型调用!🐱"/>
            </div>

           </div>
       
    </div>
</template>
<script setup>
import TopBack from '@/components/FuntionComponents/TopBack.vue';
import AntWelcome  from '@/components/Index/AntWelcome.vue';

</script>
<style scoped>
.page-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #f7fcff;
}
.welcome{
    margin-top: 10px; 
    margin-left: 10px;
    margin-right: 10px;
    border-radius: 10px; /* 圆角半径 */
}
 
</style>