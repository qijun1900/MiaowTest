<template>
  <view class="container">
    <view class="fixed-header">
      <view class="search-wrap">
        <view class="search-box">
          <uni-icons type="search" size="18" color="#9aa5bc"></uni-icons>
          <input
            v-model="searchKeyword"
            class="search-input"
            placeholder="搜索笔记..."
            placeholder-class="search-placeholder"
          />
          <uni-icons
            v-if="searchKeyword"
            type="clear"
            size="16"
            color="#a2acbf"
            @click="clearSearch"
          ></uni-icons>
        </view>
      </view>

      <view class="toolbar">
        <text class="result-count">共 {{ filteredNotes.length }} 篇笔记</text>

        <view class="toolbar-right">
          <view class="sort-pill" @click="toggleSort">
            <uni-icons
              :type="sortOrder === 'desc' ? 'arrowdown' : 'arrowup'"
              size="13"
              color="#5f6d84"
            ></uni-icons>
            <text class="sort-pill-text">{{ sortOrderText }}</text>
          </view>

          <view class="view-btn">
            <view class="grid-icon">
              <view class="grid-dot"></view>
              <view class="grid-dot"></view>
              <view class="grid-dot"></view>
              <view class="grid-dot"></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="list-content">
      <view v-if="isLoading" class="loading-wrap">
        <view
          v-for="index in 3"
          :key="`loading-${index}`"
          class="note-card loading-card"
        >
          <view class="card-content">
            <view class="card-header">
              <view class="loading-title shimmer"></view>
              <view class="header-actions">
                <view class="loading-action shimmer"></view>
                <view class="loading-action shimmer"></view>
              </view>
            </view>

            <view class="loading-line shimmer"></view>
            <view class="loading-line shimmer"></view>
            <view class="loading-line loading-line-short shimmer"></view>

            <view class="card-footer">
              <view class="loading-meta shimmer"></view>
              <view class="tag-wrap">
                <view class="loading-tag shimmer"></view>
                <view class="loading-tag loading-tag-small shimmer"></view>
              </view>
            </view>
          </view>
        </view>

        <text class="loading-caption">笔记加载中...</text>
      </view>

      <view v-else-if="filteredNotes.length === 0" class="empty-state">
        <uni-icons
          :type="isSearching ? 'search' : 'compose'"
          size="26"
          color="#b2bdd3"
        ></uni-icons>
        <text class="empty-text">{{ isSearching ? "没有找到匹配的笔记" : "还没有笔记" }}</text>
        <text class="empty-desc">{{
          isSearching ? "试试其他关键词" : "点击右下角按钮创建第一篇笔记"
        }}</text>
      </view>

      <view v-else class="list-wrap">
        <view v-for="item in filteredNotes" :key="item.id" class="note-card">
          <view class="card-content" @click="handleCheckNote(item)">
            <view class="card-header">
              <text class="note-title">{{ item.title }}</text>
              <view class="header-actions">
                <view class="delete-btn" @click.stop="handleDeleteNote(item)">
                  <uni-icons
                    type="trash"
                    size="17"
                    color="#b4bbca"
                  ></uni-icons>
                </view>
                <view class="edit-btn" @click.stop="handleEditNote(item)">
                  <uni-icons
                    type="compose"
                    size="17"
                    color="#9f8b79"
                  ></uni-icons>
                </view>
              </view>
            </view>

            <text class="note-preview">{{ item.preview }}</text>

            <view class="card-footer">
              <view class="meta-wrap">
                <uni-icons type="clock" size="13" color="#8a93aa"></uni-icons>
                <text class="meta-text"
                  >{{ item.dateText }} · {{ item.readTime }}</text
                >
              </view>

              <view class="tag-wrap">
                <text v-for="tag in item.tags" :key="tag" class="tag-item">{{
                  tag
                }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <dragButton
      v-model:show="isShowdragButton"
      butColor="#d0a883"
      :isDock="true"
      :existTabBar="true"
      iconType="plusempty"
      iconColor="#ffffff"
      :iconSize="32"
      :bottomOffset="100"
      :popMenu="false"
      :enableLongPressDelete="true"
      @btnClick="handleFloatingAddNote"
    />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import dragButton from "../../../components/plug-in/drag-button/drag-button.vue";
import formatTime from "../../../util/formatTime";
import { stripHtml } from "../../../util/notePreview";
import {
  getNotebookNotesAPI,
  deleteNotebookNoteAPI,
} from "../../../API/Tools/NotesBookAPI";

const searchKeyword = ref("");
const sortOrder = ref("desc");
const isShowdragButton = ref(true);
const isLoading = ref(false);
const notesBookId = ref("");
const notes = ref([]);

const sortOrderText = computed(() =>
  sortOrder.value === "desc" ? "最近优先" : "最早优先",
);

const isSearching = computed(() => Boolean(searchKeyword.value.trim()));

const filteredNotes = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  const list = notes.value.filter((item) => {
    if (!keyword) return true;
    return (
      item.title.toLowerCase().includes(keyword) ||
      item.preview.toLowerCase().includes(keyword) ||
      item.tags.some((tag) => tag.toLowerCase().includes(keyword))
    );
  });

  return [...list].sort((a, b) =>
    sortOrder.value === "desc"
      ? b.updatedAt - a.updatedAt
      : a.updatedAt - b.updatedAt,
  );
});

