<template>
    <ThemeProvider>
    <CustomNavBar title="练习设置" @back="handleNavBack" />
    <view class="container">
        <!-- 练习信息 -->
        <view class="info-section">
            <text class="section-title">练习信息</text>
            <view class="info-card">
                <view class="info-item">
                    <text class="info-label">考试名称</text>
                    <text class="info-value">{{ QuestionTypeData.examName || '未知考试' }}</text>
                </view>
                <view class="info-item">
                    <text class="info-label">考试题型</text>
                    <t-tag theme="primary" variant="light" shape="round" size="small">
                        {{ QuestionTypeData.subjectTypeName || '未知类型' }}
                    </t-tag>
                </view>
                <view class="info-item">
                    <text class="info-label">题目数量</text>
                    <text class="info-value amount-text">{{ QuestionTypeData.amount || 0 }} 题</text>
                </view>
                <view class="info-item last">
                    <text class="info-label">更新时间</text>
                    <text class="info-value">{{ QuestionTypeData.updateTime || '未知时间' }}</text>
                </view>
            </view>
        </view>

        <!-- 练习设置 -->
        <view class="settings-section">
            <text class="section-title">练习设置</text>
            <view class="settings-card">
                <PracticeSettings
                    v-model:questionCount="questionCount"
                    :maxQuestions="QuestionTypeData.amount"
                    v-model:isRandom="isRandom"
                    v-model:isOptionRandom="isOptionRandom"
                    v-model:isShowAnswer="isShowAnswer"
                    v-model:isShowHelper="isShowHelper"
                />
            </view>
        </view>

        <!-- 开始按钮 -->
        <view class="action-container">
            <t-button
                theme="primary"
                content="立即练习"
                shape="round"
                size="large"
                block
                :loading="isLoading"
                @click="handleStart"
            />
        </view>
    </view>
    </ThemeProvider>
</template>

<script setup>
import { ref } from "vue";
import { useQuestionStore } from "../../stores/modules/QuestionStore";
import { onLoad } from "@dcloudio/uni-app";
import ThemeProvider from "../../components/core/ThemeProvider.vue";
import PracticeSettings from "../../components/modules/exam/PracticeSettings.vue";
import CustomNavBar from "../../components/common/CustomNavBar.vue";

const handleNavBack = () => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack({ delta: 1 });
    } else {
        uni.switchTab({ url: "/pages/index/index" });
    }
};

const QuestionStore = useQuestionStore();
const QuestionTypeData = ref({});
const isLoading = ref(false);
const bankInfo = ref(null);

const questionCount = ref(1);
const isRandom = ref(false);
const isOptionRandom = ref(false);
const isShowAnswer = ref(QuestionStore.UserShowSettings.showAnswer);
const isShowHelper = ref(QuestionStore.UserShowSettings.showHelper);

onLoad((options) => {
    if (options.data) {
        try {
            const Data = JSON.parse(decodeURIComponent(options.data));
            QuestionTypeData.value = Data;
            questionCount.value = Data.amount || 1;
            bankInfo.value = {
                bankId: Data.examId,
                bankName: Data.examName,
                isUserBank: false,
            };
        } catch (error) {
            console.error("解析科目数据失败:", error);
            uni.showToast({ title: "题型解析失败", icon: "none" });
        }
    } else {
        console.error("未接收到题型数据参数");
        uni.showToast({ title: "参数错误", icon: "none" });
    }
});

const handleStart = () => {
    if (!QuestionTypeData.value || !QuestionTypeData.value.amount) {
        uni.showToast({ title: "数据加载中，请稍候", icon: "none" });
        return;
    }
    if (questionCount.value > QuestionTypeData.value.amount) {
        uni.showToast({ title: "题目数量不能超过总题数", icon: "none" });
        return;
    }

    isLoading.value = true;
    QuestionStore.setSelectedQuestions(
        questionCount.value,
        isRandom.value,
        isOptionRandom.value,
    );
    QuestionStore.setUserShowSettings({
        showAnswer: isShowAnswer.value,
        showHelper: isShowHelper.value,
        OptionRandom: isOptionRandom.value,
    });

    setTimeout(() => {
        isLoading.value = false;
        let url = "/pages/exam/PracticeView";
        if (bankInfo.value) {
            url += `?bankInfo=${encodeURIComponent(JSON.stringify(bankInfo.value))}`;
        }
        uni.navigateTo({ url });
    }, 300);
};
</script>

<style scoped>
.container {
    padding: 24rpx;
    background-color: var(--app-brand-light);
    min-height: 100vh;
}

.section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: var(--app-text-secondary);
    padding: 0 8rpx 16rpx;
}

.info-card,
.settings-card {
    background: var(--app-bg-container);
    border-radius: 12rpx;
    padding: 8rpx 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.info-section {
    margin-bottom: 24rpx;
}

.info-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 0;
    border-bottom: 1rpx solid var(--app-bg-secondary);
}

.info-item.last {
    border-bottom: none;
}

.info-label {
    font-size: 30rpx;
    color: var(--app-text-primary);
    flex-shrink: 0;
}

.info-value {
    font-size: 30rpx;
    color: var(--app-text-secondary);
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 65%;
}

.amount-text {
    font-weight: 600;
    color: var(--app-brand);
}

.settings-section {
    margin-bottom: 24rpx;
}

.action-container {
    padding: 24rpx 0 60rpx;
}
</style>
