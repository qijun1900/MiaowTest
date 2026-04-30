<template>
    <view class="welcome-panel">
        <view class="welcome-copy">
            <text class="welcome-greeting">{{ dynamicGreeting }}</text>
            <text class="welcome-title">{{ title }}</text>
        </view>

        <view class="welcome-actions">
            <view
                v-for="item in actionItems"
                :key="item.key"
                class="welcome-action"
                @click="handleActionClick(item)"
            >
                <view
                    class="action-icon"
                    :class="`action-icon-${item.icon || item.key}`"
                    :style="{ color: item.color }"
                >
                    <view class="icon-shape"></view>
                </view>
                <text class="action-title">{{ item.title }}</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { computed } from "vue";
import { UserInfoStore } from "@/stores/modules/UserinfoStore";
import { getGreetingInfo } from "@/util/greet";

const userInfoStore = UserInfoStore();

const props = defineProps({
    title: {
        type: String,
        default: "需要我为你做些什么？",
    },
    actions: {
        type: Array,
        default: () => [
            {
                key: "create-image",
                icon: "image",
                title: "创建图片",
                color: "#25b95f",
            },
            {
                key: "analyze-data",
                icon: "chart",
                title: "分析数据",
                color: "#6cc9dd",
            },
            {
                key: "make-plan",
                icon: "plan",
                title: "制定计划",
                color: "#dcc82f",
            },
        ],
    },
});

const dynamicGreeting = computed(() => {
    const greetingInfo = getGreetingInfo();
    const name = userInfoStore.userInfo?.nickname || '同学';
    return `${name}，${greetingInfo.text}`;
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
    margin-bottom: 30rpx;
}

.welcome-greeting {
    display: block;
    font-size: 38rpx;
    line-height: 1.5;
    font-weight: 600;
    color: #313644;
    margin-bottom: 8rpx;
}

.welcome-title {
    display: block;
    font-size: 48rpx;
    line-height: 1.18;
    font-weight: 800;
    color: #121826;
}

.welcome-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 28rpx;
}

.welcome-action {
    min-width: 288rpx;
    height: 84rpx;
    padding: 0 34rpx 0 30rpx;
    border-radius: 999rpx;
    background: #ffffff;
    border: 1rpx solid #edf0f4;
    box-shadow: 0 4rpx 12rpx rgba(17, 24, 39, 0.035);
    display: inline-flex;
    align-items: center;
    gap: 20rpx;
    box-sizing: border-box;
    transition: transform 0.15s ease, background 0.15s ease;
}

.welcome-action:active {
    transform: scale(0.985);
    background: #fafbfc;
}

.action-icon {
    width: 48rpx;
    height: 48rpx;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.icon-shape,
.icon-shape::before,
.icon-shape::after {
    box-sizing: border-box;
}

.action-title {
    font-size: 30rpx;
    line-height: 1;
    font-weight: 700;
    color: #8e9198;
    white-space: nowrap;
}

.action-icon-image .icon-shape {
    width: 36rpx;
    height: 32rpx;
    border: 6rpx solid currentColor;
    border-radius: 5rpx;
    position: relative;
}

.action-icon-image .icon-shape::before {
    content: "";
    position: absolute;
    left: 4rpx;
    bottom: 2rpx;
    width: 18rpx;
    height: 18rpx;
    border-left: 6rpx solid currentColor;
    border-bottom: 6rpx solid currentColor;
    transform: rotate(45deg);
    transform-origin: center;
}

.action-icon-image .icon-shape::after {
    content: "";
    position: absolute;
    right: -11rpx;
    top: -13rpx;
    width: 18rpx;
    height: 18rpx;
    border-top: 5rpx solid currentColor;
    border-right: 5rpx solid currentColor;
}

.action-icon-chart .icon-shape {
    width: 38rpx;
    height: 38rpx;
    border-left: 6rpx solid currentColor;
    border-bottom: 6rpx solid currentColor;
    border-radius: 3rpx;
    position: relative;
}

.action-icon-chart .icon-shape::before,
.action-icon-chart .icon-shape::after {
    content: "";
    position: absolute;
    bottom: 3rpx;
    width: 7rpx;
    border-radius: 999rpx 999rpx 0 0;
    background: currentColor;
}

.action-icon-chart .icon-shape::before {
    left: 9rpx;
    height: 34rpx;
}

.action-icon-chart .icon-shape::after {
    left: 24rpx;
    height: 24rpx;
}

.action-icon-write .icon-shape {
    width: 40rpx;
    height: 13rpx;
    border: 6rpx solid currentColor;
    border-left: 0;
    border-radius: 0 999rpx 999rpx 0;
    position: relative;
    transform: rotate(-36deg);
}

.action-icon-write .icon-shape::before {
    content: "";
    position: absolute;
    left: -17rpx;
    top: -6rpx;
    width: 0;
    height: 0;
    border-top: 12rpx solid transparent;
    border-bottom: 12rpx solid transparent;
    border-right: 16rpx solid currentColor;
}

.action-icon-write .icon-shape::after {
    content: "";
    position: absolute;
    left: -39rpx;
    top: -15rpx;
    width: 20rpx;
    height: 6rpx;
    border-radius: 999rpx;
    background: currentColor;
    box-shadow: -18rpx 14rpx 0 currentColor;
}

.action-icon-plan .icon-shape {
    width: 29rpx;
    height: 29rpx;
    border: 6rpx solid currentColor;
    border-radius: 50%;
    position: relative;
}

.action-icon-plan .icon-shape::before {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -17rpx;
    width: 18rpx;
    height: 13rpx;
    border-radius: 0 0 6rpx 6rpx;
    border: 5rpx solid currentColor;
    border-top: 0;
    transform: translateX(-50%);
}

.action-icon-plan .icon-shape::after {
    content: "";
    position: absolute;
    left: 50%;
    top: -20rpx;
    width: 6rpx;
    height: 6rpx;
    border-radius: 50%;
    background: currentColor;
    transform: translateX(-50%);
    box-shadow:
        -19rpx 8rpx 0 currentColor,
        19rpx 8rpx 0 currentColor,
        -26rpx 27rpx 0 currentColor,
        26rpx 27rpx 0 currentColor;
}
</style>
