<template>
    <div class="ai-answer-notice">
     <WarnIcon size="18"/>
     <span class="ai-answer-notice-font">本解析由 AI 生成，内容仅供参考，请仔细甄别!</span>
    </div>
</template>
<script setup>
import WarnIcon from '../icons/WarnIcon.vue';
</script>
<style scoped>
 .ai-answer-notice {
    background-color: #fdebce ;
    border-radius: 8px;
    padding: 12px 2px 12px 8px;
    margin: 16px 0;
    font-size: 14px;
    color: #666;
    position: relative;
    line-height: 1;
}
.ai-answer-notice-font{
    color: #f4ae2c;
    font-size: 15px;
    font-weight: 800;
    margin-left: 2px;
}
</style>