<template>
    <!-- 占位元素：与导航栏等高，防止页面内容被遮挡 -->
    <view
        v-if="fixed"
        class="navbar-placeholder"
        :style="{ height: navBarInfo.totalHeight + 'px' }"
    ></view>
    <!-- 导航栏本体 -->
    <view
        class="custom-navbar"
        :class="{ 'navbar-fixed': fixed, 'navbar-transparent': transparent, 'no-border': !border }"
        :style="navbarOuterStyle"
    >
        <!-- 导航栏内容行 -->
        <view class="nav-row" :style="navRowStyle">
            <!-- 左侧 -->
            <view class="nav-left">
                <slot name="left">
                    <view v-if="showBack" class="nav-back" @click="handleBack">
                        <t-icon
                            :name="backIcon"
                            size="44rpx"
                            :color="backIconColor"
                        />
                    </view>
                </slot>
            </view>

            <!-- 中间标题 -->
            <view class="nav-center">
                <slot name="center">
                    <text class="nav-title" :style="titleStyle">{{ title }}</text>
                </slot>
            </view>

            <!-- 右侧 -->
            <view class="nav-right">
                <slot name="right"></slot>
            </view>
        </view>
    </view>
</template>

<script setup>
import { computed } from "vue";
import { useNavBarSafeArea } from "../../composables/useNavBarSafeArea";

const props = defineProps({
    /** 导航栏标题 */
    title: { type: String, default: "" },
    /** 是否显示返回按钮 */
    showBack: { type: Boolean, default: true },
    /** 返回按钮图标 */
    backIcon: { type: String, default: "chevron-left" },
    /** 返回按钮颜色 */
    backIconColor: { type: String, default: "var(--app-text-primary)" },
    /** 标题颜色 */
    titleColor: { type: String, default: "var(--app-text-primary)" },
    /** 是否固定在顶部 */
    fixed: { type: Boolean, default: true },
    /** 背景是否透明 */
    transparent: { type: Boolean, default: false },
    /** 是否显示底部分割线 */
    border: { type: Boolean, default: true },
    /** 避让微信胶囊按钮（小程序页面右侧有胶囊时设为 true） */
    reserveMenuButton: { type: Boolean, default: false },
    /** 自定义背景色（不传则使用 CSS 变量） */
    bgColor: { type: String, default: "" },
    /** 自定义导航栏总高度（px），不传则自动计算 */
    customHeight: { type: Number, default: 0 },
});

const emit = defineEmits(["back"]);

const { navBarInfo, safeAreaInfo, customNavbarStyle, navRowStyle } =
    useNavBarSafeArea({
        reserveMenuButtonRight: props.reserveMenuButton,
    });

/** 导航栏外层样式：支持自定义背景色、自定义高度覆盖 */
const navbarOuterStyle = computed(() => {
    const style = { ...customNavbarStyle.value };
    if (props.bgColor) {
        style.backgroundColor = props.bgColor;
    }
    if (props.customHeight > 0) {
        style.height = `${props.customHeight}px`;
    }
    return style;
});

/** 标题文字样式 */
const titleStyle = computed(() => ({
    color: props.titleColor,
}));

const handleBack = () => {
    emit("back");
};

defineExpose({
    navBarInfo,
    safeAreaInfo,
});
</script>

<style scoped>
/* 占位元素 */
.navbar-placeholder {
    width: 100%;
    flex-shrink: 0;
}

/* 导航栏容器 */
.custom-navbar {
    background-color: var(--app-bg-container);
    box-sizing: border-box;
    position: relative;
    z-index: 100;
    border-bottom: 1rpx solid var(--app-border);
    /* 通过 backdrop-filter 让背景与页面自然融合 */
    backdrop-filter: blur(20rpx);
    -webkit-backdrop-filter: blur(20rpx);
}

.custom-navbar.no-border {
    border-bottom: none;
}

/* 固定定位模式 */
.custom-navbar.navbar-fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
}

/* 透明模式 */
.custom-navbar.navbar-transparent {
    background-color: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border-bottom: none;
}

/* 导航栏内容行 */
.nav-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 18rpx;
    padding-right: 18rpx;
}

/* 左侧区域 */
.nav-left {
    flex-shrink: 0;
    min-width: 80rpx;
    display: flex;
    align-items: center;
}

/* 返回按钮 */
.nav-back {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s ease;
}

.nav-back:active {
    background-color: var(--app-bg-secondary);
}

/* 中间标题区域 */
.nav-center {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-title {
    font-size: calc(32rpx * var(--app-font-scale, 1));
    font-weight: 600;
    color: var(--app-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 400rpx;
}

/* 右侧区域 */
.nav-right {
    flex-shrink: 0;
    min-width: 80rpx;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}
</style>
