<template>
    <ThemeProvider>
    <view class="page" :style="{ paddingBottom: safeAreaInfo.bottom + 'px' }">
        <!-- 导航栏 -->
        <view class="top-wrapper">
            <view class="custom-navbar" :style="customNavbarStyle">
                <view class="nav-row" :style="navRowStyle">
                    <view class="nav-left" @click="handleBack">
                        <t-icon name="chevron-left" size="44rpx" color="var(--app-text-primary)"></t-icon>
                    </view>
                    <text class="nav-title">{{ isSelectMode ? `已选 ${selectedIds.length} 项` : bookTitle }}</text>
                    <view class="nav-right">
                        <view v-if="isSelectMode" class="nav-action" @click="exitSelectMode">
                            <t-icon name="close" size="40rpx" color="var(--app-text-primary)"></t-icon>
                        </view>
                        <view v-else class="nav-actions">
                            <view class="nav-action" @click="toggleShowMeanings">
                                <t-icon
                                    :name="showAllMeanings ? 'browse' : 'browse-off'"
                                    size="38rpx"
                                    :color="showAllMeanings ? 'var(--app-brand)' : 'var(--app-text-secondary)'"
                                ></t-icon>
                            </view>
                            <view class="nav-action" @click="handleAddWord">
                                <t-icon name="add" size="40rpx" color="var(--app-brand)"></t-icon>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 搜索 + 筛选 -->
        <view class="filter-section">
            <view class="search-bar">
                <t-icon name="search" size="32rpx" color="var(--app-text-placeholder)"></t-icon>
                <input
                    class="search-input"
                    v-model="keyword"
                    placeholder="搜索单词或释义"
                    :maxlength="50"
                    @input="handleSearchInput"
                />
                <t-icon
                    v-if="keyword"
                    name="close-circle-filled"
                    size="32rpx"
                    color="var(--app-text-placeholder)"
                    @click="clearSearch"
                ></t-icon>
            </view>
            <scroll-view class="filter-tags" scroll-x>
                <view class="tag-list">
                    <view
                        class="filter-tag"
                        :class="{ active: activeFilter === 'all' }"
                        @click="setFilter('all')"
                    >
                        <text>全部 {{ totalCount }}</text>
                    </view>
                    <view
                        class="filter-tag"
                        :class="{ active: activeFilter === 'marked' }"
                        @click="setFilter('marked')"
                    >
                        <t-icon name="star-filled" size="24rpx" :color="activeFilter === 'marked' ? 'var(--app-brand)' : 'var(--app-text-secondary)'"></t-icon>
                        <text>{{ markedCount }}</text>
                    </view>
                    <view
                        v-for="tagItem in tagOptions"
                        :key="tagItem"
                        class="filter-tag"
                        :class="{ active: activeFilter === tagItem }"
                        @click="setFilter(tagItem)"
                    >
                        <text>{{ tagItem }}</text>
                    </view>
                </view>
            </scroll-view>
        </view>

        <!-- 单词列表 -->
        <scroll-view class="main-scroll" scroll-y @scrolltolower="handleLoadMore">
            <!-- 骨架屏 -->
            <view v-if="loading && !wordList.length" class="word-list">
                <view v-for="i in 6" :key="`skeleton-${i}`" class="word-card skeleton-card">
                    <view class="skeleton-line skeleton-shimmer" style="width: 40%; height: 36rpx;"></view>
                    <view class="skeleton-line skeleton-shimmer" style="width: 30%; height: 26rpx; margin-top: 12rpx;"></view>
                    <view class="skeleton-line skeleton-shimmer" style="width: 60%; height: 26rpx; margin-top: 12rpx;"></view>
                </view>
            </view>

            <!-- 空状态 -->
            <view v-else-if="!loading && !wordList.length" class="empty-state">
                <t-icon name="book" size="100rpx" color="var(--app-text-placeholder)"></t-icon>
                <text class="empty-text" v-if="keyword">没有找到匹配的单词</text>
                <text class="empty-text" v-else-if="activeFilter === 'marked'">还没有收藏的单词</text>
                <text class="empty-text" v-else>还没有单词</text>
                <view v-if="!keyword && activeFilter === 'all'" class="empty-btn" @click="handleAddWord">
                    <t-icon name="add" size="28rpx" color="#fff"></t-icon>
                    <text>添加单词</text>
                </view>
            </view>

            <!-- 单词卡片列表 -->
            <view v-else class="word-list">
                <view
                    v-for="(item, index) in wordList"
                    :key="item._id || index"
                    class="word-card"
                    :class="{ 'card-selected': isSelectMode && selectedIds.includes(item._id) }"
                    @click="handleCardClick(item)"
                    @longpress="handleLongPress(item)"
                >
                    <!-- 选择模式复选框 -->
                    <view v-if="isSelectMode" class="card-checkbox">
                        <t-icon
                            :name="selectedIds.includes(item._id) ? 'check-circle-filled' : 'circle'"
                            size="36rpx"
                            :color="selectedIds.includes(item._id) ? 'var(--app-brand)' : 'var(--app-text-placeholder)'"
                        ></t-icon>
                    </view>

                    <!-- 收藏按钮 -->
                    <view v-if="!isSelectMode" class="mark-btn" @click.stop="handleToggleMarked(item)">
                        <t-icon
                            :name="item.isMarked ? 'star-filled' : 'star'"
                            size="36rpx"
                            :color="item.isMarked ? 'var(--app-warning)' : 'var(--app-text-placeholder)'"
                        ></t-icon>
                    </view>

                    <!-- 单词信息 -->
                    <view class="word-main">
                        <view class="word-header">
                            <text class="word-text">{{ item.word }}</text>
                            <text v-if="item.phonetic" class="phonetic-text">{{ item.phonetic }}</text>
                        </view>

                        <!-- 释义：全局显示 或 折叠提示 -->
                        <text v-if="showAllMeanings" class="meaning-text">{{ item.meaning || '暂无释义' }}</text>
                        <text v-else class="meaning-hint">点击查看释义</text>

                        <!-- 展开区域 -->
                        <view v-if="expandedId === item._id" class="expand-area">
                            <view v-if="!showAllMeanings && item.meaning" class="expand-meaning">
                                <text class="expand-meaning-text">{{ item.meaning }}</text>
                            </view>
                            <view v-if="item.example" class="example-box">
                                <text class="example-label">例句</text>
                                <text class="example-text">{{ item.example }}</text>
                            </view>
                            <view v-if="item.tags && item.tags.length" class="tags-row">
                                <view v-for="tag in item.tags" :key="tag" class="word-tag">
                                    <text>{{ tag }}</text>
                                </view>
                            </view>
                            <view class="action-row">
                                <view class="action-btn" @click.stop="handleEditWord(item)">
                                    <t-icon name="edit" size="28rpx" color="var(--app-brand)"></t-icon>
                                    <text>编辑</text>
                                </view>
                                <view class="action-btn" @click.stop="handleDeleteWord(item)">
                                    <t-icon name="delete" size="28rpx" color="var(--app-danger)"></t-icon>
                                    <text>删除</text>
                                </view>
                                <view class="action-btn action-btn-right" @click.stop="openDetailPopup(item)">
                                    <t-icon name="info-circle" size="28rpx" color="var(--app-warning)"></t-icon>
                                    <text>详情</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 加载更多 -->
                <view v-if="loading && wordList.length" class="loading-more">
                    <view class="loading-spinner"></view>
                    <text>加载中...</text>
                </view>
                <view v-else-if="!hasMore && wordList.length" class="no-more">
                    <text>— 没有更多了 —</text>
                </view>
            </view>
        </scroll-view>

        <!-- 选择模式底部操作栏 -->
        <view v-if="isSelectMode" class="select-bottom-bar" :style="{ paddingBottom: safeAreaInfo.bottom + 'px' }">
            <view class="select-bar-inner">
                <view class="select-all-btn" @click="toggleSelectAll">
                    <t-icon
                        :name="isAllSelected ? 'check-circle-filled' : 'circle'"
                        size="40rpx"
                        :color="isAllSelected ? 'var(--app-brand)' : 'var(--app-text-placeholder)'"
                    ></t-icon>
                    <text class="select-all-text">全选</text>
                </view>
                <view
                    class="delete-btn"
                    :class="{ 'delete-btn-disabled': selectedIds.length === 0 || deleting }"
                    @click="handleBatchDelete"
                >
                    <t-icon name="delete" size="28rpx" color="var(--app-bg-container)"></t-icon>
                    <text class="delete-btn-text">删除 ({{ selectedIds.length }})</text>
                </view>
            </view>
        </view>

        <!-- 删除确认弹窗 -->
        <t-dialog
            :visible="showDeleteDialog"
            title="确认删除"
            :content="deleteDialogContent"
            :confirm-btn="{ content: '删除', theme: 'danger' }"
            cancel-btn="取消"
            :show-overlay="true"
            :z-index="12000"
            @confirm="confirmDelete"
            @cancel="showDeleteDialog = false"
            @close="showDeleteDialog = false"
        />

        <!-- 单词详情弹窗（可拖拽） -->
        <view v-if="showDetailPopup" class="detail-overlay" @click.self="closeDetailPopup">
            <view
                class="detail-sheet"
                :class="{ 'detail-sheet-dragging': isDragging }"
                :style="{ height: detailSheetHeight + 'vh' }"
            >
                <!-- 拖拽手柄 -->
                <view class="detail-handle" @touchstart="onHandleTouchStart" @touchmove.prevent="onHandleTouchMove" @touchend="onHandleTouchEnd">
                    <view class="detail-handle-bar"></view>
                </view>

                <!-- 关闭按钮 -->
                <view class="detail-header">
                    <view></view>
                    <t-icon name="close" size="40rpx" color="var(--app-text-secondary)" @click="closeDetailPopup"></t-icon>
                </view>

                <!-- 可滚动内容区 -->
                <scroll-view class="detail-scroll" scroll-y>
                    <!-- 基本信息 -->
                    <view v-if="detailWord" class="detail-basic">
                        <view class="detail-word-header">
                            <text class="detail-word-text">{{ detailWord.word }}</text>
                            <text v-if="detailWord.phonetic" class="detail-phonetic">{{ detailWord.phonetic }}</text>
                        </view>
                        <text class="detail-meaning">{{ detailWord.meaning || '暂无释义' }}</text>
                        <view v-if="detailWord.example" class="detail-example">
                            <text class="detail-example-label">例句</text>
                            <text class="detail-example-text">{{ detailWord.example }}</text>
                        </view>
                    </view>

                    <!-- AI 扩展学习 -->
                    <view class="detail-ai-section">
                        <view class="detail-ai-title">
                            <t-icon name="lightbulb" size="32rpx" color="var(--app-warning)"></t-icon>
                            <text>AI 扩展学习</text>
                        </view>
                        <view class="detail-ai-btns">
                            <view class="detail-ai-btn" @click="fetchDetailAi('all')">
                                <text>🧠 全部</text>
                            </view>
                            <view class="detail-ai-btn" @click="fetchDetailAi('mnemonic')">
                                <text>💡 助记法</text>
                            </view>
                            <view class="detail-ai-btn" @click="fetchDetailAi('root')">
                                <text>📖 词根</text>
                            </view>
                            <view class="detail-ai-btn" @click="fetchDetailAi('synonyms')">
                                <text>🔗 近义词</text>
                            </view>
                        </view>
                        <view v-if="detailAiContent" class="detail-ai-result">
                            <ContentRenderer :content="detailAiContent" :isMarkdown="true" />
                        </view>
                        <view v-else-if="detailAiLoading" class="detail-ai-loading">
                            <view class="loading-spinner"></view>
                            <text>AI 生成中...</text>
                        </view>
                    </view>

                    <!-- 底部安全区 -->
                    <view :style="{ height: safeAreaInfo.bottom + 20 + 'px' }"></view>
                </scroll-view>
            </view>
        </view>
    </view>
    </ThemeProvider>
