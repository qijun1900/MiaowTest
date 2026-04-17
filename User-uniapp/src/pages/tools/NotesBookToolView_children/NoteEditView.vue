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
              @upinImage="handleEditorUploadImage"
            />
          </view>
        </view>

        <view v-else class="panel preview-panel">
          <rich-text class="preview-rich" :nodes="previewHtml"></rich-text>
        </view>

        <view class="tag-selector-block">
          <TagSelector
            :show="true"
            v-model="noteTags"
            title="笔记标签"
            :default-tags="defaultNoteTags"
            :max-visible-selected-tags="6"
            :max-visible-recommended-tags="12"
            :allow-custom-input="editorMode === 'edit'"
            :read-only="editorMode === 'preview'"
            theme="default"
          />
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onBackPress, onLoad, onUnload } from "@dcloudio/uni-app";
import TagSelector from "../../../components/core/TagSelector.vue";
import { useNavBarSafeArea } from "../../../composables/useNavBarSafeArea";
import {
  stripHtml,
  normalizeToHtml,
  buildNotePreviewHtml,
} from "../../../util/notePreview";
import {
  getNotebookNoteDetailAPI,
  saveNotebookNoteAPI,
} from "../../../API/Tools/NotesBookAPI";
import {
  deleteRemoteImageFile,
  uploadSingleFile,
} from "../../../composables/useImageUpload";

// 顶部导航与安全区适配（可复用于其他页面）
const { 
    safeAreaInfo, 
    customNavbarStyle, 
    navRowStyle 
  } = useNavBarSafeArea({
  reserveMenuButtonRight: true, // 小程序端为右上角胶囊预留空间，避免标题/按钮遮挡
  rightPaddingExtra: 8, // 在胶囊安全距离基础上额外增加一点视觉留白
});

// 编辑页核心状态：标题、富文本内容、纯文本内容（用于空内容校验）
const noteTitle = ref("");
const noteContent = ref("");
const notePlainText = ref("");
const noteTags = ref([]);
const editorMode = ref("edit");
const isBypassBackGuard = ref(false);
const storageDraftKey = ref("note-editor-draft:default:new");
const editorCtx = ref(null);
const notesBookId = ref("");
const noteId = ref("");
const EDITOR_IMAGE_MAX_SIZE = 10 * 1024 * 1024;
const NOTEBOOK_CLOUD_PATH_PREFIX = "user/notebook";
const pendingUploadedImageUrls = ref([]);
const isCleaningPendingUploads = ref(false);
const defaultNoteTags = [
  "复习",
  "重点",
  "易错",
  "知识点",
  "待整理",
  "待补充",
  "总结",
  "灵感",
];

// 用于未保存变更比对的快照
const initialSnapshot = ref({
  title: "",
  content: "",
  tags: [],
});

const normalizeSingleTag = (tag) => {
  if (typeof tag === "string") return tag.trim();
  if (typeof tag === "number") return String(tag).trim();

  if (tag && typeof tag === "object") {
    const maybeText = tag.text ?? tag.label ?? tag.name ?? tag.value;
    return typeof maybeText === "string"
      ? maybeText.trim()
      : String(maybeText || "").trim();
  }

  return "";
};

const normalizeTagList = (list = []) => {
  const normalized = [];

  for (const item of Array.isArray(list) ? list : []) {
    const text = normalizeSingleTag(item);
    if (text && !normalized.includes(text)) {
      normalized.push(text);
    }
  }

  return normalized;
};

const isSameTagList = (left = [], right = []) => {
  const leftList = normalizeTagList(left);
  const rightList = normalizeTagList(right);

  if (leftList.length !== rightList.length) return false;
  return leftList.every((item, index) => item === rightList[index]);
};

// sp-editor 工具栏配置：开启 image 按键以支持插图上传
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
    "image",
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
    noteContent.value !== initialSnapshot.value.content ||
    !isSameTagList(noteTags.value, initialSnapshot.value.tags)
  );
});

