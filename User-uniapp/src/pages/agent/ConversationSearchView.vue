<template>
    <view class="container">
        <!-- 自定义导航栏 -->
        <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="navbar-content">
                <view class="navbar-left" @click="handleBack">
                    <t-icon name="chevron-left" size="48rpx" color="#2d2f36" />
                </view>
                <view class="navbar-center">
                    <view class="nav-search-bar">
                        <t-icon name="search" size="32rpx" color="#8b8fa3" />
                        <input
                            class="nav-search-input"
                            type="text"
                            placeholder="搜索会话..."
                            placeholder-class="nav-search-placeholder"
                            :focus="true"
                            :adjust-position="false"
                            v-model="keyword"
                            @input="handleInput"
                        />
                        <t-icon
                            v-if="keyword"
                            name="close-circle-filled"
                            size="32rpx"
                            color="#c0c4cc"
                            @click="handleClear"
                        />
                    </view>
                </view>
                <view class="navbar-right" @click="handleCancel">
                    <text class="cancel-text">取消</text>
                </view>
            </view>
        </view>

        <!-- 骨架屏加载 -->
        <view class="skeleton-list" v-if="pageLoading">
            <view class="skeleton-item" v-for="i in 8" :key="i">
                <view class="skeleton-icon"></view>
                <view class="skeleton-content">
                    <view class="skeleton-title"></view>
                    <view class="skeleton-preview"></view>
                </view>
            </view>
        </view>

        <!-- 会话列表 -->
        <scroll-view class="result-list" scroll-y v-else>
            <view class="searching-bar" v-if="searching">
                <view class="searching-bar-inner"></view>
            </view>

            <view
                class="result-item"
                v-for="item in displayList"
                :key="item._id"
                @click="handleSelect(item)"
                @longpress="handleLongPress(item)"
                @touchstart="onItemTouchStart"
                @touchmove="onItemTouchMove"
                @touchend="onItemTouchEnd"
            >
                <view v-if="isSelectionMode" class="item-checkbox" @click.stop="toggleSelect(item._id)">
                    <t-icon
                        :name="selectedIds.has(item._id) ? 'check-circle-filled' : 'circle'"
                        size="44rpx"
                        :color="selectedIds.has(item._id) ? '#0052d9' : '#c0c4cc'"
                    />
                </view>

                <view v-if="!isSelectionMode" class="result-icon">
                    <t-icon name="chat" size="40rpx" color="#8b8fa3" />
                </view>
                <view class="result-content">
                    <view class="result-title">
                        <template
                            v-for="(part, idx) in highlightText(item.title, keyword)"
                            :key="idx"
                        >
                            <text :class="part.isMatch ? 'highlight' : ''">{{ part.text }}</text>
                        </template>
                    </view>
                    <text v-if="item.lastMessagePreview" class="result-preview">{{ item.lastMessagePreview }}</text>
                </view>
                <text class="result-time">{{ formatTime(item.lastMessageAt) }}</text>
            </view>

            <view class="empty-state" v-if="searched && keyword && displayList.length === 0">
                <t-icon name="search" size="80rpx" color="#dcdfe6" />
                <text class="empty-text">未找到相关会话</text>
            </view>

            <view class="empty-state" v-if="!keyword && !pageLoading && displayList.length === 0">
                <t-icon name="chat" size="80rpx" color="#dcdfe6" />
                <text class="empty-text">暂无会话记录</text>
            </view>
        </scroll-view>

        <!-- 底部删除操作栏 -->
        <view v-if="isSelectionMode" class="bottom-action-bar" :style="{ paddingBottom: (safeAreaBottom + 12) + 'px' }">
            <view class="action-bar-left">
                <text class="action-bar-count">{{ selectedIds.size }} 项已选</text>
            </view>
            <view class="action-bar-right">
                <view
                        class="action-delete-btn"
                        :class="{ 'action-delete-disabled': selectedIds.size === 0 || deleting }"
                        @click="handleDeleteTap"
                    >
                        <t-icon name="delete" size="32rpx" color="#ffffff" />
                        <text class="action-delete-text">{{ deleting ? '删除中...' : '删除' }}</text>
                    </view>
            </view>
        </view>

        <!-- 删除确认弹窗 -->
        <t-dialog
            :visible="showDeleteDialog"
            title="确认删除"
            :content="`确定删除选中的 ${selectedIds.size} 个会话吗？删除后无法恢复。`"
            confirm-btn="删除"
            :cancel-btn="{ content: '取消', variant: 'outline' }"
            @confirm="handleConfirmDelete"
            @cancel="showDeleteDialog = false"
            @close="showDeleteDialog = false"
        />
    </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { fetchConversationList, searchConversations, deleteConversation } from "../../API/LLM/AgentAPI.js";
import formatTimeUtil from "../../util/formatTime.js";

