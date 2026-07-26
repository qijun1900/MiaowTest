<template>
    <ThemeProvider>
        <view class="page" :style="{ paddingBottom: safeAreaInfo.bottom + 'px' }">
            <!-- 顶部导航栏 -->
            <view class="top-wrapper">
                <view class="custom-navbar" :style="customNavbarStyle">
                    <view class="nav-row" :style="navRowStyle">
                        <view class="nav-left" @click="handleBack">
                            <t-icon
                                name="chevron-left"
                                size="44rpx"
                                color="var(--app-text-primary)"
                            ></t-icon>
                        </view>
                        <text class="nav-title">复习完成</text>
                        <view class="nav-right"></view>
                    </view>
                </view>
            </view>

            <scroll-view class="main-scroll" scroll-y>
                <view class="scroll-content">
                    <!-- 庆祝头部 -->
                    <view class="celebrate-section">
                        <text class="celebrate-emoji">🎉</text>
                        <text class="celebrate-title">复习完成！</text>
                        <text class="celebrate-desc">{{ bookTitle }}</text>
                    </view>

                    <!-- 统计卡片 -->
                    <view class="stats-card">
                        <view class="stats-grid">
                            <view class="stat-block">
                                <text class="stat-number">{{ resultData.total || 0 }}</text>
                                <text class="stat-name">总数</text>
                            </view>
                            <view class="stat-block stat-correct">
                                <text class="stat-number">{{ resultData.correctCount || 0 }}</text>
                                <text class="stat-name">认识</text>
                            </view>
                            <view class="stat-block stat-wrong">
                                <text class="stat-number">{{ resultData.wrongCount || 0 }}</text>
                                <text class="stat-name">不认识</text>
                            </view>
                        </view>

                        <!-- 正确率进度条 -->
                        <view class="accuracy-section">
                            <view class="accuracy-header">
                                <text class="accuracy-label">正确率</text>
                                <text class="accuracy-value">{{ resultData.accuracy || 0 }}%</text>
                            </view>
                            <view class="accuracy-bar-bg">
                                <view
                                    class="accuracy-bar-fill"
                                    :style="{ width: (resultData.accuracy || 0) + '%' }"
                                    :class="{ 'accuracy-high': (resultData.accuracy || 0) >= 80, 'accuracy-mid': (resultData.accuracy || 0) >= 50 && (resultData.accuracy || 0) < 80, 'accuracy-low': (resultData.accuracy || 0) < 50 }"
                                ></view>
                            </view>
                        </view>
                    </view>

                    <!-- 复习详情列表 -->
                    <view class="detail-section" v-if="resultData.details && resultData.details.length > 0">
                        <view class="section-header">
                            <view class="section-dot"></view>
                            <text class="section-title">复习详情</text>
                        </view>

                        <view class="detail-list">
                            <view
                                v-for="(item, index) in resultData.details"
                                :key="item.wordId || index"
                                class="detail-item"
                                :class="{ 'detail-correct': item.isCorrect, 'detail-wrong': !item.isCorrect, expanded: expandedIndex === index }"
                                @click="toggleExpand(index)"
                            >
                                <view class="detail-icon">
                                    <t-icon
                                        :name="item.isCorrect ? 'check-circle-filled' : 'close-circle-filled'"
                                        size="36rpx"
                                        :color="item.isCorrect ? 'var(--app-success)' : 'var(--app-danger)'"
                                    ></t-icon>
                                </view>
                                <view class="detail-info">
                                    <text class="detail-word">{{ item.word || getWordText(item.wordId) }}</text>
                                    <text class="detail-mastery">
                                        {{ getMasteryLabel(item.prevMastery) }} → {{ getMasteryLabel(item.newMastery) }}
                                    </text>
                                    <!-- 展开后显示释义 -->
                                    <view v-if="expandedIndex === index && item.meaning" class="detail-meaning-wrapper">
                                        <view class="detail-divider"></view>
                                        <text class="detail-meaning">{{ item.meaning }}</text>
                                    </view>
                                </view>
                                <t-icon
                                    :name="expandedIndex === index ? 'chevron-up' : 'chevron-down'"
                                    size="28rpx"
                                    color="var(--app-text-placeholder)"
                                ></t-icon>
                            </view>
                        </view>
                    </view>

                    <!-- 底部留白 -->
                    <view style="height: 40rpx;"></view>
                </view>
            </scroll-view>

            <!-- 底部操作栏 -->
            <view class="bottom-bar" :style="{ paddingBottom: safeAreaInfo.bottom + 'px' }">
                <view class="bottom-bar-inner">
                    <view class="bar-btn bar-btn-outline" @click="handleReviewAgain">
                        <t-icon name="refresh" size="32rpx" color="var(--app-brand)"></t-icon>
                        <text class="bar-btn-text outline-text">再来一轮</text>
                    </view>
                    <view class="bar-btn bar-btn-primary" @click="handleBack">
                        <t-icon name="home" size="32rpx" color="#fff"></t-icon>
                        <text class="bar-btn-text primary-text">返回单词本</text>
                    </view>
                </view>
            </view>
        </view>
    </ThemeProvider>
