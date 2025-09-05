<template>
    <view class="question-container">
        <view class="question-header">
            <view class="question-top-row">
                <text class="question-index">{{props.questionIndex}}.</text>
                <text class="question-lable">填空题</text>
            </view>
            <view class="question-stem">
                <rich-text :nodes="question.stem"></rich-text>
            </view>
        </view>
        <!-- 根据options数组长度动态渲染多个输入框 -->
        <view
            v-show="props.currentMode === 0" 
            class="input-container" 
            v-for="(option, index) in question.options" 
            :key="index">
            <view class="input-label">
                <uni-icons
                    color="#3797ff" 
                    type="compose" 
                    size="20"></uni-icons>
                <text>空{{index + 1}}</text> 
            </view>
            <view class="input-textarea">
            <up-textarea 
                v-model="userinput[index]" 
                :placeholder="'请在此处输入空' + (index + 1) + '的答案'"  
                autoHeight 
                :height="48">
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
                <text class="answer-label">答案：</text>
                <view class="answer-content">
                    <view 
                        v-for="(option, index) 
                        in question.options" 
                        :key="index" 
                        class="answer-item">
                        <text class="answer-index">空{{index + 1}}:{{option.content}}</text>
                        <text v-if="index < question.options.length - 1" class="answer-separator">;</text>
                    </view>
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
        <uni-transition name="fade" mode="out-in" :show="showAnswerComputed">
            <view class="question-explanation-container" key="explanation">
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
        </uni-transition>
        <button 
            @click="handleDE"  
            v-if="props.currentMode === 0">清除Store</button>
    </view>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useSubjectiveAnswerStore } from '@/stores/modules/SubjectiveAnswerStore';

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

// 初始化用户输入数组，根据options长度创建对应数量的空字符串
const userinput = ref(props.question.options.map(() => ''));
const isShowAnswer = ref(false);// 控制答案和解析的显示逻辑

//测试
const handleDE = () => {
    subjectiveAnswerStore.clearAllAnswers(); // 调用 store 中的方法清除所有数据
    console.log("sub-Store已清除"); 
};

// 监听用户输入变化，保存到 store
watch(userinput, (newInput) => {
    subjectiveAnswerStore.saveUserAnswer(props.question._id, newInput);
}, { deep: true });

// 监听question.options变化，重新初始化userinput数组
watch(() => props.question.options, (newOptions) => {
    userinput.value = newOptions.map(() => '');
}, { deep: true });

const showAnswerComputed = computed(() => {
    if(props.currentMode === 1){
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
    const referenceAnswers = props.question.options.map(option => option.content);
    subjectiveAnswerStore.saveReferenceAnswer(props.question._id, referenceAnswers);

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
    margin-top: 6rpx

}
.input-textarea{
    padding: 8rpx 15rpx 25rpx 15rpx;
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
.answer-index{
    font-size: 30rpx;
    color: #333;
    line-height: 1.6;
    font-weight: 550;
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
/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>