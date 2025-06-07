<template>
    <div class="page-container">
        <TopBack 
            title="喵喵智答"
            navBarIconColor="#000000" 
            navBarBackground="#f9fdff"
           />
           <div>
                <div class="welcome">
                    <AntWelcome 
                    title="你可以向我提问题!"
                    description="基于组件Ant Design X Vue 与大模型服务平台百炼，实现多种模型调用!🐱" />
                </div>
                <div class="prompts">
                    <AntPrompts />
                </div>
                <div class="sender">
                    <AntSender />
                </div>
           </div>
    </div>
</template>
<script setup>
import TopBack from '@/components/FuntionComponents/TopBack.vue';
import AntWelcome  from '@/components/FuntionComponents/AntWelcome.vue';
import AntPrompts from '@/components/FuntionComponents/AntPrompts.vue';
import AntSender from '@/components/FuntionComponents/AntSender.vue';
</script>
<style scoped>
.page-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #f7fcff;
    display: flex;
    flex-direction: column;
}

.welcome{
    margin-top: 5px; 
    margin-left: 13px;
    margin-right: 13px;
    border-radius: 10px;
}
 
.prompts{
    margin-top: 10px;
    margin-left: 18px;
}

.sender {
    position: fixed;  /* 固定定位 */
    bottom: 0;       /* 贴紧底部 */
    left: 0;         /* 左侧对齐 */
    right: 0;        /* 右侧对齐 */
    background-color: #f7fcff;
    padding: 8px 12px;
    z-index: 100;    /* 确保在最上层 */
    transition: transform 0.3s ease;
}


</style>