</template>

<script setup>
import ThemeProvider from "../../../components/core/ThemeProvider.vue";
import { ref} from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useNavBarSafeArea } from "../../../composables/useNavBarSafeArea";
import { MASTERY_LABELS, formatInterval } from "../../../util/sm2Algorithm";

const { safeAreaInfo, customNavbarStyle, navRowStyle } = useNavBarSafeArea({
    reserveMenuButtonRight: true,
    rightPaddingExtra: 8,
});

// ---- 路由参数 ----
const bookId = ref("");
const bookTitle = ref("");
const expandedIndex = ref(-1); // 当前展开的单词索引，-1=全部折叠
const resultData = ref({
    total: 0,
    correctCount: 0,
    wrongCount: 0,
    accuracy: 0,
    details: [],
});

// ---- 生命周期 ----
onLoad((options) => {
    bookId.value = options.bookId || "";
    bookTitle.value = decodeURIComponent(options.title || "单词本");

    if (options.result) {
        try {
            resultData.value = JSON.parse(decodeURIComponent(options.result));
        } catch (e) {
            console.error("解析复习结果失败", e);
        }
    }
});

// ---- 展开/折叠 ----
const toggleExpand = (index) => {
    expandedIndex.value = expandedIndex.value === index ? -1 : index;
};

// ---- 辅助函数 ----
const getWordText = (wordId) => {
    // 从 details 中查找对应的单词文本
    const detail = resultData.value.details?.find(d => d.wordId === wordId);
    if (detail?.word) return detail.word;
    if (typeof wordId === "string") {
        return wordId.slice(-6);
    }
    return String(wordId || "");
};

const getMasteryLabel = (level) => {
    return MASTERY_LABELS[level] || "新词";
};

const formatIntervalText = (days) => {
    return formatInterval(days);
};

// ---- 操作 ----
const handleReviewAgain = () => {
    const title = encodeURIComponent(bookTitle.value);
    uni.redirectTo({
        url: `/pages/tools/WordBookToolView_children/WordReviewView?bookId=${bookId.value}&title=${title}&mode=mixed&limit=20`,
    });
};

const handleBack = () => {
    // 安全计算返回层级，防止页面栈不足
    const pages = getCurrentPages();
    const delta = Math.min(2, pages.length - 1);
    if (delta <= 0) {
        uni.switchTab({ url: "/pages/tab/tools" });
    } else {
        uni.navigateBack({ delta });
    }
};
</script>

<style scoped>
.page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--app-bg-page);
}

.top-wrapper {
    background: var(--app-bg-page);
    border-bottom: 1rpx solid var(--app-border);
    box-shadow: 0 4rpx 18rpx rgba(140, 120, 80, 0.08);
    z-index: 30;
}

.custom-navbar {
    padding-left: 18rpx;
    padding-right: 18rpx;
    box-sizing: border-box;
}

.nav-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
}

