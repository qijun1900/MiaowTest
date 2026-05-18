<template>
    <view class="container">
        <!-- 用户信息卡片 -->
        <view class="profile-card" @click="goToUserInfo">
            <view class="profile-left">
                <userAvatar :width="100" :height="100" :showOnline="false" />
                <view class="profile-info">
                    <text class="profile-name">{{ userInfoStore.userInfo?.nickname || "未设置昵称" }}</text>
                    <text class="profile-uid">UID: {{ userInfoStore.userInfo?.uid || "--" }}</text>
                </view>
            </view>
            <up-icon name="arrow-right" size="14px" color="#999"></up-icon>
        </view>

        <!-- 外观设置 -->
        <view class="settings-group">
            <view class="group-header">外观设置</view>

            <!-- 深浅模式 -->
            <view class="setting-item" @click="handleDarkMode">
                <view class="setting-left">
                    <view class="setting-icon darkmode-icon">
                        <up-icon name="eye-fill" size="18px" color="#999"></up-icon>
                    </view>
                    <text class="setting-label">深浅模式</text>
                </view>
                <view class="setting-right">
                    <text class="setting-value">{{ appearanceStore.getDarkModeText() }}</text>
                    <up-icon name="arrow-right" size="14px" color="#ccc"></up-icon>
                </view>
            </view>

            <!-- 主题 -->
            <view class="setting-item" @click="showThemePopup = true">
                <view class="setting-left">
                    <view class="setting-icon theme-icon">
                        <up-icon name="star-fill" size="18px" color="#999"></up-icon>
                    </view>
                    <text class="setting-label">主题</text>
                </view>
                <view class="setting-right">
                    <view
                        class="theme-color-dot"
                        :style="{ backgroundColor: appearanceStore.themeColor }"
                    ></view>
                    <up-icon name="arrow-right" size="14px" color="#ccc"></up-icon>
                </view>
            </view>

            <!-- 字号 -->
            <view class="setting-item" @click="handleFontSize">
                <view class="setting-left">
                    <view class="setting-icon fontsize-icon">
                        <up-icon name="zh" size="18px" color="#999"></up-icon>
                    </view>
                    <text class="setting-label">字号</text>
                </view>
                <view class="setting-right">
                    <text class="setting-value">{{ appearanceStore.fontSizeOptions[appearanceStore.fontSizeIndex] }}</text>
                    <up-icon name="arrow-right" size="14px" color="#ccc"></up-icon>
                </view>
            </view>
        </view>

        <!-- 主题色选择弹窗 -->
        <up-popup
            :show="showThemePopup"
            mode="bottom"
            round="16"
            @close="showThemePopup = false"
        >
            <view class="theme-picker">
                <view class="theme-picker-title">选择主题色</view>
                <view class="theme-color-list">
                    <view
                        v-for="(item, index) in appearanceStore.themeColors"
                        :key="index"
                        class="theme-color-item"
                        @click="selectThemeColor(item.color)"
                    >
                        <view
                            class="theme-color-circle"
                            :class="{ active: appearanceStore.themeColor === item.color }"
                            :style="{ backgroundColor: item.color }"
                        >
                            <up-icon
                                v-if="appearanceStore.themeColor === item.color"
                                name="checkmark"
                                size="16px"
                                color="#fff"
                            ></up-icon>
                        </view>
                        <text class="theme-color-name">{{ item.name }}</text>
                    </view>
                </view>
                <view class="theme-picker-close" @click="showThemePopup = false">
                    <text>取消</text>
                </view>
            </view>
        </up-popup>

        <!-- 设置列表 -->
        <view class="settings-group">
            <!-- 账号安全 -->
            <view class="setting-item" @click="handleAccountSecurity">
                <view class="setting-left">
                    <view class="setting-icon safe-icon">
                        <up-icon name="lock" size="18px" color="#999"></up-icon>
                    </view>
                    <text class="setting-label">账号安全</text>
                </view>
                <view class="setting-right">
                    <up-icon name="arrow-right" size="14px" color="#ccc"></up-icon>
                </view>
            </view>

            <!-- 消息通知 -->
            <view class="setting-item">
                <view class="setting-left">
                    <view class="setting-icon notify-icon">
                        <up-icon name="bell" size="18px" color="#999"></up-icon>
                    </view>
                    <text class="setting-label">消息通知</text>
                </view>
                <view class="setting-right">
                    <up-switch
                        v-model="notificationEnabled"
                        :activeValue="true"
                        :inactiveValue="false"
                        size="22"
                        @change="handleNotificationChange"
                    ></up-switch>
                </view>
            </view>

            <!-- 清除缓存 -->
            <view class="setting-item" @click="handleClearCache">
                <view class="setting-left">
                    <view class="setting-icon clear-icon">
                        <up-icon name="trash" size="18px" color="#999"></up-icon>
                    </view>
                    <text class="setting-label">清除缓存</text>
                </view>
                <view class="setting-right">
                    <text class="setting-value">{{ cacheSize }}</text>
                    <up-icon name="arrow-right" size="14px" color="#ccc"></up-icon>
                </view>
            </view>

            <!-- 检查更新 -->
            <view class="setting-item" @click="handleCheckUpdate">
                <view class="setting-left">
                    <view class="setting-icon update-icon">
                        <up-icon name="reload" size="18px" color="#999"></up-icon>
                    </view>
                    <text class="setting-label">检查更新</text>
                </view>
                <view class="setting-right">
                    <text class="setting-value">v{{ appVersion }}</text>
                    <up-icon name="arrow-right" size="14px" color="#ccc"></up-icon>
                </view>
            </view>
        </view>

        <view class="settings-group">
            <!-- 用户协议 -->
            <view class="setting-item" @click="handleUserAgreement">
                <view class="setting-left">
                    <view class="setting-icon agreement-icon">
                        <up-icon name="file-text" size="18px" color="#999"></up-icon>
                    </view>
                    <text class="setting-label">用户协议</text>
                </view>
                <view class="setting-right">
                    <up-icon name="arrow-right" size="14px" color="#ccc"></up-icon>
                </view>
            </view>

            <!-- 隐私政策 -->
            <view class="setting-item" @click="handlePrivacyPolicy">
                <view class="setting-left">
                    <view class="setting-icon privacy-icon">
                        <up-icon name="eye" size="18px" color="#999"></up-icon>
                    </view>
                    <text class="setting-label">隐私政策</text>
                </view>
                <view class="setting-right">
                    <up-icon name="arrow-right" size="14px" color="#ccc"></up-icon>
                </view>
            </view>

            <!-- 关于我们 -->
            <view class="setting-item" @click="handleAbout">
                <view class="setting-left">
                    <view class="setting-icon about-icon">
                        <up-icon name="info-circle" size="18px" color="#80848f"></up-icon>
                    </view>
                    <text class="setting-label">关于我们</text>
                </view>
                <view class="setting-right">
                    <text class="setting-value">v{{ appVersion }}</text>
                    <up-icon name="arrow-right" size="14px" color="#ccc"></up-icon>
                </view>
            </view>
        </view>

        <!-- 退出登录 -->
        <view class="logout-section">
            <view class="logout-btn" @click="handleLogout">退出登录</view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { UserInfoStore } from "../../stores/modules/UserinfoStore";
