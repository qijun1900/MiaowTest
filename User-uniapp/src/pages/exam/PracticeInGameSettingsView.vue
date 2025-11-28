<template>
    <view class="container">
        <view class="content">
            <view class="settings-card">
                <view class="setting-item">
                    <text class="label">立即显示答案：</text>
                    <view class="switch-wrapper">
                        <up-switch 
                            v-model="localIsShowAnswer" 
                            size="20" 
                            @change="handleShowAnswerChange">
                        </up-switch>
                    </view>
                </view>
                <view class="setting-item">
                    <text class="label">开启刷题助手：</text>
                    <view class="switch-wrapper">
                        <up-switch 
                            v-model="localIsShowHelper" 
                            size="20" 
                            @change="handleShowHelperChange"></up-switch>
                    </view>
                </view>
            </view>
            
            <!-- 反馈提示组件 -->
            <view class="feedback-section">
                <Tips 
                    text="题目有问题？ 点击立即反馈->"
                    type="warning"
                    :duration="0"
                    :showIcon="true"
                    :closable="false"
                    :clickable="true"
                    @click="handleFeedbackClick"
                />
            </view>
            
            <view class="tips-section">
                <view class="tips-title">设置说明</view>
                <view class="tips-item">
                    <text class="tips-dot">•</text>
                    <text class="tips-text">立即显示答案：开启后，答题后会立即显示正确答案和解析</text>
                </view>
                <view class="tips-item">
                    <text class="tips-dot">•</text>
                    <text class="tips-text">刷题助手：开启后可以收藏题目与记录笔记</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useQuestionStore } from '../../stores/modules/QuestionStore';
import Tips from '../../components/core/Tips.vue';

const QuestionStore = useQuestionStore();

// 本地状态
const localIsShowAnswer = ref(false);
const localIsShowHelper = ref(false);

// 初始化设置
onMounted(() => {
    localIsShowAnswer.value = QuestionStore.UserShowSettings.showAnswer
    localIsShowHelper.value = QuestionStore.UserShowSettings.showHelper 
    
});

// 监听store中的设置变化，同步到本地状态
watch(() => QuestionStore.UserShowSettings, (newSettings) => {
    if (newSettings.showAnswer !== undefined) {
        localIsShowAnswer.value = newSettings.showAnswer;
    }
    if (newSettings.showHelper !== undefined) {
        localIsShowHelper.value = newSettings.showHelper;
    }
});


// 处理显示答案设置变化
const handleShowAnswerChange = (value) => {
   QuestionStore.setUserShowSettings({ 
        showAnswer:  value
    });

    
    uni.showToast({
        title: value ? '已开启立即显示答案' : '已关闭立即显示答案',
        icon: 'none'
    });
};

// 处理刷题助手设置变化
const handleShowHelperChange = (value) => {
    QuestionStore.setUserShowSettings({
        showHelper: value 
    });
    uni.showToast({
        title: value ? '已开启刷题助手' : '已关闭刷题助手',
        icon: 'none'
    });
};

// 处理反馈点击事件
const handleFeedbackClick = () => {
    // 可以跳转到反馈页面或打开反馈表单
    uni.showModal({
        title: '意见反馈',
        content: '即将跳转到反馈页面',
        success: (res) => {
            if (res.confirm) {
                // 跳转到反馈页面
                uni.navigateTo({
                    url: '/pages/public/feedbackview'
                });
            }
        }
    });
};
</script>

<style scoped>
.container {
    background-color: #f8f9fa;
    min-height: 100vh;
}

.content {
    padding: 20rpx;
    padding-top: 40rpx;
}

.settings-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
    margin-bottom: 30rpx;
}

.setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30rpx;
    position: relative;
}

.setting-item:last-child {
    margin-bottom: 0;
}

.label {
    color: #333;
    font-size: 32rpx;
    font-weight: 500;
    flex: 1;
}

.switch-wrapper {
    margin-left: 20rpx;
}

.helper-tip {
    font-size: 24rpx;
    color: #999;
    margin-top: 10rpx;
    width: 100%;
    text-align: right;
}

.tips-section {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.tips-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
    position: relative;
    padding-left: 20rpx;
}

.tips-title::before {
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

.tips-item {
    display: flex;
    margin-bottom: 15rpx;
    align-items: flex-start;
}

.tips-item:last-child {
    margin-bottom: 0;
}

.tips-dot {
    color: #007AFF;
    font-size: 32rpx;
    margin-right: 10rpx;
    line-height: 1.2;
}

.tips-text {
    flex: 1;
    font-size: 28rpx;
    color: #666;
    line-height: 1.5;
}

.feedback-section {
    margin-bottom: 30rpx;
}
</style>