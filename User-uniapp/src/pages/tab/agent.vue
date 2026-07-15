<template>
    <page-meta page-style="overflow: hidden;" />
    <ThemeProvider>
    <view class="container" :style="containerStyle">
        <!--
            AgentHeader 内部结构说明：
            · .top-wrapper  →  flex 占位 spacer（高度 = 导航栏总高）
            · .custom-navbar →  position:fixed，真正悬浮在顶部
        -->
        <AgentHeader
            :model-list="modelList"
            :initial-model="currentModelName || '暂无模型'"
            :conversation-title="currentConversationTitle"
            :favorited="currentIsFavorited"
            @menu-click="handleMenuClick"
            @new-chat="handleNewChat"
            @model-change="handleModelChange"
            @option-click="handleOptionClick"
            @model-sheet-toggle="handleModelSheetToggle"
            @touchstart="handleTouchStart"
        />

        <!-- 下拉刷新浮层 -->
        <view v-if="isRefreshing" class="refresh-overlay">
            <AiThinking />
        </view>

        <!-- 内容滚动区 -->
        <scroll-view
            class="content"
            scroll-y
            :show-scrollbar="false"
            :scroll-into-view="scrollToViewId"
            @scroll="handleScroll"
            @touchstart="onContentTouchStart"
            @touchend="onContentTouchEnd"
        >
            <view class="content-inner" :style="contentInnerStyle">
                <WelcomePanel 
                    :show="showWelcomePanel" 
                    @action-click="handleWelcomeActionClick" 
                />
                
                <ChatSkeleton v-if="loadingConversationId" />

                <view class="bubble-test-area" v-if="messageList.length > 0">
                    <view
                        v-for="(msg, index) in messageList"
                        :key="msg._msgId"
                        :id="msg._msgId"
                        class="msg-anchor"
                    >
                        <view v-if="msg.role === 'assistant' && msg.skillName && !msg.pending" class="msg-skill-tag">
                            <t-icon name="lightbulb" size="20" color="var(--app-brand)" />
                            <text class="msg-skill-tag-text">{{ msg.skillName }}</text>
                        </view>
                        <ThoughtChain
                            v-if="msg.role === 'assistant' && (msg.reasoning || msg.thinkingStatus === 'thinking')"
                            :status="msg.thinkingStatus || 'thinking'"
                            :content="msg.reasoning || ''"
                            :auto-collapse="true"
                            max-width="100%"
                        />
                        <Bubble
                            :content="msg.content"
                            :images="msg.images || []"
                            :files="msg.files || []"
                            :show-avatar="false"
                            :shape="msg.role === 'user' ? 'corner' : undefined"
                            :variant="msg.role === 'user' ? 'solid' : undefined"
                            :placement="msg.role === 'user' ? 'end' : 'start'"
                            :max-width="msg.role === 'user' ? '650rpx' : '100%'"
                            :is-markdown="msg.role === 'assistant'"
                            :no-style="msg.role === 'assistant'"
                            :loading="msg.pending && !(msg.role === 'assistant' && (msg.thinkingStatus === 'thinking' || msg.reasoning))"
                            :typing="msg.typing ? { step: 5, interval: 15, suffix: '|' } : false"
                            @finish="handleBubbleFinish(index)"
                        >
                            <template #loading>
                                <AiThinking />
                            </template>
                        </Bubble>
                    </view>
                    <view id="msg-mid"></view>
                    <view id="msg-bottom"></view>
                    <!--
                        滚动占位：仅当 AI 正在生成（pending / streaming）时启用。
                        作用是让用户的新消息能被 scroll-into-view 顶到头部下沿；
                        AI 生成结束后自动移除，避免最后一条消息下方出现整屏白屏。
                    -->
                    <view v-if="showScrollSpacer" class="scroll-spacer" :style="spacerStyle"></view>
                    <AgentActionBar
                        v-if="showActionBar"
                        :content="lastAIMessage?.content || ''"
                        :favorited="lastAIMessage?.favorited || false"
                        :actions="['copy', 'regenerate', 'save-note']"
                        @copy="handleActionCopy"
                        @favorite="(liked) => handleActionFavorite(lastAIIndex, liked)"
                        @regenerate="handleActionRegenerate"
                        @save-note="handleOpenNotebookPicker"
                    />
                    <AiDisclaimer v-if="showActionBar" />
                </view>

                <!-- <PromptTags @select="handlePromptSelect" /> -->
            </view>
        </scroll-view>

        <!--
            当 container 的 bottom 随键盘上移时，sender 自然贴在容器底部，
            即键盘顶部，不会留下任何灰色空隙。
        -->
        <view
            v-if="hasModels && isLoggedIn"
            class="sender-area"
            :class="{ 'sender-area-hidden': modelSheetVisible }"
            :style="senderAreaStyle"
        >
            <SkillBar
                :skills="skillList"
                :active-key="activeSkillKey"
                @select="handleSkillSelect"
            />
            <AgentSender
                placeholder="在此处输入内容..."
                v-model="senderText"
                v-model:thinking="thinkingMode"
                :pending-images="pendingAttachments"
                :uploading="isUploading"
                :show-thinking-toggle="showThinkingToggle"
                :is-show-thingking-but="currentSupportsThinking"
                :show-attachment="true"
                :pending="isAIStreaming"
                @add-attachment="handleAddAttachment"
                @submit="handleSenderSubmit"
                @stop="handleStopStream"
                @focus="handleSenderFocus"
                @blur="handleSenderBlur"
            >
                <template #images>
                    <AgentUploader
                        ref="uploaderRef"
                        mode="editable"
                        :images="pendingAttachments"
                        :max-count="9"
                        @remove="(idx) => removePendingAttachment(idx)"
                        @retry="(idx) => retryAttachment(idx)"
                        @files-chosen="handleFilesChosen"
                        @warning="handleUploaderWarning"
                    />
                </template>
            </AgentSender>
        </view>

        <!-- 自定义遮罩：tPopup 的 overlay 在 fixed 容器内会阻断交互，改用独立 view -->
        <view
            v-if="notebookPickerVisible"
            class="notebook-overlay"
            @click="handleClosePicker"
        />
        <!-- 保存到笔记本 选择弹窗 — 必须在 .container 最外层以避免 overflow:hidden 裁剪 -->
        <tPopup
            v-model:show="notebookPickerVisible"
            title="保存到笔记本"
            :closeable="true"
            :overlay="false"
            bg-color="#ffffff"
            @close="handleClosePicker"
        >
            <template #popupcontent>
                <view class="notebook-picker">
                    <view v-if="notebookLoading" class="skeleton-list">
                        <view v-for="i in 4" :key="i" class="skeleton-item">
                            <view class="skeleton-avatar"></view>
                            <view class="skeleton-lines">
                                <view class="skeleton-line skeleton-line-title"></view>
                                <view class="skeleton-line skeleton-line-meta"></view>
                            </view>
                        </view>
                    </view>
                    <view
                        v-else-if="!notebookList.length"
                        class="picker-state"
                    >
                        <text class="picker-state-text">还没有笔记本，去笔记本工具创建一个吧～</text>
                    </view>
                    <scroll-view
                        v-else
                        scroll-y
                        class="notebook-scroll"
                        :show-scrollbar="false"
                    >
                        <view
                            v-for="book in notebookList"
                            :key="book._id"
                            class="notebook-item"
                            :class="{ 'notebook-item-saving': savingBookId === book._id }"
                            hover-class="notebook-item-active"
                            @click="handlePickNotebook(book)"
                        >
                            <view class="notebook-icon">
                                <t-icon name="book" size="20" color="#999" />
                            </view>
                            <view class="notebook-info">
                                <text class="notebook-title">{{ book.title }}</text>
                                <text class="notebook-meta">{{ book.noteCount || 0 }} 篇笔记</text>
                            </view>
                            <view v-if="savingBookId === book._id" class="notebook-saving">
                                <view class="spinner-circle-small"></view>
                            </view>
                            <view v-else-if="savedBookId === book._id" class="notebook-saved">
                                <t-icon name="check-circle-filled" size="22" color="#22c55e" />
                            </view>
                            <view v-else class="notebook-arrow">
                                <t-icon name="chevron-right" size="20" color="#cbd5e1" />
                            </view>
                        </view>
                    </scroll-view>
                </view>
            </template>
        </tPopup>

        <!-- 侧边栏支持手势关闭  -->
        <AgentSidebar
            v-model:show="sidebarVisible"
            :conversations="conversationList"
            :current-chat-id="currentConversationId"
            :loading-chat-id="loadingConversationId"
            @select-chat="handleSelectChat"
            @new-chat="handleNewChat"
            @search-click="handleSearchClick"
            @filter-change="handleSidebarFilterChange"
        />

        <!-- 自定义 TabBar -->
        <CustomTabBar
            :current-index="2"
            :visible="isTabBarVisible"
        />
        <!-- 删除会话确认弹窗 -->
        <t-dialog
            :visible="deleteDialogVisible"
            title="删除会话"
            content="确定要删除该会话吗？删除后不可恢复。"
            :confirm-btn="{ content: '删除', theme: 'danger', variant: 'text' }"
            :cancel-btn="{ content: '取消', variant: 'text' }"
            class="simple-delete-dialog"
            @confirm="handleConfirmDeleteConversation"
            @cancel="deleteDialogVisible = false"
            @close="deleteDialogVisible = false"
        />

        <!-- 重命名会话弹窗 -->
        <t-dialog
            :visible="renameDialogVisible"
            title="重命名会话"
            :confirm-btn="{ content: '确定', variant: 'text' }"
            :cancel-btn="{ content: '取消', variant: 'text' }"
            destroy-on-close
            class="simple-rename-dialog"
            @confirm="handleConfirmRename"
            @cancel="renameDialogVisible = false"
            @close="renameDialogVisible = false"
        >
            <template #content>
                <view class="rename-input-wrap">
                    <t-input
                        v-model:value="renameInputValue"
                        placeholder="请输入新标题"
                        :clearable="true"
                        :autofocus="renameDialogVisible"
                        borderless
                    />
                </view>
            </template>
        </t-dialog>

        <!-- 自定义通知条：TMessage link 在小程序不可用，改用独立 view -->
        <view v-if="toastVisible" class="note-toast" @click="handleToastClick">
            <t-icon name="check-circle-filled" size="20" color="#22c55e" />
            <text class="note-toast-text">{{ toastText }}</text>
            <text class="note-toast-link">查看笔记</text>
        </view>
    </view>
    </ThemeProvider>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import AgentHeader from "../../components/modules/agent/AgentHeader.vue";
