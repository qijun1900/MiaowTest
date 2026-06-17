<template>
    <ThemeProvider>
    <CustomNavBar title="设置" @back="handleNavBack" />
    <view class="container">
        <!-- 用户信息卡片 -->
        <view class="profile-card" @click="handleProfileCardClick">
            <view class="profile-left">
                <userAvatar :width="100" :height="100" :showOnline="false" />
                <view class="profile-info">
                    <template v-if="isLoggedIn">
                        <text class="profile-name">{{ userInfoStore.userInfo?.nickname || "未设置昵称" }}</text>
                        <text class="profile-uid">UID: {{ userInfoStore.userInfo?.uid || "--" }}</text>
                    </template>
                    <template v-else>
                        <text class="profile-name">点击登录</text>
                        <text class="profile-uid">登录后享受完整功能</text>
                    </template>
                </view>
            </view>
            <t-icon name="chevron-right" size="14px" color="var(--app-text-placeholder)"></t-icon>
        </view>

        <!-- 外观设置 -->
        <view class="settings-group">
            <view class="group-header">外观设置</view>

            <!-- 深浅模式：卡片直接展示 -->
            <view class="inline-section">
                <view class="inline-label">
                    <t-icon name="browse" size="18px" color="var(--app-text-secondary)"></t-icon>
                    <text>深浅模式</text>
                </view>
                <view class="dark-mode-options">
                    <view
                        v-for="option in darkModeOptions"
                        :key="option.value"
                        class="dark-mode-card"
                        :class="{ active: appearanceStore.darkMode === option.value }"
                        @click="selectDarkMode(option.value)"
                    >
                        <view class="dark-mode-preview" :class="`preview-${option.value}`">
                            <view class="preview-status-bar">
                                <view class="preview-dot"></view>
                                <view class="preview-dot"></view>
                                <view class="preview-dot"></view>
                            </view>
                            <view class="preview-content">
                                <view class="preview-line long"></view>
                                <view class="preview-line short"></view>
                                <view class="preview-card-mini"></view>
                            </view>
                        </view>
                        <view class="dark-mode-info">
                            <t-icon
                                v-if="appearanceStore.darkMode === option.value"
                                name="check-circle-filled"
                                size="18px"
                                color="var(--app-brand)"
                            ></t-icon>
                            <text class="dark-mode-name">{{ option.label }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 主题：卡片直接展示 -->
            <view class="inline-section">
                <view class="inline-label">
                    <t-icon name="palette" size="18px" color="var(--app-text-secondary)"></t-icon>
                    <text>主题风格</text>
                </view>
                <view class="theme-preview-area">
                    <view
                        v-for="preset in decoratedPresets"
                        :key="preset.key"
                        class="theme-preview-card"
                        :class="{ active: appearanceStore.themePreset === preset.key }"
                        @click="selectPreset(preset.key)"
                    >
                        <view class="theme-mock-page" :style="preset.mockPageStyle">
                            <view class="mock-navbar" :style="preset.mockNavBarStyle">
                                <view class="mock-dot" :style="preset.mockDotStyle"></view>
                                <view class="mock-title-line" :style="preset.mockTitleStyle"></view>
                            </view>
                            <view class="mock-body">
                                <view class="mock-card" :style="preset.mockCardStyle">
                                    <view class="mock-card-line" :style="preset.mockCardLineStyle"></view>
                                    <view class="mock-card-line short" :style="preset.mockCardLineShortStyle"></view>
                                </view>
                                <view class="mock-card" :style="preset.mockCardStyle">
                                    <view class="mock-card-line" :style="preset.mockCardLineStyle"></view>
                                </view>
                                <view class="mock-btn" :style="preset.mockBtnStyle"></view>
                            </view>
                        </view>
                        <view class="theme-preview-label">
                            <view class="theme-color-ring" :style="preset.colorRingStyle">
                                <view class="theme-color-fill" :style="preset.colorFillStyle"></view>
                            </view>
                            <text class="theme-preview-name">{{ preset.name }}</text>
                            <t-icon
                                v-if="appearanceStore.themePreset === preset.key"
                                name="check-circle-filled"
                                size="18px"
                                :color="preset.primary"
                            ></t-icon>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 字号：卡片直接展示 -->
            <view class="inline-section">
                <view class="inline-label">
                    <t-icon name="translate" size="18px" color="var(--app-text-secondary)"></t-icon>
                    <text>字体大小</text>
                </view>
                <view class="font-size-options">
                    <view
                        v-for="(option, index) in fontSizeOptions"
                        :key="index"
                        class="font-size-card"
                        :class="{ active: appearanceStore.fontSizeIndex === index }"
                        @click="selectFontSize(index)"
                    >
                        <text class="font-size-preview" :style="{ fontSize: option.previewSize }">A</text>
                        <text class="font-size-name">{{ option.label }}</text>
                    </view>
                </view>
                <text class="font-size-hint">调整应用内文字大小，提升阅读体验</text>
            </view>
        </view>

        <!-- 设置列表 -->
        <view class="settings-group">
            <!-- 账号安全（登录后可见） -->
            <view v-if="isLoggedIn" class="setting-item" @click="handleAccountSecurity">
                <view class="setting-left">
                    <view class="setting-icon">
                        <t-icon name="lock-on" size="18px" color="var(--app-text-secondary)"></t-icon>
                    </view>
                    <text class="setting-label">账号安全</text>
                </view>
                <view class="setting-right">
                    <t-icon name="chevron-right" size="14px" color="var(--app-text-placeholder)"></t-icon>
                </view>
            </view>

            <!-- 账号绑定（登录后可见） -->
            <view v-if="isLoggedIn" class="setting-item" @click="handleAccountBind">
                <view class="setting-left">
                    <view class="setting-icon">
                        <t-icon name="link" size="18px" color="var(--app-text-secondary)"></t-icon>
                    </view>
                    <text class="setting-label">账号绑定</text>
                </view>
                <view class="setting-right">
                    <text class="setting-value">{{ bindStatusText }}</text>
                    <t-icon name="chevron-right" size="14px" color="var(--app-text-placeholder)"></t-icon>
                </view>
            </view>

            <!-- 消息通知 -->
            <view class="setting-item">
                <view class="setting-left">
                    <view class="setting-icon">
                        <t-icon name="notification" size="18px" color="var(--app-text-secondary)"></t-icon>
                    </view>
                    <text class="setting-label">消息通知</text>
                </view>
                <view class="setting-right">
                    <t-switch
                        :value="notificationEnabled"
                        :custom-value="[true, false]"
                        @change="(e) => handleNotificationChange(e.value)"
                    ></t-switch>
                </view>
            </view>

            <!-- 清除缓存 -->
            <view class="setting-item" @click="handleClearCache">
                <view class="setting-left">
                    <view class="setting-icon">
                        <t-icon name="delete" size="18px" color="var(--app-text-secondary)"></t-icon>
                    </view>
                    <text class="setting-label">清除缓存</text>
                </view>
                <view class="setting-right">
                    <text class="setting-value">{{ cacheSize }}</text>
                    <t-icon name="chevron-right" size="14px" color="var(--app-text-placeholder)"></t-icon>
                </view>
            </view>

            <!-- 检查更新 -->
            <view class="setting-item" @click="handleCheckUpdate">
                <view class="setting-left">
                    <view class="setting-icon">
                        <t-icon name="refresh" size="18px" color="var(--app-text-secondary)"></t-icon>
                    </view>
                    <text class="setting-label">检查更新</text>
                </view>
                <view class="setting-right">
                    <text class="setting-value">v{{ appVersion }}</text>
                    <t-icon name="chevron-right" size="14px" color="var(--app-text-placeholder)"></t-icon>
                </view>
            </view>
        </view>

        <view class="settings-group">
            <!-- 用户协议 -->
            <view class="setting-item" @click="handleUserAgreement">
                <view class="setting-left">
                    <view class="setting-icon">
                        <t-icon name="file" size="18px" color="var(--app-text-secondary)"></t-icon>
                    </view>
                    <text class="setting-label">用户协议</text>
                </view>
                <view class="setting-right">
                    <t-icon name="chevron-right" size="14px" color="var(--app-text-placeholder)"></t-icon>
                </view>
            </view>

            <!-- 隐私政策 -->
            <view class="setting-item" @click="handlePrivacyPolicy">
                <view class="setting-left">
                    <view class="setting-icon">
                        <t-icon name="browse" size="18px" color="var(--app-text-secondary)"></t-icon>
                    </view>
                    <text class="setting-label">隐私政策</text>
                </view>
                <view class="setting-right">
                    <t-icon name="chevron-right" size="14px" color="var(--app-text-placeholder)"></t-icon>
                </view>
            </view>

            <!-- 关于我们 -->
            <view class="setting-item" @click="handleAbout">
                <view class="setting-left">
                    <view class="setting-icon">
                        <t-icon name="info-circle" size="18px" color="var(--app-text-secondary)"></t-icon>
                    </view>
                    <text class="setting-label">关于我们</text>
                </view>
                <view class="setting-right">
                    <text class="setting-value">v{{ appVersion }}</text>
                    <t-icon name="chevron-right" size="14px" color="var(--app-text-placeholder)"></t-icon>
                </view>
            </view>
        </view>

        <!-- 退出登录（登录后可见） -->
        <view v-if="isLoggedIn" class="logout-section">
            <view class="logout-btn" @click="handleLogout">退出登录</view>
        </view>
    </view>
    </ThemeProvider>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { UserInfoStore } from "../../stores/modules/UserinfoStore";
import { AppearanceStore } from "../../stores/modules/AppearanceStore";
import { clearExamCache } from "../../util/cacheCleaner";
import userAvatar from "../../components/core/userAvatar.vue";
import ThemeProvider from "../../components/core/ThemeProvider.vue";
import CustomNavBar from "../../components/common/CustomNavBar.vue";
import { checkUserBind } from "../../API/My/UserInfoUpdateAPI";
import logSDK from "../../util/logSDK";
// #ifdef APP-PLUS
import { checkForUpdate } from "../../util/checkUpdate";
// #endif

const userInfoStore = UserInfoStore();
const appearanceStore = AppearanceStore();

// 导航栏返回
const handleNavBack = () => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack({ delta: 1 });
    } else {
        uni.switchTab({ url: "/pages/index/index" });
    }
};
// #ifdef APP-PLUS
const appVersion = ref(plus.runtime.version);
// #endif
// #ifndef APP-PLUS
const appVersion = ref("1.4.0");
// #endif
const cacheSize = ref("计算中...");
const notificationEnabled = ref(true);

