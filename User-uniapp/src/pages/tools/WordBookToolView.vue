<template>
    <ThemeProvider>
    <view class="page" :style="{ paddingBottom: safeAreaInfo.bottom + 'px' }">
        <view class="top-wrapper">
            <view class="custom-navbar" :style="customNavbarStyle">
                <view class="nav-row" :style="navRowStyle">
                    <view class="nav-left" @click="handleBack">
                        <t-icon name="chevron-left" size="44rpx" color="var(--app-text-primary)"></t-icon>
                    </view>
                    <text class="nav-title">{{ isSelectMode ? `已选 ${selectedIds.length} 项` : '喵喵单词本' }}</text>
                    <view class="nav-right">
                        <view v-if="isSelectMode" class="nav-action" @click="exitSelectMode">
                            <t-icon name="close" size="40rpx" color="var(--app-text-primary)"></t-icon>
                        </view>
                        <view v-else class="nav-action" @click="handleCreateBook">
                            <t-icon name="add" size="40rpx" color="#e67e22"></t-icon>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <scroll-view class="main-scroll" scroll-y>
            <view class="scroll-content">
                <view class="bg-blob blob-1"></view>
                <view class="bg-blob blob-2"></view>

                <!-- Hero 区域 -->
                <view class="hero" v-if="!isSelectMode">
                    <view class="hero-left">
                        <view class="section-header">
                            <view class="section-dot"></view>
                            <text class="section-title">所有单词本</text>
                        </view>
                        <text class="hero-subtitle">积累词汇，夯实你的语言基础</text>
                    </view>
                    <view class="hero-stat">
                        <text class="hero-stat-value">{{ wordBookList.length }}</text>
                        <text class="hero-stat-label">个单词本</text>
                    </view>
                </view>

                <!-- 选择模式提示条 -->
                <view v-if="isSelectMode" class="select-hint-bar">
                    <t-icon name="info-circle" size="32rpx" color="var(--app-brand)"></t-icon>
                    <text class="select-hint-text">点击卡片可选中或取消，选中后可批量删除</text>
                </view>

                <!-- 骨架屏 loading -->
                <view v-if="loading" class="card-list skeleton-list">
                    <view
                        v-for="index in skeletonCount"
                        :key="`skeleton-${index}`"
                        class="wordbook-card skeleton-card"
                    >
                        <view class="skeleton-aura"></view>
                        <view class="card-top">
                            <view class="skeleton-pill skeleton-shimmer"></view>
                        </view>
                        <view class="card-content skeleton-content">
                            <view class="skeleton-title skeleton-shimmer"></view>
                            <view class="skeleton-desc skeleton-shimmer"></view>
                            <view class="skeleton-desc skeleton-desc-short skeleton-shimmer"></view>
                        </view>
                        <view class="card-footer skeleton-footer">
                            <view class="skeleton-icon skeleton-shimmer"></view>
                            <view class="skeleton-time skeleton-shimmer"></view>
                            <view class="skeleton-line"></view>
                            <view class="skeleton-hint skeleton-shimmer"></view>
                        </view>
                    </view>
                </view>

                <!-- 单词本卡片列表 -->
                <view class="card-list" v-else>
                    <view
                        v-for="(item, index) in decoratedWordBookList"
                        :key="item._id || index"
                        class="wordbook-card"
                        :class="{ 'card-selected': isSelectMode && selectedIds.includes(item._id) }"
                        :style="[item.cardStyle, { animationDelay: `${index * 70}ms` }]"
                        @click="handleCardClick(item)"
                        @longpress="handleLongPress(item)"
                    >
                        <!-- 选择模式下的复选框 -->
                        <view v-if="isSelectMode" class="card-checkbox" :class="{ checked: selectedIds.includes(item._id) }">
                            <t-icon
                                :name="selectedIds.includes(item._id) ? 'check-circle-filled' : 'circle'"
                                size="36rpx"
                                :color="selectedIds.includes(item._id) ? 'var(--app-brand)' : '#c0c4cc'"
                            ></t-icon>
                        </view>

                        <view class="card-aura" :style="item.auraStyle"></view>
                        <view v-if="!isSelectMode" class="edit-btn" @click.stop="handleEditBook(item)">
                            <uni-icons type="compose" size="15" color="#8a6d3b"></uni-icons>
                        </view>
                        <view class="card-top">
                            <view class="count-tag" :style="item.tagStyle">
                                <text class="count-text">{{ item.wordCount }} 词</text>
                            </view>
                        </view>
                        <view class="card-content">
                            <text class="book-title">{{ item.title }}</text>
                            <text class="book-desc">{{ item.description }}</text>
                        </view>
                        <view class="card-footer">
                            <uni-icons type="clock" size="15" color="#9a8a6e"></uni-icons>
                            <text class="footer-text">{{ item.updatedAtText }}</text>
                            <view class="footer-line"></view>
                            <text class="footer-hint">最近更新</text>
                        </view>
                    </view>

                    <!-- 新建单词本卡片（选择模式下隐藏） -->
                    <view v-if="!isSelectMode" class="wordbook-card create-card" @click="handleCreateBook">
                        <view class="create-content">
                            <view class="create-icon-wrapper">
                                <view class="create-icon">
                                    <uni-icons type="plus" size="40" color="#999"></uni-icons>
                                </view>
                            </view>
                            <view class="create-text">新建单词本</view>
                        </view>
                    </view>
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
                        :color="isAllSelected ? 'var(--app-brand)' : '#c0c4cc'"
                    ></t-icon>
                    <text class="select-all-text">全选</text>
                </view>
                <view
                    class="delete-btn"
                    :class="{ 'delete-btn-disabled': selectedIds.length === 0 }"
                    @click="handleDeleteTap"
                >
                    <t-icon name="delete" size="28rpx" color="#fff"></t-icon>
                    <text class="delete-btn-text">删除 ({{ selectedIds.length }})</text>
                </view>
            </view>
        </view>

        <!-- 创建/编辑单词本弹窗 -->
        <tPopup
            v-model:show="popupShow"
            :title="isEditMode ? '编辑单词本' : '创建单词本'"
            :closeable="true"
            :overlay="true"
            @close="handleClosePopup"
        >
            <template #popupcontent>
                <view class="form-container">
                    <!-- 单词本名称 -->
                    <view class="form-item">
                        <view class="form-label">
                            单词本名称
                            <text class="required">*</text>
                        </view>
                        <view class="input-wrapper" :class="{ 'has-error': validationErrors.title }">
                            <uni-icons
                                type="compose"
                                size="18"
                                :color="validationErrors.title ? 'var(--app-danger)' : 'var(--app-text-secondary)'"
                            ></uni-icons>
                            <input
                                class="form-input"
                                :class="{ 'is-error': validationErrors.title }"
                                v-model="formData.title"
                                placeholder="请输入单词本名称（最多20个字）"
                                maxlength="20"
                                @input="handleTitleInput"
                            />
                            <text class="char-count">{{ formData.title.length }}/20</text>
                        </view>
                        <view v-if="validationErrors.title" class="form-error">
                            <uni-icons type="info-filled" size="14" color="var(--app-danger)"></uni-icons>
                            <text>{{ validationErrors.title }}</text>
                        </view>
                    </view>

                    <!-- 描述 -->
                    <view class="form-item">
                        <view class="form-label">描述</view>
                        <view class="textarea-wrapper">
                            <textarea
                                class="form-textarea"
                                v-model="formData.description"
                                placeholder="可选，简单描述这个单词本"
                                maxlength="60"
                            ></textarea>
                            <text class="char-count description-count">{{ formData.description.length }}/60</text>
                        </view>
                    </view>

                    <!-- 按钮组 -->
                    <view class="form-actions">
                        <button class="btn btn-cancel" :disabled="submitting" @click="handleClosePopup">
                            <uni-icons type="closeempty" size="16" color="#666"></uni-icons>
                            取消
                        </button>
                        <button
                            class="btn btn-submit"
                            :disabled="submitting"
                            :class="{ 'btn-loading': submitting }"
                            @click="handleSubmit"
                        >
                            <view v-if="submitting" class="btn-spinner">
                                <view class="spinner-circle-small"></view>
                            </view>
                            <uni-icons v-else type="checkmarkempty" size="16" color="#fff"></uni-icons>
                            {{ submitting ? (isEditMode ? "保存中..." : "创建中...") : (isEditMode ? "保存" : "创建") }}
                        </button>
                    </view>
                </view>
            </template>
        </tPopup>

        <!-- 删除确认弹窗 (TDesign Dialog) -->
        <t-dialog
            :visible="showDeleteDialog"
            title="确认删除"
            :content="deleteDialogContent"
            :confirm-btn="{ content: '删除', theme: 'danger' }"
            cancel-btn="取消"
            :show-overlay="true"
            :z-index="12000"
            @confirm="handleBatchDelete"
            @cancel="showDeleteDialog = false"
            @close="showDeleteDialog = false"
        />
    </view>
    </ThemeProvider>
