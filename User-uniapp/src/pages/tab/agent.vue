<template>
    <page-meta page-style="overflow: hidden;" />
    <view class="container" :style="containerStyle">
        <!--
            AgentHeader 内部结构说明：
            · .top-wrapper  →  flex 占位 spacer（高度 = 导航栏总高）
            · .custom-navbar →  position:fixed，真正悬浮在顶部
        -->
        <AgentHeader
            :model-list="modelList"
            :initial-model="currentModelName"
            :conversation-title="currentConversationTitle"
            :favorited="currentIsFavorited"
            @menu-click="handleMenuClick"
            @new-chat="handleNewChat"
            @model-change="handleModelChange"
            @option-click="handleOptionClick"
            @touchstart="handleTouchStart"
        />

        <!-- 内容滚动区 -->
        <scroll-view 
            class="content" 
            scroll-y 
            :show-scrollbar="false" 
            @scroll="handleScroll" 
            @touchstart="handleTouchStart"
        >
            <view class="content-inner">
                <WelcomePanel 
                    :show="showWelcomePanel" 
                    @action-click="handleWelcomeActionClick" 
                />
                
                <view style="padding: 24rpx;">
                    <!-- <ThoughtChain 
                        status="thinking" 
                        content="我正在思考如何评估这三个模型的表现...\n首先，我会分析XGBoost的混淆矩阵。\n其次，我会关注SHAP特征重要性。" 
                        buttonWidth="240rpx"
                        maxWidth="100%"
                        :typing="{ step: 1, interval: 50, suffix: '|' }"
                    /> -->
                </view>

                <view class="bubble-test-area" v-if="messageList.length > 0">
                    <Bubble
                        v-for="(msg, index) in messageList"
                        :key="index"
                        :content="msg.content"
                        :show-avatar="false"
                        :shape="msg.role === 'user' ? 'corner' : undefined"
                        :variant="msg.role === 'user' ? 'solid' : undefined"
                        :placement="msg.role === 'user' ? 'end' : 'start'"
                        :max-width="msg.role === 'user' ? '650rpx' : '100%'"
                        :is-markdown="msg.isStreaming ? false : true"
                        :no-style="msg.role === 'assistant'"
                        :typing="msg.typing ? { step: 5, interval: 15, suffix: '|' } : false"
                        @finish="handleBubbleFinish(index)"
                    />
                    <AgentActionBar
                        v-if="showActionBar"
                        :content="lastAIMessage?.content || ''"
                        :favorited="lastAIMessage?.favorited || false"
                        :actions="['copy', 'regenerate']"
                        @copy="handleActionCopy"
                        @favorite="(liked) => handleActionFavorite(lastAIIndex, liked)"
                        @regenerate="handleActionRegenerate"
                    />
                </view>

                <!-- <PromptTags @select="handlePromptSelect" /> -->
            </view>
        </scroll-view>

        <!--
            当 container 的 bottom 随键盘上移时，sender 自然贴在容器底部，
            即键盘顶部，不会留下任何灰色空隙。
        -->
        <view class="sender-area" :style="senderAreaStyle">
            <AgentSender
                v-model="senderText"
                v-model:thinking="thinkingMode"
                :show-thinking-toggle="showThinkingToggle"
                @add-attachment="handleAddAttachment"
                @submit="handleSenderSubmit"
                @focus="handleSenderFocus"
                @blur="handleSenderBlur"
            />
        </view>

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
    </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import AgentHeader from "../../components/modules/agent/AgentHeader.vue";
