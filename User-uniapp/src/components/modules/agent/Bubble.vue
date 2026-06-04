<template>
    <view
        v-if="alive"
        class="bubble-row"
        :class="[
            placement === 'end' ? 'bubble-row-end' : 'bubble-row-start',
            loading ? 'bubble-row-loading' : '',
        ]"
    >
        <view
            v-if="shouldShowAvatar"
            class="bubble-avatar"
            :class="[
                avatarShape === 'square' ? 'bubble-avatar-square' : 'bubble-avatar-circle',
            ]"
            :style="avatarStyle"
        >
            <slot name="avatar">
                <image
                    v-if="avatar"
                    class="bubble-avatar-image"
                    :src="avatar"
                    :srcset="avatarSrcSet"
                    :alt="avatarAlt"
                    :style="{ objectFit: avatarFit }"
                    mode="aspectFill"
                    @error="handleAvatarError"
                />
                <uni-icons
                    v-else
                    :type="avatarIcon || 'person-filled'"
                    :size="avatarIconSize"
                    color="#8b93a7"
                />
            </slot>
        </view>

        <view class="bubble-stack" :style="{ maxWidth }">
            <slot name="header"></slot>

            <view v-if="images && images.length > 0" class="bubble-images">
                <image
                    v-for="(img, idx) in images"
                    :key="idx"
                    :src="getBubbleImageUrl(img)"
                    mode="aspectFill"
                    class="bubble-image-item"
                    @click="previewBubbleImage(idx)"
                />
            </view>

            <view
                class="bubble-box"
                :class="[
                    `bubble-${bubbleVariant}`,
                    shape ? `bubble-shape-${shape}` : '',
                    noStyle ? 'bubble-no-style' : '',
                    placement === 'end' ? 'bubble-box-end' : 'bubble-box-start',
                ]"
                @longpress="handleLongPress"
            >
                <slot v-if="loading" name="loading">
                    <view class="bubble-loading">
                        <view class="bubble-loading-dot"></view>
                        <view class="bubble-loading-dot"></view>
                        <view class="bubble-loading-dot"></view>
                    </view>
                </slot>

                <slot
                    v-else
                    name="content"
                    :content="renderedContent"
                    :html="renderHtml"
                    :is-markdown="isMarkdown"
                    :is-typing="isTyping"
                    :progress="progress"
                >
                    <MpHtml
                        v-if="shouldRenderMarkdown"
                        class="bubble-mp-html"
                        :content="renderHtml"
                        :markdown="isMarkdown"
                        :tag-style="htmlTagStyle"
                        :selectable="selectable"
                        :preview-img="previewImg"
                        :show-img-menu="showImgMenu"
                        :scroll-table="scrollTable"
                        @load="handleHtmlLoad"
                        @ready="handleHtmlReady"
                        @imgtap="handleHtmlImgTap"
                        @linktap="handleHtmlLinkTap"
                        @error="handleHtmlError"
                    />
                    <text v-else class="bubble-text">{{ renderedContent }}</text>
                    <text v-if="showTypingSuffix" class="bubble-typing-suffix">
                        {{ typingOptions.suffix }}
                    </text>
                </slot>
            </view>

            <slot name="footer"></slot>
        </view>

        <!-- 长按下拉菜单 -->
        <view v-if="showActionMenu" class="bubble-action-mask" @click.stop="closeActionMenu" @touchmove.stop.prevent></view>
        <view
            v-if="showActionMenu"
            class="bubble-action-dropdown"
            :class="placement === 'end' ? 'bubble-action-dropdown-end' : 'bubble-action-dropdown-start'"
            @click.stop
        >
            <view class="bubble-action-item" @click="handleActionCopy">
                <text class="bubble-action-text">复制内容</text>
                <uni-icons type="copy" size="18" color="#333"></uni-icons>
            </view>
            <view class="bubble-action-divider"></view>
            <view class="bubble-action-item" @click="handleActionSelect">
                <text class="bubble-action-text">选择文本</text>
                <uni-icons type="compose" size="18" color="#333"></uni-icons>
            </view>
        </view>

        <!-- 选择文本全屏视图 -->
        <view v-if="showSelectView" class="bubble-select-overlay" @click.stop="closeSelectView">
            <view class="bubble-select-card" @click.stop @touchmove.stop>
                <view class="bubble-select-header">
                    <text class="bubble-select-title">选择文本</text>
                    <view class="bubble-select-close" @click="closeSelectView">
                        <uni-icons type="closeempty" size="20" color="#64748b"></uni-icons>
                    </view>
                </view>
                <scroll-view class="bubble-select-body" scroll-y :show-scrollbar="false">
                    <text class="bubble-select-text" selectable user-select>{{ content }}</text>
                </scroll-view>
                <view class="bubble-select-footer">
                    <view class="bubble-select-btn" @click="handleActionCopy">
                        <text>全部复制</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, useSlots, watch } from "vue";