.nav-left {
    width: 80rpx;
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.nav-title {
    flex: 1;
    text-align: center;
    font-size: calc(34rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 700;
    padding: 0 12rpx;
}

.nav-right {
    width: 80rpx;
    flex-shrink: 0;
}

/* ---- 滚动区域 ---- */
.main-scroll {
    flex: 1;
    min-height: 0;
}

.scroll-content {
    padding: 30rpx 24rpx;
}

/* ---- 庆祝区域 ---- */
.celebrate-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx 0 30rpx;
}

.celebrate-emoji {
    font-size: 100rpx;
    margin-bottom: 16rpx;
}

.celebrate-title {
    font-size: calc(44rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 800;
    margin-bottom: 12rpx;
}

.celebrate-desc {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

/* ---- 统计卡片 ---- */
.stats-card {
    background: var(--app-bg-container);
    border-radius: 28rpx;
    border: 2rpx solid var(--app-border);
    box-shadow: var(--app-shadow-card);
    padding: 36rpx 30rpx;
    margin-bottom: 30rpx;
}

.stats-grid {
    display: flex;
    gap: 0;
    margin-bottom: 30rpx;
}

.stat-block {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
}

.stat-number {
    font-size: calc(48rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 800;
}

.stat-correct .stat-number {
    color: var(--app-success);
}

.stat-wrong .stat-number {
    color: var(--app-danger);
}

.stat-name {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

/* ---- 正确率 ---- */
.accuracy-section {
    padding-top: 24rpx;
    border-top: 1rpx solid var(--app-border);
}

.accuracy-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14rpx;
}

.accuracy-label {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 600;
}

.accuracy-value {
    font-size: calc(32rpx * var(--app-font-scale, 1));
    color: var(--app-brand);
    font-weight: 700;
}

.accuracy-bar-bg {
    width: 100%;
    height: 16rpx;
    border-radius: 8rpx;
    background: var(--app-border);
    overflow: hidden;
}

.accuracy-bar-fill {
    height: 100%;
    border-radius: 8rpx;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.accuracy-high {
    background: linear-gradient(90deg, var(--app-success) 0%, #52c41a 100%);
}

.accuracy-mid {
    background: linear-gradient(90deg, var(--app-warning) 0%, #faad14 100%);
}

.accuracy-low {
    background: linear-gradient(90deg, var(--app-danger) 0%, #ff4d4f 100%);
}

/* ---- 详情列表 ---- */
.detail-section {
    margin-bottom: 30rpx;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 14rpx;
    margin-bottom: 20rpx;
}

.section-dot {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    background: var(--app-brand);
    box-shadow: 0 0 0 8rpx color-mix(in srgb, var(--app-brand) 14%, transparent);
    flex-shrink: 0;
}

.section-title {
    font-size: calc(32rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 700;
}

.detail-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 20rpx 24rpx;
    border-radius: 20rpx;
    background: var(--app-bg-container);
    border: 1rpx solid var(--app-border);
}

.detail-icon {
    flex-shrink: 0;
    padding-top: 4rpx;
}

.detail-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
    min-width: 0;
}

.detail-word {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.detail-mastery {
    font-size: calc(22rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

.detail-interval {
    flex-shrink: 0;
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-brand);
    font-weight: 600;
}

/* 展开状态 */
.detail-item.expanded {
    background: var(--app-bg-secondary);
}

.detail-meaning-wrapper {
    margin-top: 12rpx;
    animation: fadeDown 0.25s ease;
}

.detail-divider {
    width: 60rpx;
    height: 3rpx;
    border-radius: 2rpx;
    background: var(--app-border);
    margin-bottom: 10rpx;
}

.detail-meaning {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    line-height: 1.6;
    white-space: pre-wrap;
}

@keyframes fadeDown {
    from {
        opacity: 0;
        transform: translateY(-8rpx);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ---- 底部操作栏 ---- */
.bottom-bar {
    background: var(--app-bg-container);
    border-top: 1rpx solid var(--app-border);
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
    z-index: 100;
    flex-shrink: 0;
}

.bottom-bar-inner {
    display: flex;
    gap: 20rpx;
    padding: 20rpx 30rpx;
}

.bar-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    height: 88rpx;
    border-radius: 44rpx;
    transition: all 0.2s ease;
}

.bar-btn:active {
    transform: scale(0.97);
}

.bar-btn-outline {
    background: var(--app-bg-container);
    border: 2rpx solid var(--app-brand);
}

.bar-btn-primary {
    background: linear-gradient(
        135deg,
        var(--app-brand) 0%,
        var(--app-brand-hover) 100%
    );
    box-shadow: 0 8rpx 24rpx
        color-mix(in srgb, var(--app-brand) 32%, transparent);
}

.bar-btn-text {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    font-weight: 600;
}

.outline-text {
    color: var(--app-brand);
}

.primary-text {
    color: #fff;
}

@media screen and (min-width: 760px) {
    .scroll-content {
        max-width: 720rpx;
        margin: 0 auto;
        padding: 30rpx 40rpx;
    }
}
</style>
