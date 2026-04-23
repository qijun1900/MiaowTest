<template>
    <view class="container">
        <GreetingBanner
            :statusBarHeight="navBarInfo.statusBarHeight || 0"
            :topInset="8"
        />

        <!-- 用户信息区域 - 美化版 -->
        <UserInfoCard
            :marginTop="'8rpx'"
            :showVip="false"
            :showStatusBar="true"
            @click="handleUserinfo"
        />

        <!-- Core Nav -->
        <view>
            <myNavbar />
        </view>

        <ThemeDivider text="更多功能" />

        <!-- 功能列表 -->
        <view class="function-list">
            <CustomNavbar :items="CustomNavbarList" @nav-click="handleClick" />
        </view>

        <!-- 热力图 -->
        <UserActivityHeatmap ref="activityHeatmapRef" />

        <!-- 登录显示 -->
        <uviewOverlay v-model:show="LoginOverlayShow">
            <template #overlaycontent>
                <view class="rect">
                    <view class="overlay-header">
                        <view class="overlay-title">你还没登录</view>
                        <text class="login-tips"
                            >请选择下面任意一种方式登录</text
                        >
                    </view>
                    <view class="login-but">
                        <!-- #ifndef MP-WEIXIN -->
                        <up-button
                            type="primary"
                            icon="fingerprint"
                            @click="handleUseAccountLogin"
                            >账号登录</up-button
                        >
                        <!-- #endif -->
                        <!-- #ifdef MP-WEIXIN -->
                        <up-button
                            color="#09B83E"
                            type="success"
                            icon="weixin-fill"
                            @click="handleUseWXLogin"
                            >微信登录</up-button
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
                    <view class="login-cancel">
                        <up-button @click="handleCancelLogin"
                            >暂不登录</up-button
                        >
                    </view>
                </view>
            </template>
        </uviewOverlay>
    </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { onShow, onPullDownRefresh } from "@dcloudio/uni-app";
import uviewOverlay from "../../components/core/uviewOverlay.vue";
import { wechatLogin } from "../../util/wechatLogin";
import myNavbar from "../../components/modules/my/myNavbar.vue";
import ThemeDivider from "../../components/core/ThemeDivider.vue";
import navBarHeightUtil from "../../util/navBarHeight.js";
import CustomNavbar from "../../components/core/CustomNavbar.vue";
import { clearExamCache } from "../../util/cacheCleaner.js";
import showShareMenu from "../../util/wechatShare.js";
import { reportLoginStatus } from "../../API/My/UserLoginAPI";
import UserAgreementTips from "../../components/modules/my/UserAgreementTips.vue";
import UserInfoCard from "../../components/modules/my/UserInfoCard.vue";
import GreetingBanner from "../../components/modules/my/GreetingBanner.vue";
import UserActivityHeatmap from "../../components/modules/my/UserActivityHeatmap.vue";

const LoginOverlayShow = ref(false);
const AuthorOverlayShow = ref(false);
const agreed = ref(false);
const navBarInfo = ref({});
const activityHeatmapRef = ref(null);
const CustomNavbarList = ref([
    {
        title: "清除缓存",
        icon: "/static/navMy/c-my-clear.png",
        path: "/pages/my/MyFavoriteView",
    },
    {
        title: "问题反馈",
        icon: "/static/navMy/c-my-feedback.png",
        path: "/pages/my/MyWrongView",
    },
    {
        title: "我的设置",
        icon: "/static/navMy/c-my-setting.png",
        path: "pages/my/MySettingView",
    },
    {
        title: "我的消息",
        icon: "/static/navMy/c-my-message.png",
        path: "/pages/my/MyMessageView",
    },
]);
// 处理导航栏点击事件
const handleClick = (item) => {
    if (item.title === "清除缓存") {
        if (clearExamCache().isClear) {
            uni.showToast({
                title: "清除成功",
                icon: "success",
            });
        }
    } else if (item.title === "问题反馈") {
        uni.navigateTo({
            url: "/pages/public/feedbackview",
        });
    } else if (item.title === "开发作者") {
        AuthorOverlayShow.value = true;
    } else if (item.title === "我的设置") {
        uni.navigateTo({
            url: "/pages/my/MySettingView",
        });
    } else if (item.title === "我的消息") {
        uni.navigateTo({
            url: "/pages/my/MyMessageView",
        });
    }
};

