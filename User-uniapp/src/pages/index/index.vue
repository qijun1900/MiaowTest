<template>
    <ThemeProvider>
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
    </view>
    </ThemeProvider>
</template>
<script setup>
import { onMounted, ref } from "vue";
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
import showShareMenu from "../../util/wechatShare.js";

const noticeData = ref([]); // 添加notice需要的数据
const swiperList = ref([]); // 添加swiper需要的数据
const list = ref(["我的题库", "收藏考试"]); // 添加subsection需要的数据
const currentMode = ref(0); // 当前选中的模式，默认为0
const backToTopRef = ref(); // 回到顶部组件引用

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
    //#ifdef MP-WEIXIN
    showShareMenu();
    //#endif
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
    font-size: 32rpx;
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
    font-size: 24rpx;
    color: var(--app-text-secondary);
    margin-right: 8rpx;
}

.arrow-icon {
    font-size: 28rpx;
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
