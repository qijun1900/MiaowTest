<template>
    <ThemeProvider>
        <view class="page" :style="{ paddingBottom: safeAreaInfo.bottom + 'px' }">
            <!-- 顶部导航栏 -->
            <view class="top-wrapper">
                <view class="custom-navbar" :style="customNavbarStyle">
                    <view class="nav-row" :style="navRowStyle">
                        <view class="nav-left" @click="handleBack">
                            <t-icon name="chevron-left" size="44rpx" color="var(--app-text-primary)"></t-icon>
                        </view>
                        <text class="nav-title">{{ bookTitle }}</text>
                        <view class="nav-right">
                            <text class="nav-progress">{{ currentIndex + 1 }}/{{ words.length }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 加载状态 -->
            <view v-if="loading" class="loading-container">
                <view class="loading-spinner"></view>
                <text class="loading-text">正在加载单词...</text>
            </view>

            <!-- 空状态 -->
            <view v-else-if="words.length === 0" class="empty-container">
                <t-icon name="check-circle-filled" size="120rpx" color="var(--app-success)"></t-icon>
                <text class="empty-title">暂无待复习单词</text>
                <text class="empty-desc">{{ emptyDesc }}</text>
                <view class="empty-btn" @click="handleBack">
                    <text class="empty-btn-text">返回</text>
                </view>
            </view>

            <!-- 复习完成（提交中） -->
            <view v-else-if="submitted" class="loading-container">
                <view class="loading-spinner"></view>
                <text class="loading-text">正在记录复习结果...</text>
            </view>

            <!-- 卡片复习区域 -->
            <view v-else class="review-area">
                <!-- 进度条 -->
                <view class="progress-bar-wrapper">
                    <view class="progress-bar-bg">
                        <view class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></view>
                    </view>
                </view>

                <!-- 掌握等级标签 -->
                <view class="mastery-tag" :style="{ color: masteryColor }">
                    <text class="mastery-text">{{ masteryLabel }}</text>
                </view>

                <!-- 翻卡片区域 -->
                <view class="flashcard-container">
                    <view class="flashcard" :class="{ flipped: isFlipped }" @click="handleCardTap">
                        <!-- 正面 -->
                        <view class="flashcard-face flashcard-front">
                            <text class="card-word">{{ currentWord.word }}</text>
                            <text v-if="currentWord.phonetic" class="card-phonetic">{{ currentWord.phonetic }}</text>
                            <view v-if="!isFlipped" class="card-tap-hint">
                                <t-icon name="swap" size="32rpx" color="var(--app-text-placeholder)"></t-icon>
                                <text class="tap-hint-text">点击卡片查看释义</text>
                            </view>
                        </view>
                        <!-- 反面 -->
                        <view class="flashcard-face flashcard-back">
                            <text class="card-word back-word">{{ currentWord.word }}</text>
                            <text v-if="currentWord.phonetic" class="card-phonetic">{{ currentWord.phonetic }}</text>
                            <view class="card-divider"></view>
                            <text class="card-meaning">{{ currentWord.meaning }}</text>
                            <text v-if="currentWord.example" class="card-example">{{ currentWord.example }}</text>
                        </view>
                    </view>
                </view>

                <!-- 底部按钮区域 -->
                <view class="bottom-area">
                    <!-- 未翻转：显示三个评价按钮 -->
                    <view v-if="!isFlipped" class="rating-row">
                        <view class="rating-btn rating-known" @click="handleRate(5)">
                            <view class="rating-badge badge-known">认识</view>
                            <text class="rating-interval">{{ knownInterval }}</text>
                        </view>
                        <view class="rating-btn rating-fuzzy" @click="handleRate(3)">
                            <view class="rating-badge badge-fuzzy">模糊</view>
                            <text class="rating-interval">{{ fuzzyInterval }}</text>
                        </view>
                        <view class="rating-btn rating-unknown" @click="handleRate(1)">
                            <view class="rating-badge badge-unknown">不会</view>
                            <text class="rating-interval">1天后</text>
                        </view>
                    </view>

                    <!-- 已翻转 + 点了"不认识"或"模糊"：只显示下一词 -->
                    <view v-else-if="isFlipped && lastQuality !== 5" class="confirm-row single">
                        <view class="confirm-btn confirm-next" :class="{ disabled: !canProceed }" @click="canProceed && goToNext()">
                            <t-icon name="arrow-right" size="36rpx" color="var(--app-brand)"></t-icon>
                            <text class="confirm-text">下一词</text>
                        </view>
                    </view>

                    <!-- 已翻转 + 点了"认识"：显示下一词 + 记错了 -->
                    <view v-else class="confirm-row">
                        <view class="confirm-btn confirm-next" :class="{ disabled: !canProceed }" @click="canProceed && handleConfirmNext()">
                            <t-icon name="check-circle" size="36rpx" color="var(--app-success)"></t-icon>
                            <text class="confirm-text">下一词</text>
                        </view>
                        <view class="confirm-btn confirm-wrong" :class="{ disabled: !canProceed }" @click="canProceed && handleConfirmWrong()">
                            <t-icon name="close-circle" size="36rpx" color="var(--app-danger)"></t-icon>
                            <text class="confirm-text">记错了</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 退出确认弹窗 -->
            <t-dialog
                :visible="showBackDialog"
                title="确认退出"
                content="退出后本次复习记录将丢失，确定退出吗？"
                :confirm-btn="{ content: '退出', theme: 'danger' }"
                cancel-btn="取消"
                :show-overlay="true"
                :z-index="12000"
                @confirm="handleBackConfirm"
                @cancel="handleBackCancel"
                @close="handleBackCancel"
            />
        </view>
    </ThemeProvider>
</template>

<script setup>
import ThemeProvider from "../../../components/core/ThemeProvider.vue";
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useNavBarSafeArea } from "../../../composables/useNavBarSafeArea";
import { getReviewWordsAPI, batchSubmitReviewAPI } from "../../../API/Tools/WordReviewAPI";
import { calculateSM2, MASTERY_LABELS, MASTERY_COLORS, formatInterval } from "../../../util/sm2Algorithm";

