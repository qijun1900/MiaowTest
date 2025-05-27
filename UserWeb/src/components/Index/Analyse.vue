<template>
    <Divider 
        title="试题详解" 
        color="#808B96"
        borderColor="#303f4a" 
        dividerFontSize="18px"
        dividerContentLeftWidth="28%"
        padding="0 40px"/>
    <div>
        <AnalysisIcon size="20"/>
        <span class="font-title">解析:</span>
    </div>

    <div class="analyse-content">
        <span class="font-analyse">{{ analysis }}</span>
    </div>
    <div v-if="isAIanswer === 1" class="ai-answer-notice">
        <WarnIcon size="18"/><span class="ai-answer-notice-font">本解析由 AI 生成，内容仅供参考，请仔细甄别</span>
    </div>

</template>
<script setup>
import Divider from '../FuntionComponents/Divider.vue';
import AnalysisIcon from '../icons/AnalysisIcon.vue';
import WarnIcon from '../icons/WarnIcon.vue';
import { computed } from 'vue';

const props = defineProps({
    analysis:{
        type:String,
        default:""
    },
    isAIanswer: {
        type:Number,
    }
});

const analysis = computed(() => {
    return props.analysis.trim() === "" ? "题目暂无解析" : props.analysis;
});
const isAIanswer = computed(() => {
    return props.isAIanswer
});
  
</script>
<style>
.font-title{
    font-size: 19px;
    font-weight: 600;
    color: #5b5e62;
}
.font-analyse{
    font-size: 17.5px;
    color: #5b5e62;
    margin-left: 20px;
}
.analyse-content{
    margin-top: 10px;
}
 .ai-answer-notice {
    background-color: #fdebce ;
    border-radius: 5px;
    padding: 12px 7px;
    margin: 16px 0;
    font-size: 14px;
    color: #666;
    position: relative;
    line-height: 1.8;
}

.ai-answer-notice-font{
    color: #f4ae2c;
    font-size: 15px;
    font-weight: 600;
    margin-left: 2px;
}
.analyse-container {
    margin-top: 20px;
}
</style>
