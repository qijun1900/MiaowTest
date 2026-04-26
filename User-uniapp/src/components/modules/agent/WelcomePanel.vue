<template>
    <view class="welcome-panel">
        <view class="welcome-copy">
            <text class="welcome-greeting">{{ greeting }}</text>
            <text class="welcome-title">{{ title }}</text>
        </view>

        <view class="welcome-actions">
            <view
                v-for="item in actionItems"
                :key="item.key"
                class="welcome-action"
                @click="handleActionClick(item)"
            >
                <view class="action-icon" :style="{ color: item.color }">
                    <text class="action-emoji">{{ item.emoji }}</text>
                </view>
                <text class="action-title">{{ item.title }}</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    greeting: {
        type: String,
        default: "qijun，你好",
    },
    title: {
        type: String,
        default: "需要我为你做些什么？",
    },
    actions: {
        type: Array,
        default: () => [
            { key: "create-image", emoji: "🖼️", title: "制作图片", color: "#26a85d" },
            { key: "create-music", emoji: "🎸", title: "创作音乐", color: "#e05a4f" },
            { key: "help-study", emoji: "📚", title: "帮我学习", color: "#5973ff" },
            { key: "write-anything", emoji: "📄", title: "随便写点什么", color: "#8a6cff" },
        ],
    },
});

const emit = defineEmits(["action-click"]);

const actionItems = computed(() => props.actions || []);

const handleActionClick = (item) => {
    emit("action-click", item);
};
</script>

<style scoped>
.welcome-panel {
    margin: 26rpx 24rpx 0;
    padding: 8rpx 0 18rpx;
    box-sizing: border-box;
}

.welcome-copy {
    margin-bottom: 28rpx;
}

.welcome-greeting {
    display: block;
    font-size: 28rpx;
    line-height: 1.4;
    font-weight: 500;
    color: #313644;
    margin-bottom: 8rpx;
}

.welcome-title {
    display: block;
    font-size: 52rpx;
    line-height: 1.18;
    font-weight: 800;
    color: #121826;
    letter-spacing: 0.2rpx;
}

.welcome-actions {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
}

.welcome-action {
    width: fit-content;
    min-width: 246rpx;
    min-height: 76rpx;
    padding: 14rpx 22rpx;
    border-radius: 999rpx;
    background: #ffffff;
    border: 1rpx solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 10rpx 22rpx rgba(17, 24, 39, 0.05);
    display: flex;
    align-items: center;
    gap: 12rpx;
    box-sizing: border-box;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.welcome-action:active {
    transform: scale(0.985);
    box-shadow: 0 6rpx 16rpx rgba(17, 24, 39, 0.08);
}

.action-icon {
    width: 36rpx;
    height: 36rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.action-emoji {
    font-size: 26rpx;
    line-height: 1;
}

.action-title {
    font-size: 28rpx;
    font-weight: 500;
    color: #3d4758;
}
</style>