import { AppearanceStore } from "../../stores/modules/AppearanceStore";
import { clearExamCache } from "../../util/cacheCleaner";
import userAvatar from "../../components/core/userAvatar.vue";
import logSDK from "../../util/logSDK";
// #ifdef APP-PLUS
import { checkForUpdate } from "../../util/checkUpdate";
// #endif

const userInfoStore = UserInfoStore();
const appearanceStore = AppearanceStore();
// #ifdef APP-PLUS
const appVersion = ref(plus.runtime.version);
// #endif
// #ifndef APP-PLUS
const appVersion = ref("1.4.0");
// #endif
const cacheSize = ref("计算中...");
const notificationEnabled = ref(true);
const showThemePopup = ref(false);

// 计算缓存大小
const calcCacheSize = () => {
    try {
        const res = uni.getStorageInfoSync();
        const size = res.currentSize || 0;
        if (size < 1024) {
            cacheSize.value = size + "KB";
        } else {
            cacheSize.value = (size / 1024).toFixed(1) + "MB";
        }
    } catch (e) {
        cacheSize.value = "未知";
        console.error("获取缓存大小失败:", e);
    }
};

// 跳转个人资料
const goToUserInfo = () => {
    uni.navigateTo({ url: "/pages/my/UserInfoView" });
};

// 账号安全
const handleAccountSecurity = () => {
    uni.showToast({ title: "功能开发中", icon: "none" });
};

// 消息通知开关
const handleNotificationChange = (value) => {
    uni.setStorageSync("notification_enabled", value);
    uni.showToast({
        title: value ? "已开启消息通知" : "已关闭消息通知",
        icon: "none",
    });
};

// 深浅模式
const handleDarkMode = () => {
    const options = ["跟随系统", "浅色模式", "深色模式"];
    const values = ["auto", "light", "dark"];
    const currentIndex = values.indexOf(appearanceStore.darkMode);
    uni.showActionSheet({
        itemList: options,
        current: currentIndex >= 0 ? currentIndex : 0,
        success: (res) => {
            appearanceStore.setDarkMode(values[res.tapIndex]);
        },
    });
};

// 选择主题色
const selectThemeColor = (color) => {
    appearanceStore.setThemeColor(color);
    showThemePopup.value = false;
    uni.showToast({ title: "主题色已切换", icon: "none" });
};

// 字号
const handleFontSize = () => {
    uni.showActionSheet({
        itemList: appearanceStore.fontSizeOptions,
        current: appearanceStore.fontSizeIndex,
        success: (res) => {
            appearanceStore.setFontSize(res.tapIndex);
            uni.showToast({
                title: "字号已切换为" + appearanceStore.fontSizeOptions[res.tapIndex],
                icon: "none",
            });
        },
    });
};

