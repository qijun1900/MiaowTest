<template>
    <ThemeProvider>
    <CustomNavBar title="练习结果" @back="handleNavBack" />
    <view class="container">
        <view class="animation">
            <firework-effect ref="fireworkRef"></firework-effect>
        </view>
        <view class="accuracy">
            <view class="accuracy-circle">
                <text class="accuracy-number">{{ accuracyRate }}</text>
                <text class="accuracy-text">正确率</text>
            </view>
        </view>
        <view class="data-container">
            <view class="data-title">
                <text class="data-label">练习情况</text>
            </view>
            <view class="data-content">
                <view class="data-item">
                    <view class="data-info">
                        <text class="data-value">{{ correctCount }}</text>
                        <text class="data-label">正确数</text>
                    </view>
                </view>
                <view class="data-item">
                    <view class="data-info">
                        <text class="data-value">{{ incorrectCount }}</text>
                        <text class="data-label">错误数</text>
                    </view>
                </view>
                <view class="data-item">
                    <view class="data-info">
                        <text class="data-value">{{ unansweredCount }}</text>
                        <text class="data-label">未作答</text>
                    </view>
                </view>
            </view>
        </view>
        <view class="answer-sheet-container">
            <view class="data-title">
                <text class="data-label">答题情况</text>
            </view>
            <AnswerSheet
                :questions="QuestionStore.UserChooseQuestion"
                :isShowAnswer="true"
            >
            </AnswerSheet>
        </view>
        <view class="bottom-action-container">
            <t-button
                variant="outline"
                theme="primary"
                shape="round"
                size="large"
                @click="exportToPDF"
            >
                导出为PDF
            </t-button>
            <t-button
                v-if="!isUserBank"
                theme="danger"
                shape="round"
                size="large"
                @click="viewWrongQuestions"
            >
                查看错题
            </t-button>
            <t-button
                v-else
                theme="danger"
                shape="round"
                size="large"
                @click="handleBack"
            >
                返回题库
            </t-button>
        </view>
    </view>
    </ThemeProvider>
</template>

<script setup>
import ThemeProvider from "../../components/core/ThemeProvider.vue";
import { ref, onMounted, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { storeToRefs } from "pinia";
import FireworkEffect from "@/uni_modules/firework-effect/firework-effect.vue"; //特效
import AnswerSheet from "../../components/modules/exam/AnswerSheet.vue";
import { useQuestionStore } from "../../stores/modules/QuestionStore";
import { useStatisticsStore } from "../../stores/modules/StatisticsStore";
import CustomNavBar from "../../components/common/CustomNavBar.vue";

const handleNavBack = () => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack({ delta: 1 });
    } else {
        uni.switchTab({ url: "/pages/index/index" });
    }
};

const fireworkRef = ref(null);
const QuestionStore = useQuestionStore();
const StatisticsStore = useStatisticsStore();
const { correctCount, incorrectCount, unansweredCount, accuracyRate } =
    storeToRefs(StatisticsStore);
const bankInfo = ref(null); // 题库信息

// 计算是否为用户题库
const isUserBank = computed(() => {
    return bankInfo.value?.isUserBank || false;
});

// 页面加载时接收参数
onLoad((options) => {
    if (options.bankInfo) {
        try {
            bankInfo.value = JSON.parse(decodeURIComponent(options.bankInfo));
        } catch (error) {
            console.error("解析题库信息失败:", error);
        }
    }
});

onMounted(() => {
    // 页面加载完成后触发烟花效果
    if (fireworkRef.value) {
        fireworkRef.value.handleShowEffect({ type: "fireworks" });
    }
});

// TODO: 实现PDF导出功能
const exportToPDF = () => {
    uni.showToast({
        title: "导出功能开发中",
        icon: "none",
    });
};

// 查看错题
const viewWrongQuestions = () => {
    uni.navigateTo({
        url: "/pages/exam/WrongQuestionView",
    });
};
//用户题库返回
const handleBack = () => {
    uni.navigateBack({ delta: 2 });
};
</script>
<style scoped>
.container {
    padding: 10rpx 20rpx;
    background-color: var(--app-bg-secondary);
    height: 100vh;
    /* 为底部固定按钮留出空间 */
    padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.accuracy {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 40rpx 0;
}

.accuracy-circle {
    width: 220rpx;
    height: 220rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #5608ff 0%, #2575fc 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 20rpx rgba(37, 117, 252, 0.3);
    position: relative;
    overflow: hidden;
}

.accuracy-circle::before {
    content: "";
    position: absolute;
    top: -10rpx;
    left: -10rpx;
    right: -10rpx;
    bottom: -10rpx;
    background: linear-gradient(135deg, #1768ff 0%, #2575fc 100%);
    border-radius: 50%;
    opacity: 0.4;
    z-index: -1;
    filter: blur(15rpx);
}

.accuracy-number {
    font-size: calc(40rpx * var(--app-font-scale, 1));
    color: var(--app-bg-container);
    font-weight: bold;
}

.accuracy-text {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
}

.data-container {
    background-color: var(--app-bg-container);
    border-radius: 20rpx;
    padding: 30rpx;
    margin: 20rpx 0;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.data-title {
    padding-bottom: 20rpx;
}

.data-title .data-label {
    font-size: calc(32rpx * var(--app-font-scale, 1));
    font-weight: bold;
    color: var(--app-text-primary);
}

.data-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 15rpx;
}

.data-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 10rpx;
    border-radius: 12rpx;
    transition: all 0.3s ease;
    flex: 1; /* 每个项目占据相等的空间 */
    background-color: var(--app-bg-secondary);
}

.data-item:active {
    background-color: var(--app-bg-secondary);
    transform: scale(0.98);
}

.data-info {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.data-value {
    font-size: calc(32rpx * var(--app-font-scale, 1));
    font-weight: bold;
    color: var(--app-text-primary);
    margin-bottom: 5rpx;
}

.data-label {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}
.answer-sheet-container {
    background-color: var(--app-bg-container);
    border-radius: 20rpx;
    padding: 30rpx;
}
.bottom-action-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(
        to top,
        rgba(255, 255, 255, 0.98) 0%,
        rgba(255, 255, 255, 0.95) 100%
    );
    backdrop-filter: blur(10rpx);
    border-top: 1rpx solid rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: row;
    gap: 16rpx;
    padding: 20rpx 30rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.bottom-action-container :deep(.t-button) {
    flex: 1;
}
</style>