// --- 状态栏高度适配 ---
const systemInfo = uni.getSystemInfoSync();
const statusBarHeight = systemInfo.statusBarHeight || 0;
const safeAreaBottom = systemInfo.safeAreaInsets?.bottom ?? 0;

// --- 搜索逻辑 ---
const keyword = ref("");
const conversationList = ref([]);
const searchResults = ref([]);
const pageLoading = ref(true);
const searching = ref(false);
const searched = ref(false);
let debounceTimer = null;
let searchSeq = 0;

const displayList = computed(() =>
    keyword.value.trim() ? searchResults.value : conversationList.value
);

// --- 多选逻辑 ---
const isSelectionMode = ref(false);
const selectedIds = ref(new Set());
const showDeleteDialog = ref(false);
const deleting = ref(false);

const enterSelectionMode = (id) => {
    selectedIds.value = new Set([id]);
    isSelectionMode.value = true;
};

const exitSelectionMode = () => {
    isSelectionMode.value = false;
    selectedIds.value = new Set();
};

const toggleSelect = (id) => {
    const next = new Set(selectedIds.value);
    if (next.has(id)) {
        next.delete(id);
    } else {
        next.add(id);
    }
    selectedIds.value = next;
    if (next.size === 0) {
        isSelectionMode.value = false;
    }
};

// --- 数据加载 ---
const loadConversationList = async () => {
    try {
        const res = await fetchConversationList();
        conversationList.value = res?.data || [];
    } catch (error) {
        console.error("加载会话列表失败:", error.message);
    } finally {
        pageLoading.value = false;
    }
};

onMounted(() => {
    loadConversationList();
});

// --- 搜索交互 ---
const handleInput = () => {
    clearTimeout(debounceTimer);
    if (!keyword.value.trim()) {
        searchResults.value = [];
        searched.value = false;
        return;
    }
    debounceTimer = setTimeout(() => {
        doSearch(keyword.value.trim());
    }, 300);
};

const handleClear = () => {
    keyword.value = "";
    searchResults.value = [];
    searched.value = false;
    clearTimeout(debounceTimer);
};

const handleBack = () => {
    if (isSelectionMode.value) {
        exitSelectionMode();
        return;
    }
    uni.navigateBack();
};

const handleCancel = () => {
    if (isSelectionMode.value) {
        exitSelectionMode();
    } else {
        uni.navigateBack();
    }
};

const doSearch = async (kw) => {
    const seq = ++searchSeq;
    searching.value = true;
    try {
        const res = await searchConversations(kw);
        if (seq !== searchSeq) return;
        searchResults.value = res?.data || [];
    } catch (error) {
        if (seq !== searchSeq) return;
        console.error("搜索会话失败:", error.message);
        searchResults.value = [];
    } finally {
        if (seq === searchSeq) {
            searching.value = false;
            searched.value = true;
        }
    }
};

// --- 列表交互 ---
const handleSelect = (item) => {
    if (isSelectionMode.value) {
        toggleSelect(item._id);
        return;
    }
    uni.$emit("agent-select-conversation", item._id);
    uni.navigateBack();
};

// --- 触摸跟踪（防止滑动时误触发长按）---
let touchStartX = 0;
let touchStartY = 0;
let touchMoved = false;

const onItemTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchMoved = false;
};

const onItemTouchMove = (e) => {
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartX);
    const dy = Math.abs(touch.clientY - touchStartY);
    if (dx > 10 || dy > 10) {
        touchMoved = true;
    }
};

const onItemTouchEnd = () => {};

const handleLongPress = (item) => {
    if (touchMoved || isSelectionMode.value) return;
    uni.vibrateShort({ type: "medium" });
    enterSelectionMode(item._id);
};

// --- 删除 ---
const handleDeleteTap = () => {
    if (selectedIds.value.size === 0 || deleting.value) return;
    showDeleteDialog.value = true;
};

const handleConfirmDelete = async () => {
    deleting.value = true;
    try {
        const ids = [...selectedIds.value];
        await Promise.all(ids.map((id) => deleteConversation(id)));
        conversationList.value = conversationList.value.filter(
            (item) => !ids.includes(item._id)
        );
        searchResults.value = searchResults.value.filter(
            (item) => !ids.includes(item._id)
        );
        exitSelectionMode();
        uni.$emit("agent-refresh-conversations");
        uni.showToast({ title: "删除成功", icon: "none" ,position: "top"});
    } catch (error) {
        uni.showToast({ title: "删除失败", icon: "none" ,position: "top"});
        console.error("批量删除会话失败:", error.message);
    } finally {
        deleting.value = false;
        showDeleteDialog.value = false;
    }
};

// --- 工具函数 ---
const formatTime = formatTimeUtil.formatChatTime;