// 预览区渲染内容：标题单独拼接，正文优先用富文本
const previewHtml = computed(() => {
  return buildNotePreviewHtml({
    title: noteTitle.value,
    content: noteContent.value,
  });
});

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
    tags: normalizeTagList(noteTags.value),
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

const normalizeImageUrl = (value = "") => String(value || "").trim();

const extractImageUrlsFromHtml = (html = "") => {
  const content = String(html || "");
  if (!content || !/<img\b/i.test(content)) {
    return [];
  }

  const result = [];
  content.replace(
    /<img\b[^>]*\bsrc\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    (fullMatch, quoted, doubleQuoted, singleQuoted, bare) => {
      const source = normalizeImageUrl(doubleQuoted || singleQuoted || bare || "");
      if (!source) return fullMatch;

      result.push(source);
      return fullMatch;
    },
  );

  return Array.from(new Set(result));
};

const trackPendingUploadedImage = (url = "") => {
  const normalizedUrl = normalizeImageUrl(url);
  if (!normalizedUrl) return;
  if (pendingUploadedImageUrls.value.includes(normalizedUrl)) return;

  pendingUploadedImageUrls.value.push(normalizedUrl);
};

const cleanupRemoteImagesByUrls = async (urlList = []) => {
  const queue = Array.from(
    new Set(
      (Array.isArray(urlList) ? urlList : []).map((item) =>
        normalizeImageUrl(item),
      ),
    ),
  ).filter(Boolean);

  const failedUrls = [];

  for (const imageUrl of queue) {
    try {
      await deleteRemoteImageFile(imageUrl, { showToast: false });
    } catch (error) {
      failedUrls.push(imageUrl);
      console.warn("清理未保存上传图片失败:", imageUrl, error);
    }
  }

  return failedUrls;
};

// 保存后仅清理“已上传但当前正文未引用”的图片；放弃编辑时清理所有待提交图片。
const cleanupPendingUploadedImages = async ({ forceAll = false } = {}) => {
  if (isCleaningPendingUploads.value) return;

  const snapshot = Array.from(new Set(pendingUploadedImageUrls.value)).filter(
    Boolean,
  );
  if (!snapshot.length) return;

  isCleaningPendingUploads.value = true;
  try {
    const currentContentImageSet = new Set(
      extractImageUrlsFromHtml(noteContent.value),
    );
    const cleanupTargets = forceAll
      ? snapshot
      : snapshot.filter((url) => !currentContentImageSet.has(url));

    if (!cleanupTargets.length) {
      if (!forceAll) {
        pendingUploadedImageUrls.value = [];
      }
      return;
    }

    const failedUrls = await cleanupRemoteImagesByUrls(cleanupTargets);
    pendingUploadedImageUrls.value = failedUrls;
  } finally {
    isCleaningPendingUploads.value = false;
  }
};

