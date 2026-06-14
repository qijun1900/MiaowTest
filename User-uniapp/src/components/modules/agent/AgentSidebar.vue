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
            <view class="search-section" @click="handleSearchClick">
                <view class="search-bar">
                    <view class="search-icon-wrapper">
                        <view class="search-icon"></view>
                    </view>
                    <text class="search-placeholder-text">搜索会话...</text>
                </view>
            </view>

            <!-- 导航选项区 -->
            <view class="main-nav-section">
                <view class="nav-item" @click="handleNewChat">
                    <uni-icons type="plusempty" size="22" color="#30323a"></uni-icons>
                    <text class="nav-text">开启新对话</text>
                </view>
                <view
                    class="nav-item"
                    :class="{ 'nav-item-active': activeFilter === 'favorites' }"
                    @click="handleNav('favorites')"
                >
                    <uni-icons
                        :type="activeFilter === 'favorites' ? 'star-filled' : 'star'"
                        size="22"
                        :color="activeFilter === 'favorites' ? '#f5a623' : '#30323a'"
                    ></uni-icons>
                    <text class="nav-text">我的收藏</text>
                </view>
                <view class="nav-item" @click="handleNav('tasks')">
                    <uni-icons type="list" size="22" color="#30323a"></uni-icons>
                    <text class="nav-text">我的任务</text>
                </view>
            </view>

            <view class="section-divider"></view>
            <view class="section-header">{{ activeFilter === 'favorites' ? '我的收藏' : '最近' }}</view>

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
                        :class="{ 'chat-item-active': currentChatId === item._id, 'chat-item-loading': loadingChatId === item._id }"
                        v-for="item in filteredChats"
                        :key="item._id"
                        @click="handleSelectChat(item._id)"
                    >
                        <view v-if="item.isPinned" class="chat-item-star">
                            <uni-icons type="star-filled" size="16" color="#f5a623"></uni-icons>
                        </view>
                        <view class="chat-item-content">
                            <text class="chat-item-title">{{ item.title }}</text>
                        </view>
                        <view v-if="loadingChatId === item._id" class="chat-item-spinner"></view>
                    </view>

                    <!-- 空状态 -->
                    <view class="empty-state" v-if="filteredChats.length === 0">
                        <text class="empty-text">{{ activeFilter === 'favorites' ? '暂无收藏会话' : '暂无会话记录' }}</text>
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
    },
    loadingChatId: {
        type: [String, Number],
        default: null
    }
});

const emit = defineEmits(["update:show", "select-chat", "filter-change", "new-chat", "search-click"]);

const activeFilter = ref("all"); // 'all' | 'favorites'

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
const touchStartX = ref(0);
const touchStartY = ref(0);
const touchDeltaX = ref(0);
const touchDeltaY = ref(0);


const filteredChats = computed(() => {
    let list = props.conversations;
    if (activeFilter.value === 'favorites') {
        list = list.filter((item) => item.isPinned);
    }
    return list;
});

// 动画控制：先渲染 DOM，再触发动画
watch(
    () => props.show,
    (newVal) => {
        if (newVal) {
            visible.value = true;
            // 每次打开侧边栏时重置过滤状态，与父组件默认列表保持一致
            if (activeFilter.value !== 'all') {
                activeFilter.value = 'all';
                emit("filter-change", 'all');
            }
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

const handleSearchClick = () => {
    emit("search-click");
};

const handleNewChat = () => {
    emit("new-chat");
    handleClose();
};

const handleSettings = () => {
   uni.navigateTo({
       url: "/pages/my/MySettingView",
   });
};

const handleNav = (target) => {
    if (target === 'favorites') {
        activeFilter.value = activeFilter.value === 'favorites' ? 'all' : 'favorites';
        emit("filter-change", activeFilter.value);
    } else {
        uni.showToast({
            title: '开发中: 我的任务',
            icon: 'none'
        });
    }
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
    background: var(--app-bg-mask);
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
    background: var(--app-bg-page);
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
    background: var(--app-bg-page);
    border-bottom: 1rpx solid var(--app-border);
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
    background: var(--app-text-primary);
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
    color: var(--app-text-primary);
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
    background: var(--app-brand);
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
    color: var(--app-text-primary);
}

.user-desc {
    font-size: 24rpx;
    color: var(--app-text-secondary);
}

/* 搜索栏 */
.search-section {
    padding: 12rpx 24rpx;
}

.search-bar {
    height: 64rpx;
    border-radius: 32rpx;
    background: var(--app-bg-container);
    border: 1rpx solid var(--app-border);
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
    border: 3rpx solid var(--app-text-secondary);
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
    background: var(--app-text-secondary);
    border-radius: 3rpx;
    transform: rotate(45deg);
}

.search-placeholder-text {
    flex: 1;
    font-size: 28rpx;
    color: var(--app-text-secondary);
}

/* 主导航区 */
.main-nav-section {
    padding: 10rpx 32rpx;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 24rpx 12rpx;
    border-radius: 12rpx;
    transition: background 0.2s ease;
}

.nav-item:active {
    background: var(--app-bg-secondary);
}

.nav-item-active {
    background: var(--app-brand-light);
}


.nav-text {
    font-size: 32rpx;
    color: var(--app-text-primary);
    font-weight: 500;
}

.section-divider {
    height: 1rpx;
    background: var(--app-border);
    margin: 10rpx 44rpx;
}

.section-header {
    padding: 20rpx 44rpx 10rpx;
    font-size: 26rpx;
    font-weight: 600;
    color: var(--app-text-secondary);
}

/* 会话列表 */
.chat-list {
    flex: 1;
    height: 0;
    min-height: 0;
    padding: 8rpx 24rpx;
    box-sizing: border-box;
}

.chat-item {
    display: flex;
    align-items: center;
    padding: 32rpx 20rpx;
    gap: 16rpx;
    margin-bottom: 8rpx;
    border-bottom: 1rpx solid var(--app-border);
    transition: all 0.2s ease;
    box-sizing: border-box;
    width: 100%;
}

.chat-item:last-child {
    border-bottom: transparent;
}

.chat-item:active {
    background: var(--app-bg-secondary);
    border-radius: 12rpx;
}

.chat-item-active {
    background: var(--app-brand-light);
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
    background: var(--app-text-secondary);
}

.chat-item-active .chat-dot {
    background: var(--app-brand);
}

.chat-item-star {
    flex-shrink: 0;
    display: flex;
    align-items: center;
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
    color: var(--app-text-primary);
    font-weight: 500;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
    width: 100%;
}

.chat-item-loading {
    opacity: 0.6;
    pointer-events: none;
}

.chat-item-spinner {
    width: 28rpx;
    height: 28rpx;
    border: 3rpx solid var(--app-border);
    border-top-color: var(--app-brand);
    border-radius: 50%;
    animation: sidebar-spin 0.6s linear infinite;
    flex-shrink: 0;
}

@keyframes sidebar-spin {
    to { transform: rotate(360deg); }
}

.chat-item-time {
    font-size: 22rpx;
    color: var(--app-text-secondary);
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
    color: var(--app-text-secondary);
}

/* 底部功能区 */
.sidebar-footer {
    padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid var(--app-border);
    background: var(--app-bg-page);
    opacity: 0.96;
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
    background: var(--app-brand);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--app-shadow-card);
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
    color: var(--app-text-primary);
    line-height: 1.5;
}

.footer-settings {
    width: 74rpx;
    height: 74rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--app-bg-container);
    border: 1rpx solid var(--app-border);
    box-shadow: var(--app-shadow-card);
}

.footer-settings:active {
    background: var(--app-bg-secondary);
}
</style>