const darkModeOptions = [
    { label: "跟随系统", value: "auto" },
    { label: "浅色", value: "light" },
    { label: "深色", value: "dark" },
];

// 字号预览基准：用 36rpx 作为「标准」档的展示尺寸，
// 各档按 store 真实 scale 缩放，确保预览差距 = 实际差距，避免误导
const FONT_PREVIEW_BASE_RPX = 36;
const fontSizeOptions = computed(() =>
    appearanceStore.fontSizeOptions.map((label, index) => ({
        label,
        previewSize: `${FONT_PREVIEW_BASE_RPX * appearanceStore.fontSizeScales[index]}rpx`,
    }))
);

// 绑定状态
const bindStatus = ref({
    isEmailBound: false,
    isWechatBound: false,
});

/**
 * 预先计算每个 preset 的全部内联样式对象，避免模板里调用函数返回新对象，
 * 防止每次 render 产生新引用触发子节点 style diff，显著降低主题卡片切换抖动。
 */
const decoratedPresets = computed(() =>
    appearanceStore.themePresets.map((preset) => {
        const isClaude = preset.key === "claude";
        const pageBg = isClaude ? "#f5f0e8" : "#f5f7fa";
        const cardBg = isClaude ? "#faf7f2" : "#ffffff";
        const textBase = isClaude ? "61, 57, 41" : "0, 0, 0";
        return {
            ...preset,
            mockPageStyle: { background: pageBg },
            mockNavBarStyle: { background: pageBg },
            mockDotStyle: { background: preset.primary },
            mockTitleStyle: { background: `rgba(${textBase}, 0.8)` },
            mockCardStyle: { background: cardBg },
            mockCardLineStyle: { background: `rgba(${textBase}, 0.6)` },
            mockCardLineShortStyle: { background: `rgba(${textBase}, 0.3)` },
            mockBtnStyle: { background: preset.primary },
            colorRingStyle: { borderColor: preset.primary },
            colorFillStyle: { background: preset.primary },
        };
    })
);

