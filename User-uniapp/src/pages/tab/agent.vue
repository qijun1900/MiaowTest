<template>
    <page-meta page-style="overflow: hidden;" />
    <view class="container" :style="containerStyle">
        <!--
            AgentHeader 内部结构说明：
            · .top-wrapper  →  flex 占位 spacer（高度 = 导航栏总高）
            · .custom-navbar →  position:fixed，真正悬浮在顶部
        -->
        <AgentHeader
            @menu-click="handleMenuClick"
            @new-chat="handleNewChat"
            @model-change="handleModelChange"
            @touchstart="handleTouchStart"
        />

        <!-- 内容滚动区 -->
        <scroll-view class="content" scroll-y :show-scrollbar="false" @scroll="handleScroll" @touchstart="handleTouchStart">
            <view class="content-inner">
                <WelcomePanel @action-click="handleWelcomeActionClick" />
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
import WelcomePanel from "../../components/modules/agent/WelcomePanel.vue";
import { useAutoTabBar } from "../../composables/useAutoTabBar.js";

// ─── 响应式状态 ────────────────────────────────────────────────────────────────
const sidebarVisible = ref(false);
const senderText = ref("");
const thinkingMode = ref(false);
const showThinkingToggle = ref(true);

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

const handleModelChange = (modelName) => {
    if (!modelName) return;
    uni.showToast({ title: `已切换 ${modelName}`, icon: "none" });
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

const handleAddAttachment = () => {
    uni.showToast({ title: "添加附件", icon: "none" });
};

const handleSenderSubmit = ({ text, thinking }) => {
    if (!text) return;
    uni.showToast({
        title: thinking ? "思考模式发送" : "普通模式发送",
        icon: "none",
    });
    senderText.value = "";
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
    padding: 24rpx 0 32rpx;
}

/*
 * ── 底部输入区（flex 末项，非 position:fixed）─────────────────────────────────
 * 作为 flex 末项，它始终紧贴容器底部（= 键盘顶部），
 * padding-bottom 由 senderAreaStyle 动态注入以适配安全区。
 */
.sender-area {
    flex-shrink: 0;
    padding-top: 14rpx;
    /* padding-bottom 由 :style 绑定（senderAreaStyle）动态注入 */
}
</style>
