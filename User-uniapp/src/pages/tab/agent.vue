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
            @menu-click="handleMenuClick"
            @new-chat="handleNewChat"
            @model-change="handleModelChange"
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
                <WelcomePanel :show="showWelcomePanel" @action-click="handleWelcomeActionClick" />
                
                <view style="padding: 24rpx;">
                    <!-- <ThoughtChain 
                        status="thinking" 
                        content="我正在思考如何评估这三个模型的表现...\n首先，我会分析XGBoost的混淆矩阵。\n其次，我会关注SHAP特征重要性。" 
                        buttonWidth="240rpx"
                        maxWidth="100%"
                        :typing="{ step: 1, interval: 50, suffix: '|' }"
                    /> -->
                </view>

                <view class="bubble-test-area">
                    <Bubble
                        v-for="(msg, index) in messageList"
                        :key="index"
                        :content="msg.content"
                        :show-avatar="false"
                        :shape="msg.role === 'user' ? 'corner' : undefined"
                        :variant="msg.role === 'user' ? 'solid' : undefined"
                        :placement="msg.role === 'user' ? 'end' : 'start'"
                        :max-width="msg.role === 'user' ? '650rpx' : '100%'"
                        :is-markdown="true"
                        :no-style="msg.role === 'assistant'"
                        :typing="msg.typing ? { step: 5, interval: 15, suffix: '|' } : false"
                        @finish="handleBubbleFinish(index)"
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
            @select-chat="handleSelectChat"
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
import { useAutoTabBar } from "../../composables/useAutoTabBar.js";
import {fetchAgentList, chatWithAgent} from "../../API/LLM/AgentAPI.js"

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
        console.error("加载Agent列表失败：", error);
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
    uni.showToast({ title: "新建会话", icon: "none" });
};

const handleSelectChat = (chatId) => {
    uni.showToast({ title: `切换到会话 ${chatId}`, icon: "none" });
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

const handlePromptSelect = (prompt) => {
    if (!prompt?.label) return;
    senderText.value = prompt.label;
};

const handleAddAttachment = () => {
    uni.showToast({ title: "添加附件", icon: "none" });
};

const handleSenderSubmit = async ({ text }) => {
    if (!text) return;

    showWelcomePanel.value = false;

    // 添加用户消息
    messageList.value.push({ role: 'user', content: text, typing: false });
    senderText.value = "";

    // 预添加AI消息占位
    const aiMessageIndex = messageList.value.length;
    messageList.value.push({ role: 'assistant', content: '...', typing: false });

    try {
        // 传完整聊天历史（排除占位的AI消息），类似 Admin-web 的 chatHistory 方式
        const messages = messageList.value.slice(0, aiMessageIndex).map(msg => ({
            role: msg.role,
            content: msg.content,
        }));

        const response = await chatWithAgent({
            messages,
            agentKey: currentModelKey.value,
        });

        // 根据后端实际返回结构调整
        const replyText = response.data?.reply || response.reply || response.data || '收到回复';
        // 返回结果后开启打字效果并赋值完整回复
        messageList.value[aiMessageIndex].typing = true;
        messageList.value[aiMessageIndex].content = replyText;
    } catch (error) {
        messageList.value[aiMessageIndex].content = '请求失败，请稍后重试。';
        messageList.value[aiMessageIndex].typing = false;
        console.error("聊天请求失败：", error);
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
</style>
