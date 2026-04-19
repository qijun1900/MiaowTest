<template>
    <view
        class="note-detail-page"
        :style="{ paddingBottom: safeAreaInfo.bottom + 'px' }"
    >
        <view class="top-wrapper">
            <view class="custom-navbar" :style="customNavbarStyle">
                <view class="nav-row" :style="navRowStyle">
                    <view class="nav-left" @click="handleBack">
                        <uni-icons
                            type="left"
                            size="17"
                            color="#5f6779"
                        ></uni-icons>
                        <text class="nav-left-text">返回</text>
                    </view>

                    <text class="nav-title">笔记详情</text>

                    <view class="nav-right">
                        <view class="nav-action" @click="handleEdit">
                            <uni-icons
                                type="compose"
                                size="15"
                                color="#5f6779"
                            ></uni-icons>
                        </view>
                        <view class="nav-action danger" @click="handleDelete">
                            <uni-icons
                                type="trash"
                                size="15"
                                color="#9f5a5a"
                            ></uni-icons>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <scroll-view class="detail-scroll" scroll-y>
            <view class="detail-body">
                <view v-if="isLoading" class="loading-wrap">
                    <view class="loading-title shimmer"></view>
                    <view class="loading-meta shimmer"></view>
                    <view class="loading-line shimmer"></view>
                    <view class="loading-line shimmer"></view>
                    <view
                        class="loading-line loading-line-short shimmer"
                    ></view>
                </view>

                <view v-else-if="loadError" class="empty-state">
                    <uni-icons
                        type="info"
                        size="30"
                        color="#b3b9c9"
                    ></uni-icons>
                    <text class="empty-text">加载失败</text>
                    <text class="empty-desc">{{ loadError }}</text>
                    <view class="retry-btn" @click="fetchNoteDetail">
                        <text class="retry-btn-text">重试</text>
                    </view>
                </view>

                <template v-else>
                    <view class="content-card">
                        <text class="note-title">{{ detailState.title }}</text>

                        <view class="meta-wrap">
                            <uni-icons
                                type="clock"
                                size="13"
                                color="#8a93aa"
                            ></uni-icons>
                            <text class="meta-text">{{
                                detailState.dateText
                            }}</text>
                            <text class="meta-divider">·</text>
                            <text class="meta-text"
                                >{{ contentLength }} 字</text
                            >
                        </view>

                        <view class="divider"></view>

                        <rich-text
                            class="detail-rich"
                            :nodes="detailHtml"
                        ></rich-text>
                    </view>

                    <view v-if="detailState.tags.length" class="tag-section">
                        <text class="tag-title">笔记标签</text>
                        <view class="tag-wrap">
                            <text
                                v-for="tag in detailState.tags"
                                :key="tag"
                                class="tag-item"
                                >{{ tag }}</text
                            >
                        </view>
                    </view>
                </template>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { useNavBarSafeArea } from "../../../composables/useNavBarSafeArea";
import { buildNotePreviewHtml, stripHtml } from "../../../util/notePreview";
import { normalizeNoteDetailData } from "../../../util/noteNormalize";
import {
    getNotebookNoteDetailAPI,
    deleteNotebookNoteAPI,
} from "../../../API/Tools/NotesBookAPI";

const { safeAreaInfo, customNavbarStyle, navRowStyle } = useNavBarSafeArea({
    reserveMenuButtonRight: true,
    rightPaddingExtra: 8,
});

const notesBookId = ref("");
const noteId = ref("");
const isLoading = ref(false);
const loadError = ref("");
const detailState = ref({
    title: "未命名笔记",
    content: "",
    tags: [],
    dateText: "刚刚更新",
});

const detailHtml = computed(() =>
    buildNotePreviewHtml({
        title: "",
        content: detailState.value.content,
        emptyHtml:
            '<p style="color:#98a2b6;margin:0;">当前笔记暂无正文内容，点击右上角可继续编辑。</p>',
    }),
);

const contentLength = computed(
    () => stripHtml(detailState.value.content).length,
);

const getDraftStorageKey = (currentNoteId) =>
    `note-editor-draft:${notesBookId.value}:${currentNoteId}`;

const fetchNoteDetail = async () => {
    if (!noteId.value) {
        loadError.value = "缺少笔记ID";
        return;
    }

    isLoading.value = true;
    loadError.value = "";
    try {
        const res = await getNotebookNoteDetailAPI({
            id: noteId.value,
            bookId: notesBookId.value,
        });

        if (res.code !== 200 || !res.data) {
            throw new Error(res.message || "获取笔记详情失败");
        }

        detailState.value = normalizeNoteDetailData(res.data);
    } catch (error) {
        console.error("获取笔记详情失败:", error);
        loadError.value = error?.message || "获取笔记详情失败";
        uni.showToast({
            title: loadError.value,
            icon: "none",
            position: "top",
        });
    } finally {
        isLoading.value = false;
    }
};

const handleBack = () => {
    uni.navigateBack();
};

const handleEdit = () => {
    if (!noteId.value || !notesBookId.value) {
        uni.showToast({
            title: "笔记参数缺失",
            icon: "none",
            position: "top",
        });
        return;
    }

    uni.navigateTo({
        url: `/pages/tools/NotesBookToolView_children/NoteEditView?bookId=${notesBookId.value}&id=${noteId.value}`,
    });
};

