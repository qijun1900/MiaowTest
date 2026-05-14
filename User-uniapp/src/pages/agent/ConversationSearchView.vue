<template>
    <view class="container">
        <!-- 搜索栏 -->
        <view class="search-header">
            <view class="search-bar">
                <view class="search-icon-wrapper">
                    <view class="search-icon"></view>
                </view>
                <input
                    class="search-input"
                    type="text"
                    placeholder="搜索会话..."
                    placeholder-class="search-placeholder"
                    :focus="true"
                    :adjust-position="false"
                    v-model="keyword"
                    @input="handleInput"
                />
                <view v-if="keyword" class="clear-btn" @click="handleClear">
                    <uni-icons type="clear" size="20" color="#c0c4cc"></uni-icons>
                </view>
            </view>
            <view class="cancel-btn" @click="handleCancel">
                <text class="cancel-text">取消</text>
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
            <!-- 搜索中提示 -->
            <view class="searching-bar" v-if="searching">
                <view class="searching-bar-inner"></view>
            </view>

            <view
                class="result-item"
                v-for="item in displayList"
                :key="item._id"
                @click="handleSelect(item)"
            >
                <view class="result-icon">
                    <uni-icons type="chat" size="20" color="#8b8fa3"></uni-icons>
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

            <!-- 搜索无结果 -->
            <view class="empty-state" v-if="searched && keyword && displayList.length === 0">
                <uni-icons type="search" size="48" color="#dcdfe6"></uni-icons>
                <text class="empty-text">未找到相关会话</text>
            </view>

            <!-- 列表为空 -->
            <view class="empty-state" v-if="!keyword && !pageLoading && displayList.length === 0">
                <uni-icons type="chat" size="48" color="#dcdfe6"></uni-icons>
                <text class="empty-text">暂无会话记录</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { fetchConversationList, searchConversations } from "../../API/LLM/AgentAPI.js";

const keyword = ref("");
const conversationList = ref([]);
const searchResults = ref([]);
const pageLoading = ref(true);
const searching = ref(false);
const searched = ref(false);
let debounceTimer = null;
let searchSeq = 0;

const displayList = computed(() => {
    return keyword.value.trim() ? searchResults.value : conversationList.value;
});

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

const handleCancel = () => {
    uni.navigateBack();
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

const handleSelect = (item) => {
    uni.$emit("agent-select-conversation", item._id);
    uni.navigateBack();
};

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

const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
        const h = date.getHours().toString().padStart(2, "0");
        const m = date.getMinutes().toString().padStart(2, "0");
        return `${h}:${m}`;
    }
    if (diffDays === 1) return "昨天";
    if (diffDays < 7) return `${diffDays}天前`;
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${month}-${day}`;
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

/* 搜索栏 */
.search-header {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    gap: 16rpx;
    background: #ffffff;
    border-bottom: 1rpx solid rgba(15, 23, 42, 0.06);
}

.search-bar {
    flex: 1;
    height: 72rpx;
    border-radius: 36rpx;
    background: #f2f3f5;
    display: flex;
    align-items: center;
    padding: 0 24rpx;
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
    width: 18rpx;
    height: 18rpx;
    border: 3rpx solid #8b8fa3;
    border-radius: 50%;
    position: relative;
}

.search-icon::after {
    content: "";
    position: absolute;
    right: -5rpx;
    bottom: -5rpx;
    width: 10rpx;
    height: 3rpx;
    background: #8b8fa3;
    border-radius: 3rpx;
    transform: rotate(45deg);
}

.search-input {
    flex: 1;
    font-size: 30rpx;
    color: #2d2f36;
    height: 72rpx;
    line-height: 72rpx;
}

.search-placeholder {
    color: #8b8fa3;
    font-size: 30rpx;
}

.clear-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rpx;
}

.cancel-btn {
    padding: 8rpx 0;
    flex-shrink: 0;
}

.cancel-text {
    font-size: 30rpx;
    color: #2d2f36;
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