//用户信息
const handleUserinfo = ({ isLoggedIn }) => {
    if (!isLoggedIn) {
        LoginOverlayShow.value = true;
    } else {
        uni.navigateTo({
            url: "/pages/my/UserInfoView",
        });
    }
};

const handleCancelLogin = () => {
    LoginOverlayShow.value = false;
    agreed.value = false;
};

// 微信程序端登录 - 使用工具函数
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
                // 登录成功后关闭弹窗
                LoginOverlayShow.value = false;
            },
        });
    } catch (error) {
        console.error("微信登录失败", error);
        uni.showToast({
            title: "微信登录失败",
            icon: "none",
        });
    }
};

// 处理账号登录 h5端和小程序端
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
    uni.navigateTo({
        url: "/pages/my/UserLoginView",
    });
};

// 用户服务协议
const showUserAgreement = () => {
    uni.navigateTo({
        url: "/pages/public/UserAgreementView",
    });
};

// 显示隐私政策
const showPrivacyPolicy = () => {
    uni.navigateTo({
        url: "/pages/public/PrivacyPolicyView",
    });
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

// 下拉刷新页面状态
onPullDownRefresh(async () => {
    try {
        navBarInfo.value = navBarHeightUtil.getNavBarInfo();
        await reportLoginStatusIfNeeded();
        if (activityHeatmapRef.value?.refresh) {
            await activityHeatmapRef.value.refresh();
        }
    } finally {
        uni.stopPullDownRefresh();
    }
});

// 获取导航栏高度信息
onMounted(() => {
    navBarInfo.value = navBarHeightUtil.getNavBarInfo();
    //#ifdef MP-WEIXIN
    showShareMenu();
    //#endif
});

onShow(() => {
    reportLoginStatusIfNeeded();
});
</script>

<style scoped>
.container {
    min-height: 100vh;
    height: 100vh; /* 设置固定高度 */
    overflow-y: auto; /* 内容超出时自动滚动 */
    overflow-x: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    background: linear-gradient(
        180deg,
        #e6f3ff 0%,
        #f0f8ff 25%,
        #f5faff 50%,
        #fafcff 75%,
        #ffffff 100%
    ); /* 优雅的淡蓝色到白色渐变 */
    padding: 0 15rpx 0 15rpx;
    position: relative;

}

.container::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
}

.rect {
    width: 600rpx;
    height: 380rpx;
    background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%);
    border-radius: 20rpx;
    box-shadow:
        0 16rpx 48rpx rgba(198, 226, 255, 0.15),
        0 4rpx 16rpx rgba(198, 226, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}
.overlay-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15rpx 30rpx;
}
.overlay-title {
    font-size: 32rpx;
    font-weight: 580;
    color: #333333;
}
.login-tips {
    font-size: 26rpx;
    color: #999999;
    margin-bottom: 10rpx;
}
.login-but {
    display: flex; /* 使用flex布局 */
    justify-content: center; /* 水平居中 */
    align-items: center; /* 垂直居中 */
    gap: 20rpx; /* 添加按钮之间的间距 */
    padding: 10rpx 20rpx;
}

/* 按钮点击效果 */
.login-but .u-button:active {
    transform: scale(0.98); /* 点击缩放效果 */
    transition: transform 0.2s ease;
}
.login-cancel {
    padding: 15rpx 30rpx;
}

.function-list {
    margin-bottom: 20rpx;
}
</style>
