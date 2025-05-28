<template>
    <div class="question-container">
            <div class="stem">
                <el-check-tag checked type="primary" class="type-tag">
                    {{ question.isMultiple === 1 ? '多选' : '单选' }}
                </el-check-tag>
                <span class="question-index">【{{ index }}】</span>
                <span class="question-stem">{{ question.stem }}</span>
            </div>
            <div class="option-list">
                <div 
                    v-for="(option, index) in question.options" 
                    :key="index" class="option-item" 
                    :class="{
                    'correct-option': answer && option.isCorrect,
                    'wrong-option': answer && !option.isCorrect && (
                        (question.isMultiple === 0 && selectedOption === index) ||
                        (question.isMultiple === 1 && selectedOptions.includes(index))
                    ),
                    'selected-option': question.isMultiple === 1 && selectedOptions.includes(index)
                    }" 
                    @click="handleClickOption(option, index)">
                    <el-tag round class="option-tag">
                        {{ String.fromCharCode(65 + index) }}
                    </el-tag>
                    <span class="option-content">{{ option.content }}</span>
                </div>
            </div>
            <div class="multiple-button" v-if="question.isMultiple === 1">
                <CheckanswerButton 
                    v-if="isShowAnswer"
                    :isMultiple="question.isMultiple === 1"
                    :selectedOptions="selectedOptions"
                    :questionOptions="question.options"
                    @submit="handleSumitMultiple"
                    @show="answer = true"/>
            </div>
            <div v-if="answer" class="answer-container">
                <div class="answer-content">
                    <span class="answer-label">答案：</span>
                    <template 
                        v-for="(option, index) in question.options" 
                        :key="index">
                        <span v-if="option.isCorrect === true" class="answer-option">
                            {{ String.fromCharCode(65 + index) }}
                        </span>
                    </template>
                </div>
            </div>
            <div class="analyse-container" v-if="answer">
                <Analyse :analysis="question.analysis" :isAIanswer="question.isAIanswer" />
            </div>
    </div>
</template>
<script setup>
import { computed, ref } from 'vue';
import Analyse from './Analyse.vue';
import CheckanswerButton from '../FuntionComponents/CheckanswerButton.vue';

const props = defineProps({
    index: {//题目索引
        type: Number,
        required: true,
    },
    questionData: {//题目数据 
        required: true,
    },
    IsShowAnswer: {//是否显示答案
        type: Boolean,
    },

})
const question = computed(() => props.questionData)
const index = computed(() => props.index)
const isShowAnswer = computed(() => props.IsShowAnswer)
const answer = ref(false)
const selectedOption = ref(null) // 记录用户单选的选项索引
const selectedOptions = ref([]) // 数组存储多选题的选择


const handleClickOption = (option, index) => {
    if (isShowAnswer.value && !answer.value && question.value.isMultiple === 0) {
        selectedOption.value = index // 记录用户选择的选项
        answer.value = true;
    }
    if (isShowAnswer.value && question.value.isMultiple === 1) {
        const selectedIndex = selectedOptions.value.indexOf(index)
        if (selectedIndex === -1) {
            selectedOptions.value.push(index) // 添加选择
        } else {
            selectedOptions.value.splice(selectedIndex, 1) // 取消选择
        }
    }
};
const handleSumitMultiple = () => {
    // 获取所有正确答案的索引
    const correctOptions = question.value.options
        .map((option, index) => option.isCorrect ? index : -1)
        .filter(index => index !== -1);
    // 校验答案是否正确
    const isCorrect =
        selectedOptions.value.length === correctOptions.length &&
        selectedOptions.value.every(option => correctOptions.includes(option));
    // 显示答案
    answer.value = true;

    // 可以在这里添加其他逻辑，如记录答题结果等
    console.log('提交答案', {
        selected: selectedOptions.value,
        correct: correctOptions,
        isCorrect: isCorrect
    });
}


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

.type-tag {
    margin-right: 1px;
    padding: 4px 7px;
}

.question-index {
    margin-right: 0px;
    color: #1e97ee;
    font-size: 16px;
    font-weight: bold;
}

.question-stem {
    flex: 1;
    font-size: 20px;
    color: #222;
    word-break: break-all;
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
    transition: background 0.2s, box-shadow 0.2s;
    user-select: none;
}

.selected-option {
    background: #d7f2ff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2)
}

.option-tag {
    margin-right: 20px;
    background: #4d9ef0;
    color: #fff;
    font-size: 20px;
    border: none;
}

.option-content {
    flex: 1;
    color: #333;
    font-size: 18px;
    word-break: break-all;
}

.correct-option {
    background: #99ffb6 !important;
    box-shadow: 0 2px 8px rgba(168, 230, 207, 0.5);
}

.wrong-option {
    background: hsl(0, 100%, 86%) !important;
    box-shadow: 0 2px 8px rgba(255, 0, 0, 0.1);
}

.multiple-button {
    display: flex;
    justify-content: center;
    margin-top: 40px;
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
    color: #67c23a;
    /* 浅绿色 */
    margin-right: 8px;
}

.analyse-container {
    margin-top: 20px;
}
</style>