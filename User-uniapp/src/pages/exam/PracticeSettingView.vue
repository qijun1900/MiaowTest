<template>
    <view class="container">
        <up-divider 
            text="|练习信息|" 
            textPosition="left"  
            textColor="#007AFF"
            lineColor="#86bbf5">
        </up-divider>
        
        <view class="card">
            <view class="info-item">
                <text class="label">考试名称：</text>
                <text class="value">{{ QuestionTypeData.examName }}</text>
            </view>
            <view class="info-item">
                <text class="label">考试类型：</text>
                <text class="value">{{ QuestionTypeData.subjectTypeName }}</text>
            </view>
            <view class="info-item">
                <text class="label">题目数量：</text>
                <text class="value">{{ QuestionTypeData.amount }}</text>
            </view>
            <view class="info-item">
                <text class="label">更新时间：</text>
                <text class="value">{{ QuestionTypeData.updateTime }}</text>
            </view>
        </view>

        <up-divider 
            text="|练习设置|" 
            textPosition="left"  
            textColor="#007AFF"
            lineColor="#86bbf5">
        </up-divider>

        <PracticeSettings 
            v-model:questionCount="questionCount"
            :maxQuestions="QuestionTypeData.amount"
            v-model:isRandom="isRandom"
            v-model:isOptionRandom="isOptionRandom"
            v-model:isShowAnswer="isShowAnswer"
            v-model:isShowAIHelp="isShowAIHelp"/>
        <up-button 
            type="primary" 
            text="立即练习" 
            shape="circle" 
            @click="handleStart">
        </up-button>
    </view>
</template>
<script setup>  
import {ref} from 'vue';
import {useQuestionStore} from '../../stores/modules/QuestionStore'
import { onLoad } from '@dcloudio/uni-app';
import PracticeSettings from '../../components/modules/exam/PracticeSettings.vue'
const QuestionStore = useQuestionStore()
const QuestionTypeData = ref([])// 考试题型基本数据

// 练习设置
const questionCount = ref(1) 
const isRandom = ref(false) // 默认不乱序
const isOptionRandom = ref(false) // 默认选项不乱序
const isShowAnswer = ref(false) //是否立即显示答案
const isShowAIHelp = ref(false)//是否开启AI解析

// 页面加载时
onLoad((options) => {
    if (options.data) {
        try {
            // 解析传递过来的科目数据
            const Data = JSON.parse(decodeURIComponent(options.data));
            QuestionTypeData.value = Data
            
            // 设置默认题目数量为总题数（最大值）
            questionCount.value = Data.amount 
        } catch (error) {
            console.error('解析科目数据失败:', error);
            uni.showToast({
                title: '题型解析失败',
                icon: 'none'
            });
        }
    } else {
        console.error('未接收到题型数据参数');
        uni.showToast({
            title: '参数错误',
            icon: 'none'
        });
    }
})
const handleStart = ()=>{
    QuestionStore.setSelectedQuestions(questionCount.value,isRandom.value,isOptionRandom.value)// 设置当前选择的题目数量，乱序选项等信息
    QuestionStore.setUserShowSettings({ // 设置用户显示设置
        showAnswer: isShowAnswer.value,
        showAIHelp: isShowAIHelp.value,
        OptionRandom : isOptionRandom.value,
    })
    uni.navigateTo({
        url: `/pages/exam/PracticeView`
    })
}

</script>

<style scoped>
.container {
    padding: 0rpx 10rpx;
    background-color: #ffffff;
}

.card {
    background-color: #ffffff;
    border-radius: 10rpx;
    padding: 20rpx;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 20rpx;
}

.info-item {
    display: flex;
    margin-bottom: 15rpx;
    align-items: center;
}

.label {
    width: 90px;
    color: #666;
    font-size: 30rpx;
    position: relative;
    padding-left: 10rpx;
    white-space: nowrap;
}

.label::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8rpx;
    height: 29rpx;
    background-color: #007AFF;
    border-radius: 2px;
}

.value {
    flex: 1;
    color: #333;
    font-size: 28rpx;
    font-weight: 500;
}
</style>