const { safeAreaInfo, customNavbarStyle, navRowStyle } = useNavBarSafeArea({
    reserveMenuButtonRight: true,
    rightPaddingExtra: 8,
});

// ---- 路由参数 ----
const bookId = ref("");
const bookTitle = ref("");
const reviewMode = ref("mixed");
const reviewLimit = ref(20);

// ---- 状态 ----
const loading = ref(true);
const submitted = ref(false);
const words = ref([]);
const currentIndex = ref(0);
const isFlipped = ref(false);
const lastQuality = ref(0); // 当前单词选择的评分（5=认识，其他=不认识/模糊）
const reviews = ref([]);
const canProceed = ref(false); // 防止确认按钮被瞬间误触
const showBackDialog = ref(false);

// ---- 计算属性 ----
const currentWord = computed(() => {
    return words.value[currentIndex.value] || { word: "", phonetic: "", meaning: "", example: "" };
});

const progressPercent = computed(() => {
    if (words.value.length === 0) return 0;
    return Math.round((currentIndex.value / words.value.length) * 100);
});

const masteryLabel = computed(() => {
    return MASTERY_LABELS[currentWord.value.masteryLevel || 0] || "新词";
});

const masteryColor = computed(() => {
    return MASTERY_COLORS[currentWord.value.masteryLevel || 0] || "var(--app-text-placeholder)";
});

const fuzzyInterval = computed(() => {
    const w = currentWord.value;
    const result = calculateSM2(w.easeFactor || 2.5, w.reviewInterval || 0, w.reviewCount || 0, 3);
    return formatInterval(result.newInterval);
});

const knownInterval = computed(() => {
    const w = currentWord.value;
    const result = calculateSM2(w.easeFactor || 2.5, w.reviewInterval || 0, w.reviewCount || 0, 5);
    return formatInterval(result.newInterval);
});

const emptyDesc = computed(() => {
    if (reviewMode.value === "new") return "所有单词都已开始学习";
    if (reviewMode.value === "review") return "暂无到期的复习单词";
    if (reviewMode.value === "marked") return "暂无收藏的单词";
    return "暂无单词可复习";
});

// ---- 生命周期 ----
onLoad((options) => {
    bookId.value = options.bookId || "";
    bookTitle.value = decodeURIComponent(options.title || "复习");
    reviewMode.value = options.mode || "mixed";
    reviewLimit.value = Number(options.limit) || 20;
    fetchWords();
});

// ---- 数据获取 ----
const fetchWords = async () => {
    loading.value = true;
    try {
        const res = await getReviewWordsAPI(bookId.value, {
            mode: reviewMode.value,
            limit: reviewLimit.value,
        });
        if (res.code === 200 && res.data) {
            words.value = res.data.words || [];
        } else {
            uni.showToast({ title: res.message || "获取单词失败", icon: "none" });
        }
    } catch (e) {
        console.error("获取复习单词失败", e);
        uni.showToast({ title: "获取单词失败", icon: "none" });
    } finally {
        loading.value = false;
    }
};

// ---- 翻转交互（视为不认识） ----
const handleCardTap = () => {
    if (!isFlipped.value) {
        const word = currentWord.value;
        if (word && word._id) {
            lastQuality.value = 1;
            reviews.value.push({ wordId: word._id, quality: 1 });
        }
        isFlipped.value = true;
        canProceed.value = true;
    }
};

