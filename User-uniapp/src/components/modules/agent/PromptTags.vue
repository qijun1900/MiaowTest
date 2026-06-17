<template>
    <view class="prompt-tags">
        <view
            v-for="item in promptItems"
            :key="item.key"
            class="prompt-tag"
            :class="{ 'prompt-tag-active': item.key === activeKey }"
            @click="handleSelect(item)"
        >
            <text class="prompt-tag-label">{{ item.label }}</text>
        </view>
    </view>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    prompts: {
        type: Array,
        default: () => [
            { key: "write", label: "写作助手" },
            { key: "code", label: "代码生成" },
            { key: "translate", label: "翻译" },
            { key: "summarize", label: "摘要" },
            { key: "analyze", label: "数据分析" },
            { key: "creative", label: "创意灵感" },
            { key: "plan", label: "学习计划" },
            { key: "explain", label: "概念解释" },
        ],
    },
    activeKey: {
        type: String,
        default: "",
    },
});

const emit = defineEmits(["select"]);

const promptItems = computed(() => props.prompts || []);

const handleSelect = (item) => {
    emit("select", item);
};
</script>

<style scoped>
.prompt-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 18rpx;
    padding: 24rpx;
}

.prompt-tag {
    height: 68rpx;
    padding: 0 28rpx;
    border-radius: 999rpx;
    background: var(--app-bg-container);
    border: 1rpx solid #edf0f4;
    box-shadow: 0 4rpx 12rpx rgba(17, 24, 39, 0.035);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.prompt-tag:active {
    transform: scale(0.985);
    background: var(--app-bg-secondary);
}

.prompt-tag-active {
    background: var(--app-brand-light);
    border-color: var(--app-brand);
}

.prompt-tag-active .prompt-tag-label {
    color: var(--app-brand);
}

.prompt-tag-label {
    font-size: calc(28rpx * var(--app-font-scale, 1));
    line-height: 1;
    font-weight: 600;
    color: var(--app-text-secondary);
    white-space: nowrap;
}
</style>