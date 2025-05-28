<template>
    <div class="question-container">
      <div class="stem">
            <el-check-tag checked type="primary" class="type-tag">
                简答
            </el-check-tag>
            <span class="question-index">【{{ index }}】</span>
            <span class="question-stem">{{ question.stem}}</span>
      </div>
      <div class="option-list">
           <ShortAnswerInput
           @submit="handleSubmit"/>
      </div>
      <div v-if="answer" class="answer-container">
        <div>
            <span class="answer-font">答案：</span>
            <div class="answer-option" >
                <span class="answer-content" v-html="question.content"></span>
            </div>
        </div>

      </div>
    </div>
</template>
<script setup>
import {computed,ref} from 'vue';
import ShortAnswerInput from '../FuntionComponents/ShortAnswerInput.vue';
const props = defineProps({
    index: {
        type: Number,
        required: true,
    },
    questionData: { 
        required: true,
    },
    isShowAnswer: {
        type: Boolean, 
    },
    isRandom: {
        type: Boolean, 
    }
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
    font-weight: 520;
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
    font-size: 18px;
    color: #222;
    word-break: break-all;
}
.answer-container {
    background-color: #f7f7f7;
    border-radius: 10px;
    padding: 16px 18px;
    margin-top: 25px;
}
.answer-font{
    font-size: 18px;
    color: #666;
    margin-right: 8px;
    font-weight: 700;
}

.answer-option{
    margin-top: 6px;
}
.answer-content{
    font-size: 17px;
    color: #323131;
    word-break: break-all;
    line-height: 1.5;
    font-weight: 500;

}
</style>