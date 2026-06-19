<template>
    <view
        class="bubble-row"
        :class="placement === 'end' ? 'bubble-row-end' : 'bubble-row-start'"
    >
        <view class="bubble-stack" :style="{ maxWidth }">
            <view v-if="displayImages.length > 0" class="bubble-images">
                <image
                    v-for="(img, idx) in displayImages"
                    :key="idx"
                    :src="getBubbleImageUrl(img)"
                    mode="aspectFill"
                    class="bubble-image-item"
                    @click="previewBubbleImage(idx)"
                />
            </view>

            <view v-if="files && files.length > 0" class="bubble-files">
                <view
                    v-for="(file, idx) in files"
                    :key="idx"
                    class="bubble-file-card"
                >
                    <view class="bubble-file-icon-wrap" :style="{ background: getFileMeta(file, idx).bg }">
                        <t-icon :name="getFileMeta(file, idx).icon" size="22" :color="getFileMeta(file, idx).color" />
                    </view>
                    <view class="bubble-file-info">
                        <text class="bubble-file-name">{{ getFileName(file, idx) }}</text>
                        <text class="bubble-file-ext">{{ getFileMeta(file, idx).label }}</text>
                    </view>
                </view>
            </view>

            <view
                class="bubble-box"
                :class="[
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

                <template v-else>
                    <template v-if="shouldRenderMarkdown">
                        <!--
                            按段落分块挂载：每个 committed 段落是一个独立 mp-html 实例。
                            :key="idx" 让 Vue 在新增块时只 mount 新实例、复用旧实例（content 没变 → 不重解析 → 不闪）。
                        -->
                        <MpHtml
                            v-for="(html, idx) in renderBlocks.committed"
                            :key="idx"
                            class="bubble-mp-html"
                            :content="html"
                            :markdown="true"
                            :tag-style="htmlTagStyle"
                        />
                        <!-- 流式中还未"收尾"（未出现 \n\n）的段落，用原生 <text> 平滑增量，避免 rich-text 重解析闪烁。 -->
                        <text v-if="renderBlocks.tail" class="bubble-text bubble-text-tail">{{ renderBlocks.tail }}</text>
                    </template>
                    <!-- 非 Markdown 模式 / 打字动画期间，直接用纯文本渲染。 -->
                    <text v-else class="bubble-text">{{ renderedContent }}</text>
                    <!-- 打字光标（如 "|"），渲染在 mp-html 之外，Markdown 模式下也安全。 -->
                    <text v-if="showTypingSuffix" class="bubble-typing-suffix">{{ typingOptions.suffix }}</text>
                </template>
            </view>
        </view>

        <!--
            长按下拉菜单（仅右侧用户消息）。
            mask 用 @touchmove.stop.prevent 阻止背后页面滚动，避免用户在菜单上滑动时把对话列表一起带走。
        -->
        <view v-if="showActionMenu" class="bubble-action-mask" @click.stop="closeActionMenu" @touchmove.stop.prevent></view>
        <view
            v-if="showActionMenu"
            class="bubble-action-dropdown bubble-action-dropdown-end"
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

        <!--
            选择文本全屏视图。
            小程序 <text selectable> 在普通气泡里复制体验差（容易选到时间戳/头像），
            打开独立卡片让用户在大字体、纯文本里精确选取，并可一键全部复制。
        -->
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
/**
 * Bubble —— Agent 对话气泡。
 *
 * 核心难点：mp-html / 小程序 rich-text 在 content prop 变化时会清空并重新解析整段
 * 富文本节点，高频更新（流式 chunk）下会出现"闪一下、内容消失再出现"。
 *
 * 解决方案 —— 按段落分块挂载（committed + tail）：
 *   committed[] —— 已稳定的段落，每段独立喂给一个 mp-html 实例。
 *                  字符串确定后再也不会变 → Vue 复用旧实例 → 永不重解析 → 不闪烁。
 *   tail        —— 流式中正在生成的最后一段，用原生 <text> 平滑增量显示；
 *                  等下一次出现段落边界 \n\n 再"提交"为新的 mp-html 块。
 */
import { computed, onBeforeUnmount, ref, watch } from "vue";
import MpHtml from "../../../uni_modules/mp-html/components/mp-html/mp-html.vue";

