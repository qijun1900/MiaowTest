<template>
    <view
        class="custom-tab-bar"
        :class="{ 'tab-bar--hidden': !visible }"
        :style="tabBarStyle"
    >
        <!-- 背景毛玻璃层 -->
        <view class="tab-bar__backdrop" />

        <!-- Tab 项容器 -->
        <view class="tab-bar__content">
            <view
                v-for="(item, index) in tabs"
                :key="item.pagePath"
                class="tab-item"
                :class="{ 'tab-item--active': currentIndex === index }"
                @click="handleTabClick(index)"
            >
                <!-- 点击涟漪效果 -->
                <view
                    v-if="rippleIndex === index"
                    class="tab-item__ripple"
                    :class="{ 'ripple--animate': rippleIndex === index }"
                />

                <!-- 图标容器 -->
                <view class="tab-item__icon-wrapper">
                    <view
                        class="tab-item__icon"
                        :class="{ 'icon--bounce': bounceIndex === index }"
                    >
                        <!-- 图片图标 -->
                        <image
                            v-if="item.isImage"
                            :src="currentIndex === index ? item.selectedIcon : item.icon"
                            class="tab-item__image"
                            mode="aspectFit"
                        />
                        <!-- TDesign 图标 -->
                        <t-icon
                            v-else
                            :name="currentIndex === index ? item.selectedIcon : item.icon"
                            :size="24"
                            :class="{ 'icon--active': currentIndex === index }"
                        />
                    </view>
                    <!-- 活跃指示器 -->
                    <view
                        v-if="currentIndex === index"
                        class="tab-item__indicator"
                    />
                </view>

                <!-- 文字 -->
                <text
                    class="tab-item__text"
                    :class="{ 'text--active': currentIndex === index }"
                >
                    {{ item.text }}
                </text>
            </view>
        </view>

        <!-- 底部安全区 -->
        <view class="tab-bar__safe-area" />
    </view>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { AppearanceStore } from "../../stores/modules/AppearanceStore";

const props = defineProps({
    /** 当前激活的 tab 索引 */
    currentIndex: {
        type: Number,
        default: 0,
    },
    /** 是否可见 */
    visible: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(["change"]);

const appearanceStore = AppearanceStore();

// Tab 配置
const tabs = ref([
    {
        pagePath: "/pages/index/index",
        text: "首页",
        icon: "home",
        selectedIcon: "home-filled",
        isImage: false,
    },
    {
        pagePath: "/pages/tab/exam",
        text: "考试",
        icon: "book-open",
        selectedIcon: "book-open-filled",
        isImage: false,
    },
    {
        pagePath: "/pages/tab/agent",
        text: "Mio",
        icon: "/static/tabBar/Agent.png",
        selectedIcon: "/static/tabBar/Agent.png",
        isImage: true,
    },
    {
        pagePath: "/pages/tab/tools",
        text: "工具",
        icon: "tools",
        selectedIcon: "tools-filled",
        isImage: false,
    },
    {
        pagePath: "/pages/tab/my",
        text: "我的",
        icon: "user",
        selectedIcon: "user-filled",
        isImage: false,
    },
]);

// 动画状态
const rippleIndex = ref(-1);
const bounceIndex = ref(-1);
let rippleTimer = null;
let bounceTimer = null;

// 安全区信息
const safeAreaBottom = ref(0);
try {
    const sysInfo = uni.getSystemInfoSync();
    safeAreaBottom.value = sysInfo.safeAreaInsets?.bottom || 0;
} catch (e) {
    safeAreaBottom.value = 0;
}

// TabBar 样式
const tabBarStyle = computed(() => ({
    paddingBottom: `${safeAreaBottom.value}px`,
}));

// Tab 点击处理
const handleTabClick = (index) => {
    if (index === props.currentIndex) return;

    // 触发涟漪效果
    rippleIndex.value = index;
    clearTimeout(rippleTimer);
    rippleTimer = setTimeout(() => {
        rippleIndex.value = -1;
    }, 600);

    // 触发弹跳效果
    bounceIndex.value = index;
    clearTimeout(bounceTimer);
    bounceTimer = setTimeout(() => {
        bounceIndex.value = -1;
    }, 300);

    // 触发事件
    emit("change", index);

    // 页面跳转
    const tab = tabs.value[index];
    if (tab) {
        uni.switchTab({ url: tab.pagePath });
    }
};

// 清理定时器
onBeforeUnmount(() => {
    clearTimeout(rippleTimer);
    clearTimeout(bounceTimer);
});
</script>

<style scoped lang="scss">
.custom-tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 999;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform, opacity;
}

.tab-bar--hidden {
    transform: translateY(100%);
    opacity: 0;
    pointer-events: none;
}

/* 背景毛玻璃层 */
.tab-bar__backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--app-bg-container);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 0.5px solid var(--app-border);
    opacity: 0.95;
}

/* Tab 项容器 */
.tab-bar__content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 50px;
    padding: 0 8rpx;
}

/* 单个 Tab 项 */
.tab-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 100%;
    padding: 4px 0;
    transition: transform 0.15s ease;
    -webkit-tap-highlight-color: transparent;
}

.tab-item:active {
    transform: scale(0.92);
}

/* 涟漪效果 */
.tab-item__ripple {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: var(--app-brand-light);
    transform: translate(-50%, -50%);
    opacity: 0;
    pointer-events: none;
}

.ripple--animate {
    animation: ripple-expand 0.6s ease-out forwards;
}

@keyframes ripple-expand {
    0% {
        width: 0;
        height: 0;
        opacity: 0.6;
    }
    100% {
        width: 120px;
        height: 120px;
        opacity: 0;
    }
}

/* 图标容器 */
.tab-item__icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin-bottom: 2px;
}

/* 图标 */
.tab-item__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                color 0.2s ease;
    color: var(--app-text-secondary);
}

/* 图片图标 */
.tab-item__image {
    width: 24px;
    height: 24px;
}

.tab-item--active .tab-item__icon {
    color: var(--app-brand);
}

.icon--active {
    color: var(--app-brand);
}

/* 图标弹跳动画 */
.icon--bounce {
    animation: icon-bounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes icon-bounce {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.25);
    }
    100% {
        transform: scale(1);
    }
}

/* 活跃指示器 */
.tab-item__indicator {
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 16px;
    height: 3px;
    border-radius: 2px;
    background-color: var(--app-brand);
    animation: indicator-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes indicator-appear {
    0% {
        width: 0;
        opacity: 0;
    }
    100% {
        width: 16px;
        opacity: 1;
    }
}

/* 文字 */
.tab-item__text {
    font-size: calc(10px * var(--app-font-scale, 1));
    line-height: 1.2;
    color: var(--app-text-secondary);
    transition: color 0.2s ease, font-weight 0.2s ease;
    white-space: nowrap;
}

.text--active {
    color: var(--app-brand);
    font-weight: 600;
}

/* 底部安全区 */
.tab-bar__safe-area {
    position: relative;
    width: 100%;
    background-color: transparent;
}
</style>
