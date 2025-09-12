<template>
    <view class="question-container">
        <view class="question-header">
            <view class="question-top-row">
                <text class="question-index">{{props.questionIndex}}.</text>
                <text class="question-lable">简答题</text>
            </view>
            <view class="question-stem">
                <rich-text :nodes="question.stem"></rich-text>
            </view>
        </view>
        <view class="input-container" v-show="props.currentMode === 0">
            <view class="input-label">
                <uni-icons
                    color="#3797ff" 
                    type="compose" 
                    size="20">
                </uni-icons>
            </view>
            <view class="input-textarea">
            <up-textarea 
                v-model="userinput" 
                placeholder="请在此处输入答案~"
                autoHeight 
                :height="75"
                count
                :maxlength="-1">
            </up-textarea>
            </view>
        </view>
        <!-- 查看答案 -->
        <view class="check-container">
            <up-button 
                v-if="props.currentMode === 0"
                @click="isShowAnswer = !isShowAnswer"
                type="primary" 
                :text= "showAnswerComputed ? '隐藏答案' : '显示答案'"
                shape="circle" 
                icon="eye-fill">
            </up-button>
        </view>
        <!-- 答案 -->
        <uni-transition name="fade" mode="out-in" :show="showAnswerComputed">
            <view class="question-answer-container" key="answer">
                <view  class="answer-label">答案：</view>
                <view class="answer-content">
                    <rich-text :nodes="question.content"></rich-text>
                </view>
            </view>
        </uni-transition>
        <!-- 用户判断 -->
        <uni-transition name="fade" mode="out-in" :show="showAnswerComputed && props.currentMode === 0">
            <view class="user-judgment-container" key="judgment">
                <up-button 
                    icon="close"
                    type="primary" 
                    :plain="true" 
                    text="答错了" 
                    shape="circle" 
                    class="user-judgment-but"
                    @click="handleSelfEvaluation(false)"></up-button>
                <up-button 
                    icon="checkmark"
                    type="primary" 
                    :plain="true" 
                    text="答对了" 
                    shape="circle" 
                    class="user-judgment-but"
                    @click="handleSelfEvaluation(true)"></up-button>
            </view>
        </uni-transition>
        <!-- 解析 -->
        <AnalysisCom :analysis="question.analysis" :showAnalysis="showAnswerComputed" />
    </view>
</template>

<script setup>
import { ref ,computed,onMounted,watch} from 'vue';
import { useSubjectiveAnswerStore } from '@/stores/modules/SubjectiveAnswerStore';
import AnalysisCom from '@/components/modules/exam/Analysiscom.vue';

const subjectiveAnswerStore = useSubjectiveAnswerStore();// 初始化 store
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
const userinput = ref('');
const isShowAnswer = ref(false);

const showAnswerComputed = computed(() => {
    if(props.currentMode === 1){
        //学习模式直接显示
        return true;
    }
    // 答题模式，根据用户点击显示答案
    return isShowAnswer.value;
});
// 监听用户输入变化，保存到 store
watch(userinput, (newInput) => {
    subjectiveAnswerStore.saveUserAnswer(props.question._id, newInput);
}, { deep: true });

// 处理用户自评
const handleSelfEvaluation = (isCorrect) => {
    subjectiveAnswerStore.saveUserSelfEvaluation(props.question._id, isCorrect);
};

onMounted(()=>{
    // 组件挂载时，从 store 获取已保存的答案（如果有）
    const savedAnswer = subjectiveAnswerStore.getUserAnswer(props.question._id);
    if(savedAnswer){
        userinput.value = savedAnswer;
    }

    //挂载时候 保存参考答案到 store
    subjectiveAnswerStore.saveReferenceAnswer(props.question._id,props.question.content);
})
</script>

<style scoped>
.question-container {
    padding: 14rpx 20rpx;
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
    font-size: 34rpx;
    color: #000000;
    font-weight: 572;
}
.input-container {
    margin-top: 30rpx;
    background-color: rgb(248, 248, 248);
    border-radius: 13rpx;
}
.input-label{
    font-size: 28rpx;
    color:#3797ff;
    font-weight: 572;
    margin-left: 13rpx;
    margin-top: 10rpx

}
.input-textarea{
    padding: 15rpx 15rpx 25rpx 15rpx;
}
/* 答案容器样式 */
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
.user-judgment-container{
    margin-top: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8rpx;
}
.user-judgment-but{
    flex: 1; /* 让按钮占据相同的宽度 */
    margin: 0 10rpx; /* 调整按钮之间的间距 */
}

.check-container{
    margin-top: 20rpx;
    padding: 0 28rpx;
}
</style>