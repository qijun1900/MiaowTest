<template>
    <view v-if="visible" class="sidebar-wrapper">
        <!-- 遮罩层 -->
        <view
            class="sidebar-overlay"
            :class="{ 'overlay-active': animating }"
            @click="handleClose"
        ></view>

        <!-- 侧边菜单面板 -->
        <view
            class="sidebar-panel"
            :class="{ 'panel-active': animating }"
            @touchstart="handlePanelTouchStart"
            @touchmove="handlePanelTouchMove"
            @touchend="handlePanelTouchEnd"
        >
            <!-- 顶部安全区 + 关闭按钮 -->
            <view class="sidebar-header" :style="headerStyle">
                <view class="header-row" :style="headerRowStyle">
                    <view class="close-btn" @click="handleClose">
                        <view class="close-icon"></view>
                    </view>
                    <text class="sidebar-title">Mio</text>
                </view>
            </view>

            <!-- 搜索栏 -->
            <view class="search-section">
                <view class="search-bar">
                    <view class="search-icon-wrapper">
                        <view class="search-icon"></view>
                    </view>
                    <input
                        class="search-input"
                        type="text"
                        placeholder="搜索会话..."
                        placeholder-class="search-placeholder"
                        :adjust-position="false"
                        v-model="searchText"
                    />
                </view>
            </view>

            <scroll-view class="chat-list" scroll-y>
                <!-- 骨架屏加载 -->
                <template v-if="loading">
                    <view class="skeleton-item" v-for="i in 8" :key="i">
                        <view class="skeleton-title"></view>
                    </view>
                </template>
                
                <!-- 实际列表 -->
                <template v-else>
                    <view
                        class="chat-item"
                        :class="{ 'chat-item-active': currentChatId === item._id }"
                        v-for="item in filteredChats"
                        :key="item._id"
                        @click="handleSelectChat(item._id)"
                    >
                        <view class="chat-item-content">
                            <text class="chat-item-title">{{ item.title }}</text>
                        </view>
                    </view>
    
                    <!-- 空状态 -->
                    <view class="empty-state" v-if="filteredChats.length === 0">
                        <text class="empty-text">暂无会话记录</text>
                    </view>
                </template>
            </scroll-view>

            <!-- 底部功能区 -->
            <view class="sidebar-footer">
                <view class="footer-user">
                    <view class="footer-avatar">
                        <image v-if="avatar" :src="avatar" class="footer-avatar-img" mode="aspectFill" />
                        <text v-else class="footer-avatar-text">{{ avatarText }}</text>
                    </view>
                    <view class="footer-user-meta">
                        <text class="footer-user-name">{{ nickname }}</text>
                    </view>
                </view>
                <view class="footer-settings" @click="handleSettings">
                    <uni-icons type="gear" size="25" color="#2f333b">
                    </uni-icons>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useNavBarSafeArea } from "../../../composables/useNavBarSafeArea";
import { UserInfoStore } from "@/stores/modules/UserinfoStore";

const props = defineProps({
    show: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    conversations: {
        type: Array,
        default: () => [],
    },
    currentChatId: {
        type: [String, Number],
        default: null
    }
});

const emit = defineEmits(["update:show", "select-chat"]);

const { customNavbarStyle, navRowStyle } = useNavBarSafeArea({
    reserveMenuButtonRight: true,
    rightPaddingExtra: 8,
});

const userInfoStore = UserInfoStore();

const nickname = computed(() => userInfoStore.userInfo?.nickname || "用户");
const avatar = computed(() => userInfoStore.userInfo?.avatar);
const avatarText = computed(() => {
    const name = userInfoStore.userInfo?.nickname;
    return name ? name.charAt(0).toUpperCase() : "U";
});

const visible = ref(false);
const animating = ref(false);
const searchText = ref("");
const touchStartX = ref(0);
const touchStartY = ref(0);
const touchDeltaX = ref(0);
const touchDeltaY = ref(0);


const filteredChats = computed(() => {
    if (!searchText.value) return props.conversations;
    const keyword = searchText.value.toLowerCase();
    return props.conversations.filter((item) =>
        item.title && item.title.toLowerCase().includes(keyword),
    );
});

// 动画控制：先渲染 DOM，再触发动画
watch(
    () => props.show,
    (newVal) => {
        if (newVal) {
            visible.value = true;
            nextTick(() => {
                animating.value = true;
            });
        } else {
            animating.value = false;
            // 等动画结束再移除 DOM
            setTimeout(() => {
                visible.value = false;
            }, 300);
        }
    },
);

const headerStyle = computed(() => customNavbarStyle.value);
const headerRowStyle = computed(() => navRowStyle.value);

const handleClose = () => {
    emit("update:show", false);
};

const handlePanelTouchStart = (event) => {
    const touch = event?.touches?.[0];
    if (!touch) {
        return;
    }
    touchStartX.value = touch.clientX;
    touchStartY.value = touch.clientY;
    touchDeltaX.value = 0;
    touchDeltaY.value = 0;
};

const handlePanelTouchMove = (event) => {
    const touch = event?.touches?.[0];
    if (!touch) {
        return;
    }
    touchDeltaX.value = touch.clientX - touchStartX.value;
    touchDeltaY.value = touch.clientY - touchStartY.value;
};