import AgentSender from "../../components/modules/agent/AgentSender.vue";
import AgentSidebar from "../../components/modules/agent/AgentSidebar.vue";
import Bubble from "../../components/modules/agent/Bubble.vue";
import WelcomePanel from "../../components/modules/agent/WelcomePanel.vue";
import ThoughtChain from "../../components/modules/agent/ThoughtChain.vue";
import PromptTags from "../../components/modules/agent/PromptTags.vue";
import AgentActionBar from "../../components/modules/agent/AgentActionBar.vue";
import AiThinking from "../../components/modules/agent/AiThinking.vue";
import AiDisclaimer from "../../components/modules/agent/AiDisclaimer.vue";
import ChatSkeleton from "../../components/modules/agent/ChatSkeleton.vue";
import AgentUploader from "../../components/modules/agent/AgentUploader.vue";
import SkillBar from "../../components/modules/agent/SkillBar.vue";
import tPopup from "../../components/core/tPopup.vue";
import ThemeProvider from "../../components/core/ThemeProvider.vue";
import CustomTabBar from "../../components/core/CustomTabBar.vue";
import { getNotebooksAPI, saveNotebookNoteAPI } from "../../API/Tools/NotesBookAPI.js";
import { useAgentAttachments } from "../../composables/useAgentAttachments.js";
import { useAutoTabBar } from "../../composables/useAutoTabBar.js";
import { usePullToRefresh } from "../../composables/usePullToRefresh.js";
import { UserInfoStore } from "../../stores/modules/UserinfoStore";
import {
        fetchAgentList,
        chatWithAgent,
        chatWithAgentStream,
        fetchConversationList,
        fetchConversationMessages,
        renameConversation,
        deleteConversation,
        toggleFavoriteConversation
    } from "../../API/LLM/AgentAPI.js"

// ─── 响应式状态 ────────────────────────────────────────────────────────────────
const userInfoStore = UserInfoStore();
const isLoggedIn = computed(() => userInfoStore.isLoggedIn);
const sidebarVisible = ref(false);
const modelSheetVisible = ref(false);
const senderText = ref("");
const thinkingMode = ref(false);
const showThinkingToggle = ref(true);
const showWelcomePanel = ref(true);
const messageList = ref([]);
const modelList = ref([]);
const currentModelKey = ref("");
const currentModelName = ref("");
const currentConversationId = ref(null);
const currentConversationTitle = ref("");
const conversationList = ref([]);
const loadingConversationId = ref(null);
let chatRequestSeq = 0;
let msgIdSeq = 0;
// 当前流式请求的可中止句柄 { promise, abort }
const streamHandle = ref(null);
// 当前流的「主动停止」标记,用于区分主动暂停和真实错误,避免回退到非流式接口
let userAborted = false;
const scrollToViewId = ref("");
let _toastTimer = null;
let _toastCallback = null;

// ─── 保存到笔记本 ──────────────────────────────────────────────────────────────
const notebookPickerVisible = ref(false);
const deleteDialogVisible = ref(false);
const pendingDeleteConversationId = ref(null);
const renameDialogVisible = ref(false);
const renameInputValue = ref("");
const notebookLoading = ref(false);
const notebookList = ref([]);
const savingBookId = ref("");
const toastVisible = ref(false);
const toastText = ref("");
const savedBookId = ref("");
const pendingNoteContent = ref("");
const pendingNoteUserText = ref("");

// ─── 技能栏 ─────────────────────────────────────────────────────────────────
const skillList = ref([
    { key: 'sentence-analyze', label: '长难句分析', icon: 'lightbulb' },
    { key: 'create-quiz', label: '出题', icon: 'edit-1' },
    { key: 'explain', label: '概念解释', icon: 'book' },
    { key: 'study-plan', label: '学习计划', icon: 'calendar-1' },
    { key: 'analyze', label: '数据分析', icon: 'chart-analytics' },
]);
const activeSkillKey = ref('');
const activeSkillName = computed(() => {
    const skill = skillList.value.find((s) => s.key === activeSkillKey.value);
    return skill?.label || '';
});

// ─── 附件上传组件引用 ────────────────────────────────────────────────────
const uploaderRef = ref(null);

const {
    attachments: pendingAttachments,
    isUploading,
    addFromChosenFiles,
    removeAttachment: removePendingAttachment,
    retryAttachment,
    clearAll: clearPendingAttachments,
    getUploadedImages,
    getUploadedFiles,
} = useAgentAttachments({ 
        maxCount: 9, 
        cloudPathPrefix: "user/agent_chat", 
        uploadFormData: { biz: "chat" }
    });