const highlightText = (text, kw) => {
    if (!kw || !text) return [{ text: text || "", isMatch: false }];
    const kwLower = kw.toLowerCase();
    const textLower = text.toLowerCase();
    const result = [];
    let lastIndex = 0;
    let index = textLower.indexOf(kwLower);
    while (index !== -1) {
        if (index > lastIndex) {
            result.push({ text: text.substring(lastIndex, index), isMatch: false });
        }
        result.push({ text: text.substring(index, index + kw.length), isMatch: true });
        lastIndex = index + kw.length;
        index = textLower.indexOf(kwLower, lastIndex);
    }
    if (lastIndex < text.length) {
        result.push({ text: text.substring(lastIndex), isMatch: false });
    }
    return result;
};

onUnmounted(() => {
    clearTimeout(debounceTimer);
});
</script>

<style scoped>
.container {
    height: 100vh;
    background: #f6f7f9;
    display: flex;
    flex-direction: column;
}

/* 自定义导航栏 */
.custom-navbar {
    background: #ffffff;
    border-bottom: 1rpx solid rgba(15, 23, 42, 0.06);
    flex-shrink: 0;
}

.navbar-content {
    display: flex;
    align-items: center;
    height: 88rpx;
    padding: 0 16rpx;
    gap: 12rpx;
}

.navbar-left {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
    flex-shrink: 0;
}

.navbar-center {
    flex: 1;
    min-width: 0;
}

.navbar-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16rpx;
    flex-shrink: 0;
}

.cancel-text {
    font-size: 28rpx;
    color: #2d2f36;
    white-space: nowrap;
}

/* 搜索框 */
.nav-search-bar {
    display: flex;
    align-items: center;
    height: 64rpx;
    border-radius: 32rpx;
    background: #f2f3f5;
    padding: 0 20rpx;
    gap: 10rpx;
}

.nav-search-input {
    flex: 1;
    font-size: 28rpx;
    color: #2d2f36;
    height: 64rpx;
    line-height: 64rpx;
}

.nav-search-placeholder {
    color: #8b8fa3;
    font-size: 28rpx;
}

/* 底部操作栏 */
.bottom-action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 32rpx 12rpx;
    background: #ffffff;
    border-top: 1rpx solid rgba(15, 23, 42, 0.08);
    flex-shrink: 0;
}

.action-bar-left {
    display: flex;
    align-items: center;
}

.action-bar-count {
    font-size: 28rpx;
    color: #2d2f36;
    font-weight: 500;
}

.action-bar-right {
    display: flex;
    align-items: center;
}

.action-delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    height: 72rpx;
    padding: 0 40rpx;
    border-radius: 36rpx;
    background: linear-gradient(135deg, #e34d59, #c92a2a);
}

.action-delete-btn:active {
    opacity: 0.85;
}

.action-delete-disabled {
    opacity: 0.4;
}

.action-delete-disabled:active {
    opacity: 0.4;
}

.action-delete-text {
    font-size: 28rpx;
    color: #ffffff;
    font-weight: 500;
}

/* 骨架屏 */
.skeleton-list {
    padding: 16rpx 32rpx;
}

.skeleton-item {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    gap: 20rpx;
    border-bottom: 1rpx solid rgba(15, 23, 42, 0.04);
}

.skeleton-icon {
    width: 44rpx;
    height: 44rpx;
    border-radius: 50%;
    background: #ebeef5;
    flex-shrink: 0;
    animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.skeleton-title {
    height: 28rpx;
    width: 60%;
    border-radius: 6rpx;
    background: #ebeef5;
    animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-preview {
    height: 22rpx;
    width: 80%;
    border-radius: 6rpx;
    background: #ebeef5;
    animation: skeleton-pulse 1.5s ease-in-out 0.15s infinite;
}

@keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}

/* 搜索进度条 */
.searching-bar {
    height: 4rpx;
    background: rgba(15, 23, 42, 0.04);
    overflow: hidden;
}

.searching-bar-inner {
    height: 100%;
    width: 30%;
    background: #2d2f36;
    border-radius: 4rpx;
    animation: searching-slide 1s ease-in-out infinite;
}

@keyframes searching-slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
}

/* 结果列表 */
.result-list {
    flex: 1;
    height: 0;
    min-height: 0;
}

.result-item {
    display: flex;
    align-items: center;
    padding: 28rpx 32rpx;
    gap: 20rpx;
    background: #ffffff;
    border-bottom: 1rpx solid rgba(15, 23, 42, 0.04);
}

.result-item:active {
    background: rgba(15, 23, 42, 0.03);
}

.item-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 4rpx;
}

.result-icon {
    width: 44rpx;
    height: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.result-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    overflow: hidden;
}

.result-title {
    font-size: 30rpx;
    color: #2d2f36;
    font-weight: 500;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.highlight {
    color: #ff6b00;
    font-weight: 600;
}

.result-preview {
    font-size: 24rpx;
    color: #8b8fa3;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.result-time {
    font-size: 22rpx;
    color: #b0b4c0;
    flex-shrink: 0;
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;
    gap: 20rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #8b8fa3;
}
</style>