const handlePanelTouchEnd = () => {
    const horizontalDistance = Math.abs(touchDeltaX.value);
    const verticalDistance = Math.abs(touchDeltaY.value);
    const isHorizontalSwipe = horizontalDistance > verticalDistance * 1.2;
    const isLeftSwipe = touchDeltaX.value < -60;

    if (isHorizontalSwipe && isLeftSwipe) {
        handleClose();
    }

    touchDeltaX.value = 0;
    touchDeltaY.value = 0;
};

const handleSelectChat = (chatId) => {
    emit("select-chat", chatId);
    handleClose();
};

const handleSettings = () => {
   uni.navigateTo({
       url: "/pages/my/MySettingView",
   });
};
</script>

<style scoped>
.sidebar-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
}

/* 遮罩层 */
.sidebar-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.sidebar-overlay.overlay-active {
    opacity: 1;
}

/* 侧边面板 */
.sidebar-panel {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #f6f7f9;
    display: flex;
    flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-panel.panel-active {
    transform: translateX(0);
}

/* 顶部区域 */
.sidebar-header {
    position: relative;
    z-index: 10;
    background: #f6f7f9;
    border-bottom: 1rpx solid rgba(15, 23, 42, 0.08);
    box-sizing: border-box;
}

.header-row {
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    gap: 16rpx;
}

.close-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-icon {
    width: 24rpx;
    height: 24rpx;
    position: relative;
}

.close-icon::before,
.close-icon::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 24rpx;
    height: 3rpx;
    background: #30323a;
    border-radius: 3rpx;
}

.close-icon::before {
    transform: translate(-50%, -50%) rotate(45deg);
}

.close-icon::after {
    transform: translate(-50%, -50%) rotate(-45deg);
}

.sidebar-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #2d2f36;
}

/* 用户信息区 */
.user-section {
    padding: 24rpx 24rpx 16rpx;
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.user-avatar {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar-text {
    font-size: 28rpx;
    font-weight: 700;
    color: #ffffff;
}

.user-info {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
}

.user-name {
    font-size: 30rpx;
    font-weight: 600;
    color: #2d2f36;
}

.user-desc {
    font-size: 24rpx;
    color: #8b8fa3;
}

/* 搜索栏 */
.search-section {
    padding: 12rpx 24rpx;
}

.search-bar {
    height: 64rpx;
    border-radius: 32rpx;
    background: rgba(255, 255, 255, 0.72);
    border: 1rpx solid rgba(15, 23, 42, 0.1);
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    gap: 12rpx;
}

.search-icon-wrapper {
    width: 32rpx;
    height: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.search-icon {
    width: 16rpx;
    height: 16rpx;
    border: 3rpx solid #8b8fa3;
    border-radius: 50%;
    position: relative;
}

.search-icon::after {
    content: "";
    position: absolute;
    right: -4rpx;
    bottom: -4rpx;
    width: 8rpx;
    height: 3rpx;
    background: #8b8fa3;
    border-radius: 3rpx;
    transform: rotate(45deg);
}

.search-input {
    flex: 1;
    font-size: 28rpx;
    color: #2d2f36;
    height: 64rpx;
    line-height: 64rpx;
}

.search-placeholder {
    color: #8b8fa3;
    font-size: 28rpx;
}

/* 会话列表 */
.chat-list {
    flex: 1;
    padding: 8rpx 24rpx;
}

.chat-item {
    display: flex;
    align-items: center;
    padding: 32rpx 20rpx;
    gap: 16rpx;
    margin-bottom: 8rpx;
    border-bottom: 1rpx solid rgba(15, 23, 42, 0.06);
    transition: all 0.2s ease;
    box-sizing: border-box;
    width: 100%;
}

.chat-item:last-child {
    border-bottom: transparent;
}

.chat-item:active {
    background: rgba(15, 23, 42, 0.04);
    border-radius: 12rpx;
}

.chat-item-active {
    background: rgba(102, 126, 234, 0.08);
    border-radius: 12rpx;
    border-bottom-color: transparent;
}

.chat-item-icon {
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chat-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: #8b8fa3;
}

.chat-item-active .chat-dot {
    background: #667eea;
}

.chat-item-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
    overflow: hidden;
}

.chat-item-title {
    font-size: 32rpx;
    color: #2d2f36;
    font-weight: 500;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
    width: 100%;
}

.chat-item-time {
    font-size: 22rpx;
    color: #8b8fa3;
}

/* 空状态 */
.empty-state {
    padding: 60rpx 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-text {
    font-size: 28rpx;
    color: #8b8fa3;
}

/* 底部功能区 */
.sidebar-footer {
    padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid rgba(15, 23, 42, 0.06);
    background: rgba(246, 247, 249, 0.96);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.footer-user {
    display: flex;
    align-items: center;
    gap: 18rpx;
}

.footer-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #32353d 0%, #565a66 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10rpx 24rpx rgba(17, 24, 39, 0.16);
    overflow: hidden;
}

.footer-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
}

.footer-avatar-text {
    font-size: 36rpx;
    font-weight: 700;
    color: #ffffff;
}

.footer-user-meta {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
}

.footer-user-name {
    font-size: 30rpx;
    font-weight: 600;
    color: #22252d;
    line-height: 1.5;
}

.footer-settings {
    width: 74rpx;
    height: 74rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #ffffff;
    border: 1rpx solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 8rpx 18rpx rgba(17, 24, 39, 0.08);
}

.footer-settings:active {
    background: rgba(15, 23, 42, 0.04);
}
</style>
