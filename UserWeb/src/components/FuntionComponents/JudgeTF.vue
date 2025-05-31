<template>
    <div class="container">
        <el-button 
            type="success" 
            round 
            icon="SuccessFilled"
            :disabled="isDisabled"
            @click="handleClick('correct')"
        >答对了</el-button>
        <el-button 
            type="danger" 
            round 
            icon="CircleCloseFilled"
            :disabled="isDisabled"
            @click="handleClick('wrong')"
        >答错了</el-button>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAnswerStore } from '@/stores/answerStore';

const props = defineProps({
    questionId: {
        type: String,
        required: true
    }
});

const answerStore = useAnswerStore();
const isDisabled = ref(false);

const handleClick = (type) => {
    isDisabled.value = true;
    
    answerStore.saveAnswerState({
        questionId: props.questionId,
        answer: true,
        selectedOption: type,
        isCorrect: type === 'correct' // 直接根据用户选择设置正确状态（布尔），无需额外判断
    });
}
</script>
<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 18px; /* 调整按钮之间的间距 */
}
</style>