</template>

<script setup>
import ThemeProvider from "../../components/core/ThemeProvider.vue";
import { computed, onBeforeUnmount, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import tPopup from "../../components/core/tPopup.vue";
import { useNavBarSafeArea } from "../../composables/useNavBarSafeArea";
import formatTime from "../../util/format/time";
import {
    getWordBooksAPI,
    createWordBookAPI,
    updateWordBookAPI,
    batchDeleteWordBooksAPI,
} from "../../API/Tools/WordBookAPI";

const { safeAreaInfo, customNavbarStyle, navRowStyle } = useNavBarSafeArea({
    reserveMenuButtonRight: true,
    rightPaddingExtra: 8,
});

const popupShow = ref(false);
const loading = ref(false);
const submitting = ref(false);
const isEditMode = ref(false);
const editingId = ref("");
const skeletonCount = 6;

// ---- 选择模式 ----
const isSelectMode = ref(false);
const selectedIds = ref([]);
const showDeleteDialog = ref(false);

const isAllSelected = computed(() => {
    return wordBookList.value.length > 0 && selectedIds.value.length === wordBookList.value.length;
});

const deleteDialogContent = computed(() => {
    const count = selectedIds.value.length;
    return `确定要删除选中的 ${count} 个单词本吗？单词本内的所有单词将一并删除，且无法恢复。`;
});

const wordBookList = ref([]);

const formData = ref({
    title: "",
    description: "",
});

const validationErrors = ref({
    title: "",
});

// 单词本卡片主题（暖色调，橙/琥珀系）
const cardThemePool = [
    {
        cardStyle: {
            borderColor: "#f5e6d0",
            background: "linear-gradient(145deg, #ffffff 0%, #fff9f2 85%)",
            boxShadow: "0 14rpx 34rpx rgba(180, 140, 80, 0.12)",
        },
        tagStyle: { background: "#fff3e0" },
        auraStyle: {
            background: "radial-gradient(circle at center, rgba(230, 126, 34, 0.14) 0%, rgba(230, 126, 34, 0) 65%)",
        },
    },
    {
        cardStyle: {
            borderColor: "#f0e4d4",
            background: "linear-gradient(145deg, #ffffff 0%, #fdf6ee 85%)",
            boxShadow: "0 14rpx 34rpx rgba(170, 130, 70, 0.12)",
        },
        tagStyle: { background: "#fcefd5" },
        auraStyle: {
            background: "radial-gradient(circle at center, rgba(210, 150, 50, 0.16) 0%, rgba(210, 150, 50, 0) 65%)",
        },
    },
    {
        cardStyle: {
            borderColor: "#f2e8d8",
            background: "linear-gradient(145deg, #ffffff 0%, #faf4ea 85%)",
            boxShadow: "0 14rpx 34rpx rgba(160, 120, 60, 0.11)",
        },
        tagStyle: { background: "#f8edda" },
        auraStyle: {
            background: "radial-gradient(circle at center, rgba(190, 140, 60, 0.14) 0%, rgba(190, 140, 60, 0) 65%)",
        },
    },
    {
        cardStyle: {
            borderColor: "#efe0cc",
            background: "linear-gradient(145deg, #ffffff 0%, #fdf5e8 85%)",
            boxShadow: "0 14rpx 34rpx rgba(175, 135, 75, 0.13)",
        },
        tagStyle: { background: "#fbe8c8" },
        auraStyle: {
            background: "radial-gradient(circle at center, rgba(220, 160, 70, 0.15) 0%, rgba(220, 160, 70, 0) 65%)",
        },
    },
    {
        cardStyle: {
            borderColor: "#f3e5cf",
            background: "linear-gradient(145deg, #ffffff 0%, #fef8f0 85%)",
            boxShadow: "0 14rpx 34rpx rgba(165, 125, 65, 0.12)",
        },
        tagStyle: { background: "#fdf0d8" },
        auraStyle: {
            background: "radial-gradient(circle at center, rgba(200, 145, 55, 0.15) 0%, rgba(200, 145, 55, 0) 65%)",
        },
    },
    {
        cardStyle: {
            borderColor: "#ede2d2",
            background: "linear-gradient(145deg, #ffffff 0%, #faf3e6 85%)",
            boxShadow: "0 14rpx 34rpx rgba(155, 115, 55, 0.11)",
        },
        tagStyle: { background: "#f5e8ce" },
        auraStyle: {
            background: "radial-gradient(circle at center, rgba(185, 135, 50, 0.14) 0%, rgba(185, 135, 50, 0) 65%)",
        },
    },
];

const shuffleArray = (arr = []) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

const cardThemes = ref(shuffleArray(cardThemePool));

const decoratedWordBookList = computed(() => {
    return wordBookList.value.map((item, index) => {
        const theme = cardThemes.value[index % cardThemes.value.length];
        return {
            ...item,
            wordCount: Number(item.wordCount) || 0,
            description: item.description || "暂无描述",
            updatedAtText: item.updatedAt
                ? formatTime.getTime2(item.updatedAt)
                : "今天",
            cardStyle: theme.cardStyle,
            tagStyle: theme.tagStyle,
            auraStyle: theme.auraStyle,
        };
    });
});

// ---- 返回 ----
const handleBack = () => {
    if (isSelectMode.value) {
        exitSelectMode();
        return;
    }
    uni.navigateBack();
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
    // 每次切换都震动反馈
    uni.vibrateShort({ type: "light" });
};

const toggleSelectAll = () => {
    if (isAllSelected.value) {
        selectedIds.value = [];
    } else {
        selectedIds.value = wordBookList.value.map((item) => item._id);
    }
};

/** 长按：震动 + 进入选择模式 */
const handleLongPress = (item) => {
    if (!item?._id) return;
    // 短震动反馈
    uni.vibrateShort({ type: "heavy" });
    if (isSelectMode.value) {
        // 已在选择模式，切换该项选中状态
        toggleSelect(item._id);
    } else {
        // 进入选择模式并选中该项
        enterSelectMode(item._id);
    }
};

/** 单击卡片：选择模式下切换选中，普通模式下进入单词列表 */
const handleCardClick = (item) => {
    if (isSelectMode.value) {
        toggleSelect(item._id);
    } else {
        handleOpenWordList(item);
    }
};

/** 底部删除按钮点击 */
const handleDeleteTap = () => {
    if (selectedIds.value.length === 0) return;
    showDeleteDialog.value = true;
};

// ---- 批量删除 ----
const deleting = ref(false);

const handleBatchDelete = async () => {
    const count = selectedIds.value.length;
    if (count === 0 || deleting.value) return;

    deleting.value = true;
    try {
        const res = await batchDeleteWordBooksAPI(selectedIds.value);
        if (res.code !== 200) {
            throw new Error(res.message || "批量删除失败");
        }
        uni.showToast({ title: `已删除 ${count} 个单词本`, icon: "success" });
        showDeleteDialog.value = false;
        exitSelectMode();
        await fetchWordBooks();
    } catch (error) {
        uni.showToast({ title: error?.message || "删除失败，请重试", icon: "none" });
        console.error("批量删除单词本失败:", error);
    } finally {
        deleting.value = false;
        showDeleteDialog.value = false;
    }
};

// ---- 创建 / 编辑 ----
const handleCreateBook = () => {
    isEditMode.value = false;
    editingId.value = "";
    popupShow.value = true;
};

const handleEditBook = (item) => {
    if (!item?._id) {
        uni.showToast({ title: "单词本ID无效", icon: "none" });
        return;
    }
    isEditMode.value = true;
    editingId.value = item._id;
    formData.value = {
        title: item.title,
        description: item.description || "",
    };
    popupShow.value = true;
};

const handleClosePopup = () => {
    popupShow.value = false;
    resetForm();
};

const resetForm = () => {
    formData.value = { title: "", description: "" };
    validationErrors.value = { title: "" };
    isEditMode.value = false;
    editingId.value = "";
};

const handleTitleInput = () => {
    if (validationErrors.value.title) {
        validationErrors.value.title = "";
    }
};

const handleSubmit = async () => {
    const title = formData.value.title.trim();
    const description = formData.value.description.trim();

    if (!title) {
        validationErrors.value.title = "请输入单词本名称";
        return;
    }

    submitting.value = true;
    try {
        if (isEditMode.value) {
            const res = await updateWordBookAPI({
                id: editingId.value,
                title,
                description,
            });
            if (res.code !== 200) {
                if (res.code === 409) {
                    validationErrors.value.title = "单词本名称已存在，请更换名称";
                    return;
                }
                throw new Error(res.message || "保存失败");
            }
            uni.showToast({ title: "保存成功", icon: "success" });
        } else {
            const res = await createWordBookAPI({ title, description });
            if (res.code !== 200) {
                if (res.code === 409) {
                    validationErrors.value.title = "单词本名称已存在，请更换名称";
                    return;
                }
                throw new Error(res.message || "创建失败");
            }
            uni.showToast({ title: "创建成功", icon: "success" });
        }
        handleClosePopup();
        await fetchWordBooks();
    } catch (error) {
        uni.showToast({
            title: error?.message || (isEditMode.value ? "保存失败，请重试" : "创建失败，请重试"),
            icon: "none",
        });
        console.error("操作失败:", error);
    } finally {
        submitting.value = false;
    }
};

const handleOpenWordList = (item) => {
    uni.navigateTo({
        url: `/pages/tools/WordBookToolView_children/WordListView?id=${item._id}&title=${encodeURIComponent(item.title)}`,
    });
};

/** 获取单词本列表 */
const fetchWordBooks = async () => {
    loading.value = true;
    try {
        const res = await getWordBooksAPI();
        if (res.code !== 200) {
            throw new Error(res.message || "获取单词本失败");
        }
        wordBookList.value = Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        wordBookList.value = [];
        uni.showToast({ title: "获取单词本失败", icon: "none", position: "bottom" });
        console.error("获取单词本失败:", error);
    } finally {
        loading.value = false;
    }
};

const themesShuffled = ref(false);

onLoad(() => {
    uni.$on("wordBook:refresh", handleRefreshEvent);
    fetchWordBooks();
});

onShow(() => {
    if (!themesShuffled.value) {
        cardThemes.value = shuffleArray(cardThemePool);
        themesShuffled.value = true;
    }
    if (!wordBookList.value.length && !loading.value) {
        fetchWordBooks();
    }
});

const handleRefreshEvent = () => {
    fetchWordBooks();
};

onBeforeUnmount(() => {
    uni.$off("wordBook:refresh", handleRefreshEvent);
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
    box-shadow: 0 4rpx 18rpx rgba(140, 120, 80, 0.08);
    z-index: 30;
}

.custom-navbar {
    padding-left: 18rpx;
    padding-right: 18rpx;
    box-sizing: border-box;
}

.nav-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
}

.nav-left {
    width: 80rpx;
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

.nav-title {
    flex: 1;
    text-align: center;
    font-size: calc(34rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 700;
    padding: 0 12rpx;
}

.nav-right {
    width: 80rpx;
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
}

.nav-action {
    width: 60rpx;
    height: 60rpx;
    border-radius: 30rpx;
    border: 2rpx solid #f0e0c8;
    background: var(--app-bg-container);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(230, 126, 34, 0.1);
}

.nav-action:active {
    transform: scale(0.93);
}

.main-scroll {
    flex: 1;
    min-height: 0;
}

.scroll-content {
    position: relative;
    box-sizing: border-box;
    background: var(--app-bg-page);
    padding: 26rpx 20rpx calc(46rpx + env(safe-area-inset-bottom));
    overflow: hidden;
    font-family: "HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 背景装饰 */
.bg-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
}

.blob-1 {
    width: 360rpx;
    height: 360rpx;
    top: -110rpx;
    right: -90rpx;
    background: radial-gradient(circle, rgba(255, 200, 120, 0.3) 0%, rgba(255, 200, 120, 0) 68%);
}

.blob-2 {
    width: 300rpx;
    height: 300rpx;
    left: -120rpx;
    top: 280rpx;
    background: radial-gradient(circle, rgba(255, 220, 170, 0.22) 0%, rgba(255, 220, 170, 0) 70%);
}

/* 选择模式提示条 */
.select-hint-bar {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 10rpx;
    margin-bottom: 20rpx;
    padding: 16rpx 20rpx;
    background: var(--app-bg-container);
    border-radius: 16rpx;
    border: 1rpx solid var(--app-border);
}

.select-hint-text {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

/* Hero 区域 */
.hero {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16rpx;
    margin: 4rpx 6rpx 26rpx;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 14rpx;
}

.section-dot {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    background: #e67e22;
    box-shadow: 0 0 0 8rpx rgba(230, 126, 34, 0.14);
    flex-shrink: 0;
}

.section-title {
    font-size: calc(44rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 700;
    letter-spacing: 0.8rpx;
}

.hero-subtitle {
    margin-top: 14rpx;
    display: block;
    font-size: calc(27rpx * var(--app-font-scale, 1));
    color: #8a7a5e;
    line-height: 1.45;
}

.hero-stat {
    flex-shrink: 0;
    background: var(--app-bg-container);
    border-radius: 24rpx;
    border: 2rpx solid #f0e0c8;
    padding: 12rpx 18rpx;
    box-shadow: 0 8rpx 20rpx rgba(160, 130, 80, 0.1);
    display: flex;
    align-items: baseline;
    gap: 6rpx;
    margin-top: 2rpx;
}

.hero-stat-value {
    font-size: calc(38rpx * var(--app-font-scale, 1));
    color: #c07820;
    font-weight: 700;
}

.hero-stat-label {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: #a0906e;
}

/* 卡片列表 */
.card-list {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22rpx;
}

.wordbook-card {
    position: relative;
    border-radius: 34rpx;
    border: 2rpx solid #f0e0c8;
    padding: 24rpx;
    min-height: 360rpx;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: card-enter 0.5s ease both;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
}

.wordbook-card:active {
    transform: scale(0.985);
}

/* 选中态 */
.wordbook-card.card-selected {
    border-color: var(--app-brand);
    box-shadow: 0 0 0 4rpx rgba(77, 98, 255, 0.16), 0 14rpx 34rpx rgba(77, 98, 255, 0.12) !important;
}

/* 卡片内复选框 */
.card-checkbox {
    position: absolute;
    top: 14rpx;
    right: 14rpx;
    z-index: 10;
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: transform 0.15s ease;
}

.card-checkbox.checked {
    transform: scale(1.1);
}

.card-aura {
    position: absolute;
    width: 320rpx;
    height: 320rpx;
    right: -70rpx;
    top: -120rpx;
}

.card-top {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
}

.edit-btn {
    position: absolute;
    top: 18rpx;
    right: 18rpx;
    z-index: 3;
    width: 52rpx;
    height: 52rpx;
    border-radius: 50%;
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 248, 235, 0.92) 100%);
    border: 1rpx solid rgba(180, 150, 100, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 16rpx rgba(140, 110, 60, 0.18);
}

.edit-btn:active {
    transform: scale(0.93);
    box-shadow: 0 4rpx 10rpx rgba(140, 110, 60, 0.15);
}

.count-tag {
    padding: 8rpx 18rpx;
    border-radius: 999rpx;
    border: 1rpx solid rgba(180, 150, 100, 0.18);
}

.count-text {
    font-size: calc(23rpx * var(--app-font-scale, 1));
    color: #b07820;
    font-weight: 600;
}

.card-content {
    position: relative;
    z-index: 1;
    margin-top: 18rpx;
}

.book-title {
    display: block;
    font-size: calc(36rpx * var(--app-font-scale, 1));
    color: #3a2a10;
    font-weight: 700;
    line-height: 1.4;
}

.book-desc {
    margin-top: 12rpx;
    font-size: calc(27rpx * var(--app-font-scale, 1));
    color: #7a6a4e;
    line-height: 1.52;
    display: block;
    min-height: 80rpx;
}

.card-footer {
    position: relative;
    z-index: 1;
    margin-top: auto;
    padding-top: 14rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.footer-text {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: #9a8a6e;
}

.footer-line {
    width: 1rpx;
    height: 22rpx;
    background: #d8cbb8;
    margin: 0 2rpx 0 4rpx;
}

.footer-hint {
    font-size: calc(22rpx * var(--app-font-scale, 1));
    color: #a89a7e;
}

/* 新建卡片 */
.create-card {
    background: var(--app-bg-page) !important;
    border: 4rpx dashed #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.create-card:active {
    border-color: var(--app-text-secondary);
    background: var(--app-bg-secondary) !important;
}

.create-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20rpx;
}

.create-icon-wrapper {
    width: 120rpx;
    height: 120rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.create-icon {
    width: 100rpx;
    height: 100rpx;
    background: #f5ead8;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.create-card:active .create-icon {
    background: var(--app-border);
    transform: scale(0.95);
}

.create-text {
    color: var(--app-text-secondary);
    font-size: calc(28rpx * var(--app-font-scale, 1));
    font-weight: 500;
}

/* 选择模式底部操作栏 */
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
    background: linear-gradient(135deg, #e34d59 0%, #c23b46 100%);
    box-shadow: 0 6rpx 20rpx rgba(227, 77, 89, 0.3);
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.delete-btn:active {
    transform: scale(0.96);
    box-shadow: 0 3rpx 12rpx rgba(227, 77, 89, 0.25);
}

.delete-btn-disabled {
    opacity: 0.45;
    pointer-events: none;
}

.delete-btn-text {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: #fff;
    font-weight: 600;
    white-space: nowrap;
}

/* 骨架屏 */
.skeleton-list {
    pointer-events: none;
}

.skeleton-card {
    background: linear-gradient(160deg, #fff 0%, #fdf8f2 100%);
    border-color: #f0e6d8;
    animation: none;
}

.skeleton-aura {
    position: absolute;
    width: 320rpx;
    height: 320rpx;
    right: -72rpx;
    top: -124rpx;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(230, 180, 100, 0.14) 0%, rgba(230, 180, 100, 0) 70%);
}

.skeleton-content {
    margin-top: 18rpx;
}

.skeleton-pill {
    width: 130rpx;
    height: 42rpx;
    border-radius: 999rpx;
}

.skeleton-title {
    width: 76%;
    height: 42rpx;
    border-radius: 12rpx;
}

.skeleton-desc {
    margin-top: 16rpx;
    width: 100%;
    height: 30rpx;
    border-radius: 10rpx;
}

.skeleton-desc-short {
    width: 68%;
}

.skeleton-footer {
    gap: 10rpx;
}

.skeleton-icon {
    width: 24rpx;
    height: 24rpx;
    border-radius: 50%;
}

.skeleton-time {
    width: 112rpx;
    height: 24rpx;
    border-radius: 10rpx;
}

.skeleton-line {
    width: 1rpx;
    height: 22rpx;
    background: #e0d6c8;
    margin: 0 2rpx 0 4rpx;
}

.skeleton-hint {
    width: 90rpx;
    height: 22rpx;
    border-radius: 10rpx;
}

.skeleton-shimmer {
    background: linear-gradient(110deg, rgba(245, 235, 220, 0.95) 8%, rgba(255, 248, 238, 0.95) 18%, rgba(245, 235, 220, 0.95) 33%);
    background-size: 220% 100%;
    animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

/* 表单样式 */
.form-container {
    padding: 50rpx 40rpx;
}

.form-item {
    margin-bottom: 46rpx;
}

.form-label {
    font-size: calc(30rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    margin-bottom: 20rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
}

.required {
    color: var(--app-danger);
    margin-left: 8rpx;
    font-weight: normal;
}

.input-wrapper {
    display: flex;
    align-items: center;
    background: var(--app-bg-secondary);
    border-radius: 16rpx;
    padding: 0 20rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
}

.input-wrapper:focus-within {
    background: var(--app-bg-container);
    border-color: #e67e22;
    box-shadow: 0 0 0 4rpx rgba(230, 126, 34, 0.1);
}

.input-wrapper.has-error {
    background: var(--app-bg-container);
    border-color: var(--app-danger);
    box-shadow: 0 0 0 4rpx rgba(244, 67, 54, 0.1);
}

.form-input {
    flex: 1;
    height: 88rpx;
    padding: 0 16rpx;
    font-size: calc(30rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    box-sizing: border-box;
    border: none;
    background: transparent;
}

.form-input.is-error {
    color: var(--app-danger);
}

.textarea-wrapper {
    background: var(--app-bg-secondary);
    border-radius: 16rpx;
    padding: 10rpx 20rpx 8rpx;
    border: 2rpx solid transparent;
}

.textarea-wrapper:focus-within {
    background: var(--app-bg-container);
    border-color: #e67e22;
    box-shadow: 0 0 0 4rpx rgba(230, 126, 34, 0.1);
}

.form-textarea {
    width: 100%;
    height: 140rpx;
    min-height: 120rpx;
    font-size: calc(28rpx * var(--app-font-scale, 1));
    line-height: 1.5;
    color: var(--app-text-primary);
}

.char-count {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

.description-count {
    display: block;
    text-align: right;
}

.form-error {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-top: 16rpx;
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-danger);
    animation: slideDown 0.3s ease;
}

.form-actions {
    display: flex;
    gap: 30rpx;
    margin-top: 54rpx;
    padding-top: 36rpx;
    border-top: 2rpx solid var(--app-bg-secondary);
}

.btn {
    flex: 1;
    height: 96rpx;
    border-radius: 48rpx;
    font-size: calc(30rpx * var(--app-font-scale, 1));
    font-weight: 600;
    border: none;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
}

.btn-cancel {
    background: linear-gradient(135deg, #f5f5f5 0%, #ebebeb 100%);
    color: var(--app-text-secondary);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.btn-cancel:active {
    background: linear-gradient(135deg, #e8e8e8 0%, #ddd 100%);
    transform: scale(0.98);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.btn-submit {
    background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
    color: var(--app-bg-container);
    box-shadow: 0 8rpx 24rpx rgba(230, 126, 34, 0.32);
}

.btn-submit:active {
    background: linear-gradient(135deg, #d35400 0%, #c0470a 100%);
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(230, 126, 34, 0.22);
}

.btn-submit:disabled,
.btn-cancel:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-loading {
    background: linear-gradient(135deg, #f0a04b 0%, #e89030 100%) !important;
}

.btn-spinner {
    width: 32rpx;
    height: 32rpx;
    margin-right: 8rpx;
}

.spinner-circle-small {
    width: 100%;
    height: 100%;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    border-top-color: var(--app-bg-container);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes slideDown {
    from { opacity: 0; transform: translateY(-10rpx); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes skeleton-shimmer {
    from { background-position: 100% 0; }
    to { background-position: -100% 0; }
}

@keyframes card-enter {
    from { opacity: 0; transform: translateY(12rpx); }
    to { opacity: 1; transform: translateY(0); }
}

@media screen and (min-width: 760px) {
    .scroll-content {
        padding-left: 34rpx;
        padding-right: 34rpx;
    }
    .card-list {
        max-width: 920rpx;
        margin: 0 auto;
        gap: 26rpx;
    }
    .hero {
        max-width: 920rpx;
        margin-left: auto;
        margin-right: auto;
    }
}
</style>