// 绑定状态文案
const bindStatusText = computed(() => {
    const { isEmailBound, isWechatBound } = bindStatus.value;
    if (isEmailBound && isWechatBound) return "邮箱、微信";
    if (isEmailBound) return "邮箱";
    if (isWechatBound) return "微信";
    return "未绑定";
});

// 查询绑定状态
const fetchBindStatus = async () => {
    try {
        const response = await checkUserBind();
        if (response.code === 200) {
            bindStatus.value = {
                isEmailBound: !!response.data.isEmailBound,
                isWechatBound: !!response.data.isWechatBound,
            };
        }
    } catch (e) {
        console.error("获取绑定状态失败:", e);
    }
};

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

// 登录状态
const isLoggedIn = computed(() => userInfoStore.isLoggedIn);

// 点击个人资料卡片
const handleProfileCardClick = () => {
    if (isLoggedIn.value) {
        uni.navigateTo({ url: "/pages/my/UserInfoView" });
    } else {
        uni.navigateTo({ url: "/pages/my/UserLoginView" });
    }
};

// 账号安全
const handleAccountSecurity = () => {
    uni.showToast({ title: "功能开发中", icon: "none" });
};

// 账号绑定：跳转个人信息页
const handleAccountBind = () => {
    uni.navigateTo({ url: "/pages/my/UserInfoView" });
};

