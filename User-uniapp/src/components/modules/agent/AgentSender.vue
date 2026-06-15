<template>
    <view class="sender-shell">
        <slot name="images"></slot>
        <input
            class="sender-input"
            :value="modelValue"
            :placeholder="placeholder"
            confirm-type="send"
            :adjust-position="false"
            @focus="handleFocus"
            @blur="handleBlur"
            @input="handleInput"
            @confirm="handleConfirm"
        />

        <view class="sender-tools">
            <view class="sender-tools-left">
                <view
                    v-if="showAttachment"
                    class="attach-btn"
                    @click="handleAddAttachment()"
                >
                    <view class="attach-plus"></view>
                </view>

                <view
                    v-if="showThinkingToggle && isShowThingkingBut"
                    class="thinking-chip"
                    :class="{ 'thinking-chip-active': thinking }"
                    @click="toggleThinking"
                >
                    <view class="chip-dot"></view>
                    <text class="chip-text">思考模式</text>
                </view>
            </view>

            <view
                class="send-btn"
                :class="{ 'send-hidden': !canSubmit }"
                @click="canSubmit && submitCurrent()"
            >
                <uni-icons type="paperplane-filled" size="20" color="#ffffff">
                </uni-icons>
            </view>
        </view>
    </view>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    modelValue: {
        type: String,
        default: "",
    },
    thinking: {
        type: Boolean,
        default: false,
    },
    showThinkingToggle: {
        type: Boolean,
        default: true,
    },
    placeholder: {
        type: String,
        default: "发消息或按住说话",
    },
    isShowThingkingBut: {
        type: Boolean,
        default: false,
    },
    pendingImages: {
        type: Array,
        default: () => [],
    },
    uploading: {
        type: Boolean,
        default: false,
    },
    showAttachment: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits([
    "update:modelValue",
    "update:thinking",
    "submit",
    "add-attachment",
    "focus",
    "blur",
]);

const hasText = computed(() => (props.modelValue || "").trim().length > 0);
const hasImages = computed(() => props.pendingImages && props.pendingImages.length > 0);
const canSubmit = computed(() => !props.uploading && (hasText.value || hasImages.value));

const handleFocus = (event) => {
    emit("focus", event);
};

const handleBlur = (event) => {
    emit("blur", event);
};

const handleInput = (event) => {
    emit("update:modelValue", event?.detail?.value || "");
};

const submitCurrent = () => {
    emit("submit", {
        text: (props.modelValue || "").trim(),
        thinking: props.thinking,
        images: props.pendingImages || [],
    });
};

const handleConfirm = () => {
    submitCurrent();
};

const toggleThinking = () => {
    emit("update:thinking", !props.thinking);
};

const handleAddAttachment = () => {
    emit("add-attachment");
};
</script>

<style scoped>
.sender-shell {
    margin: 0 24rpx;
    padding: 18rpx 20rpx 14rpx;
    border-radius: 34rpx;
    background: var(--app-bg-container);
    border: 1rpx solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 10rpx 22rpx rgba(17, 24, 39, 0.08);
}

.sender-input {
    width: 100%;
    min-height: 74rpx;
    font-size: 30rpx;
    color: var(--app-text-primary);
    line-height: 1.4;
}

.sender-tools {
    margin-top: 10rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
}

.sender-tools-left {
    display: flex;
    align-items: center;
    gap: 14rpx;
    min-width: 0;
}

.thinking-chip {
    min-height: 58rpx;
    padding: 0 20rpx;
    border-radius: 999rpx;
    display: inline-flex;
    align-items: center;
    gap: 10rpx;
    background: var(--app-bg-secondary);
    border: 1rpx solid var(--app-border);
}

.thinking-chip-active {
    background: var(--app-brand-light);
    border-color: var(--app-brand);
}

.chip-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: var(--app-brand);
}

.chip-text {
    font-size: 26rpx;
    color: var(--app-brand);
    font-weight: 600;
}

.attach-btn,
.send-btn {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 1;
    transform: scale(1);
    overflow: hidden;
}

.attach-btn {
    background: var(--app-bg-container);
    border: 1rpx solid rgba(15, 23, 42, 0.18);
}

.attach-hidden {
    width: 0;
    opacity: 0;
    border-width: 0;
    transform: scale(0.6);
    pointer-events: none;
    margin-right: -14rpx; /* 抵消 flex gap 避免留白 */
}

.send-btn {
    background: var(--app-brand);
    box-shadow: 0 8rpx 18rpx rgba(47, 107, 255, 0.26);
}

.send-hidden {
    width: 0;
    opacity: 0;
    transform: scale(0.6);
    pointer-events: none;
}

.attach-plus {
    width: 24rpx;
    height: 24rpx;
    position: relative;
}

.attach-plus::before,
.attach-plus::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    background: var(--app-text-primary);
    transform: translate(-50%, -50%);
    border-radius: 999rpx;
}

.attach-plus::before {
    width: 20rpx;
    height: 3rpx;
}

.attach-plus::after {
    width: 3rpx;
    height: 20rpx;
}
</style>
