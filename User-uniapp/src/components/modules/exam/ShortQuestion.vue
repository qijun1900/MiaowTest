<template>
    <view class="question-container">
        <view class="question-header">
            <text class="question-index">{{ props.questionIndex }}.</text>
            <text class="question-lable">简答题</text>
            <ContentRenderer class="question-stem" :content="question.stem" style="display: inline;" />
        </view>
        <view class="input-container" v-show="props.currentMode === 0">
            <view class="input-label">
                <uni-icons color="#3797ff" type="compose" size="20">
                </uni-icons>
            </view>
            <view class="input-textarea">
                <t-textarea
                    :value="userinput"
                    @change="(val) => { userinput = val }"
                    placeholder="请在此处输入答案~"
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
            />
        </view>
        <!-- 答案 -->
        <uni-transition name="fade" mode="out-in" :show="showAnswerComputed">
            <view class="question-answer-container" key="answer">
                <view class="answer-label">答案：</view>
                <view class="answer-content">
                    <ContentRenderer :content="question.content" />
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
                    icon="close-circle-filled"
                    content="答错了"
                    shape="round"
                    class="user-judgment-but"
                    @click="handleSelfEvaluation(false)"
                />
                <t-button
                    theme="primary"
                    variant="outline"
                    icon="check-circle-filled"
                    content="答对了"
                    shape="round"
                    class="user-judgment-but"
                    @click="handleSelfEvaluation(true)"
                />
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
import { ref, computed, onMounted, watch } from "vue";
import { useSubjectiveAnswerStore } from "@/stores/modules/SubjectiveAnswerStore";
import AnalysisCom from "@/components/modules/exam/Analysiscom.vue";
import ContentRenderer from "@/components/common/ContentRenderer.vue";

const subjectiveAnswerStore = useSubjectiveAnswerStore();
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
        default: 0,
    },
});
const userinput = ref("");
const isShowAnswer = ref(false);

const showAnswerComputed = computed(() => {
    if (props.currentMode === 1) {
        return true;
    }
    return isShowAnswer.value;
});

watch(
    userinput,
    (newInput) => {
        subjectiveAnswerStore.saveUserAnswer(props.question._id, newInput);
    },
    { deep: true },
);

const handleSelfEvaluation = (isCorrect) => {
    subjectiveAnswerStore.saveUserSelfEvaluation(props.question._id, isCorrect);
};

onMounted(() => {
    const savedAnswer = subjectiveAnswerStore.getUserAnswer(props.question._id);
    if (savedAnswer) {
        userinput.value = savedAnswer;
    }

    subjectiveAnswerStore.saveReferenceAnswer(
        props.question._id,
        props.question.content,
    );
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
    color: #333;
    float: left;
    margin-top: 16rpx;
}

.question-lable {
    margin-left: 12rpx;
    margin-right: 12rpx;
    background-color: #0d82ff;
    color: #fafafa;
    padding: 6rpx 14rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
    float: left;
    margin-top: 16rpx;
}

.question-stem {
    font-size: 34rpx;
    color: #000000;
    font-weight: 572;
    display: inline;
}

.input-container {
    margin-top: 30rpx;
    background-color: rgb(248, 248, 248);
    border-radius: 13rpx;
}

.input-label {
    font-size: 28rpx;
    color: #3797ff;
    font-weight: 572;
    margin-left: 13rpx;
    margin-top: 16rpx;
}

.input-textarea {
    padding: 15rpx 15rpx 25rpx 15rpx;
}

.question-answer-container {
    margin-top: 50rpx;
    padding: 30rpx 20rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
}

.answer-label {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-right: 10rpx;
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
    flex: 1;
    margin: 0 10rpx;
}

.check-container {
    margin-top: 20rpx;
    padding: 0 28rpx;
}
</style>
