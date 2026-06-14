<template>
    <view class="question-container">
        <view class="question-header">
            <text class="question-index">{{ props.questionIndex }}.</text>
            <text class="question-lable">填空题</text>
            <ContentRenderer class="question-stem" :content="question.stem" style="display: inline;" />
        </view>
        <!-- 根据options数组长度动态渲染多个输入框 -->
        <view
            v-show="props.currentMode === 0"
            class="input-container"
            v-for="(option, index) in question.options"
            :key="index"
        >
            <view class="input-label">
                <uni-icons color="#3797ff" type="compose" size="20"></uni-icons>
                <text>空{{ index + 1 }}</text>
            </view>
            <view class="input-textarea">
                <t-textarea
                    :value="userinput[index]"
                    @change="(val) => { userinput[index] = val }"
                    :placeholder="'请在此处输入空' + (index + 1) + '的答案'"
                    autosize
                >
                </t-textarea>
            </view>
        </view>
        <!-- 查看答案 -->
        <view class="check-container">
            <t-button
                v-if="props.currentMode === 0"
                @click="isShowAnswer = !isShowAnswer"
                theme="primary"
                shape="round"
                size="large"
                block
                :icon="showAnswerComputed ? 'browse-off' : 'browse'"
                :content="showAnswerComputed ? '隐藏答案' : '显示答案'"
            >
            </t-button>
        </view>
        <!-- 答案 -->
        <uni-transition name="fade" mode="out-in" :show="showAnswerComputed">
            <view class="question-answer-container" key="answer">
                <text class="answer-label">答案：</text>
                <view class="answer-content">
                    <view
                        v-for="(option, index) in question.options"
                        :key="index"
                        class="answer-item"
                    >
                        <text class="answer-index"
                            >空{{ index + 1 }}:{{ option.content }}</text
                        >
                        <text
                            v-if="index < question.options.length - 1"
                            class="answer-separator"
                            >;</text
                        >
                    </view>
                </view>
            </view>
        </uni-transition>
        <!-- 用户判断 -->
        <uni-transition
            name="fade"
            mode="out-in"
            :show="showAnswerComputed && props.currentMode === 0"
        >
            <view class="user-judgment-container" key="judgment">
                <t-button
                    theme="primary"
                    variant="outline"
                    content="答错了"
                    shape="round"
                    class="user-judgment-but"
                    @click="handleSelfEvaluation(false)"
                >
                    <template #icon>
                        <t-icon name="close-circle-filled" />
                    </template>
                </t-button>
                <t-button
                    theme="primary"
                    variant="outline"
                    content="答对了"
                    shape="round"
                    class="user-judgment-but"
                    @click="handleSelfEvaluation(true)"
                >
                    <template #icon>
                        <t-icon name="check-circle-filled" />
                    </template>
                </t-button>
            </view>
        </uni-transition>
        <!-- 解析 -->
        <AnalysisCom
            :analysis="question.analysis"
            :showAnalysis="showAnswerComputed"
            :isAIanswer="question.isAIanswer === 1 ? true : false"
        />
    </view>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useSubjectiveAnswerStore } from "@/stores/modules/SubjectiveAnswerStore";
import AnalysisCom from "@/components/modules/exam/Analysiscom.vue";
import ContentRenderer from "@/components/common/ContentRenderer.vue";

const subjectiveAnswerStore = useSubjectiveAnswerStore(); // 初始化 store
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

// 初始化用户输入数组，根据options长度创建对应数量的空字符串
const userinput = ref(props.question.options.map(() => ""));
const isShowAnswer = ref(false); // 控制答案和解析的显示逻辑

// 监听用户输入变化，保存到 store
watch(
    userinput,
    (newInput) => {
        subjectiveAnswerStore.saveUserAnswer(props.question._id, newInput);
    },
    { deep: true },
);

// 监听question.options变化，重新初始化userinput数组
watch(
    () => props.question.options,
    (newOptions) => {
        userinput.value = newOptions.map(() => "");
    },
    { deep: true },
);

const showAnswerComputed = computed(() => {
    if (props.currentMode === 1) {
        //学习模式直接显示
        return true;
    }
    // 答题模式，根据用户点击显示答案
    return isShowAnswer.value;
});

// 处理用户自评
const handleSelfEvaluation = (isCorrect) => {
    subjectiveAnswerStore.saveUserSelfEvaluation(props.question._id, isCorrect);
};

// 组件挂载时，从 store 获取已保存的答案（如果有）
onMounted(() => {
    const savedAnswer = subjectiveAnswerStore.getUserAnswer(props.question._id);
    if (savedAnswer) {
        userinput.value = savedAnswer;
    }

    //挂载时候 保存参考答案到 store
    const referenceAnswers = props.question.options.map(
        (option) => option.content,
    );
    subjectiveAnswerStore.saveReferenceAnswer(
        props.question._id,
        referenceAnswers,
    );

    //cosnsole
    // console.log(
    //     "用户答案存储",subjectiveAnswerStore.userAnswers,
    //     "已答题目的ID列表",subjectiveAnswerStore.answeredQuestions,
    //     "参考答案存储",subjectiveAnswerStore.referenceAnswers,
    //     "用户自评是否正确的状态",subjectiveAnswerStore.isUserSelfCorrect,
    // )
});
</script>

<style scoped>
.question-container {
    padding: 14rpx 20rpx;
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
.input-container {
    margin-top: 30rpx;
    background-color: var(--app-bg-secondary);
    border-radius: 13rpx;
}
.input-label {
    font-size: 28rpx;
    color: var(--app-brand);
    font-weight: 572;
    margin-left: 13rpx;
    margin-top: 6rpx;
}
.input-textarea {
    padding: 8rpx 15rpx 25rpx 15rpx;
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
.answer-index {
    font-size: 30rpx;
    color: var(--app-text-primary);
    line-height: 1.6;
    font-weight: 550;
}

.user-judgment-container {
    margin-top: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8rpx;
    gap: 10rpx;
}
.user-judgment-but {
    flex: 1; /* 让按钮占据相同的宽度 */
    margin: 0 10rpx; /* 调整按钮之间的间距 */
}
.check-container {
    margin-top: 20rpx;
    padding: 0 28rpx;
}
</style>
