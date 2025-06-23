<template>
    <div class="question-container">
        <div class="stem">
            <el-check-tag checked type="primary" class="type-tag">
                判断
            </el-check-tag>
            <span class="question-index">【{{ index }}】</span>
            <span class="question-stem" v-translate>{{ question.stem}}</span>
        </div>
        <div class="option-list">
            <div v-for="(option, index) in options" 
            :key="index" class="option-item" 
            @click="handleClickOption(index)">
                <el-tag 
                    round   
                    class="option-tag" 
                    :style="{
                        background: (answer && (option.isCorrect || selectedOption === index)) ? 'transparent' : '#4d9ef0'
                    }">
                    <RightIcon v-if="answer && option.isCorrect"  size="31"/>
                    <ErrorIcon v-else-if="answer && selectedOption === index && !option.isCorrect"  size="28.5"/>
                    <span v-else>{{ String.fromCharCode(65 + index) }}</span>
                </el-tag>
                <span class="option-content" :class="{
                    'correct-text': answer && option.isCorrect,
                    'wrong-text': answer && !option.isCorrect && selectedOption === index
                }">
                    {{ option.text }}
                </span>
            </div>
        </div>
        <div v-if="answer" class="answer-container">
            <div class="answer-content">
                <span class="answer-label">答案：</span>
                <span class="answer-option">
                    {{ rightAnswer === 1 ? 'A' : 'B' }}
                </span>
            </div>
        </div>
        <div class="analyse-container" v-if="answer">
            <Analyse :analysis="question.analysis" :isAIanswer="question.isAIanswer" />
        </div>
        
    </div>
</template>
<script setup>
import { computed, ref, watch } from 'vue';
import ErrorIcon from '../icons/ErrorIcon.vue';
import RightIcon from '../icons/RightIcon.vue';
import Analyse from './Analyse.vue';
import { useAnswerStore } from '@/stores/answerStore';

const answerStore = useAnswerStore();

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
const IsShowAnswer = computed(() => props.IsShowAnswer)
const rightAnswer = computed(() => question.value.answer)

// 从store中初始化答题状态
const answer = ref(answerStore.getAnswerState(question.value._id)?.answer || false)
const selectedOption = ref(answerStore.getAnswerState(question.value._id)?.selectedOption || null)

// 监听答题状态变化并保存
watch([answer, selectedOption], () => {
    answerStore.saveAnswerState({
        questionId: question.value._id,
        answer: answer.value,
        selectedOption: selectedOption.value,
        isCorrect: selectedOption.value !== null && options.value[selectedOption.value].isCorrect // 新增正确状态判断
    })
}, { deep: true })

const handleClickOption = (index) => {
    if (IsShowAnswer.value && !answer.value) {
        selectedOption.value = index
        answer.value = true
        
        // 立即更新存储状态
        answerStore.saveAnswerState({
            questionId: question.value._id,
            answer: true,
            selectedOption: index,
            isCorrect: options.value[index].isCorrect // 直接保存正确状态
        })
    }
}
const options = computed(() => [
    { text: '正确', isCorrect: rightAnswer.value === 1 },
    { text: '错误', isCorrect: rightAnswer.value === 0 }  
])
</script>
<style scoped>
.question-container {
    background: #fff;
    border-radius: 12px;
    padding: 10px 30px 28px 30px;
}

.stem {
    margin-bottom: 28px;
    font-weight: 530;
    color: #333;
}

.question-index {
    margin-right: 0px;
    color: #1e97ee;
    font-size: 16px;
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
}

.option-list {
    display: flex;
    flex-direction: column;
    gap: 22px;
}

.option-item {
    display: flex;
    align-items: center;
    background: #f7f8fa;
    border-radius: 8px;
    padding: 18px 18px 18px 18px;
    cursor: pointer;
    transition: background 0.2s;
    user-select: none;
}

.correct-text {
    color: #09b531 !important;
}

.wrong-text {
    color: #ff0019 !important;
}

.option-tag {
    margin-right: 20px;
    background: #4d9ef0;
    color: #fff;
    font-size: 20px;
    border: none;
    width: 27px;           /* 固定宽度，根据图标实际宽度调整 */
    height: 27px;          /* 可选：高度也固定 */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;            /* 去除内边距 */
}

.option-content {
    flex: 1;
    color: #333;
    font-size: 18px;
    font-weight: 600;
}

.answer-container {
    background-color: #f7f7f7;
    border-radius: 10px;
    padding: 16px 18px;
    margin-top: 20px;
}

.answer-content {
    display: flex;
    align-items: center;
}

.answer-label {
    font-size: 20px;
    color: #666;
    margin-right: 8px;
    font-weight: 700;
}

.answer-option {
    font-size: 23px;
    color: #6cd537;
    margin-right: 8px;
}
</style>