</template>

<script setup>
import ThemeProvider from "../../../components/core/ThemeProvider.vue";
import ContentRenderer from "../../../components/common/ContentRenderer.vue";
import { computed, onBeforeUnmount, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { useNavBarSafeArea } from "../../../composables/useNavBarSafeArea";
import {
    getWordsAPI,
    deleteWordAPI,
    batchDeleteWordsAPI,
    toggleMarkedAPI,
    aiWordDetailAPI,
} from "../../../API/Tools/WordListAPI";

const { safeAreaInfo, customNavbarStyle, navRowStyle } = useNavBarSafeArea({
    reserveMenuButtonRight: true,
    rightPaddingExtra: 8,
});

// ---- 路由参数 ----
const bookId = ref("");
const bookTitle = ref("单词列表");

// ---- 列表状态 ----
const wordList = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const hasMore = ref(true);
const PAGE_SIZE = 20;
const totalCount = ref(0);
const markedCount = ref(0);

// ---- 搜索/筛选 ----
const keyword = ref("");
const activeFilter = ref("all");
const tagOptions = ref([]);
let searchTimer = null;

// ---- 释义显示 ----
const showAllMeanings = ref(false);
const expandedId = ref("");

const toggleShowMeanings = () => {
    showAllMeanings.value = !showAllMeanings.value;
};

// ---- 选择模式 ----
const isSelectMode = ref(false);
const selectedIds = ref([]);
const deleting = ref(false);
const showDeleteDialog = ref(false);
const deleteTarget = ref(null);

const isAllSelected = computed(() => {
    return wordList.value.length > 0 && selectedIds.value.length === wordList.value.length;
});

const deleteDialogContent = computed(() => {
    if (deleteTarget.value) {
        return `确定要删除单词「${deleteTarget.value.word}」吗？`;
    }
    return `确定要删除选中的 ${selectedIds.value.length} 个单词吗？`;
});

// ---- 详情弹窗 ----
const showDetailPopup = ref(false);
const detailWord = ref(null);
const detailAiContent = ref("");
const detailAiLoading = ref(false);
const detailSheetHeight = ref(65);
const isDragging = ref(false);
let dragStartY = 0;
let dragStartHeight = 0;

const openDetailPopup = (item) => {
    detailWord.value = item;
    detailAiContent.value = "";
    detailAiLoading.value = false;
    showDetailPopup.value = true;
};

const closeDetailPopup = () => {
    showDetailPopup.value = false;
    detailWord.value = null;
    detailAiContent.value = "";
};

const onHandleTouchStart = (e) => {
    isDragging.value = true;
    dragStartY = e.touches[0].clientY;
    dragStartHeight = detailSheetHeight.value;
};

const onHandleTouchMove = (e) => {
    if (!isDragging.value) return;
    const clientY = e.touches[0].clientY;
    const sysInfo = uni.getSystemInfoSync();
    const windowHeight = sysInfo.windowHeight || 667;
    const deltaY = dragStartY - clientY;
    const deltaVh = (deltaY / windowHeight) * 100;
    const newHeight = Math.min(90, Math.max(25, dragStartHeight + deltaVh));
    detailSheetHeight.value = newHeight;
};

const onHandleTouchEnd = () => {
    isDragging.value = false;
    const h = detailSheetHeight.value;
    if (h < 35) {
        closeDetailPopup();
    } else if (h < 55) {
        detailSheetHeight.value = 45;
    } else if (h < 75) {
        detailSheetHeight.value = 65;
    } else {
        detailSheetHeight.value = 85;
    }
};

const fetchDetailAi = async (type) => {
    if (!detailWord.value?.word || detailAiLoading.value) return;
    detailAiContent.value = "";
    detailAiLoading.value = true;

    try {
        const res = await aiWordDetailAPI(detailWord.value.word, type);
        if (res.code === 200 && res.data?.content) {
            detailAiContent.value = res.data.content;
        } else {
            detailAiContent.value = "AI 生成失败，请稍后重试";
        }
    } catch (error) {
        detailAiContent.value = "AI 生成失败，请稍后重试";
    } finally {
        detailAiLoading.value = false;
    }
};

// ---- 数据获取 ----
const fetchWords = async ({ append = false } = {}) => {
    if (loading.value) return;
    loading.value = true;

    try {
        const params = {
            page: append ? currentPage.value : 1,
            pageSize: PAGE_SIZE,
            keyword: keyword.value,
        };

        if (activeFilter.value === "marked") {
            params.isMarked = true;
        } else if (activeFilter.value !== "all") {
            params.tag = activeFilter.value;
        }

        const res = await getWordsAPI(bookId.value, params);
        if (res.code !== 200) throw new Error(res.message || "获取失败");

        const data = res.data || {};
        const list = data.list || [];

        if (append) {
            wordList.value = [...wordList.value, ...list];
        } else {
            wordList.value = list;
        }

        totalCount.value = data.pagination?.total || 0;
        markedCount.value = data.markedCount || 0;
        hasMore.value = data.pagination?.hasMore || false;

        if (append) {
            currentPage.value++;
        } else {
            currentPage.value = 2;
        }

        buildTagOptions();
    } catch (error) {
        console.error("获取单词列表失败:", error);
        if (!append) wordList.value = [];
    } finally {
        loading.value = false;
    }
};

const buildTagOptions = () => {
    const tags = new Set();
    wordList.value.forEach((item) => {
        (item.tags || []).forEach((t) => tags.add(t));
    });
    tagOptions.value = Array.from(tags);
};

// ---- 搜索 ----
const handleSearchInput = () => {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        fetchWords();
    }, 300);
};