const handleDiscardAndLeave = async () => {
  await cleanupPendingUploadedImages({ forceAll: true });
  isBypassBackGuard.value = true;
  uni.navigateBack();
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
  noteTags.value = normalizeTagList(cached.tags || []);
  pendingUploadedImageUrls.value = [];
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

// 云端加载笔记详情，编辑态优先展示云端内容，失败时回退到本地草稿（如果有）
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
    noteTags.value = normalizeTagList(res?.data?.tags || []);
    pendingUploadedImageUrls.value = [];
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
    noteTags.value = [];
    pendingUploadedImageUrls.value = [];
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

const getEditorTempFilePath = (file = {}) => {
  return String(file?.tempFilePath || file?.path || file?.url || "").trim();
};

const insertImageToEditor = (ctx, source) =>
  new Promise((resolve, reject) => {
    if (!ctx || typeof ctx.insertImage !== "function") {
      reject(new Error("编辑器未初始化"));
      return;
    }

    ctx.insertImage({
      src: source,
      alt: "note-image",
      success: () => resolve(),
      fail: (error) => {
        reject(new Error(error?.errMsg || "插入图片失败"));
      },
    });
  });

// 处理 sp-editor 图片按钮上传（自动兼容 OSS / 微信云托管）
const handleEditorUploadImage = async (tempFiles = [], eventEditorCtx) => {
  const fileList = Array.isArray(tempFiles) ? tempFiles : [];
  if (!fileList.length) return;

  const currentEditorCtx =
    eventEditorCtx && typeof eventEditorCtx.insertImage === "function"
      ? eventEditorCtx
      : editorCtx.value;

  if (!currentEditorCtx) {
    uni.showToast({
      title: "编辑器尚未就绪",
      icon: "none",
      position: "top",
    });
    return;
  }

  let successCount = 0;
  let failCount = 0;
  let oversizeCount = 0;

  uni.showLoading({
    title: "上传图片中",
    mask: true,
  });

  try {
    for (const fileItem of fileList) {
      const localPath = getEditorTempFilePath(fileItem);
      const fileSize = Number(fileItem?.size || 0);

      if (!localPath) {
        failCount += 1;
        continue;
      }

      if (fileSize > 0 && fileSize > EDITOR_IMAGE_MAX_SIZE) {
        failCount += 1;
        oversizeCount += 1;
        continue;
      }

      try {
        const uploadResult = await uploadSingleFile(localPath, {
          cloudPathPrefix: NOTEBOOK_CLOUD_PATH_PREFIX,
          formData: {
            biz: "notebook",
          },
        });
        try {
          await insertImageToEditor(currentEditorCtx, uploadResult.url);
          trackPendingUploadedImage(uploadResult.url);
        } catch (insertError) {
          await cleanupRemoteImagesByUrls([uploadResult.url]);
          throw insertError;
        }
        successCount += 1;
      } catch (error) {
        failCount += 1;
        console.error("笔记编辑器图片上传失败:", error);
      }
    }
  } finally {
    uni.hideLoading();
  }

  await syncContentFromEditor();

  if (failCount > 0) {
    const failMessage =
      oversizeCount > 0
        ? `有${oversizeCount}张超过10MB，未插入`
        : "图片上传失败，请稍后重试";

    uni.showToast({
      title:
        successCount > 0
          ? `已插入${successCount}张，${failMessage}`
          : failMessage,
      icon: "none",
      position: "top",
    });
  }
};

// 持久化草稿
const persistDraft = (extraPayload = {}) => {
  const payload = {
    title: noteTitle.value,
    content: noteContent.value,
    text: notePlainText.value,
    tags: normalizeTagList(noteTags.value),
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
  const tags = normalizeTagList(noteTags.value);

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
      await cleanupPendingUploadedImages({ forceAll: false });
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
      tags,
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
    await cleanupPendingUploadedImages({ forceAll: false });
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
      await cleanupPendingUploadedImages({ forceAll: false });
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
      handleDiscardAndLeave();
    },
    position: "top",
  });
};

// 点击取消：有变更时先确认

const handleCancel = () => {
  if (!hasUnsavedChanges.value) {
    if (!pendingUploadedImageUrls.value.length) {
      uni.navigateBack();
      return;
    }
    handleDiscardAndLeave();
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
});

// 物理返回键拦截，避免误退出造成内容丢失
onBackPress(() => {
  if (isBypassBackGuard.value) {
    return false;
  }

  if (!hasUnsavedChanges.value) {
    if (!pendingUploadedImageUrls.value.length) {
      return false;
    }
    handleDiscardAndLeave();
    return true;
  }

  confirmLeave();
  return true;
});

onUnload(() => {
  if (!pendingUploadedImageUrls.value.length) return;
  cleanupPendingUploadedImages({ forceAll: true });
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
  min-height: 1000rpx;
  height: 1000rpx;
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
  min-height: 1000rpx;
  overflow: auto;
}

.preview-rich {
  font-size: 32rpx;
  color: #4f576b;
  line-height: 1.8;
}

.tag-selector-block {
  margin-top: 18rpx;
}

.tag-selector-block :deep(.tags-section) {
  margin: 0;
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