const handleDelete = () => {
    if (!noteId.value || !notesBookId.value) {
        uni.showToast({
            title: "笔记参数缺失",
            icon: "none",
            position: "top",
        });
        return;
    }

    uni.showModal({
        title: "删除笔记",
        content: `确认删除「${detailState.value.title}」吗？此操作无法撤销。`,
        confirmText: "删除",
        cancelText: "取消",
        success: async ({ confirm }) => {
            if (!confirm) return;

            try {
                const res = await deleteNotebookNoteAPI({
                    id: noteId.value,
                    bookId: notesBookId.value,
                });

                if (res.code !== 200) {
                    throw new Error(res.message || "删除失败，请重试");
                }

                uni.removeStorageSync(getDraftStorageKey(noteId.value));
                uni.showToast({
                    title: "删除成功",
                    icon: "success",
                });

                setTimeout(() => {
                    uni.navigateBack();
                }, 280);
            } catch (error) {
                console.error("删除笔记失败:", error);
                uni.showToast({
                    title: error?.message || "删除失败，请重试",
                    icon: "none",
                    position: "top",
                });
            }
        },
    });
};

onLoad((options = {}) => {
    notesBookId.value = String(
        options.bookId || options.notesBookId || "",
    ).trim();
    noteId.value = String(options.id || options.noteId || "").trim();

    if (!noteId.value) {
        loadError.value = "缺少笔记ID";
        uni.showToast({
            title: "缺少笔记ID",
            icon: "none",
            position: "top",
        });
    }
});

onShow(() => {
    fetchNoteDetail();
});
</script>

<style scoped>
.note-detail-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #fff9f2;
}

.top-wrapper {
    background: #efede7;
    border-bottom: 1rpx solid #d8dce8;
    box-shadow: 0 4rpx 18rpx rgba(126, 136, 162, 0.08);
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
    width: 140rpx;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6rpx;
}

.nav-left-text {
    font-size: 30rpx;
    color: #5f6779;
}

.nav-title {
    flex: 1;
    text-align: center;
    font-size: 32rpx;
    color: #3e4656;
    font-weight: 600;
    padding: 0 12rpx;
}

.nav-right {
    width: 140rpx;
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    gap: 10rpx;
}

.nav-action {
    width: 56rpx;
    height: 56rpx;
    border-radius: 28rpx;
    border: 2rpx solid #d8deea;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-action.danger {
    border-color: #eed6d2;
    background: #fff7f5;
}

.detail-scroll {
    flex: 1;
    min-height: 0;
}

.detail-body {
    padding: 24rpx 18rpx 34rpx;
}

.content-card {
    border-radius: 24rpx;
    border: 2rpx solid #e8ddd1;
    background: #fffefb;
    padding: 24rpx 24rpx 28rpx;
    box-shadow: 0 8rpx 18rpx rgba(132, 112, 95, 0.1);
}

.note-title {
    font-size: 48rpx;
    line-height: 1.32;
    color: #403a40;
    font-weight: 700;
    word-break: break-all;
}

.meta-wrap {
    margin-top: 14rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    color: #8d8488;
}

.meta-text {
    font-size: 25rpx;
    color: #8d8488;
}

.meta-divider {
    font-size: 22rpx;
    color: #b9aeb1;
}

.divider {
    margin: 18rpx 0;
    height: 2rpx;
    background: #efe7de;
}

.detail-rich {
    font-size: 32rpx;
    color: #59515a;
    line-height: 1.85;
}

.tag-section {
    margin-top: 16rpx;
    border-radius: 24rpx;
    border: 2rpx solid #e8ddd1;
    background: #fffefb;
    padding: 20rpx 22rpx;
    box-shadow: 0 8rpx 18rpx rgba(132, 112, 95, 0.08);
}

.tag-title {
    font-size: 26rpx;
    color: #6b6170;
}

.tag-wrap {
    margin-top: 12rpx;
    display: flex;
    align-items: center;
    gap: 10rpx;
    flex-wrap: wrap;
}

.tag-item {
    background: #eee6dc;
    color: #91898d;
    padding: 8rpx 14rpx;
    border-radius: 12rpx;
    font-size: 24rpx;
    line-height: 1.1;
}

.loading-wrap {
    border-radius: 24rpx;
    border: 2rpx solid #e8ddd1;
    background: #fffefb;
    padding: 24rpx;
    box-shadow: 0 8rpx 18rpx rgba(132, 112, 95, 0.08);
}

.loading-title {
    width: 58%;
    height: 50rpx;
    border-radius: 12rpx;
}

.loading-meta {
    margin-top: 16rpx;
    width: 220rpx;
    height: 26rpx;
    border-radius: 10rpx;
}

.loading-line {
    margin-top: 14rpx;
    width: 100%;
    height: 30rpx;
    border-radius: 10rpx;
}

.loading-line-short {
    width: 72%;
}

.shimmer {
    position: relative;
    overflow: hidden;
    background: #efe7dd;
}

.shimmer::after {
    content: "";
    position: absolute;
    top: 0;
    left: -130%;
    width: 130%;
    height: 100%;
    background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.65) 50%,
        rgba(255, 255, 255, 0) 100%
    );
    animation: shimmerMove 1.35s ease-in-out infinite;
}

@keyframes shimmerMove {
    to {
        left: 130%;
    }
}

.empty-state {
    margin-top: 130rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14rpx;
}

.empty-text {
    font-size: 30rpx;
    color: #8c96ad;
}

.empty-desc {
    font-size: 24rpx;
    color: #a9b4cb;
    text-align: center;
}

.retry-btn {
    margin-top: 10rpx;
    height: 64rpx;
    padding: 0 24rpx;
    border-radius: 32rpx;
    border: 2rpx solid #dce4f6;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
}

.retry-btn-text {
    color: #5f6d84;
    font-size: 26rpx;
}
</style>