const clearSearch = () => {
    keyword.value = "";
    fetchWords();
};

// ---- 筛选 ----
const setFilter = (filter) => {
    activeFilter.value = filter;
    fetchWords();
};

// ---- 加载更多 ----
const handleLoadMore = () => {
    if (!hasMore.value || loading.value) return;
    fetchWords({ append: true });
};

// ---- 展开/收起 ----
const toggleExpand = (item) => {
    expandedId.value = expandedId.value === item._id ? "" : item._id;
};

// ---- 收藏切换 ----
const handleToggleMarked = async (item) => {
    try {
        const res = await toggleMarkedAPI({ id: item._id });
        if (res.code !== 200) throw new Error(res.message);
        item.isMarked = res.data?.isMarked ?? !item.isMarked;
        markedCount.value += item.isMarked ? 1 : -1;
    } catch (error) {
        uni.showToast({ title: "操作失败", icon: "none" });
    }
};

// ---- 选择模式 ----
const enterSelectMode = (firstId) => {
    isSelectMode.value = true;
    selectedIds.value = [firstId];
};

const exitSelectMode = () => {
    isSelectMode.value = false;
    selectedIds.value = [];
};

const toggleSelect = (id) => {
    if (!id) return;
    const idx = selectedIds.value.indexOf(id);
    if (idx === -1) {
        selectedIds.value = [...selectedIds.value, id];
    } else {
        selectedIds.value = selectedIds.value.filter((i) => i !== id);
    }
    uni.vibrateShort({ type: "light" });
};

