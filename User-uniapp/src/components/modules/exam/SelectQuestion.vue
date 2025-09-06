<template>
    <view class="question-container">
        <view class="question-header">
            <view class="question-top-row">
                <text class="question-index">{{props.questionIndex}}.</text>
                <text class="question-lable">{{question.isMultiple=== 1 ?"多选":"单选"}}</text>
            </view>
            <view class="question-stem">
                <rich-text :nodes="question.stem"></rich-text>
            </view>
        </view>
        <view 
            v-for="(option,index) in question.options" 
            :key="index"
            class="option-container"
            @click="handleOptionClick(index)"
            :style="{ pointerEvents: props.currentMode === 1 ? 'none' : 'auto' }">
            <view class="option-item" 
                  :class="{
                      'correct-answer': showAnswerComputed && option.isCorrect,
                      'selected-answer': isSelected(index),
                      'multiple-selected': question.isMultiple === 1 && isSelected(index),
                      'wrong-answer': showAnswerComputed && isSelected(index) && !option.isCorrect
                  }">
                <text class="option-tag">{{String.fromCharCode(65 + index)}}.</text>
                <text class="option-content">{{option.content}}</text>
            </view>
        </view>

        <!--多选题提交按钮 -->
        <view class="Multiple-submit-button" style="margin-top: 30rpx;">
            <uni-transition
                :show="props.question.isMultiple === 1 && !showAnswerComputed && props.currentMode === 0 && selectedOptions.length > 0 && questionStore.UserShowSettings.showAnswer"
                mode-class="fade"
                :duration="300"
            >
                <up-button 
                    v-if="props.question.isMultiple === 1 && !showAnswerComputed && props.currentMode === 0 && selectedOptions.length > 0"
                    @click="submitMultiAnswer"
                    type="primary" 
                    text="核验答案" 
                    shape="circle" 
                    icon="checkmark-circle-fill">
                </up-button>
            </uni-transition>
        </view>
        <!-- 答案 -->
        <view class="question-answer-container" v-if="showAnswerComputed">
            <text class="answer-label">答案：</text>
            <text class="answer-content" v-for="(option, index) in question.options" :key="index" >
                <text v-if="option.isCorrect">{{String.fromCharCode(65 + index)}}</text>
            </text>
        </view>
        <!-- 解析 -->
        <view class="question-explanation-container" v-if="showAnswerComputed">
            <view class="question-explanation-header">
                <text class="explanation-label">解析:</text>
                <uni-icons 
                    type="help"
                    size="21" 
                    class="explanation-icon"
                    color="#6f89ff"></uni-icons>
            </view>
            <view class="question-explanation-content">
                <rich-text v-if="question.analysis && question.analysis !== ''" :nodes="question.analysis"></rich-text>
                <text v-else>暂无解析</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useObjectiveAnswerStore } from '../../../stores/modules/ObjectiveAnswerStore';
import { useQuestionStore } from '../../../stores/modules/QuestionStore';
import uniTransition from '@dcloudio/uni-ui/lib/uni-transition/uni-transition.vue';

const props = defineProps({
    question: {
        type: Object,
        required: true
    },
    questionIndex: {
        type: Number,
        required: true
    },
    currentMode: {
        type: Number,
        default: 0 // 默认值为0，表示答题模式 1为学习模式
    }
});

const answerStore = useObjectiveAnswerStore();
const selectedOptions = ref([]);
const questionStore = useQuestionStore();
const showAnswerSetting = questionStore.UserShowSettings.showAnswer; // 是否显示答案
// 控制多选题答案显示
const multiAnswerSubmitted = ref(false);


// 判断选项是否被选中
const isSelected = (index) => {
    if (props.question.isMultiple === 1) {
        // 多选题
        return selectedOptions.value.includes(index);
    } else {
        // 单选题
        return selectedOptions.value.length === 1 && selectedOptions.value[0] === index;
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
        // 多选题不立即保存答案，等待用户点击核验答案按钮
    } else {
        // 单选题处理逻辑
        selectedOptions.value = [index];
        // 保存用户答案（单选答案为单个值），确保类型为数字
        answerStore.saveUserAnswer(props.question._id, Number(index));
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
        } else if (props.question.isMultiple === 0 && typeof userAnswer === 'number') {
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
    return showAnswerSetting && selectedOptions.value.length > 0;
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

.question-index{
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
}
.question-lable{
    margin-left: 12rpx;
    margin-right: 12rpx;
    background-color: #0d82ff;
    color: #fafafa;
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    font-size: 20rpx;
    display: inline-block;
}
.question-top-row{
    float: inline-start;
}
.question-stem{
    font-size: 34rpx;/**34rpx为最小题干字体，小于该字体，微信小程序题目题干第二行前面将出现空白 */
    color: #000000;
    font-weight: 572;
}
.option-container{
    margin-top: 23rpx;
    padding: 0rpx 12rpx;
}

/* 选项美化样式 */
.option-item {
    display: flex;
    align-items: center;
    padding: 30rpx 30rpx;
    background-color: #f8f9fa;
    border-radius: 18rpx;
    border: 2rpx solid #e9ecef;
    transition: all 0.3s ease;
}

/* 选中答案样式 */
.selected-answer {
    background-color: #e3f2fd;
    border-color: #0d82ff;
}

/* 多选选中样式 */
.multiple-selected {
    background-color: #e3f2fd;
    border-color: #0d82ff;
}

/* 正确答案样式 */
.correct-answer {
    background-color: #e8f5e9;
    border-color: #4caf50;
}

/* 错误答案样式 */
.wrong-answer {
    background-color: #ffeaea;
    border-color: #ff4d4f;
}

.option-tag {
    font-size: 28rpx;
    font-weight: bold;
    color: #0d82ff;
    margin-right: 16rpx;
    min-width: 40rpx;
    text-align: center;
}

/* 选中答案选项标签样式 */
.selected-answer .option-tag {
    color: #0d82ff;
}

/* 多选选中选项标签样式 */
.multiple-selected .option-tag {
    color: #0d82ff;
}

/* 正确答案选项标签样式  */
.correct-answer .option-tag {
    color: #4caf50;
}

/* 错误答案选项标签样式 */
.wrong-answer .option-tag {
    color: #ff4d4f;
}

.option-content {
    font-size: 30rpx;
    color: #333;
    line-height: 1.5;
    flex: 1;
}

/* 答案容器样式 */
.question-answer-container {
    margin-top: 50rpx;
    padding: 30rpx 20rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
}

.answer-label {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-right: 10rpx;
}

.answer-content {
    font-size: 28rpx;
    font-weight: bold;
    color: #54c058;
    margin-right: 8rpx;
}

/* 解析容器样式 */
.question-explanation-container {
    margin-top: 45rpx;
    padding: 30rpx 20rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    margin-bottom: 15rpx;
}
.question-explanation-header {
    margin-bottom: 20rpx;
}
.explanation-label {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
}
.question-explanation-content {
    font-size: 28rpx;
    color: #303030;
    font-weight: 580;
}
.Multiple-submit-button{
    margin-top: 15rpx;
    margin-bottom: 15rpx;
    padding: 0rpx 30rpx;
}
</style>