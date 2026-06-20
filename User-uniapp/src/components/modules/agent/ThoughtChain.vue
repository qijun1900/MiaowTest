<template>
    <view class="thought-chain" :style="wrapperStyle">
        <t-chat-thinking
            :content="thinkingContent"
            :status="tdStatus"
            :collapsed="collapsed"
            :animation="animation"
            :layout="layout"
            :max-height="maxHeight"
            :custom-style="customStyle"
            @collapsed-change="handleCollapsedChange"
        >
            <template #content>
                <slot name="content" :text="renderedText" :is-typing="isTyping">
                    <view class="thought-chain__text">
                        <text>{{ renderedText }}</text>
                        <text
                            v-if="isTyping && typingOptions.suffix"
                            class="thought-chain__caret"
                        >{{ typingOptions.suffix }}</text>
                    </view>
                    <slot name="extra" />
                </slot>
            </template>
        </t-chat-thinking>
    </view>
</template>

<script>
/**
 * ThoughtChain 业务常量（必须放在普通 <script> 中，否则 defineProps validator 无法引用）
 */
export const TYPE_PRESETS = {
    thinking:  { icon: '💭', label: '思考',    animation: 'moving'   },
    analysis:  { icon: '🔍', label: '分析',    animation: 'gradient' },
    planning:  { icon: '🗂️', label: '规划',    animation: 'dots'     },
    searching: { icon: '🔎', label: '检索',    animation: 'moving'   },
    reasoning: { icon: '🧠', label: '推理',    animation: 'gradient' },
    custom:    { icon: '💡', label: '处理',    animation: 'moving'   },
};

export const STATUS_MAP = {
    start:    'pending',
    thinking: 'pending',
    pending:  'pending',
    end:      'complete',
    complete: 'complete',
    error:    'error',
    cancel:   'stop',
    stop:     'stop',
};
</script>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import TChatThinking from '@tdesign/uniapp-chat/chat-thinking/chat-thinking.vue';

/**
 * ThoughtChain —— 基于 t-chat-thinking 的业务封装
 * 业务能力：
 *  - type 业务预设（thinking / analysis / planning / searching / reasoning / custom）
 *  - 状态自动映射 + 中文文案
 *  - 内置打字机效果
 *  - autoCollapse：状态结束后自动收起
 *  - 自动统计耗时并写入标题
 *  - 标题/内容/额外区均可插槽扩展
 */

const props = defineProps({
    /** 业务类型，决定默认图标 / 文案 / 动画 */
    type: {
        type: String,
        default: 'thinking',
        validator: v => Object.keys(TYPE_PRESETS).includes(v),
    },
    /** 文本内容 */
    content: { type: String, default: '' },
    /** 自定义标题，留空走 type + status 自动文案 */
    title: { type: String, default: '' },
    /** v-model 控制展开/折叠（true = 展开） */
    modelValue: { type: Boolean, default: true },
    /** 业务语义状态 */
    status: {
        type: String,
        default: 'start',
        validator: v => Object.keys(STATUS_MAP).includes(v),
    },
    /** 结束后自动折叠 */
    autoCollapse: { type: Boolean, default: false },
    /** 打字机：true / false / { step, interval, suffix } */
    typing: { type: [Boolean, Object], default: false },
    /** 透传：moving / skeleton / gradient / dots */
    animation: { type: String, default: '' },
    /** 透传：block / border */
    layout: { type: String, default: 'block' },
    /** 内容区最大高度（rpx 数值），超出滚动 */
    maxHeight: { type: Number, default: 0 },
    /** 最大宽度 */
    maxWidth: { type: String, default: '100%' },
    /** 是否在标题中显示耗时 */
    showDuration: { type: Boolean, default: true },
    /** 透传给 t-chat-thinking 的 customStyle */
    customStyle: { type: Object, default: () => ({}) },
});

const emit = defineEmits([
    'update:modelValue',
    'collapsed-change',
    'status-change',
    'typing-finish',
]);

// —— 展开/折叠 —— //
const collapsed = ref(!props.modelValue);

watch(() => props.modelValue, v => { collapsed.value = !v; });

const handleCollapsedChange = (e) => {
    const val = typeof e === 'boolean' ? e : e?.detail?.value ?? e?.value;
    collapsed.value = !!val;
    emit('update:modelValue', !collapsed.value);
    emit('collapsed-change', collapsed.value);
};

// —— 打字机 —— //
const renderedText = ref('');
const isTyping = ref(false);
let timer = null;
let cursor = 0;

