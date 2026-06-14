<template>
    <ThemeProvider>
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

            <!-- 深浅模式 -->
            <view class="setting-item" @click="handleDarkMode">
                <view class="setting-left">
                    <view class="setting-icon">
                        <t-icon name="browse" size="18px" color="var(--app-text-secondary)"></t-icon>
                    </view>
                    <text class="setting-label">深浅模式</text>
                </view>
                <view class="setting-right">
                    <text class="setting-value">{{ appearanceStore.getDarkModeText() }}</text>
                    <t-icon name="chevron-right" size="14px" color="var(--app-text-placeholder)"></t-icon>
                </view>
            </view>

            <!-- 主题预设 -->
            <view class="setting-item" @click="showThemePopup = true">
                <view class="setting-left">
                    <view class="setting-icon">
                        <t-icon name="star-filled" size="18px" color="var(--app-text-secondary)"></t-icon>
                    </view>
                    <text class="setting-label">主题</text>
                </view>
                <view class="setting-right">
                    <view
                        class="theme-color-dot"
                        :style="{ backgroundColor: currentPreset.primary }"
                    ></view>
                    <text class="setting-value">{{ currentPreset.name }}</text>
                    <t-icon name="chevron-right" size="14px" color="var(--app-text-placeholder)"></t-icon>
                </view>
            </view>

            <!-- 字号 -->
            <view class="setting-item" @click="handleFontSize">
                <view class="setting-left">
                    <view class="setting-icon">
                        <t-icon name="translate" size="18px" color="var(--app-text-secondary)"></t-icon>
                    </view>
                    <text class="setting-label">字号</text>
                </view>
                <view class="setting-right">
                    <text class="setting-value">{{ appearanceStore.fontSizeOptions[appearanceStore.fontSizeIndex] }}</text>
                    <t-icon name="chevron-right" size="14px" color="var(--app-text-placeholder)"></t-icon>
                </view>
            </view>
        </view>

        <!-- 主题预设选择弹窗 -->
        <t-popup
            :visible="showThemePopup"
            placement="bottom"
            @visible-change="(visible) => { if (!visible) showThemePopup = false }"
        >
            <view class="theme-picker">
                <view class="theme-picker-title">选择主题</view>
                <view class="theme-preset-list">
                    <view
                        v-for="preset in appearanceStore.themePresets"
                        :key="preset.key"
                        class="theme-preset-card"
                        :class="{ active: appearanceStore.themePreset === preset.key }"
                        @click="selectPreset(preset.key)"
                    >
                        <view
                            class="theme-preset-swatch"
                            :style="getPresetSwatchStyle(preset)"
                        >
                            <view
                                class="theme-preset-dot"
                                :style="{ backgroundColor: preset.primary }"
                            ></view>
                        </view>
                        <view class="theme-preset-info">
                            <view class="theme-preset-name-row">
                                <text class="theme-preset-name">{{ preset.name }}</text>
                                <t-icon
                                    v-if="appearanceStore.themePreset === preset.key"
                                    name="check-circle-filled"
                                    size="18px"
                                    color="var(--app-brand)"
                                ></t-icon>
                            </view>
                            <text class="theme-preset-desc">{{ preset.description }}</text>
                        </view>
                    </view>
                </view>
                <view class="theme-picker-close" @click="showThemePopup = false">
                    <text>取消</text>
                </view>
            </view>
        </t-popup>

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
import { checkUserBind } from "../../API/My/UserInfoUpdateAPI";
import logSDK from "../../util/logSDK";
// #ifdef MP-WEIXIN
import { wechatBind } from "../../util/wechatLogin";
// #endif
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

// 绑定状态
const bindStatus = ref({
    isEmailBound: false,
    isWechatBound: false,
});

// 当前主题预设
const currentPreset = computed(
    () => appearanceStore.getCurrentPreset?.() || appearanceStore.themePresets[0]
);

// 预设卡片左侧色样：根据预设给一个对应的渐变底
const getPresetSwatchStyle = (preset) => {
    const map = {
        aurora: "linear-gradient(135deg, #eaf1ff 0%, #ffffff 100%)",
        claude: "linear-gradient(135deg, #f5f0e8 0%, #faf7f2 100%)",
    };
    return {
        background: map[preset.key] || map.aurora,
    };
};

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

// 选择主题预设
const selectPreset = (presetKey) => {
    appearanceStore.setThemePreset(presetKey);
    showThemePopup.value = false;
    uni.showToast({ title: "主题已切换", icon: "none", position: "top" });
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
    font-size: 32rpx;
    font-weight: 500;
    color: var(--app-text-primary);
    margin-bottom: 8rpx;
}

.profile-uid {
    font-size: 24rpx;
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
    font-size: 30rpx;
    color: var(--app-text-primary);
}

.setting-right {
    display: flex;
    align-items: center;
}

.setting-value {
    font-size: 26rpx;
    color: var(--app-text-secondary);
    margin-right: 10rpx;
}

/* 主题色小圆点 */
.theme-color-dot {
    width: 28rpx;
    height: 28rpx;
    border-radius: 50%;
    margin-right: 10rpx;
    border: 2rpx solid var(--app-border);
    flex-shrink: 0;
}

/* 分组标题 */
.group-header {
    font-size: 26rpx;
    color: var(--app-text-secondary);
    padding: 20rpx 30rpx 10rpx;
    border-bottom: 1rpx solid var(--app-border);
}

/* 主题预设选择弹窗 */
.theme-picker {
    padding: 30rpx;
    background-color: var(--app-bg-container);
}

.theme-picker-title {
    font-size: 32rpx;
    font-weight: 500;
    color: var(--app-text-primary);
    text-align: center;
    margin-bottom: 30rpx;
}

.theme-preset-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    margin-bottom: 30rpx;
}

.theme-preset-card {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border-radius: 16rpx;
    background-color: var(--app-bg-secondary);
    border: 2rpx solid transparent;
    transition: border-color 0.2s, background-color 0.2s;
}

.theme-preset-card.active {
    border-color: var(--app-brand);
    background-color: var(--app-brand-light);
}

.theme-preset-swatch {
    width: 88rpx;
    height: 88rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    flex-shrink: 0;
    border: 1rpx solid var(--app-border);
}

.theme-preset-dot {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.12);
}

.theme-preset-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.theme-preset-name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6rpx;
}

.theme-preset-name {
    font-size: 30rpx;
    font-weight: 500;
    color: var(--app-text-primary);
}

.theme-preset-desc {
    font-size: 24rpx;
    color: var(--app-text-secondary);
}

.theme-picker-close {
    text-align: center;
    padding: 20rpx 0;
    border-top: 1rpx solid var(--app-border);
}

.theme-picker-close text {
    font-size: 28rpx;
    color: var(--app-text-secondary);
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
    font-size: 32rpx;
    color: var(--app-danger);
    box-shadow: var(--app-shadow-card);
}
</style>
