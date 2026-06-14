<template>
    <view class="container">
        <!-- 提示 -->
        <Tips v-if="questionBanks && questionBanks.length > 0" text="左滑即可对题库进行删除操作" :duration="10000" type="info" />

        <!-- 加载状态 -->
        <ThemeLoading v-if="isLoading" text="正在加载题库..." />

        <!-- 有题库数据时显示题库列表 -->
        <view v-else-if="questionBanks && questionBanks.length > 0">
            <view
                class="question-bank-item"
                v-for="(item, index) in questionBanks"
                :key="index"
                @click="handleClick(item)"
            >
                <view
                    class="question-bank-item-swipe"
                    :class="{ swiped: swipeIndex === index }"
                    @touchstart="handleTouchStart($event, index)"
                    @touchmove="handleTouchMove($event, index)"
                    @touchend="handleTouchEnd($event, index)"
                >
                    <!-- 左边图标 -->
                    <view class="bank-image">
                        <t-icon name="book" size="40px" color="var(--app-brand)" />
                    </view>

                    <!-- 右边题库信息 -->
                    <view class="bank-info">
                        <text class="bank-name">{{ item.bankName }}</text>
                        <view class="bank-details">
                            <text class="question-count"
                                >{{ item.questionCount }}题</text
                            >
                            <text class="time">{{
                                formatTime.getTime2(item.createTime)
                            }}</text>
                        </view>
                    </view>

                    <!-- 最右侧指示图标 -->
                    <view
                        class="more-section"
                        :class="{ hidden: swipeIndex === index }"
                    >
                        <text class="arrow-icon">›</text>
                    </view>
                    <!-- 滑动删除的操作 -->
                    <view
                        class="delete-action"
                        :class="{ visible: swipeIndex === index }"
                    >
                        <button
                            class="delete-btn"
                            @click.stop="handleDeleteBank(item, index)"
                        >
                            <uni-icons
                                type="trash"
                                size="24"
                                color="#fff"
                            ></uni-icons>
                        </button>
                    </view>
                </view>
            </view>
        </view>

        <!-- 空状态显示 -->
        <view v-else class="empty-state">
            <view class="empty-image">
                <t-icon name="book" size="60px" color="var(--app-text-placeholder)" />
            </view>
            <text class="empty-text">暂无题库</text>
            <text class="empty-desc">快去创建你的第一个题库吧！</text>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getUserBankList, deleteUserBankAPI } from "../../../API/Exam/ExamAPI";
import formatTime from "../../../util/formatTime";
import ThemeLoading from "../../core/ThemeLoading.vue";
import useSwipe from "../../../composables/useSwipe";
import Tips from "../../core/Tips.vue";

const questionBanks = ref([]);
const isLoading = ref(false);
// 滑动删除相关状态与方法（使用封装的 composable）
const {
    swipeIndex,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetSwipe,
} = useSwipe();

// 点击事件处理
const handleClick = (item) => {
    uni.navigateTo({
        url: `/pages/exam/UserBankView?data=${encodeURIComponent(JSON.stringify(item))}`,
    });
};

// 删除题库
const handleDeleteBank = (item, index) => {
    uni.showModal({
        title: "确认删除",
        content: "确定要删除该题库吗？删除后无法恢复。",
        confirmColor: "#ff4757",
        success: async (res) => {
            if (res.confirm) {
                await deleteBank(item.bankId, index);
            }
            resetSwipe();
        },
    });
};

const deleteBank = async (bankId, index) => {
    try {
        const res = await deleteUserBankAPI(bankId);
        if (res.code === 200) {
            uni.showToast({
                title: "删除成功",
                icon: "success",
            });
            questionBanks.value.splice(index, 1);
        } else {
            uni.showToast({
                title: res.message,
                icon: "error",
            });
        }
    } catch (error) {
        uni.showToast({
            title: "删除失败，请稍后再试",
            icon: "none",
        });
        console.error("删除题库失败:", error);
    }
};

onMounted(async () => {
    try {
        isLoading.value = true;
        const res = await getUserBankList();
        questionBanks.value = res.data || [];
    } catch (error) {
        console.error("获取题库失败:", error);
        questionBanks.value = [];
    } finally {
        isLoading.value = false;
    }
});
</script>

<style scoped>
.container {
    padding: 15rpx 10rpx;
}

.question-bank-item {
    margin-bottom: 8rpx;
    background: transparent;
    overflow: hidden;
}

.question-bank-item-swipe {
    padding: 20rpx 0;
    position: relative;
    overflow: visible;
    background-color: transparent;
    width: 100%;
    min-height: 110rpx;
    display: flex;
    align-items: center;
    border-bottom: 1rpx solid var(--app-border);
    transform: translateX(0);
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.question-bank-item:last-child .question-bank-item-swipe {
    border-bottom: none;
}

.question-bank-item-swipe.swiped {
    transform: translateX(-50rpx);
}

.bank-image {
    width: 85rpx;
    height: 85rpx;
    border-radius: 12rpx;
    margin-left: 22rpx;
    margin-right: 28rpx;
    flex-shrink: 0;
    background: var(--app-brand-light);
    display: flex;
    align-items: center;
    justify-content: center;
}

.bank-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.bank-name {
    font-size: 32rpx;
    font-weight: bold;
    color: var(--app-brand);
    margin-bottom: 10rpx;
}

.bank-details {
    display: flex;
    align-items: center;
    gap: 22rpx;
}

.question-count {
    font-size: 24rpx;
    color: var(--app-text-secondary);
}

.time {
    font-size: 25rpx;
    color: var(--app-text-secondary);
}

.more-section {
    display: flex;
    align-items: center;
    margin-right: 22rpx;
    transition:
        opacity 0.3s,
        transform 0.3s;
}
.more-section.hidden {
    opacity: 0;
    transform: translateX(10rpx);
}

.arrow-icon {
    font-size: 32rpx;
    color: var(--app-brand);
    font-weight: bold;
}

/* 删除操作区域 */
.delete-action {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 120rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--app-danger);
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    z-index: 2;
    border-radius: 0 16rpx 16rpx 0;
    /* 保证不影响内容宽度 */
    pointer-events: auto;
}

.delete-action.visible {
    transform: translateX(0);
}

.delete-btn {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    border-radius: 40rpx;
    margin: 0;
    padding: 0;
    transition: background-color 0.2s;
}

.delete-btn:active {
    background-color: rgba(255, 255, 255, 0.2);
}

/* 空状态样式 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80rpx 40rpx;
    background-color: transparent;
}

.empty-image {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 30rpx;
    opacity: 0.65;
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-text {
    font-size: 32rpx;
    font-weight: bold;
    color: var(--app-text-primary);
    margin-bottom: 20rpx;
}

.empty-desc {
    font-size: 26rpx;
    color: var(--app-text-secondary);
    text-align: center;
}
</style>
