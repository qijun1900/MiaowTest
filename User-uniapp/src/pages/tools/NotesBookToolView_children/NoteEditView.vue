<template>
  <view
    class="note-editor-page"
    :style="{ paddingBottom: safeAreaInfo.bottom + 'px' }"
  >
    <view class="top-wrapper">
      <view
        class="custom-navbar"
        :style="customNavbarStyle"
      >
        <view class="nav-row" :style="navRowStyle">
          <view class="cancel-btn" @click="handleCancel">
            <uni-icons type="left" size="17" color="#5f6779"></uni-icons>
            <text class="cancel-text">取消</text>
          </view>

          <view class="mode-switch">
            <view
              v-for="item in editorModes"
              :key="item.value"
              class="mode-item"
              :class="{ active: editorMode === item.value }"
              @click="editorMode = item.value"
            >
              <text
                class="mode-text"
                :class="{ active: editorMode === item.value }"
                >{{ item.label }}</text
              >
            </view>
          </view>

          <view class="save-btn" @click="handleSave">
            <uni-icons
              type="checkbox-filled"
              size="15"
              color="#ffffff"
            ></uni-icons>
            <text class="save-text">保存</text>
          </view>
        </view>
      </view>
    </view>

    <scroll-view class="editor-scroll" scroll-y>
      <view class="editor-body">
        <input
          v-model="noteTitle"
          class="title-input"
          placeholder="笔记标题"
          placeholder-class="title-placeholder"
          maxlength="80"
        />
        <view class="title-divider"></view>

        <view v-if="editorMode === 'edit'" class="panel editor-panel">
          <view class="note-editor-wrapper">
            <sp-editor
              :placeholder="'开始记录...'"
              :toolbar-config="toolbarConfig"
              :editor-id="'noteEditEditor'"
              @init="handleEditorInit"
              @input="handleEditorInput"
            />
          </view>
        </view>

        <view v-else class="panel preview-panel">
          <rich-text class="preview-rich" :nodes="previewHtml"></rich-text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onBackPress, onLoad, onShow } from "@dcloudio/uni-app";
import navBarHeightUtil from "../../../util/navBarHeight";
import {
  stripHtml,
  normalizeToHtml,
  buildNotePreviewHtml,
} from "../../../util/notePreview";
import {
  getNotebookNoteDetailAPI,
  saveNotebookNoteAPI,
} from "../../../API/Tools/NotesBookAPI";

// 顶部导航与安全区信息，用于多端自定义导航适配
const navBarInfo = ref({
  statusBarHeight: 0,
  navBarHeight: 44,
  totalHeight: 44,
});