const handleFilesChosen = (files) => {
    addFromChosenFiles(files);
};

const handleUploaderWarning = (err) => {
    const msg = err?.data?.errMsg || err?.errMsg || err?.message || "选择文件失败";
    if (!/cancel/i.test(msg)) {
        uni.showToast({ title: msg, icon: "none" });
    }
};

const currentIsFavorited = computed(() => {
    if (!currentConversationId.value) return false;
    const conv = conversationList.value.find(c => c._id === currentConversationId.value);
    return conv?.isPinned || false;
});

const hasModels = computed(() => modelList.value.length > 0);

const isCurrentMultimodal = computed(() => {
    const cur = modelList.value.find((m) => m.value === currentModelKey.value);
    return !!cur?.isMultimodal;
});

const currentSupportsThinking = computed(() => {
    const cur = modelList.value.find((m) => m.value === currentModelKey.value);
    return !!cur?.supportThinking;
});

const {
    isRefreshing,
    pullTouchStart: rawPullTouchStart,
    pullTouchEnd,
} = usePullToRefresh({
    enabled: computed(() => showWelcomePanel.value && messageList.value.length === 0),
    onRefresh: () => Promise.all([loadAgentList(), loadConversationList()]),
});

const onContentTouchStart = (e) => {
    handleTouchStart(e);
    rawPullTouchStart(e);
};

const onContentTouchEnd = (e) => {
    handleTouchStart(e);
    pullTouchEnd(e);
};

const loadAgentList = async () => {
    try {
        const res = await fetchAgentList();
        const list = res?.data || [];
        if (list.length) {
            modelList.value = list.map((item) =>{
                return {
                    label: item.agentName,
                    value: item.agentKey,
                    isMultimodal: item.isMultimodal === 1,
                    supportThinking: item.supportThinking === 1
                };
            });
            currentModelName.value = list[0]?.agentName || "";
            currentModelKey.value = list[0]?.agentKey || "";
        } else {
            modelList.value = [];
            currentModelName.value = "";
            currentModelKey.value = "";
        }
    } catch (error) {
        console.error("加载Agent列表失败:", error.message);
    }
};

const loadConversationList = async (favoritesOnly = false) => {
    if (!isLoggedIn.value) {
        conversationList.value = [];
        return;
    }
    try {
        const params = favoritesOnly ? { favorites: 1 } : {};
        const res = await fetchConversationList(params);
        if (res?.data) {
            conversationList.value = res.data;
            if (currentConversationId.value) {
                const chat = conversationList.value.find(c => c._id === currentConversationId.value);
                if (chat) {
                    currentConversationTitle.value = chat.title;
                }
            }
        }
    } catch (error) {
        console.error("加载会话列表失败:", error.message);
    }
};

// ─── 键盘高度监听 ──────────────────────────────────────────────────────────────
const keyboardHeight = ref(0);
const systemInfo = uni.getSystemInfoSync();
const isAndroid = systemInfo.platform.toLowerCase() === 'android';

// TabBar 高度（与 CustomTabBar 内部一致：内容 50px + 安全区）
const TAB_BAR_CONTENT_HEIGHT_PX = 50;
const safeAreaBottomPx = systemInfo.safeAreaInsets?.bottom || 0;
const tabBarHeightPx = TAB_BAR_CONTENT_HEIGHT_PX + safeAreaBottomPx;

// ─── TabBar 自动隐藏与显示逻辑 ──────────────────────────────────────────────────
const {
        isTabBarVisible,
        handleScroll, // 监听内容区滚动以自动隐藏 TabBar
        handleTouchStart,// 监听输入区触摸以自动显示 TabBar
        handleSenderFocus, // 监听输入区 focus 以自动隐藏 TabBar
        handleSenderBlur // 监听输入区 blur 以自动隐藏 TabBar
    } = useAutoTabBar(keyboardHeight);

// H5：通过 visualViewport resize 计算键盘高度
const handleViewportResize = () => {
    // #ifdef H5
    if (typeof window !== "undefined" && window.visualViewport) {
        const diff = window.innerHeight - window.visualViewport.height;
        keyboardHeight.value = Math.max(0, diff);
    }
    // #endif
};

onMounted(() => {
    loadAgentList();
    loadConversationList();

    // 隐藏原生 TabBar
    uni.hideTabBar({ animation: false });

    // 测量 scroll-view 真实高度，用于动态计算底部占位
    setTimeout(measureScrollViewHeight, 100);

    // 监听搜索页选择的会话
    uni.$on("agent-select-conversation", handleSelectChat);
    // 监听会话删除后刷新列表
    uni.$on("agent-refresh-conversations", () => loadConversationList());

    // 小程序 / App 使用官方 API
    // #ifdef MP-WEIXIN || APP-PLUS
    uni.onKeyboardHeightChange((res) => {
        keyboardHeight.value = res.height || 0;
    });
    // #endif

    // H5 使用 visualViewport
    // #ifdef H5
    window.visualViewport?.addEventListener("resize", handleViewportResize);
    // #endif
});

onUnmounted(() => {
    uni.$off("agent-select-conversation", handleSelectChat);
    uni.$off("agent-refresh-conversations");

    // #ifdef MP-WEIXIN || APP-PLUS
    uni.offKeyboardHeightChange();
    // #endif

    // #ifdef H5
    window.visualViewport?.removeEventListener("resize", handleViewportResize);
    // #endif
});

/**
 * 容器的 bottom 随键盘高度收缩。
 *
 * 键盘弹起 → container.bottom = keyboardHeight → 容器只覆盖键盘上方可视区域
 * 键盘收起 → container.bottom = 0             → 容器重新撑满全屏
 *
 * sender 作为 flex 末项，始终贴在容器底部，
 * 即键盘顶部，彻底消除两者之间的灰色空白。
 */
const containerStyle = computed(() => {
    let pushingHeight = keyboardHeight.value;
    
    // #ifdef APP-PLUS
    if (isAndroid) {
        // App端安卓平台设置了 softinputMode: "adjustResize"
        // 键盘弹起时系统会自动缩小 Webview 高度，不再需要手动上推
        pushingHeight = 0;
    }
    // #endif

    return {
        bottom: pushingHeight > 0 ? `${pushingHeight}px` : "0px",
        transition: "bottom 0.25s ease",
    };
});

/**
 * sender 区域定位与内边距：
 * · 键盘弹起：bottom=0、仅小间距（容器底部已在键盘顶部，TabBar 也已隐藏）
 * · TabBar 可见：bottom 上移 TabBar 高度，避免被遮挡；安全区由 TabBar 承担
 * · TabBar 隐藏 + 键盘收起：bottom=0、加上 safe-area
 */
/**
 * 内容区底部留白：
 * TabBar 可见时，sender 上移了 tabBarHeight 像素，需要额外加上 TabBar 高度，
 * 否则最后一行 AiDisclaimer 会被悬浮的 sender 输入栏遮挡。
 */
const contentInnerStyle = computed(() => {
    const extra = !keyboardHeight.value && isTabBarVisible.value ? tabBarHeightPx : 0;
    // 260rpx 基础(sender) + 90rpx 技能栏(SkillBar) + TabBar 占位
    return { paddingBottom: `calc(350rpx + ${extra}px)` };
});