const toggleSelectAll = () => {
    if (isAllSelected.value) {
        selectedIds.value = [];
    } else {
        selectedIds.value = wordList.value.map((item) => item._id);
    }
};

const handleLongPress = (item) => {
    if (!item?._id) return;
    uni.vibrateShort({ type: "heavy" });
    if (isSelectMode.value) {
        toggleSelect(item._id);
    } else {
        enterSelectMode(item._id);
    }
};

const handleCardClick = (item) => {
    if (isSelectMode.value) {
        toggleSelect(item._id);
    } else {
        toggleExpand(item);
    }
};

// ---- 删除 ----
const handleDeleteWord = (item) => {
    deleteTarget.value = item;
    showDeleteDialog.value = true;
};

const handleBatchDelete = () => {
    if (selectedIds.value.length === 0 || deleting.value) return;
    deleteTarget.value = null;
    showDeleteDialog.value = true;
};

const confirmDelete = async () => {
    deleting.value = true;
    try {
        if (deleteTarget.value) {
            const res = await deleteWordAPI({ id: deleteTarget.value._id, wordBookId: bookId.value });
            if (res.code !== 200) throw new Error(res.message);
            wordList.value = wordList.value.filter((w) => w._id !== deleteTarget.value._id);
            totalCount.value = Math.max(0, totalCount.value - 1);
            if (deleteTarget.value.isMarked) markedCount.value = Math.max(0, markedCount.value - 1);
            uni.showToast({ title: "删除成功", icon: "success" });
        } else {
            const res = await batchDeleteWordsAPI({ ids: selectedIds.value, wordBookId: bookId.value });
            if (res.code !== 200) throw new Error(res.message);
            const deletedIds = new Set(selectedIds.value);
            wordList.value = wordList.value.filter((w) => !deletedIds.has(w._id));
            totalCount.value = Math.max(0, totalCount.value - (res.data?.deletedCount || 0));
            uni.showToast({ title: `已删除 ${res.data?.deletedCount || 0} 个单词`, icon: "success" });
            exitSelectMode();
        }
        showDeleteDialog.value = false;
        deleteTarget.value = null;
    } catch (error) {
        uni.showToast({ title: error?.message || "删除失败", icon: "none" });
    } finally {
        deleting.value = false;
    }
};

