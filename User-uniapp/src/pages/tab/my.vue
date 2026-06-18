<template>
    <ThemeProvider>
    <view class="container">
        <!-- 固定头部：问候语 + 设置按钮 -->
        <view class="header-fixed" :style="customNavbarStyle">
            <view class="header-row" :style="navRowStyle">
                <GreetingBanner class="header-greeting" />
                <view
                    class="header-setting"
                    hover-class="header-setting--active"
                    :hover-stay-time="80"
                    @click="goSetting"
                >
                    <t-icon name="setting-1" size="22px" color="var(--app-text-primary)" />
                </view>
            </view>
        </view>

        <!-- 头部占位，防止内容被固定头部遮挡 -->
        <view :style="{ height: customNavbarStyle.height }"></view>

        <!-- 用户信息区域 -->
        <UserInfoCard
            :marginTop="'8rpx'"
            :showVip="false"
            :showStatusBar="false"
            @click="handleUserinfo"
        />

        <!-- Core Nav -->
        <view>
            <myNavbar />
        </view>

        <!-- 热力图 -->
        <UserActivityHeatmap ref="activityHeatmapRef" />

        <!-- 登录弹窗 -->
        <tOverlay v-model:show="LoginOverlayShow">
            <template #overlaycontent>
                <view class="rect">
                    <view class="overlay-header">
                        <view class="overlay-title">你还没登录</view>
                        <text class="login-tips"
                            >请选择下面任意一种方式登录</text
                        >
                    </view>
                    <view class="login-but">
                        <t-button
                            variant="outline"
                            @click="handleCancelLogin"
                            >暂不登录</t-button
                        >
                        <!-- #ifndef MP-WEIXIN -->
                        <t-button
                            theme="primary"
                            @click="handleUseAccountLogin"
                            >账号登录</t-button
                        >
                        <!-- #endif -->
                        <!-- #ifdef MP-WEIXIN -->
                        <t-button
                            style="background-color: #09B83E; color: #fff;"
                            @click="handleUseWXLogin"
                            >微信登录</t-button
                        >
                        <!-- #endif -->
                    </view>
                    <view class="tips-container">
                        <UserAgreementTips
                            v-model="agreed"
                            @showUserAgreement="showUserAgreement"
                            @showPrivacyPolicy="showPrivacyPolicy"
                        />
                    </view>
                </view>
            </template>
        </tOverlay>

        <!-- 底部安全区占位 -->
        <view :style="{ height: tabBarPlaceholderHeight }"></view>
    </view>

    <!-- 自定义 TabBar -->
    <CustomTabBar
        :current-index="4"
        :visible="isTabBarVisible"
    />
    </ThemeProvider>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { onShow, onPullDownRefresh } from "@dcloudio/uni-app";
import tOverlay from "../../components/core/tOverlay.vue";
import { wechatLogin } from "../../util/auth/wechatLogin";
import myNavbar from "../../components/modules/my/myNavbar.vue";
import showShareMenu from "../../util/wechat/share";
import { reportLoginStatus } from "../../API/My/UserLoginAPI";
import UserAgreementTips from "../../components/modules/my/UserAgreementTips.vue";
import UserInfoCard from "../../components/modules/my/UserInfoCard.vue";
import GreetingBanner from "../../components/modules/my/GreetingBanner.vue";
import UserActivityHeatmap from "../../components/modules/my/UserActivityHeatmap.vue";
import { useNavBarSafeArea } from "../../composables/useNavBarSafeArea.js";
import ThemeProvider from "../../components/core/ThemeProvider.vue";
import CustomTabBar from "../../components/core/CustomTabBar.vue";

const { customNavbarStyle, navRowStyle, refreshLayoutInfo } =
    useNavBarSafeArea({ reserveMenuButtonRight: true });

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


const AGREED_KEY = "user_agreed_policy";
const LoginOverlayShow = ref(false);
const agreed = ref(uni.getStorageSync(AGREED_KEY) || false);
const activityHeatmapRef = ref(null);

const goSetting = () => {
    uni.navigateTo({ url: "/pages/my/MySettingView" });
};