const estimateReadTime = (text = "") => {
  const plainText = String(text || "").trim();
  const minutes = Math.max(1, Math.ceil(plainText.length / 280));
  return `${minutes} 分钟阅读`;
};

const IMAGE_NOTE_PLACEHOLDER = "[\u56fe\u7247]";

const hasImageTag = (value = "") => /<img\b/i.test(String(value || ""));

const normalizePreviewText = (value = "") =>
  stripHtml(String(value || "")).trim();

//将后端笔记数据转换为前端显示格式
const normalizeNoteItem = (item = {}) => {
  const rawSummary = String(item.summary || "");
  const rawPlainText = String(item.plainText || "");
  const normalizedSummary = normalizePreviewText(rawSummary);
  const normalizedPlainText = normalizePreviewText(rawPlainText);
  const previewText =
    normalizedSummary ||
    normalizedPlainText ||
    (hasImageTag(rawSummary) ? IMAGE_NOTE_PLACEHOLDER : "");
  const updatedAt = Number(new Date(item.updatedAt).getTime()) || 0;

  return {
    id: String(item._id || ""),
    title: String(item.title || "未命名笔记"),
    preview: previewText || "暂无内容",
    dateText: formatTime.getRelativeTime(item.updatedAt),
    readTime: estimateReadTime(normalizedPlainText || previewText),
    tags: Array.isArray(item.tags) ? item.tags : [],
    updatedAt,
  };
};

//获取笔记列表
const fetchNotes = async () => {
  if (!notesBookId.value) return;

  isLoading.value = true;
  try {
    const res = await getNotebookNotesAPI(notesBookId.value);
    if (res.code !== 200) {
      throw new Error(res.message || "获取笔记列表失败");
    }

    const list = Array.isArray(res.data) ? res.data : [];
    notes.value = list.map(normalizeNoteItem);
  } catch (error) {
    console.error("获取笔记列表失败:", error);
    uni.showToast({
      title: error?.message || "获取笔记列表失败",
      icon: "none",
    });
  } finally {
    isLoading.value = false;
  }
};

const clearSearch = () => {
  searchKeyword.value = "";
};

const toggleSort = () => {
  sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
};

const getDraftStorageKey = (noteId) =>
  `note-editor-draft:${notesBookId.value}:${noteId}`;

const handleDeleteNote = (item) => {
  uni.showModal({
    title: "删除笔记",
    content: `确认删除「${item.title}」吗？此操作无法撤销。`,
    confirmText: "删除",
    cancelText: "取消",
    success: async ({ confirm }) => {
      if (!confirm) return;

      try {
        const res = await deleteNotebookNoteAPI({
          id: item.id,
          bookId: notesBookId.value,
        });

        if (res.code !== 200) {
          throw new Error(res.message || "删除失败，请重试");
        }

        notes.value = notes.value.filter((note) => note.id !== item.id);
        uni.removeStorageSync(getDraftStorageKey(item.id));

        uni.showToast({
          title: "删除成功",
          icon: "success",
        });
      } catch (error) {
        console.error("删除笔记失败:", error);
        uni.showToast({
          title: error?.message || "删除失败，请重试",
          icon: "none",
        });
      }
    },
  });
};

//编辑/添加笔记（跳转到编辑页，携带笔记ID参数）
const handleEditNote = (item) => {
  uni.navigateTo({
    url: `/pages/tools/NotesBookToolView_children/NoteEditView?bookId=${notesBookId.value}&id=${item.id}`,
  });
};