const props = defineProps({
    // 气泡正文。typing 开启时不会一次性展示，而是按 step 逐步写入 renderedContent。
    content: { type: String, default: "" },
    // start 左侧（AI 消息），end 右侧（用户消息）；样式和长按菜单的方向都会反转。
    placement: { type: String, default: "start" },
    // AI 思考态：true 时展示 loading 插槽，屏蔽正文渲染，避免 loading 和打字同时出现。
    loading: { type: Boolean, default: false },
    // 去掉气泡的内置 padding / 背景 / 边框 / 圆角；AI 消息用裸文字风格时开启。
    noStyle: { type: Boolean, default: false },
    // 是否按 Markdown 解析。开启后正文走 mp-html（committed 块）+ <text>（tail）渲染。
    isMarkdown: { type: Boolean, default: false },
    // 打字效果：true 走默认速度；对象支持 { step, interval, suffix } 覆盖。
    // 仅用于非流式回退路径——流式过程不走 typing，所有内容都通过 streaming 通道显示。
    typing: { type: [Boolean, Object], default: false },
    // 气泡最大宽度，支持 rpx / px / % / vw 等 uni-app 兼容的尺寸字符串。
    maxWidth: { type: String, default: "500px" },
    images: { type: Array, default: () => [] },
    files: { type: Array, default: () => [] },
    // 是否处于流式输出中。开启后启用"committed 块 + tail 文本"的分批挂载策略，避免 mp-html 重解析闪烁。
    streaming: { type: Boolean, default: false },
});

// 仅在打字动画走完时触发；流式结束不会触发。父组件用它把 msg.typing 标记复位。
const emit = defineEmits(["finish"]);

// ───────── 长按菜单 / 选择文本 ─────────
// 仅右侧用户消息：AI 消息走外部 AgentActionBar 提供复制/再生成等动作，避免和长按菜单功能重叠。
const showActionMenu = ref(false);
const showSelectView = ref(false);

const handleLongPress = () => {
    // loading 中或正文为空时长按无意义；left（AI 侧）走 ActionBar，不在这里弹菜单。
    if (props.loading || !props.content || props.placement !== 'end') return;
    showActionMenu.value = true;
};
const closeActionMenu = () => { showActionMenu.value = false; };
const closeSelectView = () => { showSelectView.value = false; };

const handleActionCopy = () => {
    const text = props.content || '';
    if (!text) { closeActionMenu(); return; }
    uni.setClipboardData({
        data: text,
        success: () => uni.showToast({ title: '已复制', icon: 'none', position: 'top' }),
        fail: () => uni.showToast({ title: '复制失败', icon: 'none' }),
    });
    closeActionMenu();
    closeSelectView();
};

const handleActionSelect = () => {
    closeActionMenu();
    showSelectView.value = true;
};

// ───────── 图片 / 文件附件 ─────────
// images 数组里可能是字符串 url，也可能是 { url, name, ... } 对象，兼容历史接口形状。
const getBubbleImageUrl = (img) =>
    !img ? '' : (typeof img === 'object' && img.url ? img.url : img);

// 后端有时把非图片附件也混在 images 里（旧数据），这里按扩展名再过滤一遍，
// 防止 file-only 的 url 被当成图片走 image 组件渲染出 404 缩略图。
const isImageUrlLike = (img) => {
    const url = String(getBubbleImageUrl(img) || '').toLowerCase().split('?')[0];
    return !!url && /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
};

const displayImages = computed(() => (props.images || []).filter(isImageUrlLike));

const previewBubbleImage = (index) => {
    const urls = displayImages.value.map(getBubbleImageUrl).filter(Boolean);
    if (!urls.length) return;
    uni.previewImage({ urls, current: urls[index] || urls[0] });
};

const getFileName = (file, index) => {
    if (typeof file === 'object' && file?.name) return file.name;
    const url = typeof file === 'object' ? file?.url : file;
    const name = String(url || '').split('?')[0].split('/').pop();
    return name || `附件${index + 1}`;
};