// ---- 导航 ----
const handleBack = () => {
    if (isSelectMode.value) {
        exitSelectMode();
        return;
    }
    uni.navigateBack();
};

const handleAddWord = () => {
    uni.navigateTo({
        url: `/pages/tools/WordBookToolView_children/WordEditView?bookId=${bookId.value}`,
    });
};

const handleEditWord = (item) => {
    uni.navigateTo({
        url: `/pages/tools/WordBookToolView_children/WordEditView?bookId=${bookId.value}&id=${item._id}`,
    });
};

// ---- 生命周期 ----
const handleRefreshEvent = () => {
    fetchWords();
};

onLoad((options) => {
    bookId.value = options?.id || options?.bookId || "";
    bookTitle.value = decodeURIComponent(options?.title || "单词列表");
    uni.$on("wordList:refresh", handleRefreshEvent);
    fetchWords();
});

onShow(() => {
    if (!wordList.value.length && !loading.value) {
        fetchWords();
    }
});

onBeforeUnmount(() => {
    uni.$off("wordList:refresh", handleRefreshEvent);
    if (searchTimer) clearTimeout(searchTimer);
});
</script>

<style scoped>
.page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--app-bg-page);
}

.top-wrapper {
    background: var(--app-bg-page);
    border-bottom: 1rpx solid var(--app-border);
    box-shadow: 0 4rpx 18rpx rgba(0, 0, 0, 0.04);
    z-index: 30;
}

