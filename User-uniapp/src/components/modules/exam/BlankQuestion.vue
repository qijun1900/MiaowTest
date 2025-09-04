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
        <!-- 用户自行判断答案 -->
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
        <view class="question-answer-container" v-if="showAnswerComputed">
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
import {  ref, watch,computed } from 'vue';

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
const isShowAnswer = ref(false);
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
</style>