const FILE_TYPE_MAP = {
    image: { icon: 'file-image',      color: '#10b981', bg: '#ecfdf5', label: '图片' },
    video: { icon: 'file-1',          color: '#8b5cf6', bg: '#f5f3ff', label: '视频' },
    pdf:   { icon: 'file-pdf',        color: '#ef4444', bg: '#fef2f2', label: 'PDF'  },
    doc:   { icon: 'file-word',       color: '#2563eb', bg: '#eff6ff', label: 'Word' },
    ppt:   { icon: 'file-powerpoint', color: '#f97316', bg: '#fff7ed', label: 'PPT'  },
    excel: { icon: 'file-excel',      color: '#16a34a', bg: '#f0fdf4', label: 'Excel'},
    md:    { icon: 'file-markdown',   color: '#475569', bg: '#f1f5f9', label: 'MD'   },
    txt:   { icon: 'file-1',          color: '#64748b', bg: '#f8fafc', label: '文本' },
    file:  { icon: 'file-attachment', color: '#64748b', bg: '#f1f5f9', label: '文件' },
};

const getFileMeta = (file, idx) => {
    const name = getFileName(file, idx).toLowerCase().split('?')[0];
    if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(name)) return FILE_TYPE_MAP.image;
    if (/\.(mp4|mov|avi|m4v|webm)$/.test(name))          return FILE_TYPE_MAP.video;
    if (/\.pdf$/.test(name))                              return FILE_TYPE_MAP.pdf;
    if (/\.(doc|docx)$/.test(name))                       return FILE_TYPE_MAP.doc;
    if (/\.(ppt|pptx)$/.test(name))                       return FILE_TYPE_MAP.ppt;
    if (/\.(xls|xlsx|csv)$/.test(name))                   return FILE_TYPE_MAP.excel;
    if (/\.md$/.test(name))                               return FILE_TYPE_MAP.md;
    if (/\.(txt|log)$/.test(name))                        return FILE_TYPE_MAP.txt;
    return FILE_TYPE_MAP.file;
};

// ───────── 打字效果 ─────────
// 仅服务于"流式失败回退到一次性返回"的场景：父组件拿到完整回复后设 msg.typing=true，
// 让正文以打字动画出现，弥补失去流式的体验。流式正常路径不会走打字。
const renderedContent = ref('');   // 当前实际渲染的字符串（typing 模式下是 content 的前 N 个字符）
const isTyping = ref(false);
let timer = null;
let cursor = 0;                    // 已写出的字符数

const typingOptions = computed(() => {
    // step / interval 做兜底，防止父组件传 0 / 负数 / NaN 造成 setTimeout 死循环。
    if (!props.typing) return { enabled: false, step: 1, interval: 30, suffix: "" };
    if (props.typing === true) return { enabled: true, step: 1, interval: 30, suffix: "" };
    return {
        enabled: true,
        step: Math.max(1, Number(props.typing.step) || 1),
        interval: Math.max(0, Number(props.typing.interval) || 30),
        suffix: props.typing.suffix || "",
    };
});

// 打字状态下追加的光标后缀（如 "|"）。Markdown 模式下也安全，因为它渲染在 mp-html 之外。
const showTypingSuffix = computed(() => isTyping.value && typingOptions.value.suffix);

const clearTypingTimer = () => {
    if (timer) { clearTimeout(timer); timer = null; }
};

const writeNext = () => {
    // 中途被 startTyping 重置（content 变了重启）时停止旧任务的尾部写入。
    if (!isTyping.value) return;
    const options = typingOptions.value;
    cursor = Math.min(props.content.length, cursor + options.step);
    renderedContent.value = props.content.slice(0, cursor);
    if (cursor >= props.content.length) {
        clearTypingTimer();
        renderedContent.value = props.content;  // 边界兜底，避免最后一步漏字
        isTyping.value = false;
        emit("finish");
        return;
    }
    timer = setTimeout(writeNext, options.interval);
};

const startTyping = () => {
    // content / typing / loading 任一变化都会重入，先清掉上一轮的 timer。
    clearTypingTimer();

    // 未开启 typing 或处于 loading 时，直接把完整 content 镜像到 renderedContent。
    // 脏检查很重要：流式过程中 content 高频变化，每次都写 isTyping=false 会触发
    // 下游 computed（如 shouldRenderMarkdown / renderBlocks）的无效重算和 mp-html 重渲。
    if (!typingOptions.value.enabled || props.loading) {
        cursor = props.content.length;
        if (renderedContent.value !== props.content) renderedContent.value = props.content;
        if (isTyping.value) isTyping.value = false;
        return;
    }
    cursor = 0;
    renderedContent.value = "";
    isTyping.value = true;
    timer = setTimeout(writeNext, typingOptions.value.interval);
};