.custom-navbar { padding-left: 18rpx; padding-right: 18rpx; box-sizing: border-box; }
.nav-row { display: flex; align-items: center; justify-content: space-between; width: 100%; box-sizing: border-box; }
.nav-left { width: 80rpx; flex-shrink: 0; display: flex; align-items: center; }
.nav-title { flex: 1; text-align: center; font-size: calc(34rpx * var(--app-font-scale, 1)); color: var(--app-text-primary); font-weight: 700; padding: 0 12rpx; }
.nav-right { flex-shrink: 0; display: flex; justify-content: flex-end; }

.nav-actions {
    display: flex;
    gap: 12rpx;
}

.nav-action {
    width: 60rpx; height: 60rpx; border-radius: 30rpx;
    border: 2rpx solid var(--app-border); background: var(--app-bg-container);
    display: flex; align-items: center; justify-content: center;
}
.nav-action:active { transform: scale(0.93); }

/* 筛选区 */
.filter-section {
    background: var(--app-bg-container);
    padding: 16rpx 24rpx 0;
}

.search-bar {
    display: flex;
    align-items: center;
    gap: 12rpx;
    background: var(--app-bg-secondary);
    border-radius: 14rpx;
    padding: 0 20rpx;
    height: 72rpx;
}

.search-input {
    flex: 1;
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
}

.filter-tags {
    margin-top: 12rpx;
    white-space: nowrap;
}

.tag-list {
    display: inline-flex;
    gap: 12rpx;
    padding-bottom: 16rpx;
}