const handleUserinfo = ({ isLoggedIn }) => {
    if (!isLoggedIn) {
        LoginOverlayShow.value = true;
    } else {
        uni.navigateTo({ url: "/pages/my/UserInfoView" });
    }
};

const handleCancelLogin = () => {
    LoginOverlayShow.value = false;
    agreed.value = false;
};

const handleUseWXLogin = async () => {
    if (!agreed.value) {
        uni.showToast({
            title: "请先阅读并同意用户协议和隐私政策",
            icon: "none",
            duration: 500,
            position: "top",
        });
        return;
    }
    LoginOverlayShow.value = false;
    try {
        await wechatLogin({
            onSuccess: () => {
                LoginOverlayShow.value = false;
            },
        });
    } catch (error) {
        console.error("微信登录失败", error);
        uni.showToast({ title: "微信登录失败", icon: "none" });
    }
};

const handleUseAccountLogin = () => {
    if (!agreed.value) {
        uni.showToast({
            title: "请先阅读并同意用户协议和隐私政策",
            icon: "none",
            duration: 2000,
            position: "bottom",
        });
        return;
    }
    LoginOverlayShow.value = false;
    uni.navigateTo({ url: "/pages/my/UserLoginView" });
};

const showUserAgreement = () => {
    uni.navigateTo({ url: "/pages/public/UserAgreementView" });
};

const showPrivacyPolicy = () => {
    uni.navigateTo({ url: "/pages/public/PrivacyPolicyView" });
};

const reportLoginStatusIfNeeded = async () => {
    const token = uni.getStorageSync("token");
    if (!token) return;
    try {
        await reportLoginStatus();
    } catch (error) {
        console.warn("reportLoginStatus 失败", error?.message || error);
    }
};

onPullDownRefresh(async () => {
    try {
        refreshLayoutInfo();
        await reportLoginStatusIfNeeded();
        if (activityHeatmapRef.value?.refresh) {
            await activityHeatmapRef.value.refresh();
        }
    } finally {
        uni.stopPullDownRefresh();
    }
});

watch(agreed, (val) => {
    uni.setStorageSync(AGREED_KEY, val);
});

// 页面加载时隐藏原生 TabBar
onMounted(() => {
    uni.hideTabBar({ animation: false });
});

onShow(() => {
    agreed.value = uni.getStorageSync(AGREED_KEY) || false;
    reportLoginStatusIfNeeded();
    // #ifdef MP-WEIXIN
    showShareMenu();
    // #endif
});
</script>

<style scoped>
.container {
    min-height: 100vh;
    overflow-x: hidden;
    background-color: var(--app-bg-page);
    padding: 0 15rpx;
}

/* 固定头部 */
.header-fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background-color: var(--app-bg-page);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: 0 8rpx 0 0;
    box-sizing: border-box;
    opacity: 0.92;
}

.header-fixed::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -40rpx;
    height: 40rpx;
    background: linear-gradient(
        to bottom,
        var(--app-bg-page) 0%,
        transparent 100%
    );
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    pointer-events: none;
    opacity: 0.6;
}

.header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
}

.header-greeting {
    flex: 1;
    min-width: 0;
    padding-left: 24rpx;
}

.header-setting {
    flex-shrink: 0;
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s ease;
}

.header-setting--active {
    background: var(--app-bg-container-active, var(--app-bg-secondary));
}


/* 登录弹窗 */
.rect {
    width: 600rpx;
    background: var(--app-bg-container);
    border-radius: 20rpx;
    box-shadow: var(--app-shadow-elevated);
    border: 1px solid var(--app-border);
    padding: 20rpx 0;
}

.overlay-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15rpx 30rpx;
}

.overlay-title {
    font-size: calc(32rpx * var(--app-font-scale, 1));
    font-weight: 580;
    color: var(--app-text-primary);
}

.login-tips {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    margin-bottom: 10rpx;
}

.login-but {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20rpx;
    padding: 10rpx 30rpx;
}

.login-but > .t-button {
    flex: 1;
}
</style>