// ---- 评价 ----
const handleRate = (quality) => {
    const word = currentWord.value;
    if (!word || !word._id) return;

    // 翻转卡片显示释义
    isFlipped.value = true;
    lastQuality.value = quality;
    canProceed.value = false; // 先锁定，防止确认按钮被瞬间误触

    // 记录结果
    reviews.value.push({ wordId: word._id, quality });

    // 短震动反馈
    uni.vibrateShort({ type: "light" });

    // 延迟解锁，等翻转动画结束 + 触摸事件消散
    setTimeout(() => {
        canProceed.value = true;
    }, 400);
};

// ---- "记错了"：改为 quality=1 ----
const handleConfirmWrong = () => {
    const word = currentWord.value;
    if (!word || !word._id) return;

    // 移除刚才记录的 quality=5，替换为 quality=1
    // 从后往前找，兼容不支持 findLastIndex 的环境
    let idx = -1;
    for (let i = reviews.value.length - 1; i >= 0; i--) {
        if (reviews.value[i].wordId === word._id) {
            idx = i;
            break;
        }
    }
    if (idx !== -1) {
        reviews.value.splice(idx, 1);
    }
    reviews.value.push({ wordId: word._id, quality: 1 });

    uni.vibrateShort({ type: "heavy" });
    goToNext();
};

// ---- "下一词"（认识确认） ----
const handleConfirmNext = () => {
    goToNext();
};

// ---- 切换到下一个单词 ----
const goToNext = () => {
    if (currentIndex.value < words.value.length - 1) {
        currentIndex.value++;
        isFlipped.value = false;
        lastQuality.value = 0;
        canProceed.value = false;
    } else {
        submitReviews();
    }
};

// ---- 提交 ----
const submitReviews = async () => {
    submitted.value = true;
    try {
        const res = await batchSubmitReviewAPI({ reviews: reviews.value });
        if (res.code === 200 && res.data) {
            const resultData = encodeURIComponent(JSON.stringify(res.data));
            const title = encodeURIComponent(bookTitle.value);
            uni.redirectTo({
                url: `/pages/tools/WordBookToolView_children/WordReviewResultsView?bookId=${bookId.value}&title=${title}&result=${resultData}`,
            });
        } else {
            uni.showToast({ title: res.message || "提交失败", icon: "none" });
            submitted.value = false;
        }
    } catch (e) {
        console.error("提交复习结果失败", e);
        uni.showToast({ title: "提交失败，请重试", icon: "none" });
        submitted.value = false;
    }
};

// ---- 返回 ----
const handleBack = () => {
    if (reviews.value.length > 0 && !submitted.value) {
        showBackDialog.value = true;
    } else {
        uni.navigateBack();
    }
};

const handleBackConfirm = () => {
    showBackDialog.value = false;
    uni.navigateBack();
};

const handleBackCancel = () => {
    showBackDialog.value = false;
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.nav-right {
    width: 120rpx;
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
}

.nav-progress {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    font-weight: 600;
}

/* ---- 加载/空状态 ---- */
.loading-container,
.empty-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24rpx;
    padding: 60rpx;
}