const senderAreaStyle = computed(() => {
    const keyboardUp = keyboardHeight.value > 0;
    const tabBarUp = !keyboardUp && isTabBarVisible.value;
    return {
        bottom: tabBarUp ? `${tabBarHeightPx}px` : "0px",
        paddingBottom:
            keyboardUp || tabBarUp
                ? "14rpx"
                : "calc(14rpx + env(safe-area-inset-bottom))",
        transition:
            "bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    };
});

const triggerVibrate = () => {
    uni.vibrateShort({ type: 'light', fail: () => {} });
};

// 思考模式开启/关闭时给予触感反馈，开启时强度更明显
watch(thinkingMode, (next, prev) => {
    if (next === prev) return;
    if (next) {
        uni.vibrateShort({ type: 'medium', fail: () => {} });
        uni.showToast({ title: '已开启深度思考', icon: 'none', position: 'top' });
    } else {
        uni.vibrateShort({ type: 'light', fail: () => {} });
    }
});

// ─── 事件处理 ──────────────────────────────────────────────────────────────────
/**
 * 把指定消息滚到 scroll-view 顶部（紧贴头部下沿）。
 * 通过先清空再赋值，强制 scroll-into-view 触发，即便重复目标也能再次滚动。
 */
const scrollToMessage = (msgId) => {
    if (!msgId) return;
    scrollToViewId.value = "";
    setTimeout(() => {
        scrollToViewId.value = msgId;
    }, 50);
};

const scrollToBottom = (smooth = false) => {
    if (smooth) {
        // 先滚到中间位置（慢），再滚到底部（快），模拟减速效果
        scrollToViewId.value = "";
        setTimeout(() => {
            scrollToViewId.value = "msg-mid";
            setTimeout(() => {
                scrollToViewId.value = "msg-bottom";
            }, 200);
        }, 50);
    } else {
        scrollToViewId.value = "";
        setTimeout(() => {
            scrollToViewId.value = "msg-bottom";
        }, 100);
    }
};

const handleMenuClick = () => {
    sidebarVisible.value = true;
};

const handleModelSheetToggle = (visible) => {
    modelSheetVisible.value = visible;
};

const handleSearchClick = () => {
    sidebarVisible.value = false;
    uni.navigateTo({ url: "/pages/agent/ConversationSearchView" });
};

const handleOptionClick = (action) => {
    if (action === "star") {
        handleToggleFavorite();
        return;
    }
    if (action === "rename") {
        renameInputValue.value = currentConversationTitle.value || "";
        renameDialogVisible.value = true;
        return;
    }
if (action === "delete") {
        if (!currentConversationId.value) {
            uni.showToast({ title: "请先选择一个会话", icon: "none" });
            return;
        }
        pendingDeleteConversationId.value = currentConversationId.value;
        deleteDialogVisible.value = true;
    }
};

const handleConfirmDeleteConversation = async () => {
    const targetId = pendingDeleteConversationId.value;
    deleteDialogVisible.value = false;
    if (!targetId) return;
    try {
        await deleteConversation(targetId);
        if (currentConversationId.value === targetId) {
            currentConversationId.value = null;
            currentConversationTitle.value = "";
            messageList.value = [];
            showWelcomePanel.value = true;
        }
        loadConversationList();
        uni.showToast({ title: "已删除", icon: "none", position: "top" });
    } catch (error) {
        uni.showToast({ title: "删除失败", icon: "none" });
        console.error("删除会话失败:", error.message);
    } finally {
        pendingDeleteConversationId.value = null;
    }
};

const handleConfirmRename = async () => {
    const newTitle = renameInputValue.value.trim();
    if (!newTitle) {
        uni.showToast({ title: "标题不能为空", icon: "none" });
        return;
    }
    renameDialogVisible.value = false;
    try {
        await renameConversation(currentConversationId.value, newTitle);
        currentConversationTitle.value = newTitle;
        loadConversationList();
        uni.showToast({ title: "重命名成功", icon: "none", position: "top" });
    } catch (error) {
        uni.showToast({ title: "重命名失败", icon: "none" });
        console.error("重命名会话失败:", error.message);
    }
};

const handleToggleFavorite = async () => {
    if (!currentConversationId.value) {
        uni.showToast({ title: "请先选择一个会话", icon: "none" });
        return;
    }
    try {
        const res = await toggleFavoriteConversation(currentConversationId.value);
        const data = res?.data || res;
        if (data && data.isPinned !== undefined) {
            const conv = conversationList.value.find(c => c._id === currentConversationId.value);
            if (conv) conv.isPinned = data.isPinned;
            uni.showToast({
                title: data.isPinned ? "已收藏" : "已取消收藏",
                icon: "none",
                position: "top"
            });
        }
    } catch (error) {
        console.error("切换收藏失败:", error.message);
        uni.showToast({ title: "操作失败", icon: "none" });
    }
};

const handleModelChange = (modelName, modelKey) => {
    if (!modelName) return;
    currentModelName.value = modelName;
    currentModelKey.value = modelKey;

    // 切换到不支持深度思考的模型时，自动关闭思考模式开关
    if (!currentSupportsThinking.value && thinkingMode.value) {
        thinkingMode.value = false;
    }

    // 切换到非多模态模型时，移除已选的图片附件（保留文档）
    if (!isCurrentMultimodal.value && pendingAttachments.value.length > 0) {
        const imgUrls = new Set(getUploadedImages());
        for (let i = pendingAttachments.value.length - 1; i >= 0; i--) {
            const a = pendingAttachments.value[i];
            const looksLikeImage = a.fileType === "image"
                || String(a.mimeType || "").startsWith("image/")
                || imgUrls.has(a.url);
            if (looksLikeImage) removePendingAttachment(i);
        }
    }

    uni.showToast({
        title: `切换到 ${modelName}`,
        icon: "none" ,
        position: "top",
    });
};

const handleNewChat = () => {
    currentConversationId.value = null;
    currentConversationTitle.value = "";
    messageList.value = [];
    clearPendingAttachments();
    showWelcomePanel.value = true;
    uni.showToast({ 
        title: "已回到新会话", 
        icon: "none" ,
        position: "top",
    });
};

const handleSidebarFilterChange = (filter) => {
    loadConversationList(filter === 'favorites');
};

const handleSelectChat = async (chatId) => {
    // 递增请求序号以消除快速切换时的竞态条件
    const requestSeq = ++chatRequestSeq;
    loadingConversationId.value = chatId;
    messageList.value = [];
    showWelcomePanel.value = false;
    sidebarVisible.value = false;

    try {
        const res = await fetchConversationMessages(chatId);
        // 仅当请求序号仍为最新时才应用结果，防止旧请求覆盖新请求
        if (requestSeq !== chatRequestSeq) return;

        currentConversationId.value = chatId;
        currentConversationTitle.value = conversationList.value.find(c => c._id === chatId)?.title || "";
        if (res?.data) {
            messageList.value = res.data.map(msg => ({
                _msgId: `msg-${++msgIdSeq}`,
                role: msg.role,
                content: msg.content,
                images: msg.ext?.images || [],
                files: msg.ext?.files || [],
                reasoning: msg.ext?.reasoning || '',
                thinkingStatus: msg.ext?.reasoning ? 'complete' : '',
                typing: false,
                pending: false,
                isStreaming: false
            }));
            showWelcomePanel.value = false;
            scrollToBottom(true);
        } else {
            messageList.value = [];
            showWelcomePanel.value = false;
        }
    } catch (error) {
        if (requestSeq !== chatRequestSeq) return;
        console.error("加载消息记录失败:", error.message);
        uni.showToast({ title: "加载历史消息失败", icon: "none" });
    } finally {
        if (requestSeq === chatRequestSeq) {
            loadingConversationId.value = null;
        }
    }
};

const handleWelcomeActionClick = (item) => {
    if (!item?.key) return;
    uni.showToast({ title: `点击了${item.title}`, icon: "none" });
};

const handleBubbleFinish = (index) => {
    if (messageList.value[index]) {
        messageList.value[index].typing = false;
    }
};
const lastAIIndex = computed(() => {
    for (let i = messageList.value.length - 1; i >= 0; i--) {
        if (messageList.value[i].role === 'assistant') return i;
    }
    return -1;
});

const lastAIMessage = computed(() => {
    const idx = lastAIIndex.value;
    return idx >= 0 ? messageList.value[idx] : null;
});

const showActionBar = computed(() => {
    const msg = lastAIMessage.value;
    return msg && !msg.pending && !msg.typing && !msg.isStreaming;
});

// AI 正在流式生成中 → AgentSender 显示停止按钮
const isAIStreaming = computed(() => {
    const last = messageList.value[messageList.value.length - 1];
    return !!(last && last.role === 'assistant' && (last.pending || last.isStreaming));
});

/**
 * 是否渲染底部滚动占位：仅在 AI 回复尚未完成时启用。
 * 这样既能保证新发送的用户消息可以被 scroll-into-view 顶到头部下方，
 * 又不会在对话结束后留下整屏白屏可滑动区域。
 */
const showScrollSpacer = computed(() => {
    const last = messageList.value[messageList.value.length - 1];
    return !!(last && last.role === 'assistant' && (last.pending || last.isStreaming));
});

/**
 * scroll-view 的真实可视高度（px）。
 * 在 onMounted 时通过 createSelectorQuery 测量一次，用于精确计算底部占位，
 * 避免使用 100vh 时溢出 scroll-view 自身高度而产生整屏白屏可滚动区。
 */
const scrollViewHeightPx = ref(0);

const measureScrollViewHeight = () => {
    const query = uni.createSelectorQuery();
    query.select(".content").boundingClientRect((rect) => {
        if (rect?.height) scrollViewHeightPx.value = rect.height;
    }).exec();
};

/**
 * 占位高度（px）动态计算：
 * 目标 = scroll-view 高度 − AI 气泡当前估算高度，
 * 保证用户消息能顶到头部下沿、且下方剩余空间正好一屏；
 * 当 AI 内容增长到能填满一屏时占位归 0，从源头杜绝整屏白屏可下滑。
 */
const spacerStyle = computed(() => {
    if (!showScrollSpacer.value || !scrollViewHeightPx.value) return { height: '0px' };
    const ai = lastAIMessage.value;
    // pending 且无内容时：AiThinking 已经在用户消息下方贴着展示，
    // 不需要再加占位，否则会让 AiThinking 下方多出一整屏空白可滚动区。
    if (ai?.pending && !ai?.content && !ai?.reasoning) return { height: '0px' };
    // 思考阶段（有 reasoning 但还没正式回复）：ThoughtChain 已撑起空间，
    // 继续保留整屏占位会导致用户可以把页面拉到全白屏。直接归 0，
    // 等正式 content 出现后再走下面的动态估算逻辑。
    if (ai?.thinkingStatus === 'thinking' && !ai?.content) return { height: '0px' };
    const chars = (ai?.content || '').length;
    const reasoningChars = (ai?.reasoning || '').length;
    const estimatedLineHeightPx = 25;
    const charsPerLine = 20;
    const lines = chars === 0 ? 1 : Math.ceil(chars / charsPerLine);
    const reasoningLines = reasoningChars === 0 ? 0 : Math.ceil(reasoningChars / charsPerLine);
    // ThoughtChain header 约 40px，content 行高同正文；正式回复区域基础高度约 40px
    const reasoningHeightPx = reasoningChars > 0 ? 40 + reasoningLines * estimatedLineHeightPx : 0;
    const estimatedAIHeightPx = 40 + lines * estimatedLineHeightPx + reasoningHeightPx;
    const target = Math.max(0, scrollViewHeightPx.value - estimatedAIHeightPx);
    return { height: `${target}px` };
});

const handleActionCopy = () => {
    // copy is handled inside AgentActionBar via uni.setClipboardData
};

const handleActionFavorite = (index, liked) => {
    if (messageList.value[index]) {
        messageList.value[index].favorited = liked;
    }
};

const handleActionRegenerate = () => {
    const lastUserIndex = lastAIIndex.value - 1;
    if (lastUserIndex < 0) return;
    const userMsg = messageList.value[lastUserIndex];
    if (!userMsg || userMsg.role !== 'user') return;

    // Remove the last AI message and re-submit
    messageList.value.splice(lastAIIndex.value, 1);
    handleSenderSubmit({
        text: userMsg.content,
        images: userMsg.images || [],
        files: userMsg.files || [],
    });
};

const handlePromptSelect = (prompt) => {
    if (!prompt?.label) return;
    senderText.value = prompt.label;
};

// ─── 技能栏点击 ────────────────────────────────────────────────────────────
const handleSkillSelect = (skill) => {
    if (!skill?.key) return;
    triggerVibrate();
    // 再次点击同一技能 → 取消激活
    if (activeSkillKey.value === skill.key) {
        activeSkillKey.value = '';
        return;
    }
    activeSkillKey.value = skill.key;

    // 长难句分析：弹出输入方式选择
    if (skill.key === 'sentence-analyze') {
        showSentenceAnalyzeSheet();
    }
};

// ─── 长难句分析 ──────────────────────────────────────────────────────────────
const showSentenceAnalyzeSheet = () => {
    uni.showActionSheet({
        itemList: ['输入句子', '拍照识别', '从相册选择'],
        success: ({ tapIndex }) => {
            handleSentenceAnalyzeAction(tapIndex);
        },
        fail: () => {
            // 用户取消 → 不清除 activeSkillKey，允许再次点击
        },
    });
};

/**
 * 确保当前模型支持多模态（图片识别）。
 * 若不支持，自动切换到第一个可用的多模态模型；若没有任何多模态模型，提示用户。
 * @returns {boolean} 是否就绪
 */
const ensureMultimodalModel = () => {
    if (isCurrentMultimodal.value) return true;
    const target = modelList.value.find((m) => m.isMultimodal);
    if (!target) {
        uni.showToast({ title: '没有可用的图片识别模型', icon: 'none' });
        return false;
    }
    handleModelChange(target.label, target.value);
    return true;
};

const handleSentenceAnalyzeAction = (actionIndex) => {
    if (actionIndex === 0) {
        // 输入句子：用户自己在输入框输入即可
        return;
    } else if (actionIndex === 1) {
        // 拍照
        if (!ensureMultimodalModel()) return;
        // #ifdef H5
        uploaderRef.value?.pickImage();
        // #endif
        // #ifndef H5
        uploaderRef.value?.pickImage({ sourceType: ['camera'] });
        // #endif
    } else if (actionIndex === 2) {
        // 相册
        if (!ensureMultimodalModel()) return;
        // #ifdef H5
        uploaderRef.value?.pickImage();
        // #endif
        // #ifndef H5
        uploaderRef.value?.pickImage({ sourceType: ['album'] });
        // #endif
    }
};

// ─── 保存到笔记本：打开选择弹窗 → 选择 → 保存 ──────────────────────────────
const handleOpenNotebookPicker = async (content) => {
    if (!isLoggedIn.value) {
        uni.showToast({ title: "请先登录", icon: "none" });
        return;
    }
    const safeContent = String(content || "").trim();
    if (!safeContent) {
        uni.showToast({ title: "暂无可保存的内容", icon: "none" });
        return;
    }
    pendingNoteContent.value = safeContent;
    // 取最后一句用户消息用于生成标题
    const lastUserMsg = [...messageList.value]
        .reverse()
        .find((m) => m.role === 'user');
    pendingNoteUserText.value = String(lastUserMsg?.content || "").trim();
    savingBookId.value = "";
    savedBookId.value = "";
    notebookPickerVisible.value = true;
    notebookLoading.value = true;
    try {
        const res = await getNotebooksAPI();
        notebookList.value = Array.isArray(res?.data) ? res.data : [];
    } catch (error) {
        console.error("获取笔记本列表失败:", error.message);
        uni.showToast({ title: "加载笔记本失败", icon: "none" });
        notebookList.value = [];
    } finally {
        notebookLoading.value = false;
    }
};

const showNoteToast = (text, callback) => {
    toastText.value = text;
    _toastCallback = callback;
    toastVisible.value = true;
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => {
        toastVisible.value = false;
        _toastCallback = null;
    }, 4000);
};

