<template>
    <ThemeProvider>
    <CustomNavBar title="题喵喵" :showBack="false" @back="handleNavBack" />
    <view class="content">
        <view class="card-container">
            <view class="noticbar">
                <uniNoticeBar :noticeData="noticeData" />
            </view>
            <view class="swiper">
                <uniSwiper :list="swiperList" />
            </view>
            <view class="navigation">
                <uniNavigation />
            </view>
        </view>
        <view class="hot-exam">
            <view class="header-section">
                <view class="hot-exam-title">推荐练习</view>
                <view class="more-section" @click="handleViewMore">
                    <text class="more-text">查看更多</text>
                    <text class="arrow-icon">›</text>
                </view>
            </view>
            <HotExamContainer />
        </view>
        <view class="my-question-bank">
            <view class="header-section">
                <view class="hot-exam-title">
                    <Subsection
                        :list="list"
                        @updateCurrent="handleSendMode"
                        :current="currentMode"
                    />
                </view>
                <view
                    class="more-section"
                    @click="handleCreateQuestionBank"
                    v-if="currentMode === 0"
                >
                    <text class="more-text">新建题库</text>
                    <text class="arrow-icon">›</text>
                </view>
                <view
                    class="more-section"
                    @click="handleViewMore"
                    v-if="currentMode === 1"
                >
                    <text class="more-text">查看考试</text>
                    <text class="arrow-icon">›</text>
                </view>
            </view>
            <UserQuestionBank v-if="currentMode === 0" />
            <UserExamFavorite v-if="currentMode === 1" />
        </view>
        <BackToTop ref="backToTopRef" position="bottom-right" />

        <!-- 底部安全区占位 -->
        <view :style="{ height: tabBarPlaceholderHeight }"></view>
    </view>

    <!-- 自定义 TabBar -->
    <CustomTabBar
        :current-index="0"
        :visible="isTabBarVisible"
    />
    </ThemeProvider>
</template>
<script setup>
import { onMounted, ref, onBeforeUnmount, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import uniNoticeBar from "../../components/core/uniNoticeBar.vue";
import uniSwiper from "../../components/core/uniSwiper.vue";
import uniNavigation from "../../components/modules/index/Navbar.vue";
import HotExamContainer from "../../components/modules/index/HotExamContainer.vue";
import UserQuestionBank from "../../components/modules/index/UserQuestionBank.vue";
import { getNoticeInfo, getIndexBanner } from "../../API/Index/AnnouncementAPI";
import escconfig from "../../config/esc.config";
import Subsection from "../../components/core/Subsection.vue";
import UserExamFavorite from "../../components/modules/index/UserExamFavorite.vue";
import { onPageScroll, onPullDownRefresh } from "@dcloudio/uni-app";
import BackToTop from "../../components/core/BackToTop.vue";
import ThemeProvider from "../../components/core/ThemeProvider.vue";
import { AppearanceStore } from "../../stores/modules/AppearanceStore";
import showShareMenu from "../../util/wechatShare.js";
import CustomNavBar from "../../components/common/CustomNavBar.vue";
import CustomTabBar from "../../components/core/CustomTabBar.vue";

const handleNavBack = () => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack({ delta: 1 });
    } else {
        uni.switchTab({ url: "/pages/index/index" });
    }
};

const noticeData = ref([]); // 添加notice需要的数据
const swiperList = ref([]); // 添加swiper需要的数据
const list = ref(["我的题库", "收藏考试"]); // 添加subsection需要的数据
const currentMode = ref(0); // 当前选中的模式，默认为0
const backToTopRef = ref(); // 回到顶部组件引用
const appearanceStore = AppearanceStore();

// 自定义 TabBar - 常显
const isTabBarVisible = ref(true);
const safeAreaBottom = ref(0);
try {
    const sysInfo = uni.getSystemInfoSync();
    safeAreaBottom.value = sysInfo.safeAreaInsets?.bottom || 0;
} catch (e) {
    safeAreaBottom.value = 0;
}
const tabBarPlaceholderHeight = computed(() => {
    return `${50 + safeAreaBottom.value}px`;
});