.filter-tag {
    display: inline-flex;
    align-items: center;
    gap: 6rpx;
    padding: 8rpx 20rpx;
    border-radius: 999rpx;
    background: var(--app-bg-secondary);
    border: 1rpx solid transparent;
    transition: background 0.2s ease, border-color 0.2s ease;
}

.filter-tag text {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    white-space: nowrap;
}

.filter-tag.active {
    background: var(--app-brand-light);
    border-color: var(--app-brand);
}

.filter-tag.active text {
    color: var(--app-brand);
    font-weight: 600;
}

/* 列表 */
.main-scroll { flex: 1; min-height: 0; }

.word-list { padding: 16rpx 24rpx; }

.word-card {
    position: relative;
    background: var(--app-bg-container);
    border-radius: 20rpx;
    border: 2rpx solid var(--app-border);
    padding: 24rpx;
    margin-bottom: 16rpx;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
}

.word-card:active { transform: scale(0.99); }

.word-card.card-selected {
    border-color: var(--app-brand);
    box-shadow: 0 0 0 4rpx color-mix(in srgb, var(--app-brand) 16%, transparent);
}

.card-checkbox {
    position: absolute; top: 16rpx; right: 16rpx; z-index: 10;
    width: 48rpx; height: 48rpx;
    display: flex; align-items: center; justify-content: center;
}

.mark-btn {
    position: absolute; top: 16rpx; right: 16rpx; z-index: 5;
    width: 56rpx; height: 56rpx;
    display: flex; align-items: center; justify-content: center;
}

.word-main { position: relative; z-index: 1; }

.word-header {
    display: flex;
    align-items: baseline;
    gap: 12rpx;
}

.word-text {
    font-size: calc(36rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 700;
}

.phonetic-text {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-placeholder);
}

.meaning-text {
    display: block;
    margin-top: 8rpx;
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 500;
    line-height: 1.5;
}

.meaning-hint {
    display: block;
    margin-top: 8rpx;
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-placeholder);
    font-weight: 400;
    line-height: 1.5;
}

/* 展开区域 */
.expand-area {
    margin-top: 16rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid var(--app-border);
    animation: fadeSlideDown 0.2s ease;
}

@keyframes fadeSlideDown {
    from { opacity: 0; transform: translateY(-8rpx); }
    to { opacity: 1; transform: translateY(0); }
}

.expand-meaning {
    margin-bottom: 12rpx;
}

.expand-meaning-text {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 500;
    line-height: 1.5;
}

.example-box { margin-bottom: 12rpx; }

.example-label {
    font-size: calc(22rpx * var(--app-font-scale, 1));
    color: var(--app-brand);
    font-weight: 600;
    margin-bottom: 4rpx;
    display: block;
}

.example-text {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    line-height: 1.6;
    font-style: italic;
}

.tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-bottom: 12rpx;
}

.word-tag {
    padding: 4rpx 14rpx;
    border-radius: 999rpx;
    background: var(--app-brand-light);
}

.word-tag text {
    font-size: calc(22rpx * var(--app-font-scale, 1));
    color: var(--app-brand);
}

.action-row { display: flex; gap: 24rpx; align-items: center; }
.action-btn-right { margin-left: auto; }

.action-btn {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 8rpx 0;
}