// ───────── Markdown 渲染（按块挂载，零闪烁） ─────────
// 通过 mp-html 的 tag-style 透传节点样式，比 scoped CSS 的 :deep 穿透更可靠（小程序对 :deep 支持不稳）。
const htmlTagStyle = {
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
};

// 打字动画期间用纯 <text> 渲染，避免每写一个字符都让 mp-html 重解析（闪烁源头之一）。
// 打字结束后 isTyping=false，自动切回 mp-html 完成最终 Markdown 渲染。
const shouldRenderMarkdown = computed(() => props.isMarkdown && !isTyping.value);

/**
 * 把 renderedContent 切成 { committed: string[], tail: string }，是整个"零闪烁"策略的核心。
 *
 *   committed[] —— 已稳定的段落，每段一个 mp-html 实例（v-for + :key="idx"）。
 *                   一旦一个段落进入 committed[idx]，它的字符串就再也不会变；
 *                   Vue 通过稳定 key 复用同一个 mp-html 实例，content prop 没变就不重解析 → 不闪。
 *   tail        —— 流式中正在生成的最后一段（还没出现 \n\n 收尾）。
 *                   用原生 <text> 显示，文本节点可以原地追加，没有 rich-text 重解析的概念，也不会闪。
 *
 * 切分规则：以段落边界 \n\n 为分隔，但 ``` ... ``` 代码块内部的 \n\n 不算分隔（否则代码块会被切成两段、渲染破碎）。
 * 非流式（historical / streaming=false）：tail 永远为 ''，全部内容都作为 committed[] 一次性 v-for 挂载。
 */
const renderBlocks = computed(() => {
    const text = renderedContent.value || '';
    if (!props.isMarkdown || !text) return { committed: [], tail: text };

    const all = [];
    let cur = 0, inFence = false, i = 0;
    const len = text.length;
    while (i < len) {
        // 行首的 ``` 切换代码块状态。要求 atLineStart 是为了排除文本中作为字面量出现的 ```。
        if ((i === 0 || text[i - 1] === '\n') && text.substr(i, 3) === '```') {
            inFence = !inFence;
            i += 3;
            continue;
        }
        // 段落边界：连续 2 个以上换行；代码块内部的换行不算。
        if (!inFence && text[i] === '\n' && text[i + 1] === '\n') {
            let j = i + 2;
            while (j < len && text[j] === '\n') j++;  // 把连续 \n 一并吃掉
            all.push(text.slice(cur, j));             // 切出的块自带尾部 \n\n，便于后面判断"是否已收尾"
            cur = j;
            i = j;
            continue;
        }
        i++;
    }
    if (cur < len) all.push(text.slice(cur));

    // LaTeX 兼容：很多大模型输出用 \(..\) / \[..\]，mp-html 的 latex 插件只认 $..$ / $$..$$。
    // 注意 String.replace 中 $$ 是转义后的字面 $，所以 $$$$1$$$$ → $$$1$$ 字面输出，即 $$<group1>$$。
    const toMd = (s) => s
        .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
        .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

    // 流式中，最后一段如果不以 \n\n 结尾说明它还没"完成"，应当作为 tail。
    // 边界情况：未闭合的 ``` 代码块只会落在最后一段（前面的 \n\n 在 inFence 时被跳过了），自然进入 tail，
    // 这样代码块在生成完毕前不会被错误地交给 mp-html 渲染半截 <pre>。
    if (props.streaming && all.length && !/\n\n$/.test(all[all.length - 1])) {
        const tail = all.pop();
        return { committed: all.map(toMd), tail };
    }
    return { committed: all.map(toMd), tail: '' };
});

// 注意 streaming / isMarkdown 不在 watch 依赖里：它们只影响 renderBlocks 这个 computed，
// 由 Vue 自动响应；不需要再触发 startTyping，否则会清掉正在播放的打字动画。
watch(
    () => [props.content, props.typing, props.loading],
    () => { startTyping(); },
    { immediate: true },
);