// 消息通知开关
const handleNotificationChange = (value) => {
    uni.setStorageSync("notification_enabled", value);
    uni.showToast({
        title: value ? "已开启消息通知" : "已关闭消息通知",
        icon: "none",
    });
};

// 选择深浅模式
const selectDarkMode = (mode) => {
    appearanceStore.setDarkMode(mode);
};

// 选择主题预设
const selectPreset = (presetKey) => {
    appearanceStore.setThemePreset(presetKey);
    uni.showToast({ title: "主题已切换", icon: "none", position: "top" });
};

// 选择字号
const selectFontSize = (index) => {
    appearanceStore.setFontSize(index);
    uni.showToast({
        title: "字号已切换为" + fontSizeOptions.value[index].label,
        icon: "none",
        position: "top",
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
    if (isLoggedIn.value) {
        fetchBindStatus();
    }
    const savedNotification = uni.getStorageSync("notification_enabled");
    if (savedNotification !== "") {
        notificationEnabled.value = savedNotification;
    }
});
</script>

<style scoped>
.container {
    min-height: 100vh;
    background-color: var(--app-bg-page);
    padding: 20rpx;
}

/* 用户信息卡片 */
.profile-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--app-bg-container);
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: var(--app-shadow-card);
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
    font-size: calc(32rpx * var(--app-font-scale, 1));
    font-weight: 500;
    color: var(--app-text-primary);
    margin-bottom: 8rpx;
}