.loading-spinner {
    width: 64rpx;
    height: 64rpx;
    border: 6rpx solid var(--app-border);
    border-top-color: var(--app-brand);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.loading-text,
.empty-title {
    font-size: calc(32rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 600;
}

.empty-desc {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

.empty-btn {
    margin-top: 20rpx;
    padding: 16rpx 48rpx;
    border-radius: 40rpx;
    background: var(--app-brand);
}

.empty-btn-text {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: #fff;
    font-weight: 600;
}

/* ---- 复习区域 ---- */
.review-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 10rpx 30rpx 20rpx;
    overflow: hidden;
}

/* ---- 进度条 ---- */
.progress-bar-wrapper {
    margin-bottom: 10rpx;
}

.progress-bar-bg {
    width: 100%;
    height: 8rpx;
    border-radius: 4rpx;
    background: var(--app-border);
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    border-radius: 4rpx;
    background: linear-gradient(90deg, var(--app-brand) 0%, var(--app-brand-hover) 100%);
    transition: width 0.3s ease;
}

/* ---- 掌握等级标签 ---- */
.mastery-tag {
    text-align: center;
    margin-bottom: 4rpx;
}

.mastery-text {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    font-weight: 600;
}

/* ---- 翻卡片区域 ---- */
.flashcard-container {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    perspective: 1200rpx;
    min-height: 0;
    padding-top: 100rpx;
}

.flashcard {
    width: 100%;
    max-width: 620rpx;
    min-height: 360rpx;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.flashcard.flipped {
    transform: rotateY(180deg);
}

.flashcard-face {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 360rpx;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 32rpx;
    border: 2rpx solid var(--app-border);
    background: linear-gradient(145deg, var(--app-bg-container) 0%, var(--app-bg-secondary) 85%);
    box-shadow: var(--app-shadow-card);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48rpx 40rpx;
    box-sizing: border-box;
}

.flashcard-back {
    transform: rotateY(180deg);
}

/* ---- 卡片内容 ---- */
.card-word {
    font-size: calc(64rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 800;
    text-align: center;
    line-height: 1.3;
}

.back-word {
    font-size: calc(40rpx * var(--app-font-scale, 1));
    margin-bottom: 4rpx;
}

.card-phonetic {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    margin-top: 10rpx;
    font-style: italic;
}

.card-tap-hint {
    display: flex;
    align-items: center;
    gap: 10rpx;
    margin-top: 28rpx;
    opacity: 0.6;
}

.tap-hint-text {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-placeholder);
}

.card-divider {
    width: 80rpx;
    height: 4rpx;
    border-radius: 2rpx;
    background: var(--app-border);
    margin: 20rpx 0;
}

.card-meaning {
    font-size: calc(34rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 600;
    text-align: center;
    line-height: 1.6;
    white-space: pre-wrap;
}

.card-example {
    margin-top: 16rpx;
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    text-align: center;
    line-height: 1.5;
    font-style: italic;
    max-width: 100%;
}

/* ---- 底部按钮区域 ---- */
.bottom-area {
    padding: 8rpx 0;
    min-height: 130rpx;
}

/* 三按钮行 */
.rating-row {
    display: flex;
    gap: 16rpx;
    animation: fadeSlideUp 0.3s ease;
}

.rating-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    padding: 22rpx 8rpx;
    border-radius: 24rpx;
    border: 2rpx solid var(--app-border);
    background: var(--app-bg-container);
    transition: all 0.2s ease;
}

.rating-btn:active {
    transform: scale(0.95);
}

.rating-unknown {
    border-color: color-mix(in srgb, var(--app-danger) 30%, transparent);
}

.rating-unknown:active {
    background: var(--app-danger-light);
}

.rating-fuzzy {
    border-color: color-mix(in srgb, var(--app-warning) 30%, transparent);
}

.rating-fuzzy:active {
    background: color-mix(in srgb, var(--app-warning) 10%, transparent);
}

.rating-known {
    border-color: color-mix(in srgb, var(--app-success) 30%, transparent);
}

.rating-known:active {
    background: var(--app-success-light);
}

/* 药丸徽章 */
.rating-badge {
    display: inline-block;
    padding: 10rpx 28rpx;
    border-radius: 30rpx;
    font-size: calc(30rpx * var(--app-font-scale, 1));
    font-weight: 700;
    letter-spacing: 2rpx;
}

.badge-unknown {
    background: var(--app-danger-light);
    color: var(--app-danger);
    border: 2rpx solid color-mix(in srgb, var(--app-danger) 20%, transparent);
}

.badge-fuzzy {
    background: color-mix(in srgb, var(--app-warning) 10%, transparent);
    color: var(--app-warning);
    border: 2rpx solid color-mix(in srgb, var(--app-warning) 20%, transparent);
}

.badge-known {
    background: var(--app-success-light);
    color: var(--app-success);
    border: 2rpx solid color-mix(in srgb, var(--app-success) 20%, transparent);
}

.rating-interval {
    font-size: calc(22rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

/* 确认行 */
.confirm-row {
    display: flex;
    gap: 20rpx;
    animation: fadeSlideUp 0.3s ease;
}

.confirm-row.single {
    justify-content: center;
}

.confirm-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    height: 88rpx;
    border-radius: 24rpx;
    border: 2rpx solid var(--app-border);
    background: var(--app-bg-container);
    transition: all 0.2s ease;
}

.confirm-btn:active {
    transform: scale(0.96);
}

.confirm-btn.disabled {
    opacity: 0.4;
    pointer-events: none;
}

.confirm-wrong {
    border-color: color-mix(in srgb, var(--app-danger) 30%, transparent);
}

.confirm-wrong:active {
    background: var(--app-danger-light);
}

.confirm-next {
    border-color: color-mix(in srgb, var(--app-success) 30%, transparent);
}

.confirm-next:active {
    background: var(--app-success-light);
}

.confirm-text {
    font-size: calc(30rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 600;
}

@keyframes fadeSlideUp {
    from {
        opacity: 0;
        transform: translateY(16rpx);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (min-width: 760px) {
    .review-area {
        max-width: 720rpx;
        margin: 0 auto;
        padding: 20rpx 40rpx;
    }
}
</style>
