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
    </view>
</template>

<script setup>


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

</style>