onBeforeUnmount(clearTypingTimer);
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

.bubble-row-end { flex-direction: row-reverse; }

.bubble-stack {
    min-width: 0;
    overflow: hidden;
    max-width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

.bubble-row-end   .bubble-stack { align-items: flex-end; }
.bubble-row-start .bubble-stack { align-items: flex-start; }

/*
 * Claude 风格字体栈：
 *   iOS / macOS → SF Pro（-apple-system）+ PingFang SC
 *   Android     → Roboto + Noto Sans CJK SC
 *   Windows     → Segoe UI + 微软雅黑
 *   Söhne / system-ui 留给 Web/Mac 上的首选项。
 * APP 端会被下面 #ifdef APP-PLUS 块覆盖成 Inter + Noto Sans SC。
 */
.bubble-box {
    box-sizing: border-box;
    padding: 18rpx 26rpx;
    color: var(--app-text-primary);
    font-family: -apple-system, BlinkMacSystemFont, "Söhne", "SF Pro Text",
        "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue",
        "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
        "Source Han Sans SC", "Noto Sans CJK SC", "Noto Sans SC",
        "WenQuanYi Micro Hei", system-ui, sans-serif;
    font-size: calc(34rpx * var(--app-font-scale, 1));
    line-height: 1.72;
    letter-spacing: 0.2rpx;
    font-weight: 400;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "ss01" 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    word-break: break-word;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    width: fit-content;
    max-width: 100%;
    border: 1rpx solid var(--app-border);
}

.bubble-box-start { background: var(--app-bg-container); border-radius: 8rpx 26rpx 26rpx; }
.bubble-box-end   { background: var(--app-brand-light);  border-radius: 26rpx 8rpx 26rpx 26rpx; }

.bubble-no-style {
    padding: 0;
    background: transparent;
    border: 0;
    border-radius: 0;
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
    background: var(--app-bg-secondary);
}

.bubble-files {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    margin-bottom: 12rpx;
    max-width: 560rpx;
}

.bubble-file-card {
    display: flex;
    align-items: center;
    gap: 18rpx;
    padding: 18rpx 20rpx;
    border-radius: 18rpx;
    background: var(--app-bg-container);
    border: 1rpx solid var(--app-border);
}

.bubble-file-icon-wrap {
    width: 72rpx;
    height: 72rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.bubble-file-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
}

.bubble-file-name {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.bubble-file-ext {
    font-size: calc(22rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

.bubble-text { white-space: pre-wrap; }

/*
 * 流式 tail 文本：还没被"提交"为 mp-html 块的最后一段。
 * margin-top + 一致的字号/行高，让它在视觉上接续上一段 mp-html 段落（看起来像新一段正文），
 * 等下次出现 \n\n 被切到 committed 后，新挂载的 mp-html 块和这段 tail 的位置/高度基本对齐，肉眼不易察觉切换。
 */
.bubble-text-tail {
    display: block;
    margin-top: 8rpx;
    font-family: inherit;
    font-size: calc(34rpx * var(--app-font-scale, 1));
    line-height: 1.72;
    color: var(--app-text-primary);
}

.bubble-mp-html {
    font-family: inherit;
    font-size: calc(34rpx * var(--app-font-scale, 1));
    line-height: 1.72;
    letter-spacing: 0.2rpx;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
    -webkit-font-smoothing: antialiased;
    display: block;
}

/*
 * mp-html 渲染出来的 <p> / <pre> 等会自带 margin-top / margin-bottom；按块挂载后每块都是独立 mp-html，
 * 上下都加 margin 会让块之间的间距变成原来的两倍。强制清掉首尾子元素的边距，让块的拼接看起来像一整段。
 */
:deep(.bubble-mp-html > view > view:first-child),
:deep(.bubble-mp-html > view > text:first-child) { margin-top: 0 !important; }

:deep(.bubble-mp-html > view > view:last-child),
:deep(.bubble-mp-html > view > text:last-child) { margin-bottom: 0 !important; }

.bubble-typing-suffix {
    display: inline;
    color: var(--app-text-secondary);
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
    background: var(--app-text-secondary);
    animation: bubble-loading 1s infinite ease-in-out;
}

.bubble-loading-dot:nth-child(2) { animation-delay: 0.15s; }
.bubble-loading-dot:nth-child(3) { margin-right: 0; animation-delay: 0.3s; }

@keyframes bubble-loading {
    0%, 80%, 100% { opacity: 0.35; transform: translateY(0); }
    40%           { opacity: 1;    transform: translateY(-6rpx); }
}

/*
 * 多设备字号微调：rpx 在小程序里已按 750 基线自动缩放，下面媒体查询主要服务 H5 / App 端。
 *   < 360px：老安卓机，缩字号、压紧 padding。
 *   ≥ 768px：平板，回到 px 单位避免字过大。
 *   ≥ 1024px：桌面/大平板，再放大半码增加可读性。
 */
@media screen and (max-width: 360px) {
    .bubble-box, .bubble-mp-html {
        font-size: calc(32rpx * var(--app-font-scale, 1));
        line-height: 1.68;
    }
    .bubble-box { padding: 16rpx 22rpx; }
}

@media screen and (min-width: 768px) {
    .bubble-box, .bubble-mp-html {
        font-size: calc(18px * var(--app-font-scale, 1));
        line-height: 1.7;
    }
    .bubble-box { padding: 12px 18px; }
}

@media screen and (min-width: 1024px) {
    .bubble-box, .bubble-mp-html {
        font-size: calc(18.5px * var(--app-font-scale, 1));
        line-height: 1.72;
    }
}

/*
 * APP 端通过 @font-face + uni.loadFontFace 注入了 Inter + Noto Sans SC，
 * 让 iOS / Android 看到统一的 Claude 风格字体；这里把字体栈优先级覆盖到注入的字体上，
 * 系统字体只作为缺字回退。
 */
/* #ifdef APP-PLUS */
.bubble-box, .bubble-mp-html {
    font-family: "Inter", "Noto Sans SC", "PingFang SC", "Hiragino Sans GB",
        "Helvetica Neue", "Roboto", "Microsoft YaHei", sans-serif;
    font-weight: 400;
    -webkit-font-smoothing: subpixel-antialiased;
}
/* #endif */

/* ───────── 长按下拉菜单 ───────── */
.bubble-action-mask {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 998;
    background: transparent;
}

.bubble-action-dropdown {
    position: absolute;
    top: 100%;
    margin-top: 10rpx;
    min-width: 280rpx;
    background: var(--app-bg-container);
    border-radius: 16rpx;
    padding: 10rpx 0;
    box-shadow: var(--app-shadow-elevated);
    z-index: 999;
    display: flex;
    flex-direction: column;
}

.bubble-action-dropdown-end { right: 0; }

.bubble-action-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22rpx 28rpx;
}

.bubble-action-item:active { background-color: var(--app-bg-secondary); }

.bubble-action-text {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    color: var(--app-text-primary);
}

.bubble-action-divider {
    height: 1rpx;
    background-color: var(--app-border);
    margin: 4rpx 0;
}

/* ───────── 选择文本全屏视图 ───────── */
.bubble-select-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 1000;
    background: var(--app-bg-mask);
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
    background: var(--app-bg-container);
    border-radius: 20rpx;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: var(--app-shadow-elevated);
}

.bubble-select-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 30rpx;
    border-bottom: 1rpx solid var(--app-border);
}

.bubble-select-title {
    font-size: calc(34rpx * var(--app-font-scale, 1));
    font-weight: 600;
    color: var(--app-text-primary);
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
    font-size: calc(34rpx * var(--app-font-scale, 1));
    line-height: 1.7;
    color: var(--app-text-primary);
    word-break: break-word;
    white-space: pre-wrap;
    user-select: text;
    -webkit-user-select: text;
}

.bubble-select-footer {
    padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid var(--app-border);
}

.bubble-select-btn {
    padding: 22rpx 0;
    text-align: center;
    background: var(--app-brand);
    color: var(--app-bg-container);
    border-radius: 12rpx;
    font-size: calc(28rpx * var(--app-font-scale, 1));
}

.bubble-select-btn:active { opacity: 0.85; }
.bubble-select-btn text   { color: var(--app-bg-container); }
</style>