// 清除缓存
const handleClearCache = () => {
    uni.showModal({
        title: "提示",
        content: "确定要清除缓存吗？缓存清除后需要重新加载数据。",
        success: (res) => {
            if (res.confirm) {
                const result = clearExamCache();
                if (result?.isClear) {
                    calcCacheSize();
                    uni.showToast({ title: result.message, icon: "success" });
                }
            }
        },
    });
};

// 检查更新（手动触发，非静默模式）
const handleCheckUpdate = async () => {
    // #ifdef APP-PLUS
    await checkForUpdate({ silent: false });
    // #endif
    // #ifndef APP-PLUS
    uni.showToast({ title: "当前已是最新版本", icon: "none" });
    // #endif
};

// 用户协议
const handleUserAgreement = () => {
    uni.navigateTo({ url: "/pages/public/UserAgreementView" });
};

// 隐私政策
const handlePrivacyPolicy = () => {
    uni.navigateTo({ url: "/pages/public/PrivacyPolicyView" });
};

// 关于我们
const handleAbout = () => {
    uni.showModal({
        title: "关于我们",
        content: `当前版本: v${appVersion.value}\n答题系统是一款专注于高效学习的智能刷题工具。`,
        showCancel: false,
    });
};

// 退出登录
const handleLogout = () => {
    uni.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
            if (res.confirm) {
                const uid = userInfoStore.userInfo?.uid;
                userInfoStore.clearUserInfo();
                uni.removeStorageSync("token");
                uni.showToast({ title: "已退出登录", icon: "success" });
                logSDK.track("AUTH_LOGOUT", {
                    result: logSDK.results.SUCCESS,
                    bizId: uid || "",
                });
                uni.navigateBack();
            }
        },
    });
};

onMounted(() => {
    calcCacheSize();
    appearanceStore.initAppearance();
    const savedNotification = uni.getStorageSync("notification_enabled");
    if (savedNotification !== "") {
        notificationEnabled.value = savedNotification;
    }
});
</script>

<style scoped>
.container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 20rpx;
}

/* 用户信息卡片 */
.profile-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.profile-left {
    display: flex;
    align-items: center;
}

.profile-info {
    display: flex;
    flex-direction: column;
    margin-left: 20rpx;
}

.profile-name {
    font-size: 32rpx;
    font-weight: 500;
    color: #333333;
    margin-bottom: 8rpx;
}

.profile-uid {
    font-size: 24rpx;
    color: #999999;
}

/* 设置分组 */
.settings-group {
    background-color: #ffffff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
}

.setting-item:last-child {
    border-bottom: none;
}

.setting-left {
    display: flex;
    align-items: center;
}

.setting-icon {
    width: 56rpx;
    height: 56rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
}

.safe-icon {
    background-color: #f5f5f5;
}

.notify-icon {
    background-color: #f5f5f5;
}

.clear-icon {
    background-color: #f5f5f5;
}

.update-icon {
    background-color: #f5f5f5;
}

.darkmode-icon {
    background-color: #f5f5f5;
}

.theme-icon {
    background-color: #f5f5f5;
}

.fontsize-icon {
    background-color: #f5f5f5;
}

.agreement-icon {
    background-color: #f5f5f5;
}

.privacy-icon {
    background-color: #f5f5f5;
}

.about-icon {
    background-color: #f5f5f5;
}

.setting-label {
    font-size: 30rpx;
    color: #333333;
}

.setting-right {
    display: flex;
    align-items: center;
}

.setting-value {
    font-size: 26rpx;
    color: #999999;
    margin-right: 10rpx;
}

/* 主题色小圆点 */
.theme-color-dot {
    width: 28rpx;
    height: 28rpx;
    border-radius: 50%;
    margin-right: 10rpx;
    border: 2rpx solid #eee;
    flex-shrink: 0;
}

/* 分组标题 */
.group-header {
    font-size: 26rpx;
    color: #999999;
    padding: 20rpx 30rpx 10rpx;
    border-bottom: 1rpx solid #f5f5f5;
}

/* 主题色选择弹窗 */
.theme-picker {
    padding: 30rpx;
}

.theme-picker-title {
    font-size: 32rpx;
    font-weight: 500;
    color: #333333;
    text-align: center;
    margin-bottom: 40rpx;
}

.theme-color-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 30rpx;
    margin-bottom: 40rpx;
}

.theme-color-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 120rpx;
}

.theme-color-circle {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12rpx;
    border: 4rpx solid transparent;
    transition: border-color 0.2s;
}

.theme-color-circle.active {
    border-color: #333333;
}

.theme-color-name {
    font-size: 24rpx;
    color: #666666;
}

.theme-picker-close {
    text-align: center;
    padding: 20rpx 0;
    border-top: 1rpx solid #f5f5f5;
}

.theme-picker-close text {
    font-size: 28rpx;
    color: #999999;
}

/* 退出登录 */
.logout-section {
    margin-top: 40rpx;
    padding-bottom: 40rpx;
}

.logout-btn {
    background-color: #ffffff;
    border-radius: 16rpx;
    height: 100rpx;
    line-height: 100rpx;
    text-align: center;
    font-size: 32rpx;
    color: #ff4d4f;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}
</style>
