<template>
    <view class="question-container">
        <view class="question-header">
            <text class="question-index">{{ props.questionIndex }}.</text>
            <text class="question-lable">{{
                question.isMultiple === 1 ? "多选" : "单选"
            }}</text>
            <ContentRenderer class="question-stem" :content="question.stem" style="display: inline;" />
        </view>
        <view
            v-for="(option, index) in question.options"
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
                    'correct-answer': showAnswerComputed && option.isCorrect,
                    'selected-answer': isSelected(index),
                    'multiple-selected':
                        question.isMultiple === 1 && isSelected(index),
                    'wrong-answer':
                        showAnswerComputed &&
                        isSelected(index) &&
                        !option.isCorrect,
                }"
            >
                <text class="option-tag"
                    >{{ String.fromCharCode(65 + index) }}.</text
                >
                <text class="option-content">{{ option.content }}</text>
            </view>
        </view>

        <!--多选题提交按钮 -->
        <view class="Multiple-submit-button" style="margin-top: 30rpx">
            <uni-transition
                :show="
                    props.question.isMultiple === 1 &&
                    !showAnswerComputed &&
                    props.currentMode === 0 &&
                    selectedOptions.length > 0 &&
                    questionStore.UserShowSettings.showAnswer
                "
                mode-class="fade"
                :duration="300"
            >
                <t-button
                    v-if="
                        props.question.isMultiple === 1 &&
                        !showAnswerComputed &&
                        props.currentMode === 0 &&
                        selectedOptions.length > 0
                    "
                    @click="submitMultiAnswer"
                    theme="primary"
                    icon="check-circle-filled"
                    content="核验答案"
                    shape="round"
                    size="large"
                    block
                />
            </uni-transition>
        </view>
        <!-- 答案 -->
        <view class="question-answer-container" v-if="showAnswerComputed">
            <text class="answer-label">答案：</text>
            <text
                class="answer-content"
                v-for="(option, index) in question.options"
                :key="index"
            >
                <text v-if="option.isCorrect">{{
                    String.fromCharCode(65 + index)
                }}</text>
            </text>
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
import uniTransition from "@dcloudio/uni-ui/lib/uni-transition/uni-transition.vue";
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

const answerStore = useObjectiveAnswerStore();
const selectedOptions = ref([]);
const questionStore = useQuestionStore();
const showAnswerSetting = ref(questionStore.UserShowSettings.showAnswer);
// 控制多选题答案显示
const multiAnswerSubmitted = ref(false);

// 判断选项是否被选中
const isSelected = (index) => {
    if (props.question.isMultiple === 1) {
        // 多选题
        return selectedOptions.value.includes(index);
    } else {
        // 单选题
        return (
            selectedOptions.value.length === 1 &&
            selectedOptions.value[0] === index
        );
    }
};

// 处理选项点击
const handleOptionClick = (index) => {
    if (props.currentMode === 1) return; // 学习模式不可点击
    if (props.question.isMultiple === 1) {
        // 多选题处理逻辑
        const optionIndex = selectedOptions.value.indexOf(index);
        if (optionIndex > -1) {
            // 如果已选中，则取消选中
            selectedOptions.value.splice(optionIndex, 1);
        } else {
            // 如果未选中，则添加到选中列表
            selectedOptions.value.push(index);
        }
        // 当 showAnswerSetting 为 false 时，多选题直接保存答案
        if (!showAnswerSetting.value) {
            // 如果没有选中任何选项，从store中移除答案
            if (selectedOptions.value.length === 0) {
                answerStore.removeUserAnswer(props.question._id);
            } else {
                answerStore.saveUserAnswer(props.question._id, [
                    ...selectedOptions.value,
                ]);
            }
        }
        // 多选题不立即保存答案，等待用户点击核验答案按钮
    } else {
        // 单选题处理逻辑
        // 检查是否已选中该选项
        const selectedIndex = selectedOptions.value.indexOf(index);
        if (selectedIndex > -1) {
            // 如果已选中，则取消选中（清空选择）
            selectedOptions.value = [];
            // 从store中移除答案
            answerStore.removeUserAnswer(props.question._id);
        } else {
            // 如果未选中，则设置为选中
            selectedOptions.value = [index];
            // 保存用户答案（单选答案为单个值），确保类型为数字
            answerStore.saveUserAnswer(props.question._id, Number(index));
        }
    }
};

// 组件挂载时，保存正确答案到store
onMounted(() => {
    // 获取正确答案的索引
    const correctAnswers = [];
    props.question.options.forEach((option, index) => {
        if (option.isCorrect) {
            correctAnswers.push(index);
        }
    });

    // 根据题目类型保存正确答案
    if (props.question.isMultiple === 1) {
        // 多选题，保存数组
        answerStore.saveCorrectAnswer(props.question._id, correctAnswers);
    } else {
        // 单选题，保存单个值
        answerStore.saveCorrectAnswer(props.question._id, correctAnswers[0]);
    }

    // 如果用户之前已经答过题，恢复选择状态
    const userAnswer = answerStore.getUserAnswer(props.question._id);
    if (userAnswer !== undefined) {
        if (props.question.isMultiple === 1 && Array.isArray(userAnswer)) {
            selectedOptions.value = [...userAnswer];
        } else if (
            props.question.isMultiple === 0 &&
            typeof userAnswer === "number"
        ) {
            selectedOptions.value = [userAnswer];
        }
    }
    // 清除多选题提交状态
    multiAnswerSubmitted.value = false;
});

// 控制答案和解析的显示逻辑
const showAnswerComputed = computed(() => {
    if (props.currentMode === 1) {
        // 学习模式直接显示
        return true;
    }
    // 多选题需点击提交按钮
    if (props.question.isMultiple === 1) {
        return multiAnswerSubmitted.value;
    }
    // 单选题，只有用户选择后才显示
    return showAnswerSetting.value && selectedOptions.value.length > 0;
    // return showAnswerSetting.value && selectedOptions.value.length > 0;
});

// 多选题提交按钮事件
const submitMultiAnswer = () => {
    // 保存多选题答案
    answerStore.saveUserAnswer(props.question._id, [...selectedOptions.value]);
    multiAnswerSubmitted.value = true;
};
</script>

<style scoped>
.question-container {
    padding: 16.5rpx 20rpx;
}

.question-header {
    overflow: hidden;
}
.question-index {
    font-size: 32rpx;
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
    font-size: 24rpx;
    float: left;
    margin-top: 16rpx;
}
.question-stem {
    font-size: 34rpx;
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

/* 多选选中样式 */
.multiple-selected {
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
    font-size: 28rpx;
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

/* 多选选中选项标签样式 */
.multiple-selected .option-tag {
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
    font-size: 30rpx;
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
    font-size: 28rpx;
    font-weight: bold;
    color: var(--app-text-primary);
    margin-right: 10rpx;
}

.answer-content {
    font-size: 28rpx;
    font-weight: bold;
    color: var(--app-success);
    margin-right: 8rpx;
}

.Multiple-submit-button {
    margin-top: 15rpx;
    margin-bottom: 15rpx;
    padding: 0rpx 30rpx;
}
</style>