import MpHtml from "../../../uni_modules/mp-html/components/mp-html/mp-html.vue";

const props = defineProps({
    // 气泡正文。typing 开启时不会一次性展示，而是按 step 逐步写入 renderedContent。
    content: {
        type: String,
        default: "",
    },
    // 气泡位置：start 表示左侧消息，end 表示右侧消息，样式和头像间距会随之反转。
    placement: {
        type: String,
        default: "start",
    },
    // 头像图片地址；优先级高于 avatarIcon。为空时可通过 #avatar 插槽完全自定义头像。
    avatar: {
        type: String,
        default: "",
    },
    // 是否展示头像
    showAvatar: {
        type: Boolean,
        default: true,
    },
    // 加载态用于 AI 正在思考/请求中，此时展示 loading 插槽或默认三点动画。
    loading: {
        type: Boolean,
        default: false,
    },
    // 气泡形状：round 为整体圆角，corner 为类似聊天气泡的一角收紧。
    shape: {
        type: String,
        default: null,
    },
    // 气泡视觉变体：filled / borderless / outlined / shadow。
    variant: {
        type: String,
        default: "filled",
    },
    // 去除组件内置 padding、背景、边框和阴影，方便完全由插槽内容控制样式。
    noStyle: {
        type: Boolean,
        default: false,
    },
    // 是否将 content 作为 Markdown 解析渲染，支持常见的 Markdown 语法和 mp-html 插件（highlight、latex 等）。
    isMarkdown: {
        type: Boolean,
        default: false,
    },
    // 打字效果配置。true 使用默认速度；对象支持 step--步数 、interval -- 间隔、suffix--后缀修饰。
    typing: {
        type: [Boolean, Object],
        default: false,
    },
    // 气泡最大宽度，传入 rpx、px、%、vw 等 uni-app 支持的尺寸字符串。
    maxWidth: {
        type: String,
        default: "500px",
    },
    // 以下 avatar-* 属性尽量对齐常见 Bubble API，方便后续迁移或替换组件。
    avatarSize: {
        type: String,
        default: "",
    },
    avatarGap: { // 头像与气泡之间的间距，传入尺寸字符串，默认为 12px。
        type: String,
        default: "12px",
    },
    avatarShape: { // 头像形状，circle（默认）或 square。
        type: String,
        default: "",
    },
    avatarIcon: { // 头像占位图标，仅在 avatar 为空时显示，传入 uni-icons 的 type 字符串。
        type: String,
        default: "",
    },
    avatarSrcSet: { // 头像多分辨率资源列表，格式同 img 标签的 srcset 属性，优先级低于 avatar。
        type: String,
        default: "",
    },
    avatarAlt: { // 头像替代文本，传入字符串会设置在 img 标签的 alt 属性上，优先级低于 avatar。
        type: String,
        default: "",
    },
    avatarFit: { // 头像图片的 object-fit 样式，传入 cover、contain 等字符串，默认为 cover。
        type: String,
        default: "cover",
    },
    selectable: { // 是否允许用户选择气泡内的文本，传入布尔值或字符串 "true"/"false"，默认为 true。
        type: [Boolean, String],
        default: true,
    },
    previewImg: { // 是否开启图片预览功能，传入布尔值或字符串 "true"/"false"，默认为 true。
        type: [Boolean, String],
        default: true,
    },
    showImgMenu: { // 是否在图片上开启长按菜单，传入布尔值或字符串 "true"/"false"，默认为 true。
        type: [Boolean, String],
        default: true,
    },
    scrollTable: { // 是否允许表格内容横向滚动，传入布尔值或字符串 "true"/"false"，默认为 true。
        type: [Boolean, String],
        default: true,
    },
    tagStyle: { // mp-html 的 tag-style 配置项，传入对象覆盖默认样式，适用于 isMarkdown 模式。
        type: Object,
        default: () => ({}),
    },
    images: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits([
    // 打字开始。参数是当前 ref 状态快照：renderedContent / isTyping / progress。
    "start",
    // 打字完成。typing 为 false 时不会触发，只有真实打字流程结束时触发。
    "finish",
    // 每次写入字符后触发，可用于自动滚动到底部或同步外部进度条。
    "writing",
    // 头像图片加载失败时触发，父组件可切换默认头像或上报资源错误。
    "avatarError",
    // 以下事件透传自 mp-html，只有 isMarkdown 开启并实际渲染 mp-html 时有意义。
    "htmlLoad",
    "htmlReady",
    "htmlImgTap",
    "htmlLinkTap",
    "htmlError",
]);

const slots = useSlots();

const showActionMenu = ref(false);
const showSelectView = ref(false);

const handleLongPress = () => {
    if (props.loading) return;
    if (!props.content) return;
    if (props.placement !== 'end') return;
    showActionMenu.value = true;
};

const closeActionMenu = () => {
    showActionMenu.value = false;
};

const closeSelectView = () => {
    showSelectView.value = false;
};

const handleActionCopy = () => {
    const text = props.content || '';
    if (!text) {
        closeActionMenu();
        return;
    }
    uni.setClipboardData({
        data: text,
        success: () => {
            uni.showToast({ title: '已复制', icon: 'none', position: 'top' });
        },
        fail: () => {
            uni.showToast({ title: '复制失败', icon: 'none' });
        },
    });
    closeActionMenu();
    closeSelectView();
};

const handleActionSelect = () => {
    closeActionMenu();
    showSelectView.value = true;
};

const getBubbleImageUrl = (img) => {
    if (!img) return '';
    return typeof img === 'object' && img.url ? img.url : img;
};

const previewBubbleImage = (index) => {
    const urls = (props.images || [])
        .map((img) => getBubbleImageUrl(img))
        .filter(Boolean);
    if (!urls.length) return;
    uni.previewImage({ urls, current: urls[index] || urls[0] });
};

// destroy() 不直接卸载父组件，只让内部根节点 v-if=false，符合 ref 方法”主动销毁”的语义。
const alive = ref(true);
// 组件实际正在渲染的内容。普通模式等于 content，打字模式下是 content 的前 N 个字符。
const renderedContent = ref('');
const isTyping = ref(false);
// 打字进度百分比，范围 0-100，便于父组件做进度 UI 或调试展示。
const progress = ref(0);
// 只使用 setTimeout / clearTimeout，避免依赖浏览器 DOM API，保证 App、H5、小程序都可运行。
let timer = null;
let cursor = 0;

const typingOptions = computed(() => {
    // false / null / undefined 都视为关闭打字效果。
    if (!props.typing) {
        return {
            enabled: false,
            step: 1,
            interval: 30,
            suffix: "",
        };
    }

    if (props.typing === true) {
        // 默认速度偏轻快，适合聊天回复；需要更慢时传对象覆盖 interval。
        return {
            enabled: true,
            step: 1,
            interval: 30,
            suffix: "",
        };
    }

    return {
        // step 越大一次显示字符越多；interval 单位是 ms。这里做兜底避免 0、NaN、负数造成异常。
        enabled: true,
        step: Math.max(1, Number(props.typing.step) || 1),
        interval: Math.max(0, Number(props.typing.interval) || 30),
        suffix: props.typing.suffix || "",
    };
});

const shouldShowAvatar = computed(
    () => props.showAvatar && (props.avatar || props.avatarIcon || slots.avatar),
);

const bubbleVariant = computed(() => {
    // 传入非法 variant 时回退到 filled，避免样式 class 失控。
    const variants = ["filled", "borderless", "outlined", "shadow"];
    return variants.includes(props.variant) ? props.variant : "filled";
});

const avatarStyle = computed(() => {
    // 头像间距根据 placement 自动放在气泡一侧：左侧消息是 marginRight，右侧消息是 marginLeft。
    const size = props.avatarSize || "36px";
    const marginKey = props.placement === "end" ? "marginLeft" : "marginRight";

    return {
        width: size,
        height: size,
        [marginKey]: props.avatarGap,
    };
});

const avatarIconSize = computed(() => {
    // uni-icons 的 size 是数字，按头像尺寸比例计算一个舒服的默认图标大小。
    const size = parseInt(props.avatarSize || "36", 10);
    return Number.isFinite(size) ? Math.max(18, Math.round(size * 0.58)) : 22;
});

const htmlTagStyle = computed(() => ({
    // mp-html 通过 tag-style 控制富文本节点样式，避免 scoped CSS 穿透不稳定。
    p: "margin: 8rpx 0; line-height: 1.7;",
    div: "line-height: 1.7;",
    img: "max-width: 100%; border-radius: 8px; margin: 8rpx 0;",
    table: "border-collapse: collapse; max-width: 100%; margin: 8rpx 0;",
    th: "border:1px solid #e5e7eb;padding:6px;background:#f8fafc;",
    td: "border:1px solid #e5e7eb;padding:6px;",
    thead: "background:#f8fafc;",
    pre: "margin:8px 0;padding:10px;border-radius:8px;background:#111827;color:#f8fafc;overflow:auto;",
    code: "padding:2px 5px;border-radius:4px;background:#eef2f7;color:#1f3a8a;",
    span: "line-height:1.7;",
    a: "color:#2563eb;text-decoration:none;",
    ...props.tagStyle,
}));

const renderHtml = computed(() => {
    // 非 Markdown 模式也会做 HTML 转义，避免 content 中的 <script> 或标签被当作富文本执行。
    if (!props.isMarkdown) {
        return escapeHtml(renderedContent.value).replace(/\n/g, "<br />");
    }
    // Markdown / highlight / latex are handled by mp-html official plugins.
    // 很多大模型返回的公式使用 \(...\) 或 \[...\]，将其转换为 mp-html 支持的 $...$ 和 $$...$$
    return renderedContent.value
        .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
        .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
});

const shouldRenderMarkdown = computed(() => {
    // 只有在 isMarkdown 开启且正在展示内容时才渲染 mp-html，避免不必要的组件树和事件绑定，提升性能和稳定性。
    // 即使父组件传了 isMarkdown，关闭 typing 后也不渲染 mp-html，直接展示纯文本，避免不必要的组件树和事件绑定，提升性能和稳定性。
    return props.isMarkdown && !isTyping.value;
});

const showTypingSuffix = computed(
    // The suffix is rendered outside mp-html, so it is safe in Markdown mode too.
    () => isTyping.value && typingOptions.value.suffix,
);

const clearTypingTimer = () => {
    // 每次重启、中断、卸载前都清理计时器，防止组件卸载后仍然触发状态更新。
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
};

const updateProgress = () => {
    // content 为空时直接视为完成，避免除以 0。
    const total = props.content.length;
    progress.value = total ? Math.min(100, Math.round((cursor / total) * 100)) : 100;
};

const finishTyping = () => {
    // 完成时强制同步完整 content，避免最后一个 step 因边界计算遗漏字符。
    clearTypingTimer();
    cursor = props.content.length;
    renderedContent.value = props.content;
    isTyping.value = false;
    progress.value = 100;
    emit("finish", getRefState());
};

const writeNext = () => {
    // interrupt() 会把 isTyping 置为 false；定时回调进来时先检查，避免继续写字。
    if (!isTyping.value) {
        return;
    }

    const options = typingOptions.value;
    // 每次按 step 截取原始字符串，保证中断、继续、重启都能复用同一份状态。
    cursor = Math.min(props.content.length, cursor + options.step);
    renderedContent.value = props.content.slice(0, cursor);
    updateProgress();
    emit("writing", getRefState());

    if (cursor >= props.content.length) {
        finishTyping();
        return;
    }

    timer = setTimeout(writeNext, options.interval);
};

const startTyping = () => {
    // content、typing 或 loading 变化时都会重新进入这里，因此先清掉旧的打字任务。
    clearTypingTimer();

    if (!typingOptions.value.enabled || props.loading) {
        // loading 状态下不启动打字，避免加载动画和内容逐字展示同时出现。
        cursor = props.content.length;
        renderedContent.value = props.content;
        isTyping.value = false;
        progress.value = 100;
        return;
    }

    cursor = 0;
    renderedContent.value = "";
    isTyping.value = true;
    progress.value = 0;
    emit("start", getRefState());
    timer = setTimeout(writeNext, typingOptions.value.interval);
};

const interrupt = () => {
    // 只暂停在当前进度，不清空 renderedContent，方便 continue() 接着写。
    clearTypingTimer();
    isTyping.value = false;
    updateProgress();
};

const continueTyping = () => {
    // 已完成或未开启 typing 时继续操作无意义，直接忽略。
    if (!typingOptions.value.enabled || cursor >= props.content.length) {
        return;
    }
    clearTypingTimer();
    isTyping.value = true;
    emit("start", getRefState());
    timer = setTimeout(writeNext, typingOptions.value.interval);
};

const restart = () => {
    // 从头重新播放当前 content 的打字效果。
    startTyping();
};

const destroy = () => {
    // 主动销毁后如 content/typing/loading 再变化，watch 会让 alive 恢复为 true 并重新渲染。
    clearTypingTimer();
    alive.value = false;
};

const getRefState = () => ({
    // 事件统一返回 ref 状态快照，调用侧不用再手动读取组件实例。
    renderedContent: renderedContent.value,
    isTyping: isTyping.value,
    progress: progress.value,
});

const handleAvatarError = (event) => {
    emit("avatarError", event);
};

const handleHtmlLoad = (event) => {
    emit("htmlLoad", event);
};

const handleHtmlReady = (event) => {
    emit("htmlReady", event);
};

const handleHtmlImgTap = (event) => {
    emit("htmlImgTap", event);
};

const handleHtmlLinkTap = (event) => {
    emit("htmlLinkTap", event);
};

const handleHtmlError = (event) => {
    emit("htmlError", event);
};

watch(
    () => [props.content, props.typing, props.loading],
    () => {
        if (!alive.value) {
            alive.value = true;
        }
        startTyping();
    },
    { immediate: true, deep: true },
);

onBeforeUnmount(() => {
    clearTypingTimer();
});

defineExpose({
    // 暴露给父组件 ref 使用，方便外部控制 AI 打字过程。
    interrupt,
    continue: continueTyping,
    restart,
    destroy,
    renderedContent,
    isTyping,
    progress,
});

function escapeHtml(value) {
    // 小程序和 App 对富文本安全能力不完全一致，先在组件侧做基础转义更稳。
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
</script>

<style scoped>
.bubble-row {
    display: flex;
    align-items: flex-start;
    width: 100%;
    box-sizing: border-box;
    margin: 12rpx 0;
    position: relative;
}

.bubble-row-start {
    justify-content: flex-start;
}

.bubble-row-end {
    justify-content: flex-start;
    flex-direction: row-reverse;
}

.bubble-avatar {
    overflow: hidden;
    background: #eef2f7;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.bubble-avatar-circle {
    border-radius: 999rpx;
}

.bubble-avatar-square {
    border-radius: 12rpx;
}

.bubble-avatar-image {
    width: 100%;
    height: 100%;
    display: block;
}

.bubble-stack {
    min-width: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

.bubble-row-end .bubble-stack {
    align-items: flex-end;
}

.bubble-row-start .bubble-stack {
    align-items: flex-start;
}

/* Claude AI 风格字体栈
 * 关键改动：把 App 端真正可用的具体字体名放在最前面：
 *   - iOS / macOS: -apple-system / BlinkMacSystemFont → SF Pro；中文落到 PingFang SC
 *   - Android: Roboto + Noto Sans CJK SC（Android 6+ 系统字体，避免落到默认衬线）
 *   - Windows: Segoe UI + 微软雅黑
 * Söhne / system-ui 留作 Web/Mac 上的首选项。
 */
.bubble-box {
    box-sizing: border-box;
    padding: 18rpx 26rpx;
    color: #1f2328;
    font-family: -apple-system, BlinkMacSystemFont, "Söhne", "SF Pro Text",
        "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue",
        "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
        "Source Han Sans SC", "Noto Sans CJK SC", "Noto Sans SC",
        "WenQuanYi Micro Hei", system-ui, sans-serif;
    font-size: 30rpx;
    line-height: 1.72;
    letter-spacing: 0.2rpx;
    font-weight: 400;
    /* font-feature-settings: 开启 Söhne / SF / Inter 都支持的现代排版特性 */
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    word-break: break-word;
    width: fit-content;
    max-width: 100%;
}

.bubble-box-start {
    background: #ffffff;
    border-radius: 8rpx 26rpx 26rpx;
}

.bubble-box-end {
    background: #dbeafe;
    border-radius: 26rpx 8rpx 26rpx 26rpx;
}

.bubble-shape-round {
    border-radius: 28rpx;
}

.bubble-shape-corner.bubble-box-start {
    border-radius: 8rpx 26rpx 26rpx;
}

.bubble-shape-corner.bubble-box-end {
    border-radius: 26rpx 8rpx 26rpx 26rpx;
}

.bubble-filled {
    border: 1rpx solid rgba(15, 23, 42, 0.06);
}

.bubble-borderless {
    border: 0;
    box-shadow: none;
}

.bubble-outlined {
    background: transparent;
    border: 1rpx solid rgba(148, 163, 184, 0.55);
}

.bubble-shadow {
    border: 1rpx solid rgba(15, 23, 42, 0.04);
    box-shadow: 0 10rpx 26rpx rgba(15, 23, 42, 0.1);
}

.bubble-images {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 12rpx;
    width: fit-content;
    max-width: 100%;
}

.bubble-image-item {
    width: 180rpx;
    height: 180rpx;
    border-radius: 12rpx;
    background: #f0f2f5;
}

.bubble-no-style {
    padding: 0;
    background: transparent;
    border: 0;
    border-radius: 0;
    box-shadow: none;
}

.bubble-text {
    white-space: pre-wrap;
}

.bubble-mp-html {
    font-family: inherit;
    font-size: 30rpx;
    line-height: 1.72;
    letter-spacing: 0.2rpx;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
    -webkit-font-smoothing: antialiased;
    display: block;
}

:deep(.bubble-mp-html > view > view:first-child),
:deep(.bubble-mp-html > view > text:first-child) {
    margin-top: 0 !important;
}

:deep(.bubble-mp-html > view > view:last-child),
:deep(.bubble-mp-html > view > text:last-child) {
    margin-bottom: 0 !important;
}

.bubble-typing-suffix {
    display: inline;
    color: #64748b;
    margin-left: 2rpx;
}

.bubble-loading {
    display: flex;
    align-items: center;
    height: 40rpx;
}

.bubble-loading-dot {
    width: 10rpx;
    height: 10rpx;
    margin-right: 8rpx;
    border-radius: 999rpx;
    background: #94a3b8;
    animation: bubble-loading 1s infinite ease-in-out;
}

.bubble-loading-dot:nth-child(2) {
    animation-delay: 0.15s;
}

.bubble-loading-dot:nth-child(3) {
    margin-right: 0;
    animation-delay: 0.3s;
}

@keyframes bubble-loading {
    0%,
    80%,
    100% {
        opacity: 0.35;
        transform: translateY(0);
    }

    40% {
        opacity: 1;
        transform: translateY(-6rpx);
    }
}

/* 多设备字号微调：小屏稍紧凑、平板/大屏稍放大，保持阅读舒适度 */
/* H5 / App 端按屏幕物理宽度判断；小程序中 rpx 已按 750 基线自动缩放，此处主要服务 H5。 */
@media screen and (max-width: 360px) {
    .bubble-box {
        font-size: 28rpx;
        padding: 16rpx 22rpx;
        line-height: 1.68;
    }
    .bubble-mp-html {
        font-size: 28rpx;
        line-height: 1.68;
    }
}

@media screen and (min-width: 768px) {
    .bubble-box {
        font-size: 16px;
        padding: 12px 18px;
        line-height: 1.7;
    }
    .bubble-mp-html {
        font-size: 16px;
        line-height: 1.7;
    }
}

@media screen and (min-width: 1024px) {
    .bubble-box {
        font-size: 16.5px;
        line-height: 1.72;
    }
    .bubble-mp-html {
        font-size: 16.5px;
        line-height: 1.72;
    }
}

/* ───────── App 端字体优化 ─────────
 * App 端通过 @font-face + uni.loadFontFace 注入了 Inter + Noto Sans SC，
 * 让 iOS / Android 看到完全一致的 Claude 风格字体。
 * 拉丁字符走 Inter；中文落到 Noto Sans SC；缺字时再回退到系统字体。
 */
/* #ifdef APP-PLUS */
.bubble-box,
.bubble-mp-html {
    font-family: "Inter", "Noto Sans SC", "PingFang SC", "Hiragino Sans GB",
        "Helvetica Neue", "Roboto", "Microsoft YaHei", sans-serif;
    font-weight: 400;
    -webkit-font-smoothing: subpixel-antialiased;
}
/* #endif */

/* ───────── 长按下拉菜单 ───────── */
.bubble-action-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 998;
    background: transparent;
}

.bubble-action-dropdown {
    position: absolute;
    top: 100%;
    margin-top: 10rpx;
    min-width: 280rpx;
    background: #ffffff;
    border-radius: 16rpx;
    padding: 10rpx 0;
    box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.18);
    z-index: 999;
    display: flex;
    flex-direction: column;
}

.bubble-action-dropdown-start {
    left: 0;
}

.bubble-action-dropdown-end {
    right: 0;
}

.bubble-action-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22rpx 28rpx;
}

.bubble-action-item:active {
    background-color: #f7f8f9;
}

.bubble-action-text {
    font-size: 28rpx;
    color: #333;
}

.bubble-action-divider {
    height: 1rpx;
    background-color: #f0f0f0;
    margin: 4rpx 0;
}

/* ───────── 选择文本全屏视图 ───────── */
.bubble-select-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background: rgba(15, 23, 42, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60rpx 40rpx;
    box-sizing: border-box;
}

.bubble-select-card {
    width: 100%;
    max-width: 680rpx;
    max-height: 80vh;
    background: #ffffff;
    border-radius: 20rpx;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.bubble-select-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.bubble-select-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1f2937;
}

.bubble-select-close {
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bubble-select-body {
    flex: 1;
    padding: 24rpx 30rpx;
    box-sizing: border-box;
    min-height: 200rpx;
}

.bubble-select-text {
    font-size: 30rpx;
    line-height: 1.7;
    color: #1f2328;
    word-break: break-word;
    white-space: pre-wrap;
    user-select: text;
    -webkit-user-select: text;
}

.bubble-select-footer {
    padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid #f0f0f0;
}

.bubble-select-btn {
    padding: 22rpx 0;
    text-align: center;
    background: #1f2937;
    color: #ffffff;
    border-radius: 12rpx;
    font-size: 28rpx;
}

.bubble-select-btn:active {
    opacity: 0.85;
}

.bubble-select-btn text {
    color: #ffffff;
}
</style>