const typingOptions = computed(() => {
    if (!props.typing) return { enabled: false, step: 1, interval: 30, suffix: '' };
    if (props.typing === true) return { enabled: true, step: 1, interval: 30, suffix: '_' };
    return {
        enabled: true,
        step: props.typing.step || 1,
        interval: props.typing.interval || 30,
        suffix: props.typing.suffix ?? '_',
    };
});

const clearTimer = () => {
    if (timer) { clearTimeout(timer); timer = null; }
};

const writeNext = () => {
    if (!isTyping.value) return;
    const { step, interval } = typingOptions.value;
    cursor = Math.min(props.content.length, cursor + step);
    renderedText.value = props.content.slice(0, cursor);
    if (cursor >= props.content.length) {
        isTyping.value = false;
        emit('typing-finish');
        return;
    }
    timer = setTimeout(writeNext, interval);
};

const startTyping = () => {
    clearTimer();
    if (!typingOptions.value.enabled) {
        renderedText.value = props.content;
        isTyping.value = false;
        return;
    }
    cursor = 0;
    renderedText.value = '';
    isTyping.value = true;
    timer = setTimeout(writeNext, typingOptions.value.interval);
};

watch(
    () => [props.content, props.typing],
    () => startTyping(),
    { immediate: true, deep: true }
);

onBeforeUnmount(clearTimer);

// —— 耗时统计 —— //
const startTime = ref(0);
const durationSec = ref(0);

watch(
    () => props.status,
    (next, prev) => {
        const isActive = next === 'start' || next === 'thinking' || next === 'pending';
        const wasActive = prev === 'start' || prev === 'thinking' || prev === 'pending';
        if (isActive && !wasActive) {
            startTime.value = Date.now();
            durationSec.value = 0;
        }
        if (!isActive && wasActive && startTime.value) {
            durationSec.value = Math.max(0, Math.round((Date.now() - startTime.value) / 1000));
        }
        if (next === 'end' || next === 'complete') {
            if (props.autoCollapse && !collapsed.value) {
                collapsed.value = true;
                emit('update:modelValue', false);
                emit('collapsed-change', true);
            }
        }
        emit('status-change', next);
    },
    { immediate: true }
);

// —— 状态/标题映射 —— //
const tdStatus = computed(() => STATUS_MAP[props.status] || 'pending');

const preset = computed(() => TYPE_PRESETS[props.type] || TYPE_PRESETS.custom);

const animation = computed(() => props.animation || preset.value.animation);

const computedTitle = computed(() => {
    if (props.title) return props.title;
    const { icon, label } = preset.value;
    const base = `${icon} ${label}`;
    switch (props.status) {
        case 'start':    return `${base}准备中`;
        case 'thinking':
        case 'pending':  return `${base}中...`;
        case 'end':
        case 'complete':
            return props.showDuration && durationSec.value > 0
                ? `已完成${label}（耗时 ${durationSec.value}s）`
                : `${label}完成`;
        case 'error':    return `${label}出错`;
        case 'cancel':
        case 'stop':     return `${label}已取消`;
        default:         return base;
    }
});

const thinkingContent = computed(() => ({
    title: computedTitle.value,
    text: renderedText.value,
}));

const wrapperStyle = computed(() => ({ maxWidth: props.maxWidth }));
</script>

<style scoped lang="scss">
.thought-chain {
    margin: 10rpx 0;
    font-size: calc(28rpx * var(--app-font-scale, 1));

    /* 主题对齐：让 t-chat-thinking 跟随 app token */
    --td-chat-thinking-bg-color: var(--app-bg-secondary);
    --td-chat-thinking-color: var(--app-text-primary);
    --td-chat-thinking-border-color: var(--app-border-color, transparent);
    --td-chat-thinking-font-size: calc(28rpx * var(--app-font-scale, 1));
    --td-chat-thinking-line-height: 1.6;
    --td-chat-thinking-border-radius: 12rpx;
    --td-chat-thinking-padding: 20rpx;

    &__text {
        word-break: break-all;
        white-space: pre-wrap;
        color: var(--app-text-secondary);
        font-size: calc(28rpx * var(--app-font-scale, 1));
        line-height: 1.6;
    }

    &__caret {
        display: inline;
        margin-left: 4rpx;
        color: var(--app-text-secondary);
        animation: thought-chain-blink 1s step-end infinite;
    }
}

@keyframes thought-chain-blink {
    50% { opacity: 0; }
}
</style>
