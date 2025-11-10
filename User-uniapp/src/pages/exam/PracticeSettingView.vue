<template>
    <view class="container">
        <view class="header-section">
            <view class="section-title">
                <view class="title-icon">
                    <text class="iconfont icon-info"></text>
                </view>
                <text class="title-text">练习信息</text>
            </view>
        </view>
        
        <view class="card">
            <view class="info-item">
                <view class="item-content">
                    <view class="label-wrapper">
                        <text class="label">考试名称</text>
                    </view>
                    <text class="value">{{ QuestionTypeData.examName || '未知考试' }}</text>
                </view>
            </view>
            <view class="info-item">
                <view class="item-content">
                    <view class="label-wrapper">
                        <text class="label">考试题型</text>
                    </view>
                    <view class="value-tag">
                        <text class="tag-text">{{ QuestionTypeData.subjectTypeName || '未知类型' }}</text>
                    </view>
                </view>
            </view>
            <view class="info-item">
                <view class="item-content">
                    <view class="label-wrapper">
                        <text class="label">题目数量</text>
                    </view>
                    <view class="value-highlight">
                        <text class="highlight-number">{{ QuestionTypeData.amount || 0 }}</text>
                        <text class="highlight-unit">题</text>
                    </view>
                </view>
            </view>
            <view class="info-item">
                <view class="item-content">
                    <view class="label-wrapper">
                        <text class="label">更新时间</text>
                    </view>
                    <text class="value">{{ QuestionTypeData.updateTime || '未知时间' }}</text>
                </view>
            </view>
        </view>

        <view class="header-section">
            <view class="section-title">
                <view class="title-icon">
                    <text class="iconfont icon-setting"></text>
                </view>
                <text class="title-text">练习设置</text>
            </view>
        </view>

        <view class="settings-card">
            <PracticeSettings 
                v-model:questionCount="questionCount"
                :maxQuestions="QuestionTypeData.amount"
                v-model:isRandom="isRandom"
                v-model:isOptionRandom="isOptionRandom"
                v-model:isShowAnswer="isShowAnswer"
                v-model:isShowAIHelp="isShowAIHelp"/>
        </view>
        
        <view class="action-container">
            <up-button 
                type="primary" 
                text="立即练习" 
                shape="circle" 
                size="large"
                :loading="isLoading"
                @click="handleStart">
            </up-button>
        </view>
    </view>
</template>
<script setup>  
import { ref } from 'vue';
import { useQuestionStore } from '../../stores/modules/QuestionStore';
import { onLoad } from '@dcloudio/uni-app';
import PracticeSettings from '../../components/modules/exam/PracticeSettings.vue';

const QuestionStore = useQuestionStore();
const QuestionTypeData = ref({}); // 考试题型基本数据
const isLoading = ref(false); // 加载状态
const bankInfo = ref(null); // 题库信息

// 练习设置
const questionCount = ref(1); 
const isRandom = ref(false); // 默认不乱序
const isOptionRandom = ref(false); // 默认选项不乱序
const isShowAnswer = ref(false); // 是否立即显示答案
const isShowAIHelp = ref(false); // 是否开启AI解析

// 页面加载时
onLoad((options) => {
    if (options.data) {
        try {
            // 解析传递过来的科目数据
            const Data = JSON.parse(decodeURIComponent(options.data));
            QuestionTypeData.value = Data;
            
            // 设置默认题目数量为总题数（最大值）
            questionCount.value = Data.amount || 1;
            
            // 准备题库信息（系统题库）
            bankInfo.value = {
                bankId: Data._id,
                bankName: Data.examName,
                isUserBank: false // 标识这是系统题库
            };
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
});

const handleStart = () => {
    if (!QuestionTypeData.value || !QuestionTypeData.value.amount) {
        uni.showToast({
            title: '数据加载中，请稍候',
            icon: 'none'
        });
        return;
    }
    
    if (questionCount.value > QuestionTypeData.value.amount) {
        uni.showToast({
            title: '题目数量不能超过总题数',
            icon: 'none'
        });
        return;
    }
    
    isLoading.value = true;
    
    // 设置当前选择的题目数量，乱序选项等信息
    QuestionStore.setSelectedQuestions(
        questionCount.value, 
        isRandom.value, 
        isOptionRandom.value
    );
    
    // 设置用户显示设置
    QuestionStore.setUserShowSettings({
        showAnswer: isShowAnswer.value,
        showAIHelp: isShowAIHelp.value,
        OptionRandom: isOptionRandom.value,
    });
    
    // 添加延迟，确保状态更新完成
    setTimeout(() => {
        isLoading.value = false;
        // 构建URL，传递题库信息
        let url = '/pages/exam/PracticeView';
        if (bankInfo.value) {
            url += `?bankInfo=${encodeURIComponent(JSON.stringify(bankInfo.value))}`;
        }
        uni.navigateTo({
            url: url
        });
    }, 300);
};
</script>

<style scoped>
.container {
    padding: 20rpx;
    background-color: #f8f9fa;
    min-height: 100vh;
}

.header-section {
    margin: 20rpx 0;
}

.section-title {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
}

.title-icon {
    width: 40rpx;
    height: 40rpx;
    background: #cfe7ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16rpx;
}

.iconfont {
    font-size: 24rpx;
    color: #ffffff;
}

.title-text {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
}

.card {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
    margin-bottom: 30rpx;
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-2rpx);
    box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.1);
}

.settings-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 40rpx;
}

.info-item {
    margin-bottom: 30rpx;
    position: relative;
}

.info-item:last-child {
    margin-bottom: 0;
}

.item-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.label-wrapper {
    display: flex;
    align-items: center;
    min-width: 160rpx;
}

.label {
    color: #666;
    font-size: 30rpx;
    font-weight: 500;
    position: relative;
    padding-left: 20rpx;
}

.label::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8rpx;
    height: 30rpx;
    background: linear-gradient(to bottom, #007AFF, #5AC8FA);
    border-radius: 4rpx;
}

.value {
    flex: 1;
    color: #333;
    font-size: 30rpx;
    font-weight: 500;
    text-align: right;
}

.value-tag {
    background: linear-gradient(135deg, #007AFF, #5AC8FA);
    border-radius: 30rpx;
    padding: 8rpx 24rpx;
}

.tag-text {
    color: #ffffff;
    font-size: 26rpx;
    font-weight: 500;
}

.value-highlight {
    display: flex;
    align-items: baseline;
}

.highlight-number {
    color: #007AFF;
    font-size: 40rpx;
    font-weight: 700;
    margin-right: 8rpx;
}

.highlight-unit {
    color: #666;
    font-size: 24rpx;
}

.action-container {
    display: flex;
    justify-content: center;
    padding: 20rpx 0 40rpx;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
    .container {
        padding: 15rpx;
    }
    
    .card, .settings-card {
        padding: 24rpx;
        border-radius: 12rpx;
    }
    
    .label {
        font-size: 28rpx;
    }
    
    .value {
        font-size: 28rpx;
    }
    
    .title-text {
        font-size: 32rpx;
    }
}

/* 动画效果 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20rpx);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card {
    animation: fadeIn 0.5s ease-out;
}

.info-item {
    animation: fadeIn 0.5s ease-out backwards;
}

.info-item:nth-child(1) { animation-delay: 0.2s; }
.info-item:nth-child(2) { animation-delay: 0.3s; }
.info-item:nth-child(3) { animation-delay: 0.4s; }
.info-item:nth-child(4) { animation-delay: 0.5s; }
</style>