const safeAreaInfo = ref({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

// 编辑页核心状态：标题、富文本内容、纯文本内容（用于空内容校验）
const noteTitle = ref("");
const noteContent = ref("");
const notePlainText = ref("");
const editorMode = ref("edit");
const isBypassBackGuard = ref(false);
const storageDraftKey = ref("note-editor-draft:default:new");
const editorCtx = ref(null);
const notesBookId = ref("");
const noteId = ref("");

// 用于未保存变更比对的快照
const initialSnapshot = ref({
  title: "",
  content: "",
});

// sp-editor 工具栏配置，可按需要继续扩展按键
const toolbarConfig = ref({
  keys: [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "align",
    "listOrdered",
    "listBullet",
    "listCheck",
    "divider",
    "date",
    "undo",
    "redo",
    "removeFormat",
    "clear",
  ],
  iconSize: "18px",
  iconColumns: 10,
});

// 页面两种模式：编辑、预览
const editorModes = [
  { label: "编辑", value: "edit" },
  { label: "预览", value: "preview" },
];

// 通过快照判断是否存在未保存修改
const hasUnsavedChanges = computed(() => {
  return (
    noteTitle.value !== initialSnapshot.value.title ||
    noteContent.value !== initialSnapshot.value.content
  );
});

// 预览区渲染内容：标题单独拼接，正文优先用富文本
const previewHtml = computed(() => {
  return buildNotePreviewHtml({
    title: noteTitle.value,
    content: noteContent.value,
  });
});

// 每次进入/返回页面时刷新导航高度与安全区
const refreshLayoutInfo = () => {
  navBarInfo.value = navBarHeightUtil.getNavBarInfo();
  safeAreaInfo.value = navBarHeightUtil.getSafeAreaInfo();
};

// 头部位置采用 totalHeight 驱动，确保小程序端状态栏+导航栏整体高度正确
const customNavbarStyle = computed(() => {
  const style = {
    height: `${navBarInfo.value.totalHeight}px`,
    paddingTop: `${navBarInfo.value.statusBarHeight}px`,
  };

  const menuRect = navBarInfo.value.menuButtonRect;
  if (!menuRect || !menuRect.left) {
    return style;
  }

  const windowWidth = uni.getWindowInfo().windowWidth || 0;
  const rightReserve = Math.max(windowWidth - menuRect.left + 8, 0);
  style.paddingRight = `${rightReserve}px`;
  return style;
});

// 导航内容区高度使用 navBarHeight，保存按钮保持在可用区域最右侧
const navRowStyle = computed(() => ({
  height: `${navBarInfo.value.navBarHeight}px`,
}));

// 以笔记本ID+笔记ID区分草稿，避免不同笔记互相覆盖
const buildStorageKey = (options = {}) => {
  const bookId = options.bookId || options.notesBookId || "default";
  const noteId = options.id || options.noteId || "new";
  return `note-editor-draft:${bookId}:${noteId}`;
};

// 把当前内容记录为“已保存”基线
const applySnapshot = () => {
  initialSnapshot.value = {
    title: noteTitle.value,
    content: noteContent.value,
  };
};

// 向编辑器回填 html（用于初始化或恢复草稿）
const setEditorContent = (content = "") => {
  if (!editorCtx.value || typeof editorCtx.value.setContents !== "function") {
    return;
  }
  editorCtx.value.setContents({
    html: content,
  });
};

// 从编辑器主动拉取最新内容，避免输入事件未及时同步
const syncContentFromEditor = () =>
  new Promise((resolve) => {
    if (!editorCtx.value || typeof editorCtx.value.getContents !== "function") {
      resolve();
      return;
    }

    editorCtx.value.getContents({
      success: (res) => {
        noteContent.value = String(res?.html || "");
        notePlainText.value = String(res?.text || "");
        resolve();
      },
      fail: () => resolve(),
    });
  });

// 本地草稿恢复
const readDraftFromStorage = () => {
  try {
    const cached = uni.getStorageSync(storageDraftKey.value);
    if (!cached || typeof cached !== "object") return null;

    return cached;
  } catch {
    return null;
  }
};
// 将草稿数据应用到编辑器和快照
const applyDraftData = (cached = {}) => {
  noteTitle.value = String(cached.title || "");
  noteContent.value = normalizeToHtml(cached.content || "");
  notePlainText.value = String(cached.text || stripHtml(noteContent.value));
  applySnapshot();
  setTimeout(() => {
    setEditorContent(noteContent.value);
  }, 0);
};

const loadDraftFromStorage = () => {
  const cached = readDraftFromStorage();
  if (!cached) return false;

  applyDraftData(cached);
  return true;
};

const clearDraftFromStorage = (key = storageDraftKey.value) => {
  try {
    uni.removeStorageSync(key);
  } catch {
    // ignore storage write error
  }
};

const loadNoteFromCloud = async () => {
  if (!notesBookId.value || !noteId.value) return false;

  try {
    const res = await getNotebookNoteDetailAPI({
      id: noteId.value,
      bookId: notesBookId.value,
    });

    if (res.code !== 200 || !res.data) {
      throw new Error(res.message || "获取笔记详情失败");
    }

    noteTitle.value = String(res.data.title || "");
    noteContent.value = normalizeToHtml(res.data.content || "");
    notePlainText.value = stripHtml(noteContent.value);
    applySnapshot();
    setTimeout(() => {
      setEditorContent(noteContent.value);
    }, 0);
    return true;
  } catch (error) {
    console.error("加载云端笔记失败:", error);
    return false;
  }
};

// 接收路由参数（编辑态）或回退到本地草稿（新建态）
const hydrateFromOptions = (options = {}) => {
  const inputTitle = options.title
    ? decodeURIComponent(String(options.title))
    : "";
  const inputContent = options.content
    ? decodeURIComponent(String(options.content))
    : "";

  if (inputTitle || inputContent) {
    noteTitle.value = inputTitle;
    noteContent.value = normalizeToHtml(inputContent);
    notePlainText.value = stripHtml(noteContent.value);
    applySnapshot();
    setTimeout(() => {
      setEditorContent(noteContent.value);
    }, 0);
    return;
  }

  loadDraftFromStorage();
};

const initializeNoteData = async (options = {}) => {
  if (noteId.value && notesBookId.value) {
    const cloudLoaded = await loadNoteFromCloud();
    const cached = readDraftFromStorage();

    if (cached && cached.pendingCloudSync) {
      applyDraftData(cached);
      return;
    }

    if (!cloudLoaded && !cached) {
      uni.showToast({
        title: "加载云端笔记失败",
        icon: "none",
      });
    }

    if (!cloudLoaded && cached) {
      applyDraftData(cached);
    }
    return;
  }

  hydrateFromOptions(options);
};

// sp-editor 初始化时拿到 editorCtx 并做一次内容回填
const handleEditorInit = (ctx) => {
  editorCtx.value = ctx;
  if (!noteContent.value) return;
  setTimeout(() => {
    setEditorContent(noteContent.value);
  }, 100);
};

// 编辑器输入事件：同步 html 与纯文本
const handleEditorInput = ({ html, text }) => {
  noteContent.value = String(html || "");
  notePlainText.value = String(text || "");
};

// 持久化草稿
const persistDraft = (extraPayload = {}) => {
  const payload = {
    title: noteTitle.value,
    content: noteContent.value,
    text: notePlainText.value,
    updatedAt: Date.now(),
    pendingCloudSync: false,
    ...extraPayload,
  };

  uni.setStorageSync(storageDraftKey.value, payload);
};

// 保存入口：先校验，再落本地草稿并更新快照
const handleSave = async () => {
  await syncContentFromEditor();

  const title = String(noteTitle.value || "").trim();
  const contentText = String(notePlainText.value || "").trim();

  if (!title && !contentText) {
    uni.showToast({
      title: "请输入内容后再保存",
      icon: "none",
      position: "bottom",
    });
    return;
  }

  try {
    // 未关联笔记本时，走本地草稿保存模式
    if (!notesBookId.value) {
      persistDraft();
      applySnapshot();
      uni.showToast({
        title: "已保存到本地草稿",
        icon: "success",
        position: "top",
      });
      return;
    }

    // 云端保存前先落一次本地草稿，避免网络失败时内容丢失
    persistDraft();
    const oldDraftKey = storageDraftKey.value;

    const res = await saveNotebookNoteAPI({
      id: noteId.value || undefined,
      bookId: notesBookId.value,
      title,
      content: noteContent.value,
    });

    if (res.code !== 200) {
      throw new Error(res.message || "云端保存失败");
    }

    const savedId = String(res?.data?.id || noteId.value || "");
    if (savedId && !noteId.value) {
      noteId.value = savedId;
      storageDraftKey.value = buildStorageKey({
        bookId: notesBookId.value,
        noteId: savedId,
      });
    }

    clearDraftFromStorage(oldDraftKey);
    clearDraftFromStorage();
    applySnapshot();
    uni.showToast({
      title: "云端保存成功",
      icon: "success",
      position: "top",
    });
  } catch (error) {
    console.error("保存笔记失败:", error);

    try {
      persistDraft({ pendingCloudSync: true });
      applySnapshot();
    } catch (storageError) {
      console.error("保存本地草稿失败:", storageError);
    }

    uni.showToast({
      title: "云端失败，已保存到本地",
      icon: "none",
      position: "top",
    });
  }
};

// 离开确认弹窗
const confirmLeave = () => {
  uni.showModal({
    title: "放弃修改？",
    content: "当前笔记尚未保存，确定离开编辑页吗？",
    confirmText: "离开",
    cancelText: "继续编辑",
    success: ({ confirm }) => {
      if (!confirm) return;
      isBypassBackGuard.value = true;
      uni.navigateBack();
    },
    position: "top",
  });
};

// 点击取消：有变更时先确认

const handleCancel = () => {
  if (!hasUnsavedChanges.value) {
    uni.navigateBack();
    return;
  }
  confirmLeave();
};

// 生命周期：加载参数、刷新布局
onLoad((options = {}) => {
  notesBookId.value = String(options.bookId || options.notesBookId || "").trim();
  noteId.value = String(options.id || options.noteId || "").trim();
  storageDraftKey.value = buildStorageKey({
    bookId: notesBookId.value,
    noteId: noteId.value,
  });

  initializeNoteData(options);
  refreshLayoutInfo();
});

onShow(() => {
  refreshLayoutInfo();
});

// 物理返回键拦截，避免误退出造成内容丢失
onBackPress(() => {
  if (isBypassBackGuard.value || !hasUnsavedChanges.value) {
    return false;
  }
  confirmLeave();
  return true;
});
</script>

<style scoped>
.note-editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f3f0ea 0%, #faf8f4 100%);
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
  position: relative;
  box-sizing: border-box;
}

.cancel-btn {
  width: 132rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6rpx;
  z-index: 2;
}

.cancel-text {
  font-size: 30rpx;
  color: #5f6779;
}

.mode-switch {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 320rpx;
  max-width: calc(100% - 300rpx);
  height: 66rpx;
  padding: 4rpx;
  border-radius: 34rpx;
  background: #e9e4db;
  display: flex;
  align-items: center;
  z-index: 1;
}

.mode-item {
  flex: 1;
  height: 58rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-item.active {
  background: #ffffff;
  box-shadow: 0 3rpx 10rpx rgba(47, 58, 84, 0.12);
}

.mode-text {
  font-size: 26rpx;
  color: #666f82;
}

.mode-text.active {
  color: #323b4f;
  font-weight: 600;
}

.save-btn {
  margin-left: 0;
  flex-shrink: 0;
  width: 132rpx;
  height: 68rpx;
  border-radius: 36rpx;
  background: linear-gradient(135deg, #3f71ff 0%, #2f57d5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  box-shadow: 0 8rpx 16rpx rgba(61, 101, 226, 0.24);
  z-index: 2;
}

.save-text {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 600;
}

.editor-scroll {
  flex: 1;
  min-height: 0;
}

.editor-body {
  padding: 28rpx 26rpx 34rpx;
}

.title-input {
  height: 96rpx;
  font-size: 50rpx;
  color: #4a5162;
  font-weight: 700;
}

.title-placeholder {
  color: #9ea6b6;
  font-size: 58rpx;
}

.title-divider {
  height: 2rpx;
  background: #cfd5e4;
  margin-bottom: 12rpx;
}

.panel {
  border-radius: 26rpx;
  border: 2rpx solid #d3daeb;
  background: #ffffff;
  box-shadow:
    0 10rpx 20rpx rgba(131, 144, 172, 0.08),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.6);
  padding: 24rpx;
}

.editor-panel {
  min-height: 720rpx;
  height: 720rpx;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.note-editor-wrapper {
  flex: 1;
  min-height: 0;
  border-radius: 22rpx;
  overflow: hidden;
}

.preview-panel {
  min-height: 720rpx;
  overflow: auto;
}

.preview-rich {
  font-size: 32rpx;
  color: #4f576b;
  line-height: 1.8;
}

:deep(.sp-editor) {
  height: 100%;
}

:deep(.sp-editor-toolbar) {
  border-bottom: 1rpx solid #e4e9f5;
  background: #f8faff;
}

:deep(.sp-editor-wrapper) {
  height: calc(100% - 72rpx);
}

:deep(.editor-container) {
  padding: 14rpx 18rpx;
  font-size: 16px;
  color: #4f576b;
  line-height: 1.75;
}
</style>