const handleToastClick = () => {
    if (_toastCallback) _toastCallback();
    toastVisible.value = false;
    clearTimeout(_toastTimer);
    _toastCallback = null;
};

const handleClosePicker = () => {
    if (savingBookId.value) return; // 保存中不允许关闭
    savedBookId.value = "";
    pendingNoteContent.value = "";
    pendingNoteUserText.value = "";
};

const buildNoteTitle = () => {
    // 取用户消息首行纯文本
    const userText = String(pendingNoteUserText.value || "")
        .split("\n")
        .map((line) =>
            line
                .replace(/^#{1,6}\s+/, "")
                .replace(/^\s*[-*+]\s+/, "")
                .replace(/^\s*\d+\.\s+/, "")
                .replace(/^\s*>\s+/, "")
                .replace(/[*_~`]+/g, "")
                .trim()
        )
        .find((line) => line.length > 0) || "AI 对话笔记";
    // 追加日期：YYYY-MM-DD
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return `${userText.slice(0, 20)} ${date}`;
};

const handlePickNotebook = async (book) => {
    if (!book?._id || savingBookId.value) return;
    savingBookId.value = book._id;
    try {
        const title = buildNoteTitle();
        const res = await saveNotebookNoteAPI({
            bookId: book._id,
            title,
            content: pendingNoteContent.value,
            tags: ["AI对话"],
            isMarkdown: true,
            isAIgenerated: true,
            AIIntegrationInfo: {
                model: currentModelName.value || undefined,
                source: "agent_chat",
            },
        });
        savedBookId.value = book._id;
        const noteId = res?.data?.id || "";
        showNoteToast(`已保存到《${book.title}》`, () => {
            if (noteId) {
                uni.navigateTo({
                    url: `/pages/tools/NotesBookToolView_children/NoteDetailView?bookId=${book._id}&id=${noteId}`,
                });
            } else {
                uni.navigateTo({
                    url: `/pages/tools/NotesBookToolView_children/NotesListView?id=${book._id}&title=${encodeURIComponent(book.title)}`,
                });
            }
        });
        // 短暂展示成功状态后自动关闭弹窗
        setTimeout(() => {
            notebookPickerVisible.value = false;
            savedBookId.value = "";
            pendingNoteContent.value = "";
            pendingNoteUserText.value = "";
        }, 700);
    } catch (error) {
        console.error("保存到笔记本失败:", error.message);
        uni.showToast({ title: "保存失败，请重试", icon: "none" });
    } finally {
        savingBookId.value = "";
    }
};

const handleAddAttachment = () => {
    if (pendingAttachments.value.length >= 9) {
        uni.showToast({ title: "最多上传9个附件", icon: "none" });
        return;
    }
    // 非多模态模型：禁用图片上传，直接打开文件选择器
    if (!isCurrentMultimodal.value) {
        uploaderRef.value?.pickFile();
        return;
    }
    uni.showActionSheet({
        itemList: ["图片", "文件"],
        success: ({ tapIndex }) => {
            if (tapIndex === 0) uploaderRef.value?.pickImage();
            else if (tapIndex === 1) uploaderRef.value?.pickFile();
        },
        fail: () => {},
    });
};

/**
 * 用户发送消息的主入口。
 * 优先使用流式接口，若流式未开始则回退到普通接口，最终兜底显示错误。
 *
 * 关键：所有对 AI 消息的读写必须通过 messageList.value[index] 访问响应式代理，
 * 不能用外部变量引用（push 前创建的对象是普通 JS 对象，不是 Vue 代理，修改不触发视图更新）。
 */
const handleSenderSubmit = async ({ text, images: existingImages, files: existingFiles } = {}) => {
    if (!isLoggedIn.value) {
        uni.showToast({ title: "请先登录", icon: "none" });
        return;
    }
    const hasText = text && text.trim().length > 0;
    // 重新生成时使用历史消息已有的图片/文件，否则使用本轮已上传的
    const imageUrls = existingImages?.length ? existingImages : getUploadedImages();
    const fileItems = existingFiles?.length ? existingFiles : getUploadedFiles();
    const hasImages = imageUrls.length > 0;
    const hasFiles = fileItems.length > 0;
    if (!hasText && !hasImages && !hasFiles) return;
    if (isUploading.value) {
        uni.showToast({ 
            title: "图片正在上传中，请稍候", 
            icon: "none" ,
            postion: "top",
        });
        return;
    }

    showWelcomePanel.value = false;
    // 记录当前技能场景，清除激活态
    const scene = activeSkillKey.value || '';
    const sceneName = activeSkillName.value || '';
    activeSkillKey.value = '';

    const userMsgId = `msg-${++msgIdSeq}`;
    messageList.value.push({
        _msgId: userMsgId,
        role: 'user',
        content: text || '',
        images: imageUrls,
        files: fileItems,
        typing: false,
    });
    senderText.value = "";
    clearPendingAttachments();
    triggerVibrate();

    // 通过 messageList.value 访问，确保拿到的是 Vue 响应式代理
    const aiIndex = messageList.value.length;
    const useThinking = thinkingMode.value && currentSupportsThinking.value;
    messageList.value.push({
        _msgId: `msg-${++msgIdSeq}`,
        role: 'assistant',
        content: '',
        reasoning: '',
        thinkingStatus: useThinking ? 'thinking' : '',
        typing: false,
        pending: true,
        isStreaming: true,
        skillName: scene ? sceneName : '',
    });
    // 将刚发出的用户消息滚到 scroll-view 顶部（紧贴头部下沿），
    // 让 AI 回复在其下方逐字流出，符合主流聊天产品体验
    scrollToMessage(userMsgId);

    const sendImages = hasImages ? imageUrls : undefined;
    const sendFiles = hasFiles ? fileItems : undefined;

    // 流式缓冲：按行/句提交，避免每个 token 都触发 mp-html 重渲染
    let streamBuffer = '';
    let lastFlushAt = 0;
    const FLUSH_INTERVAL_MS = 120; // 兜底节流：即使没有标点也至少这个间隔刷新一次
    const FLUSH_BOUNDARY = /[\n。！？；?!;]|```/;
    const flushBuffer = (force = false) => {
        if (!streamBuffer) return;
        if (!force) {
            const now = Date.now();
            const hasBoundary = FLUSH_BOUNDARY.test(streamBuffer);
            const timeUp = now - lastFlushAt >= FLUSH_INTERVAL_MS;
            if (!hasBoundary && !timeUp) return;
        }
        messageList.value[aiIndex].content += streamBuffer;
        streamBuffer = '';
        lastFlushAt = Date.now();
    };

    userAborted = false;

    try {
        try {
            // ── 流式对话 ──
            const handle = chatWithAgentStream({
                message: text || '',
                agentKey: currentModelKey.value,
                conversationId: currentConversationId.value,
                images: sendImages,
                files: sendFiles,
                enableThinking: useThinking,
                scene,
                onStart: ({ conversationId }) => {
                    if (conversationId) currentConversationId.value = conversationId;
                },
                onMessage: (chunk) => {
                    if (messageList.value[aiIndex].pending) {
                        messageList.value[aiIndex].pending = false;
                    }
                    // 收到正式回复 → 思考阶段结束
                    if (messageList.value[aiIndex].thinkingStatus === 'thinking') {
                        messageList.value[aiIndex].thinkingStatus = 'complete';
                    }
                    streamBuffer += chunk;
                    flushBuffer();
                },
                onReasoning: (chunk) => {
                    // 推理片段：先显示 ThoughtChain，再等正式回复
                    if (messageList.value[aiIndex].pending) {
                        messageList.value[aiIndex].pending = false;
                    }
                    if (!messageList.value[aiIndex].thinkingStatus) {
                        messageList.value[aiIndex].thinkingStatus = 'thinking';
                    }
                    messageList.value[aiIndex].reasoning += chunk;
                },
                onDone: () => {
                    flushBuffer(true);
                    messageList.value[aiIndex].pending = false;
                    messageList.value[aiIndex].isStreaming = false;
                    if (messageList.value[aiIndex].thinkingStatus === 'thinking') {
                        messageList.value[aiIndex].thinkingStatus = 'complete';
                    }
                    triggerVibrate();
                },
                onError: () => {},
            });
            // 暴露停止入口给 handleStopStream;同时挂上 flushBuffer 让停止时把残余 buffer 写出
            streamHandle.value = {
                abort: handle.abort,
                flush: () => flushBuffer(true),
            };
            await handle.promise;
            // 主动停止时把剩余 buffer 落到气泡,并复位状态
            flushBuffer(true);
            messageList.value[aiIndex].pending = false;
            messageList.value[aiIndex].isStreaming = false;
            if (messageList.value[aiIndex].thinkingStatus === 'thinking') {
                messageList.value[aiIndex].thinkingStatus = userAborted ? 'stop' : 'complete';
            }
        } catch {
            // 流式失败：已有部分内容或用户主动停止 → 保留;无内容且非主动停止才回退到普通接口
            flushBuffer(true);
            if (userAborted) {
                messageList.value[aiIndex].pending = false;
                messageList.value[aiIndex].isStreaming = false;
                if (messageList.value[aiIndex].thinkingStatus === 'thinking') {
                    messageList.value[aiIndex].thinkingStatus = 'stop';
                }
            } else if (!messageList.value[aiIndex].content) {
                const response = await chatWithAgent({
                    message: text || '',
                    agentKey: currentModelKey.value,
                    conversationId: currentConversationId.value,
                    images: sendImages,
                    files: sendFiles,
                    scene,
                });
                const resData = response.data || response;
                if (resData.conversationId) currentConversationId.value = resData.conversationId;
                const target = resData?.data || resData?.reply || resData;
                let replyText = typeof target === 'object' ? target?.reply : target;
                replyText = typeof replyText === 'string' ? replyText : String(replyText || '收到回复');
                messageList.value[aiIndex].pending = false;
                messageList.value[aiIndex].isStreaming = false;
                messageList.value[aiIndex].typing = true;
                messageList.value[aiIndex].content = replyText;
                // 非流式回退不支持思考输出，清理 ThoughtChain，避免一直显示「思考中」
                if (messageList.value[aiIndex].thinkingStatus === 'thinking') {
                    messageList.value[aiIndex].thinkingStatus = '';
                }
                triggerVibrate();
            }
        }
        loadConversationList();
    } catch (error) {
        messageList.value[aiIndex].pending = false;
        messageList.value[aiIndex].isStreaming = false;
        if (messageList.value[aiIndex].thinkingStatus === 'thinking') {
            messageList.value[aiIndex].thinkingStatus = 'error';
        }
        messageList.value[aiIndex].content = '请求失败，请稍后重试。';
        console.error("对话请求失败:", error.message);
    } finally {
        streamHandle.value = null;
    }
};

/**
 * 用户点击 Sender 的停止按钮:
 * 1. 标记 userAborted,catch 分支据此跳过非流式回退;
 * 2. 调用传输层 abort(),触发后端 AbortSignal,LLM 立刻停止生成;
 * 3. flush 剩余 buffer 让最后几个 token 也写进气泡;
 * 4. 状态复位 + 轻震动反馈。
 */
const handleStopStream = () => {
    const handle = streamHandle.value;
    if (!handle) return;
    userAborted = true;
    try { handle.abort?.(); } catch (err) { console.warn("中止流失败:", err?.message); }
    try { handle.flush?.(); } catch (err) { console.warn("刷新流失败:", err?.message); }
    // 兜底:把最后一条 AI 消息的流式状态复位,确保 ActionBar 立刻出现
    const last = messageList.value[messageList.value.length - 1];
    if (last && last.role === 'assistant') {
        last.pending = false;
        last.isStreaming = false;
        if (last.thinkingStatus === 'thinking') {
            last.thinkingStatus = 'stop';
        }
    }
    triggerVibrate();
};
</script>

<style scoped>
/*
 * ── 根容器 ───────────────────────────────────────────────────────────────────
 * position:fixed + overflow:hidden 彻底禁止原生页面滚动/被键盘顶起。
 * bottom 由 containerStyle 动态控制，键盘弹起时容器向上收缩至键盘顶部，
 * 不会在 sender 和键盘之间留下任何背景色空白。
 */
/* ── 下拉刷新浮层 ── */
.refresh-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 200;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 20rpx 0;
    background: var(--app-bg-page);
    opacity: 0.95;
}

.container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    /* bottom 由 :style 绑定（containerStyle）动态注入 */
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--app-bg-page);
}

/* ── 内容滚动区 ──────────────────────────────────────────────────────────────── */
.content {
    flex: 1;
    /*
     * height: 0 是让 scroll-view 作为 flex 子项正确伸缩的关键。
     * 不写此行时，scroll-view 会被内容撑开而溢出。
     */
    height: 0;
    min-height: 0;
}

.content-inner {
    /* 底部留白让最后一条消息不被悬浮的 sender 输入栏 + 技能栏遮住；顶部不留白，间距交给 msg-anchor 统一控制 */
    padding: 0 0 350rpx;
}

.bubble-test-area {
    padding: 24rpx;
    overflow-x: hidden;
}

/*
 * 每条消息的可定位容器：
 *  · :id 用作 scroll-into-view 目标
 *  · padding-top 形成"头部下沿 → 消息"以及"消息 → 消息"之间统一的间距，
 *    保证新消息被滚到 scroll-view 顶部时与头部之间的留白和后续消息间距完全一致。
 */
.msg-anchor {
    padding-top: 8rpx;
}

.msg-anchor:first-child {
    padding-top: 0;
}

/*
 * 底部滚动占位：高度 ≈ 一屏，保证最后一条用户消息总能被 scroll-into-view 滚到 scroll-view 顶部，
 * 而不是因为后面没内容只能停在末尾。AI 回复增长时占位被自然挤压，不会影响视觉。
 */
.scroll-spacer {
    /* 实际高度由 :style="spacerStyle" 动态注入，根据 AI 内容长度自适应收缩 */
    width: 100%;
}

/*
 * ── 底部输入区（悬浮在内容上方）─────────────────────────────────
 * 使用 absolute 定位并贴在容器底部，不占用 flex 空间，使得文字可以滚动到被输入框遮挡的下方
 */

/* ── AI 消息技能标签 ── */
.msg-skill-tag {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    padding: 6rpx 18rpx;
    margin-bottom: 8rpx;
    border-radius: 999rpx;
    background: var(--app-brand-light);
    border: 1rpx solid var(--app-brand);
}

.msg-skill-tag-text {
    font-size: calc(22rpx * var(--app-font-scale, 1));
    color: var(--app-brand);
    font-weight: 600;
    line-height: 1;
}

.sender-area {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    padding-top: 14rpx;
    background: transparent;
    pointer-events: none; /* 让空白区域透传点击 */
    /* padding-bottom 由 :style 绑定（senderAreaStyle）动态注入 */
    transition: transform 0.28s cubic-bezier(0.32, 0.72, 0.32, 1), opacity 0.22s ease;
    transform: translateY(0);
    opacity: 1;
}

/* 模型选择弹窗打开时，输入栏向下滑出并淡出 */
.sender-area-hidden {
    transform: translateY(120%);
    opacity: 0;
    pointer-events: none;
}

/* 恢复内部元素的点击响应，因为外层使用 pointer-events: none */
.sender-area :deep(.sender-shell),
.sender-area :deep(.skill-bar) {
    pointer-events: auto;
}

/* ── 流式渲染气泡（绕过 Bubble 组件，直接用 text 实时显示） ── */
.streaming-bubble {
    margin: 12rpx 0;
    padding: 18rpx 26rpx;
    background: var(--app-bg-container);
    border: 1rpx solid var(--app-border);
    border-radius: 8rpx 26rpx 26rpx;
    max-width: 100%;
}

/* Claude AI 风格字体：把 App 端可用的具体字体名放最前面 */
.streaming-text {
    font-family: -apple-system, BlinkMacSystemFont, "Söhne", "SF Pro Text",
        "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue",
        "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
        "Source Han Sans SC", "Noto Sans CJK SC", "Noto Sans SC",
        "WenQuanYi Micro Hei", system-ui, sans-serif;
    font-size: calc(30rpx * var(--app-font-scale, 1));
    line-height: 1.72;
    letter-spacing: 0.2rpx;
    font-weight: 400;
    color: var(--app-text-primary);
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    word-break: break-word;
    white-space: pre-wrap;
}

.streaming-cursor {
    font-family: inherit;
    font-size: calc(30rpx * var(--app-font-scale, 1));
    color: var(--app-text-placeholder);
    animation: cursor-blink 0.8s infinite;
}

/* App 端使用 @font-face 注入的 Inter + Noto Sans SC，与气泡组件保持一致 */
/* #ifdef APP-PLUS */
.streaming-text,
.streaming-cursor {
    font-family: "Inter", "Noto Sans SC", "PingFang SC", "Hiragino Sans GB",
        "Helvetica Neue", "Roboto", "Microsoft YaHei", sans-serif;
    font-weight: 400;
    -webkit-font-smoothing: subpixel-antialiased;
}
/* #endif */

/* ── 保存成功通知条 ─────────────────────────────────────── */
.note-toast {
    position: fixed;
    top: 160rpx;
    left: 24rpx;
    right: 24rpx;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 24rpx 28rpx;
    background: var(--app-bg-container);
    border-radius: 16rpx;
    box-shadow: var(--app-shadow-elevated);
    animation: toast-slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.note-toast-text {
    flex: 1;
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.note-toast-link {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-brand);
    font-weight: 500;
    flex-shrink: 0;
}

@keyframes toast-slide-in {
    from { transform: translateY(-40rpx); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

/* 小屏稍紧凑 */
@media screen and (max-width: 360px) {
    .streaming-bubble {
        padding: 16rpx 22rpx;
    }
    .streaming-text,
    .streaming-cursor {
        font-size: calc(28rpx * var(--app-font-scale, 1));
        line-height: 1.68;
    }
}

/* 平板/桌面端用 px 单位避免 rpx 在大屏被放大成大字号 */
@media screen and (min-width: 768px) {
    .streaming-bubble {
        padding: 12px 18px;
    }
    .streaming-text,
    .streaming-cursor {
        font-size: calc(16px * var(--app-font-scale, 1));
        line-height: 1.7;
    }
}

@media screen and (min-width: 1024px) {
    .streaming-text,
    .streaming-cursor {
        font-size: calc(16.5px * var(--app-font-scale, 1));
        line-height: 1.72;
    }
}

@keyframes cursor-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}

/* ── 删除会话 简约白色弹窗 ─────────────────────────────────────── */
.simple-delete-dialog {
    --td-dialog-border-radius: 24rpx;
    --td-dialog-title-color: var(--app-text-primary);
    --td-dialog-content-color: var(--app-text-secondary);
    --td-dialog-width: 600rpx;
}

/* ── 重命名弹窗 ────────────────────────────────────────────────── */
.simple-rename-dialog {
    --td-dialog-border-radius: 24rpx;
    --td-dialog-title-color: var(--app-text-primary);
    --td-dialog-content-color: var(--app-text-secondary);
    --td-dialog-width: 600rpx;
}

.rename-input-wrap {
    margin-top: 16rpx;
    background: var(--app-bg-secondary);
    border-radius: 16rpx;
    overflow: hidden;
    border: 1.5rpx solid var(--app-border);
}

.rename-input-wrap :deep(.t-input) {
    background: transparent;
    padding: 4rpx 8rpx;
}

.rename-input-wrap :deep(.t-input__wrap) {
    background: transparent;
}

/* ── 保存到笔记本 弹窗 ─────────────────────────────────────────── */
.notebook-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 9998;
}

.notebook-picker {
    width: 100%;
    min-height: 240rpx;
    padding: 0 0 24rpx;
    background: var(--app-bg-container);
}

.picker-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60rpx 0;
    gap: 18rpx;
}

.picker-state-text {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

/* 骨架屏 */
.skeleton-list {
    padding: 16rpx 0;
}

.skeleton-item {
    display: flex;
    align-items: center;
    padding: 28rpx 32rpx;
}

.skeleton-avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 12rpx;
    background: #f0f0f0;
    margin-right: 24rpx;
    flex-shrink: 0;
    animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-lines {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14rpx;
}

.skeleton-line {
    height: 24rpx;
    border-radius: 6rpx;
    background: #f0f0f0;
    animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-line-title {
    width: 55%;
}

.skeleton-line-meta {
    width: 30%;
    height: 20rpx;
}

@keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}

.notebook-scroll {
    max-height: 50vh;
}

.notebook-item {
    display: flex;
    align-items: center;
    padding: 28rpx 32rpx;
    background: var(--app-bg-container);
    border-bottom: 1rpx solid var(--app-border);
    transition: background 0.15s ease;
}

.notebook-item:last-child {
    border-bottom: none;
}

.notebook-item-active {
    background: var(--app-bg-secondary);
}

.notebook-item-saving {
    background: var(--app-bg-secondary);
}

.notebook-icon {
    width: 64rpx;
    height: 64rpx;
    border-radius: 12rpx;
    background: var(--app-bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    flex-shrink: 0;
}

.notebook-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}


.notebook-title {
    font-size: calc(30rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 500;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.notebook-meta {
    font-size: calc(22rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    margin-top: 6rpx;
}

.notebook-arrow,
.notebook-saved,
.notebook-saving {
    margin-left: 12rpx;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.notebook-saved {
    animation: pop-in 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pop-in {
    0% { transform: scale(0.4); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

.spinner-circle-small {
    width: 32rpx;
    height: 32rpx;
    border: 3rpx solid var(--app-border);
    border-top-color: var(--app-text-secondary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