// 动态设置原生导航栏颜色，跟随主题
const applyNavBarTheme = () => {
    const preset = appearanceStore.getCurrentPreset?.();
    const mode = appearanceStore.resolveMode();
    const bg = mode === "dark" ? "#1f1e1b" : "#f5f7fa";
    const frontColor = mode === "dark" ? "#ffffff" : "#000000";
    // Aurora light 用原有蓝色背景
    if (preset?.key === "aurora" && mode === "light") {
        uni.setNavigationBarColor({
            backgroundColor: "#f5f7fa",
            frontColor: "#000000",
        });
    } else {
        uni.setNavigationBarColor({
            backgroundColor: bg,
            frontColor: frontColor,
        });
    }
};

//选择模式
const handleSendMode = (value) => {
    currentMode.value = value; // 更新当前选中的模式
};
// 获取通知信息
const fetchNoticeInfo = async () => {
    try {
        const res = await getNoticeInfo();
        noticeData.value = res.data;
    } catch (error) {
        console.error("获取通知信息失败:", error);
    }
};
// 获取轮播图信息
const fetchBannerInfo = async () => {
    try {
        const res = await getIndexBanner();
        if (res.data && Array.isArray(res.data)) {
            swiperList.value = res.data.map((item) => ({
                type: "image",
                src: `${escconfig.ossDomain}${item.cover}`,
            }));
        }
    } catch (error) {
        console.error("获取轮播图信息失败:", error);
    }
};

const handleViewMore = () => {
    uni.switchTab({
        url: "/pages/tab/exam",
    });
};

const handleCreateQuestionBank = () => {
    uni.navigateTo({
        url: "/pages/exam/crquestionbankView",
    });
};

// 下拉刷新页面数据
onPullDownRefresh(async () => {
    try {
        await Promise.all([fetchNoticeInfo(), fetchBannerInfo()]);
    } finally {
        uni.stopPullDownRefresh();
    }
});

// 页面滚动事件
onPageScroll((e) => {
    // 调用BackToTop组件的滚动处理方法
    if (backToTopRef.value) {
        backToTopRef.value.handlePageScroll(e);
    }
});
onMounted(() => {
    fetchNoticeInfo();
    fetchBannerInfo();
    applyNavBarTheme();
    // 隐藏原生 TabBar
    uni.hideTabBar({ animation: false });
    //#ifdef MP-WEIXIN
    showShareMenu();
    //#endif
    // 监听主题切换事件，实时更新导航栏
    uni.$on("app:theme-change", applyNavBarTheme);
});

onShow(() => {
    // 页面显示时同步一次（从设置页切回来时）
    applyNavBarTheme();
});

onBeforeUnmount(() => {
    uni.$off("app:theme-change", applyNavBarTheme);
});
</script>
<style scoped lang="scss">
.content {
    min-height: 100vh;
    background-color: var(--app-bg-page);
}

.card-container {
    margin-top: 20rpx;
    border-radius: 20rpx;
    background-color: var(--app-brand-light);
    overflow: hidden;
}

.noticbar {
    margin-top: 3rpx;
}

.swiper {
    padding-left: 10rpx;
    padding-right: 10rpx;
}

.hot-exam {
    padding: 20rpx;
    background-color: var(--app-bg-container);
    border-radius: 12rpx;
    margin: 20rpx 0;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}

.hot-exam-title {
    font-size: calc(32rpx * var(--app-font-scale, 1));
    font-weight: bold;
    color: var(--app-text-primary);
    padding-left: 10rpx;
    border-left: 6rpx solid var(--app-brand);
    width: 55%;
}

.more-section {
    display: flex;
    align-items: center;
    padding: 10rpx 20rpx;
    background-color: var(--app-bg-secondary);
    border-radius: 20rpx;
    transition: background-color 0.2s ease;
}

.more-section:active {
    background-color: var(--app-border);
}

.more-text {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    margin-right: 8rpx;
}

.arrow-icon {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-brand);
    font-weight: bold;
}

.my-question-bank {
    padding: 20rpx;
    background-color: var(--app-bg-container);
    border-radius: 12rpx;
    margin: 20rpx 0;
}
</style>