.action-btn text {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

/* 骨架屏 */
.skeleton-card { pointer-events: none; }
.skeleton-line { border-radius: 8rpx; }

.skeleton-shimmer {
    background: linear-gradient(110deg, var(--app-bg-secondary) 8%, color-mix(in srgb, var(--app-bg-container) 95%, transparent) 18%, var(--app-bg-secondary) 33%);
    background-size: 220% 100%;
    animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
    from { background-position: 100% 0; }
    to { background-position: -100% 0; }
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 40rpx;
    gap: 20rpx;
}

.empty-text {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

.empty-btn {
    margin-top: 16rpx;
    padding: 16rpx 40rpx;
    border-radius: 999rpx;
    background: var(--app-brand);
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.empty-btn text {
    color: #fff;
    font-size: calc(28rpx * var(--app-font-scale, 1));
    font-weight: 600;
}

/* 加载更多 */
.loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 24rpx;
}

.loading-more text {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

.loading-spinner {
    width: 32rpx; height: 32rpx;
    border: 3rpx solid var(--app-border);
    border-top-color: var(--app-brand);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.no-more { text-align: center; padding: 24rpx; }

.no-more text {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-placeholder);
}

/* 选择模式底部栏 */
.select-bottom-bar {
    background: var(--app-bg-container);
    border-top: 1rpx solid var(--app-border);
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
    z-index: 100;
    flex-shrink: 0;
}

.select-bar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 30rpx;
    gap: 24rpx;
    width: 100%;
    box-sizing: border-box;
}

.select-all-btn {
    display: flex;
    align-items: center;
    gap: 10rpx;
    padding: 8rpx 0;
    flex-shrink: 0;
}

.select-all-text {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 500;
}

.delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    height: 76rpx;
    padding: 0 36rpx;
    border-radius: 38rpx;
    background: linear-gradient(135deg, var(--app-danger) 0%, color-mix(in srgb, var(--app-danger) 80%, #000) 100%);
    box-shadow: 0 6rpx 20rpx color-mix(in srgb, var(--app-danger) 30%, transparent);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    flex-shrink: 0;
}

.delete-btn:active { transform: scale(0.96); }
.delete-btn-disabled { opacity: 0.45; pointer-events: none; }

.delete-btn-text {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: #fff;
    font-weight: 600;
    white-space: nowrap;
}

/* 详情弹窗（可拖拽） */
.detail-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 11600;
    display: flex;
    align-items: flex-end;
}

.detail-sheet {
    width: 100%;
    background: var(--app-bg-container);
    border-radius: 28rpx 28rpx 0 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    will-change: height;
    transition: height 0.25s cubic-bezier(0.2, 0, 0, 1);
}

.detail-sheet.detail-sheet-dragging {
    transition: none;
}

.detail-handle {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24rpx 0 16rpx;
    cursor: grab;
}

.detail-handle-bar {
    width: 72rpx;
    height: 10rpx;
    border-radius: 5rpx;
    background: var(--app-border);
}

.detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8rpx 28rpx 16rpx;
    border-bottom: 1rpx solid var(--app-border);
}

.detail-header-title {
    font-size: calc(32rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 700;
}

.detail-scroll {
    flex: 1;
    min-height: 0;
}

.detail-basic {
    padding: 24rpx 28rpx;
    border-bottom: 1rpx solid var(--app-border);
}

.detail-word-header {
    display: flex;
    align-items: baseline;
    gap: 12rpx;
    margin-bottom: 8rpx;
}

.detail-word-text {
    font-size: calc(40rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 700;
}

.detail-phonetic {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

.detail-meaning {
    display: block;
    font-size: calc(30rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 500;
    line-height: 1.5;
    margin-bottom: 12rpx;
}

.detail-example {
    margin-top: 12rpx;
}

.detail-example-label {
    display: block;
    font-size: calc(22rpx * var(--app-font-scale, 1));
    color: var(--app-brand);
    font-weight: 600;
    margin-bottom: 4rpx;
}

.detail-example-text {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    line-height: 1.6;
    font-style: italic;
}

.detail-ai-section {
    margin: 20rpx 28rpx;
    background: var(--app-bg-secondary);
    border-radius: 16rpx;
    padding: 20rpx;
}

.detail-ai-title {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 16rpx;
}

.detail-ai-title text {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 600;
}

.detail-ai-btns {
    display: flex;
    gap: 12rpx;
    margin-bottom: 16rpx;
}

.detail-ai-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14rpx 0;
    border-radius: 12rpx;
    background: var(--app-bg-container);
    border: 1rpx solid var(--app-border);
}

.detail-ai-btn text {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    white-space: nowrap;
}

.detail-ai-btn:active {
    background: var(--app-brand-light);
    border-color: var(--app-brand);
}

.detail-ai-result {
    background: var(--app-bg-container);
    border-radius: 12rpx;
    padding: 20rpx;
}

.detail-ai-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 32rpx;
}

.detail-ai-loading text {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}
</style>
