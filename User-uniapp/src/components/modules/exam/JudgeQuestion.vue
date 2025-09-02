<template>
    <view class="question-container">
        <view class="question-header">
            <view class="question-top-row">
                <text class="question-index">{{props.questionIndex}}.</text>
                <text class="question-lable">判断题</text>
            </view>
            <view class="question-stem">
                <rich-text :nodes="question.stem"></rich-text>
            </view>
        </view>
        <view 
            v-for="(option,index) in judgeOptions" 
            :key="index"
            class="option-container">
            <view class="option-item" :class="{'correct-answer': (question.answer === 1 && index === 0) || (question.answer === 0 && index === 1)}">
                <text class="option-tag">{{String.fromCharCode(65 + index)}}.</text>
                <text class="option-content">{{option}}</text>
            </view>
        </view>
        <view class="question-answer-container">
            <text class="answer-label">答案：</text>
            <text class="answer-content">{{question.answer === 1 ? 'A' : 'B'}}</text>
        </view>
        <view class="question-explanation-container">
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
// 判断题选项，A代表正确，B代表错误
const judgeOptions = ['正确', '错误'];

const props = defineProps({
    question: {
        type: Object,
        required: true
    },
    questionIndex: {
        type: Number,
        required: true
    }
});


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


/* 正确答案样式 */
.correct-answer {
    background-color: #e8f5e9;
    border-color: #4caf50;
}

.option-tag {
    font-size: 28rpx;
    font-weight: bold;
    color: #0d82ff;
    margin-right: 16rpx;
    min-width: 40rpx;
    text-align: center;
}

.correct-answer .option-tag {
    color: #4caf50;
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
</style>