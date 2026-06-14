<template>
    <view class="welcome-panel" :class="{ 'is-center': !isLoggedIn || !actionItems || actionItems.length === 0 }" v-if="show">
        <!-- 未登录提示 -->
        <view v-if="!isLoggedIn" class="welcome-login">
            <text class="welcome-greeting">欢迎使用题喵喵 AI</text>
            <text class="welcome-title">登录后即可开始对话</text>
            <view class="feature-list">
                <view class="feature-card" v-for="item in guestFeatures" :key="item">
                    <text class="feature-card-text">{{ item }}</text>
                </view>
            </view>
            <view class="login-action-btn" @click="goLogin">
                <text class="login-action-text">前往登录</text>
            </view>
        </view>

        <!-- 已登录正常欢迎 -->
        <template v-else>
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
        </template>
    </view>
</template>

<script setup>
import { computed } from "vue";
import { UserInfoStore } from "@/stores/modules/UserinfoStore";
import { getGreetingInfo } from "@/util/greet";

const userInfoStore = UserInfoStore();
const isLoggedIn = computed(() => userInfoStore.isLoggedIn);

const guestFeatures = ["会话管理", "题目创建", "错题添加"];

const goLogin = () => {
    uni.navigateTo({ url: "/pages/my/UserLoginView" });
};

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
            // {
            //     title: "分析数据",
            //     icon: "https://miaowtest-test.oss-cn-beijing.aliyuncs.com/icon/%E4%BA%91%E4%B8%AD%E7%9A%84%E8%84%B8_1777991373.png", // 这里直接放图片地址
            // },
            // {
            //     title: "生成报告",
            //     icon: "https://miaowtest-test.oss-cn-beijing.aliyuncs.com/icon/%E4%BA%B2%E5%90%BB%E7%9A%84%E7%8C%AB%E5%92%AA%E8%A1%A8%E6%83%85_1777993099.png",
            // }
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
    color: var(--app-text-secondary);
    margin-bottom: 8rpx;
}

.welcome-title {
    display: block;
    font-size: 48rpx;
    line-height: 1.18;
    font-weight: 800;
    color: var(--app-text-primary);
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
    background: var(--app-bg-container);
    border: 1rpx solid var(--app-border);
    box-shadow: var(--app-shadow-card);
    display: inline-flex;
    align-items: center;
    gap: 20rpx;
    box-sizing: border-box;
    transition: transform 0.15s ease, background 0.15s ease;
}

.welcome-action:active {
    transform: scale(0.985);
    background: var(--app-bg-secondary);
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
    color: var(--app-text-secondary);
    white-space: nowrap;
}

.welcome-login {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
}

.feature-list {
    margin-top: 32rpx;
    display: flex;
    flex-direction: column;
    gap: 28rpx;
    align-items: center;
}

.feature-card {
    min-width: 288rpx;
    height: 84rpx;
    padding: 0 40rpx;
    border-radius: 999rpx;
    background: var(--app-bg-container);
    border: 1rpx solid var(--app-border);
    box-shadow: var(--app-shadow-card);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}

.feature-card-text {
    font-size: 30rpx;
    line-height: 1;
    font-weight: 700;
    color: var(--app-text-secondary);
    white-space: nowrap;
}

.login-action-btn {
    margin-top: 56rpx;
    width: 500rpx;
    height: 112rpx;
    background: var(--app-bg-container);
    border: 1rpx solid var(--app-border);
    border-radius: 999rpx;
    box-shadow: var(--app-shadow-card);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease, background 0.15s ease;
}

.login-action-btn:active {
    transform: scale(0.985);
    background: var(--app-bg-secondary);
}

.login-action-text {
    font-size: 38rpx;
    font-weight: 700;
    color: var(--app-text-primary);
}
</style>