import AgentSender from "../../components/modules/agent/AgentSender.vue";
import AgentSidebar from "../../components/modules/agent/AgentSidebar.vue";
import Bubble from "../../components/modules/agent/Bubble.vue";
import WelcomePanel from "../../components/modules/agent/WelcomePanel.vue";
import ThoughtChain from "../../components/modules/agent/ThoughtChain.vue";
import PromptTags from "../../components/modules/agent/PromptTags.vue";
import AgentActionBar from "../../components/modules/agent/AgentActionBar.vue";
import { useAutoTabBar } from "../../composables/useAutoTabBar.js";
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
const sidebarVisible = ref(false);
const senderText = ref("");
const thinkingMode = ref(false);
const showThinkingToggle = ref(true);
const showWelcomePanel = ref(true);
const messageList = ref([]);
const modelList = ref([{label: "Mio", value: "mio"}]);
const currentModelKey = ref("mio");
const currentModelName = ref("Mio");
const currentConversationId = ref(null);
const currentConversationTitle = ref("");
const conversationList = ref([]);
const loadingConversationId = ref(null);
let chatRequestSeq = 0;

const currentIsFavorited = computed(() => {
    if (!currentConversationId.value) return false;
    const conv = conversationList.value.find(c => c._id === currentConversationId.value);
    return conv?.isPinned || false;
});

const loadAgentList = async () => {
    try {
        const res = await fetchAgentList();
        const list = res?.data || [];
        if (list.length) {
            modelList.value = list.map((item) =>{
                return {
                    label: item.agentName,
                    value: item.agentKey
                };
            });
            currentModelName.value = list[0]?.agentName || "Mio";
            currentModelKey.value = list[0]?.agentKey || "mio";
        }
    } catch (error) {
        console.error("加载Agent列表失败:", error.message);
    }
};

