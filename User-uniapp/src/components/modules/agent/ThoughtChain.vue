<template>
    <view class="thought-chain" :style="{ maxWidth: maxWidth }">
        <!-- 头部触发区域 -->
        <view 
            class="header-btn" 
            :class="{ disabled: disabled }"
            :style="{ width: buttonWidth }"
            @click="toggleExpand"
        >
            <view class="status-icon">
                <text v-if="status === 'thinking'" class="icon-loading">💭</text>
                <text v-else-if="status === 'end'" class="icon-success">✔️</text>
                <text v-else-if="status === 'error'" class="icon-error">❌</text>
                <text v-else class="icon-start">💡</text>
            </view>
            <view class="status-text">{{ statusText }}</view>
            <view class="arrow-icon" :class="{ expanded: isExpanded }">▼</view>
        </view>

        <!-- 内容区域 -->
        <view 
            class="content-area" 
            :class="{ expanded: isExpanded }"
            :style="{ 
                backgroundColor: backgroundColor, 
                color: color,
                transitionDuration: duration 
            }"
        >
            <view class="content-inner">
                <slot>
                    <text class="content-text">{{ renderedContent }}</text>
                    <text v-if="isTyping && typingOptions.suffix" class="typing-suffix">{{ typingOptions.suffix }}</text>
                </slot>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';

const props = defineProps({
    content: {
        type: String,
        default: ''
    },
    modelValue: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        default: 'start', // 'start' | 'thinking' | 'end' | 'error' | 'cancel'
        validator: (value) => ['start', 'thinking', 'end', 'error', 'cancel'].includes(value)
    },
    autoCollapse: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    buttonWidth: {
        type: String,
        default: '160px'
    },
    duration: {
        type: String,
        default: '0.3s'
    },
    maxWidth: {
        type: String,
        default: '500px'
    },
    backgroundColor: {
        type: String,
        default: '#f8f9fa'
    },
    color: {
        type: String,
        default: '#666666'
    },
    typing: {
        type: [Boolean, Object],
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

const isExpanded = ref(props.modelValue);

const renderedContent = ref('');
const isTyping = ref(false);
let timer = null;
let cursor = 0;

const typingOptions = computed(() => {
    if (!props.typing) {
        return { enabled: false, step: 1, interval: 50, suffix: '' };
    }
    if (props.typing === true) {
        return { enabled: true, step: 1, interval: 30, suffix: '_' };
    }
    return {
        enabled: true,
        step: props.typing.step || 1,
        interval: props.typing.interval || 30,
        suffix: props.typing.suffix ?? '_'
    };
});

const clearTypingTimer = () => {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
};

const writeNext = () => {
    if (!isTyping.value) return;

    const options = typingOptions.value;
    cursor = Math.min(props.content.length, cursor + options.step);
    renderedContent.value = props.content.slice(0, cursor);

    if (cursor >= props.content.length) {
        isTyping.value = false;
        return;
    }
    timer = setTimeout(writeNext, options.interval);
};

const startTyping = () => {
    clearTypingTimer();
    if (!typingOptions.value.enabled) {
        renderedContent.value = props.content;
        isTyping.value = false;
        return;
    }

    cursor = 0;
    renderedContent.value = '';
    isTyping.value = true;
    timer = setTimeout(writeNext, typingOptions.value.interval);
};

watch(() => [props.content, props.typing], () => {
    startTyping();
}, { immediate: true, deep: true });

onBeforeUnmount(() => {
    clearTypingTimer();
});

watch(() => props.modelValue, (newVal) => {
    isExpanded.value = newVal;
});

watch(() => props.status, (newStatus) => {
    if (newStatus === 'end' && props.autoCollapse) {
        isExpanded.value = false;
        emit('update:modelValue', false);
    }
});

const toggleExpand = () => {
    if (props.disabled) return;
    isExpanded.value = !isExpanded.value;
    emit('update:modelValue', isExpanded.value);
};

const statusText = computed(() => {
    switch (props.status) {
        case 'start': return '准备思考';
        case 'thinking': return '深度思考中...';
        case 'end': return '思考完成';
        case 'error': return '思考出错';
        case 'cancel': return '已取消';
        default: return '思考';
    }
});
</script>

<style scoped>
.thought-chain {
    margin: 10rpx 0;
    border-radius: 12rpx;
    overflow: hidden;
    font-size: 28rpx;
}

.header-btn {
    display: flex;
    align-items: center;
    padding: 12rpx 20rpx;
    background-color: var(--app-bg-secondary);
    border-radius: 8rpx;
    cursor: pointer;
    user-select: none;
}

.header-btn.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.status-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
}

.status-text {
    flex: 1;
    color: var(--app-text-primary);
    font-weight: 500;
}

.arrow-icon {
    font-size: 24rpx;
    color: var(--app-text-secondary);
    transition: transform 0.3s ease;
}

.arrow-icon.expanded {
    transform: rotate(180deg);
}

.content-area {
    margin-top: 8rpx;
    border-radius: 8rpx;
    max-height: 0;
    overflow: hidden;
    transition-property: max-height, padding, opacity;
    transition-timing-function: ease-in-out;
    opacity: 0;
}

.content-area.expanded {
    max-height: 1000px; /* 根据实际内容调整，或使用JS动态计算 */
    opacity: 1;
}

.content-inner {
    padding: 20rpx;
    word-break: break-all;
    white-space: pre-wrap;
    line-height: 1.5;
}

.typing-suffix {
    display: inline;
    color: var(--app-text-secondary);
    margin-left: 4rpx;
    animation: blink 1s step-end infinite;
}

@keyframes blink {
    50% { opacity: 0; }
}
</style>
