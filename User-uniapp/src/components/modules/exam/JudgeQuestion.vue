<template>
    <view class="question-container">
        <view class="question-header">
            <text class="question-index">{{ props.questionIndex }}.</text>
            <text class="question-lable">判断题</text>
            <ContentRenderer class="question-stem" :content="question.stem" style="display: inline;" />
        </view>
        <view
            v-for="(option, index) in judgeOptions"
            :key="index"
            class="option-container"
            @click="handleOptionClick(index)"
            :style="{
                pointerEvents: props.currentMode === 1 ? 'none' : 'auto',
            }"
        >
            <view
                class="option-item"
                :class="{
                    'correct-answer':
                        showAnswerComputed &&
                        ((question.answer === 1 && index === 0) ||
                            (question.answer === 0 && index === 1)),
                    'selected-answer': isSelected(index),
                    'wrong-answer':
                        showAnswerComputed &&
                        isSelected(index) &&
                        !(
                            (question.answer === 1 && index === 0) ||
                            (question.answer === 0 && index === 1)
                        ),
                }"
            >
                <text class="option-tag"
                    >{{ String.fromCharCode(65 + index) }}.</text
                >
                <text class="option-content">{{ option }}</text>
            </view>
        </view>
        <!-- 答案 -->
        <view class="question-answer-container" v-if="showAnswerComputed">
            <text class="answer-label">答案：</text>
            <text class="answer-content">{{
                question.answer === 1 ? "A" : "B"
            }}</text>
        </view>

        <!-- 解析 -->
        <AnalysisCom
            :analysis="question.analysis"
            :showAnalysis="showAnswerComputed"
            :isAIanswer="question.isAIanswer === 1 ? true : false"
        />
    </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useObjectiveAnswerStore } from "../../../stores/modules/ObjectiveAnswerStore";
import { useQuestionStore } from "../../../stores/modules/QuestionStore";
import AnalysisCom from "@/components/modules/exam/Analysiscom.vue";
import ContentRenderer from "@/components/common/ContentRenderer.vue";

const props = defineProps({
    question: {
        type: Object,
        required: true,
    },
    questionIndex: {
        type: Number,
        required: true,
    },
    currentMode: {
        type: Number,
        default: 0, // 默认值为0，表示答题模式 1为学习模式
    },
});
const judgeOptions = ["正确", "错误"]; // 判断题选项，A代表正确，B代表错误
const answerStore = useObjectiveAnswerStore(); // 答案存储
const selectedOption = ref(null); // 选中的选项
const questionStore = useQuestionStore(); // 问题存储
const showAnswerSetting = ref(questionStore.UserShowSettings.showAnswer); // 是否显示答案

// 判断选项是否被选中
const isSelected = (index) => {
    return selectedOption.value === index;
};

// 处理选项点击
const handleOptionClick = (index) => {
    if (props.currentMode === 1) return; // 学习模式不可点击

    // 判断题处理逻辑（类似于单选题）
    selectedOption.value = index;
    // 保存用户答案
    answerStore.saveUserAnswer(props.question._id, index);
};

// 组件挂载时，保存正确答案到store
onMounted(() => {
    // 保存正确答案（判断题的正确答案为0或1，对应选项B或A）
    answerStore.saveCorrectAnswer(
        props.question._id,
        props.question.answer === 1 ? 0 : 1,
    );

    // 如果用户之前已经答过题，恢复选择状态
    const userAnswer = answerStore.getUserAnswer(props.question._id);
    if (userAnswer !== undefined && typeof userAnswer === "number") {
        selectedOption.value = userAnswer;
    }
});

// 控制答案和解析的显示逻辑
const showAnswerComputed = computed(() => {
    if (props.currentMode === 1) {
        // 学习模式直接显示
        return true;
    }
    // 判断题，只有用户选择后才显示
    return showAnswerSetting.value && selectedOption.value !== null;
});
</script>

<style scoped>
.question-container {
    padding: 16.5rpx 20rpx;
}

.question-header {
    overflow: hidden;
}
.question-index {
    font-size: calc(32rpx * var(--app-font-scale, 1));
    font-weight: bold;
    color: var(--app-text-primary);
    float: left;
    margin-top: 16rpx;
}
.question-lable {
    margin-left: 12rpx;
    margin-right: 12rpx;
    background-color: var(--app-brand);
    color: var(--app-bg-container);
    padding: 6rpx 14rpx;
    border-radius: 8rpx;
    font-size: calc(24rpx * var(--app-font-scale, 1));
    float: left;
    margin-top: 16rpx;
}
.question-stem {
    font-size: calc(34rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 572;
    display: inline;
}
.option-container {
    margin-top: 23rpx;
    padding: 0rpx 12rpx;
}

/* 选项美化样式 */
.option-item {
    display: flex;
    align-items: center;
    padding: 30rpx 30rpx;
    background-color: var(--app-bg-secondary);
    border-radius: 18rpx;
    border: 2rpx solid #e9ecef;
    transition: all 0.3s ease;
}

/* 选中答案样式 */
.selected-answer {
    background-color: var(--app-brand-light);
    border-color: var(--app-brand);
}

/* 正确答案样式 */
.correct-answer {
    background-color: var(--app-success-light);
    border-color: var(--app-success);
}

/* 错误答案样式 */
.wrong-answer {
    background-color: var(--app-danger-light);
    border-color: var(--app-danger);
}

.option-tag {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    font-weight: bold;
    color: var(--app-brand);
    margin-right: 16rpx;
    min-width: 40rpx;
    text-align: center;
}

/* 选中答案选项标签样式 */
.selected-answer .option-tag {
    color: var(--app-brand);
}

/* 正确答案选项标签样式  */
.correct-answer .option-tag {
    color: var(--app-success);
}

/* 错误答案选项标签样式 */
.wrong-answer .option-tag {
    color: var(--app-danger);
}

.option-content {
    font-size: calc(30rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    line-height: 1.5;
    flex: 1;
}

/* 答案容器样式 */
.question-answer-container {
    margin-top: 50rpx;
    padding: 30rpx 20rpx;
    background-color: var(--app-bg-secondary);
    border-radius: 12rpx;
    display: flex;
    align-items: center;
}

.answer-label {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    font-weight: bold;
    color: var(--app-text-primary);
    margin-right: 10rpx;
}

.answer-content {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    font-weight: bold;
    color: var(--app-success);
    margin-right: 8rpx;
}
</style>