.profile-uid {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

/* 设置分组 */
.settings-group {
    background-color: var(--app-bg-container);
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    box-shadow: var(--app-shadow-card);
    overflow: hidden;
}

.setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 30rpx;
    border-bottom: 1rpx solid var(--app-border);
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
    background-color: var(--app-bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
}

.setting-label {
    font-size: calc(30rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
}

.setting-right {
    display: flex;
    align-items: center;
}

.setting-value {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    margin-right: 10rpx;
}

/* ── 内联选择区域 ── */
.inline-section {
    padding: 24rpx 30rpx;
    border-bottom: 1rpx solid var(--app-border);
}

.inline-label {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 20rpx;
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

/* ── 深浅模式卡片 ── */
.dark-mode-options {
    display: flex;
    gap: 16rpx;
}

.dark-mode-card {
    flex: 1;
    border-radius: 16rpx;
    overflow: hidden;
    border: 3rpx solid transparent;
    transition: border-color 0.2s ease;
    background: var(--app-bg-secondary);
}

.dark-mode-card.active {
    border-color: var(--app-brand);
    outline: 4rpx solid var(--app-brand-light);
}

.dark-mode-preview {
    padding: 14rpx;
    border-radius: 12rpx 12rpx 0 0;
    min-height: 160rpx;
}

.preview-auto {
    background: linear-gradient(135deg, #f5f7fa 0%, #1f1e1b 100%);
}

.preview-light {
    background: #f5f7fa;
}

.preview-dark {
    background: #1f1e1b;
}

.preview-status-bar {
    display: flex;
    gap: 6rpx;
    margin-bottom: 14rpx;
    padding: 0 4rpx;
}

.preview-dot {
    width: 8rpx;
    height: 8rpx;
    border-radius: 50%;
    background: rgba(128, 128, 128, 0.5);
}

.preview-content {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    padding: 0 4rpx;
}

.preview-line {
    height: 8rpx;
    border-radius: 4rpx;
    background: rgba(128, 128, 128, 0.3);
}

.preview-line.long {
    width: 80%;
}

.preview-line.short {
    width: 50%;
}

.preview-card-mini {
    margin-top: 6rpx;
    height: 40rpx;
    border-radius: 8rpx;
    background: rgba(128, 128, 128, 0.15);
}

.dark-mode-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
    padding: 12rpx 0;
}

.dark-mode-name {
    font-size: calc(22rpx * var(--app-font-scale, 1));
    font-weight: 500;
    color: var(--app-text-primary);
}

/* ── 主题预览卡片 ── */
.theme-preview-area {
    display: flex;
    gap: 20rpx;
}

.theme-preview-card {
    flex: 1;
    border-radius: 16rpx;
    overflow: hidden;
    border: 3rpx solid var(--app-border);
    transition: border-color 0.2s ease;
    background: var(--app-bg-secondary);
}

.theme-preview-card.active {
    border-color: var(--app-brand);
    outline: 4rpx solid var(--app-brand-light);
}

.theme-mock-page {
    padding: 10rpx;
    min-height: 220rpx;
    border-radius: 12rpx 12rpx 0 0;
}

.mock-navbar {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 6rpx 8rpx;
    border-radius: 6rpx;
    margin-bottom: 10rpx;
}

.mock-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
}

.mock-title-line {
    height: 8rpx;
    width: 50rpx;
    border-radius: 4rpx;
}

.mock-body {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    padding: 0 4rpx;
}

.mock-card {
    padding: 8rpx;
    border-radius: 8rpx;
    display: flex;
    flex-direction: column;
    gap: 5rpx;
}

.mock-card-line {
    height: 6rpx;
    border-radius: 3rpx;
}

.mock-card-line.short {
    width: 60%;
}

.mock-btn {
    height: 20rpx;
    border-radius: 10rpx;
    margin-top: 4rpx;
}

.theme-preview-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 12rpx 0;
}

.theme-color-ring {
    width: 24rpx;
    height: 24rpx;
    border-radius: 50%;
    border: 3rpx solid;
    display: flex;
    align-items: center;
    justify-content: center;
}

.theme-color-fill {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
}

.theme-preview-name {
    font-size: calc(22rpx * var(--app-font-scale, 1));
    font-weight: 500;
    color: var(--app-text-primary);
}

/* ── 字号卡片 ── */
.font-size-options {
    display: flex;
    gap: 16rpx;
}

.font-size-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    padding: 24rpx 0;
    border-radius: 16rpx;
    background: var(--app-bg-secondary);
    border: 3rpx solid transparent;
    transition: border-color 0.2s ease, background-color 0.2s ease;
}

.font-size-card.active {
    border-color: var(--app-brand);
    background: var(--app-brand-light);
    outline: 4rpx solid var(--app-brand-light);
}

.font-size-preview {
    font-weight: 700;
    color: var(--app-text-primary);
    line-height: 1;
}

.font-size-name {
    font-size: calc(22rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    font-weight: 500;
}

.font-size-card.active .font-size-name {
    color: var(--app-brand);
    font-weight: 600;
}

.font-size-hint {
    margin-top: 14rpx;
    font-size: var(--app-font-base);
    color: var(--app-text-placeholder);
}

/* 分组标题 */
.group-header {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    padding: 20rpx 30rpx 10rpx;
    border-bottom: 1rpx solid var(--app-border);
}

/* 退出登录 */
.logout-section {
    margin-top: 40rpx;
    padding-bottom: 40rpx;
}

.logout-btn {
    background-color: var(--app-bg-container);
    border-radius: 16rpx;
    height: 100rpx;
    line-height: 100rpx;
    text-align: center;
    font-size: calc(32rpx * var(--app-font-scale, 1));
    color: var(--app-danger);
    box-shadow: var(--app-shadow-card);
}
</style>