//查看笔记详情
const handleCheckNote = (item) => {
  uni.navigateTo({
    url: `/pages/tools/NotesBookToolView_children/NoteDetailView?bookId=${notesBookId.value}&id=${item.id}`,
  });
};

const handleFloatingAddNote = () => {
  if (!notesBookId.value) {
    uni.showToast({
      title: "笔记本ID无效",
      icon: "none",
    });
    return;
  }

  uni.navigateTo({
    url: `/pages/tools/NotesBookToolView_children/NoteEditView?bookId=${notesBookId.value}`,
  });
};

onLoad((options = {}) => {
  notesBookId.value = String(options.id || options.bookId || "").trim();
});

onShow(() => {
  fetchNotes();
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 22rpx 16rpx calc(32rpx + env(safe-area-inset-bottom));
  background: #fff9f2;
}

.fixed-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff9f2;
  padding-top: 2rpx;
  padding-bottom: 10rpx;
}

.list-content {
  padding-top: 12rpx;
}

.search-wrap {
  margin-bottom: 18rpx;
}

.search-box {
  height: 84rpx;
  border-radius: 42rpx;
  border: 2rpx solid #dce6fa;
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 0 22rpx;
  box-shadow: 0 8rpx 16rpx rgba(171, 191, 231, 0.2);
}

.search-input {
  flex: 1;
  height: 84rpx;
  font-size: 30rpx;
  color: #44506a;
}

.search-placeholder {
  color: #99a4bb;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
  padding: 0 2rpx;
}

.result-count {
  font-size: 28rpx;
  color: #6b7690;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.sort-pill {
  height: 62rpx;
  padding: 0 18rpx;
  border-radius: 31rpx;
  border: 2rpx solid #dce4f6;
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.sort-pill-text {
  font-size: 26rpx;
  color: #5f6d84;
}

.view-btn {
  width: 62rpx;
  height: 62rpx;
  border-radius: 31rpx;
  border: 2rpx solid #dce4f6;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-icon {
  width: 24rpx;
  height: 24rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 4rpx;
}

.grid-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 3rpx;
  background: #8190ac;
}

.list-wrap {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.loading-card {
  background: #fffaf5;
}

.loading-title {
  width: 46%;
  height: 42rpx;
  border-radius: 12rpx;
}

.loading-action {
  width: 44rpx;
  height: 44rpx;
  border-radius: 22rpx;
}

.loading-line {
  margin-top: 12rpx;
  height: 28rpx;
  border-radius: 12rpx;
}

.loading-line-short {
  width: 66%;
}

.loading-meta {
  width: 180rpx;
  height: 24rpx;
  border-radius: 10rpx;
}

.loading-tag {
  width: 96rpx;
  height: 34rpx;
  border-radius: 12rpx;
}

.loading-tag-small {
  width: 72rpx;
}

.loading-caption {
  text-align: center;
  font-size: 24rpx;
  color: #b2bdd3;
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

.note-card {
  display: flex;
  border-radius: 24rpx;
  border: 2rpx solid #e8ddd1;
  background: #fffefb;
  overflow: hidden;
  box-shadow: 0 8rpx 18rpx rgba(132, 112, 95, 0.1);
}

.card-content {
  flex: 1;
  padding: 20rpx 22rpx 20rpx;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
  min-width: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-shrink: 0;
}

.note-title {
  flex: 1 1 0;
  width: 0;
  max-width: 100%;
  display: -webkit-box;
  font-size: 42rpx;
  line-height: 1.28;
  color: #403a40;
  font-weight: 600;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}

.edit-btn,
.delete-btn {
  width: 44rpx;
  height: 44rpx;
  border-radius: 22rpx;
  background: #f5eee6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  background: #efe6db;
}

.note-preview {
  margin-top: 12rpx;
  font-size: 33rpx;
  line-height: 1.62;
  color: #635c62;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  min-height: 150rpx;
}

.card-footer {
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.meta-wrap {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
}

.meta-text {
  font-size: 26rpx;
  color: #8d8488;
}

.tag-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
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

.empty-state {
  margin-top: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #9ca8bf;
}

.empty-desc {
  font-size: 24rpx;
  color: #b2bdd3;
}

:deep(.drag) {
  width: 110upx;
  height: 110upx;
  border: 2rpx solid rgba(255, 255, 255, 0.78);
  box-shadow:
    0 12rpx 28rpx rgba(132, 96, 68, 0.34),
    0 0 0 6rpx rgba(208, 168, 131, 0.24);
}
</style>
