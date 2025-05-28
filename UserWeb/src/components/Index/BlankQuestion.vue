<template>
    <div class="question-container">
        <div  class="stem">
            <el-check-tag checked type="primary" class="type-tag">
                填空
            </el-check-tag>
            <span class="question-index">【{{ index }}】</span>
            <span class="question-stem">{{ question.stem}}</span>
        </div>
        <div class="option-list">
            <AnswerInput 
                :options="question.options" 
                @submit="handleSubmit"
            />
        </div>
        <div v-if="answer" class="answer-container">
        <div>
            <span class="answer-font">答案：</span>
            <div 
                v-for="(answer,index) in question.options" 
                :key="index"
                class="answer-option">
                <span class="index-lable">空{{ index+1 }}:</span><span class="answer-lable">{{ answer.content }}</span>
            </div>
        </div>
    </div>
    <div class="analyse-container" v-if="answer">
        <Analyse :analysis="question.analysis" :isAIanswer="question.isAIanswer" />
    </div>
 </div>
</template>
<script setup>
import {computed,ref} from 'vue';
import AnswerInput from '../FuntionComponents/AnswerInput.vue';
import Analyse from './Analyse.vue';
const props = defineProps({
    index: {
        type: Number,
        required: true,
    },
    questionData: { 
        required: true,
    },
    IsShowAnswer: {
        type: Boolean, 
    },
})
const question = computed(() => props.questionData)
const index = computed(() => props.index)
const answer = ref(false)

const handleSubmit = (answers) => {
    answer.value = true;
    console.log('用户提交的答案:', answers);
}
</script>
<style scoped>
.question-container {
    background: #fff;
    border-radius: 12px;
    padding: 10px 15px 28px 15px;
}
.stem {
    margin-bottom: 28px;
    font-weight: 530;
    color: #333;
}

.question-index {
    margin-right: 0px;
    color: #1e97ee;
    font-size: 18px;
    font-weight: bold;
}
.type-tag {
    margin-right: 1px;
    font-size: 14px;
    padding: 4px 7px;
    
}
.question-stem {
    flex: 1;
    font-size: 20px;
    color: #222;
    word-break: break-all;
    
}
.stem {
    margin-bottom: 28px;
    font-weight: 500;
    color: #333;
}
.option-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.answer-container {
    background-color: #f7f7f7;
    border-radius: 10px;
    padding: 16px 18px;
    margin-top: 25px;
}
.answer-option{
    margin-top: 9px;
}
.index-lable{
    font-size: 18px;
    color: #666;
    margin-right:7px;
    line-height: 1.35;
}
.answer-lable{
    font-size: 19px;
    color: #42c600f1;
    margin-right: 9px;
    line-height: 1.35;
    word-break: break-all;
    font-weight: 600;
}
.answer-font{
    font-size: 20px;
    color: #666;
    margin-right: 8px;
    font-weight: 700;
}

</style>