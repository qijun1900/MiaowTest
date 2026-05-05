<template>
    <view class="welcome-panel" :class="{ 'is-center': !actionItems || actionItems.length === 0 }" v-if="show">
        <view class="welcome-copy">
            <text class="welcome-greeting">{{ dynamicGreeting }}</text>
            <text class="welcome-title">{{ title }}</text>
        </view>

        <view class="welcome-actions" v-if="actionItems && actionItems.length > 0">
            <slot name="actions">
                <view v-for="item in actionItems" :key="item.key || item.title" class="welcome-action"
                    @click="handleActionClick(item)">
                    <slot name="action-item" :item="item">
                        <view v-if="item.icon" class="action-icon">
                            <image class="action-image" :src="item.icon" mode="aspectFit" />
                        </view>
                        <text class="action-title">{{ item.title }}</text>
                    </slot>
                </view>
            </slot>
        </view>
    </view>
</template>

<script setup>
import { computed } from "vue";
import { UserInfoStore } from "@/stores/modules/UserinfoStore";
import { getGreetingInfo } from "@/util/greet";

const userInfoStore = UserInfoStore();

const props = defineProps({
    show: {
        type: Boolean,
        default: true,
    },
    title: {
        type: String,
        default: "需要我为你做些什么？",
    },
    actions: { // { title: 'Action 1', icon: 'image', color: '#ff0000' }
        type: Array,
        default: () => [
            {
                title: "分析数据",
                icon: "https://miaowtest-test.oss-cn-beijing.aliyuncs.com/icon/%E4%BA%91%E4%B8%AD%E7%9A%84%E8%84%B8_1777991373.png", // 这里直接放图片地址
            },
            {
                title: "生成报告",
                icon: "https://miaowtest-test.oss-cn-beijing.aliyuncs.com/icon/%E4%BA%B2%E5%90%BB%E7%9A%84%E7%8C%AB%E5%92%AA%E8%A1%A8%E6%83%85_1777993099.png",
            }
        ],
    },
});

const dynamicGreeting = computed(() => {
    const greetingInfo = getGreetingInfo();
    const name = userInfoStore.userInfo?.nickname || '同学';
    return `${name}，${greetingInfo.text}`;
});

const emit = defineEmits(["action-click"]);

const actionItems = computed(() => {
    const items = props.actions || [];
    return items.map((item, index) => {
        if (typeof item === 'string') {
            return {
                key: `action-${index}`,
                title: item
            };
        }
        return item;
    });
});

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

.welcome-panel.is-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    margin: 0;
}

.welcome-panel.is-center .welcome-copy {
    text-align: center;
    margin-bottom: 0;
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
    width: 50rpx;
    height: 50rpx;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.action-image {
    width: 100%;
    height: 100%;
    display: block;
}

.action-title {
    font-size: 30rpx;
    line-height: 1;
    font-weight: 700;
    color: #8e9198;
    white-space: nowrap;
}
</style>