const loadConversationList = async (favoritesOnly = false) => {
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

// ─── TabBar 自动隐藏与显示逻辑 ──────────────────────────────────────────────────
const { 
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

    // 监听搜索页选择的会话
    uni.$on("agent-select-conversation", handleSelectChat);

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
 * sender 区域的底部内边距：
 * · 键盘弹起时：仅保留小间距，不需要 safe-area（容器底部已经在键盘顶）
 * · 键盘收起时：加上 env(safe-area-inset-bottom) 适配底部安全区
 */
const senderAreaStyle = computed(() => ({
    paddingBottom:
        keyboardHeight.value > 0
            ? "14rpx"
            : "calc(14rpx + env(safe-area-inset-bottom))",
}));

// ─── 事件处理 ──────────────────────────────────────────────────────────────────
const handleMenuClick = () => {
    sidebarVisible.value = true;
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
	        uni.showModal({
	            title: "重命名会话",
	            editable: true,
	            placeholderText: currentConversationTitle.value || "请输入新标题",
	            success: async (res) => {
	                if (res.confirm && res.content) {
	                    try {
	                        await renameConversation(currentConversationId.value, res.content);
	                        currentConversationTitle.value = res.content;
	                        loadConversationList();
	                        uni.showToast({ 
                                title: "重命名成功", 
                                icon: "none",
                                position: "top"
                            });
	                    } catch (error) {
	                        uni.showToast({ title: "重命名失败", icon: "none" });
                            console.error("重命名会话失败:", error.message);
	                    }
	                }
	            },
	        });
	    }
if (action === "delete") {
	    uni.showModal({
	        title: "删除会话",
	        content: "确定要删除该会话吗？删除后不可恢复。",
	        confirmText: "删除",
	        confirmColor: "#ef4444",
	        success: async (res) => {
	            if (res.confirm) {
	                try {
	                    const targetId = currentConversationId.value;
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
	                }
	            }
	        },
	    });
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
    sidebarVisible.value = false;

    try {
        const res = await fetchConversationMessages(chatId);
        // 仅当请求序号仍为最新时才应用结果，防止旧请求覆盖新请求
        if (requestSeq !== chatRequestSeq) return;

        currentConversationId.value = chatId;
        currentConversationTitle.value = conversationList.value.find(c => c._id === chatId)?.title || "";
        if (res?.data) {
            messageList.value = res.data.map(msg => ({
                role: msg.role,
                content: msg.content,
                typing: false,
                pending: false,
                isStreaming: false
            }));
            showWelcomePanel.value = false;
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
    handleSenderSubmit({ text: userMsg.content });
};

const handlePromptSelect = (prompt) => {
    if (!prompt?.label) return;
    senderText.value = prompt.label;
};

const handleAddAttachment = () => {
    uni.showToast({ title: "添加附件", icon: "none" });
};

/**
 * 用户发送消息的主入口。
 * 优先使用流式接口，若流式未开始则回退到普通接口，最终兜底显示错误。
 *
 * 关键：所有对 AI 消息的读写必须通过 messageList.value[index] 访问响应式代理，
 * 不能用外部变量引用（push 前创建的对象是普通 JS 对象，不是 Vue 代理，修改不触发视图更新）。
 */
const handleSenderSubmit = async ({ text }) => {
    if (!text) return;

    showWelcomePanel.value = false;
    messageList.value.push({ role: 'user', content: text, typing: false });
    senderText.value = "";

    // 通过 messageList.value 访问，确保拿到的是 Vue 响应式代理
    const aiIndex = messageList.value.length;
    messageList.value.push({ role: 'assistant', content: '', typing: false, pending: true, isStreaming: true });

    try {
        try {
            // ── 流式对话 ──
            await chatWithAgentStream({
                message: text,
                agentKey: currentModelKey.value,
                conversationId: currentConversationId.value,
                onStart: ({ conversationId }) => {
                    if (conversationId) currentConversationId.value = conversationId;
                    messageList.value[aiIndex].pending = false;
                },
                onMessage: (chunk) => {
                    messageList.value[aiIndex].pending = false;
                    messageList.value[aiIndex].content += chunk;
                },
                onDone: () => {
                    messageList.value[aiIndex].pending = false;
                    messageList.value[aiIndex].isStreaming = false;
                },
                onError: () => {},
            });
            messageList.value[aiIndex].pending = false;
            messageList.value[aiIndex].isStreaming = false;
        } catch {
            // 流式失败：已有部分内容则保留，无内容则回退到普通接口
            if (!messageList.value[aiIndex].content) {
                const response = await chatWithAgent({
                    message: text,
                    agentKey: currentModelKey.value,
                    conversationId: currentConversationId.value,
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
            }
        }
        loadConversationList();
    } catch (error) {
        messageList.value[aiIndex].pending = false;
        messageList.value[aiIndex].isStreaming = false;
        messageList.value[aiIndex].content = '请求失败，请稍后重试。';
        console.error("对话请求失败:", error.message);
    }
};
</script>

<style scoped>
/*
 * ── 根容器 ───────────────────────────────────────────────────────────────────
 * position:fixed + overflow:hidden 彻底禁止原生页面滚动/被键盘顶起。
 * bottom 由 containerStyle 动态控制，键盘弹起时容器向上收缩至键盘顶部，
 * 不会在 sender 和键盘之间留下任何背景色空白。
 */
.container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    /* bottom 由 :style 绑定（containerStyle）动态注入 */
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #f6f7f9;
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
    padding: 24rpx 0 160rpx;
}

.bubble-test-area {
    padding: 24rpx;
}

/*
 * ── 底部输入区（悬浮在内容上方）─────────────────────────────────
 * 使用 absolute 定位并贴在容器底部，不占用 flex 空间，使得文字可以滚动到被输入框遮挡的下方
 */
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
}

/* 恢复内部元素的点击响应，因为外层使用 pointer-events: none */
.sender-area :deep( .sender-shell ) {
    pointer-events: auto;
}

/* ── 流式渲染气泡（绕过 Bubble 组件，直接用 text 实时显示） ── */
.streaming-bubble {
    margin: 12rpx 0;
    padding: 16rpx 24rpx;
    background: #ffffff;
    border: 1rpx solid rgba(15, 23, 42, 0.06);
    border-radius: 8rpx 26rpx 26rpx;
    max-width: 100%;
}

.streaming-text {
    font-size: 28rpx;
    line-height: 1.7;
    color: #202635;
    word-break: break-word;
    white-space: pre-wrap;
}

.streaming-cursor {
    font-size: 28rpx;
    color: #94a3b8;
    animation: cursor-blink 0.8s infinite;
}

@keyframes cursor-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}
</style>
