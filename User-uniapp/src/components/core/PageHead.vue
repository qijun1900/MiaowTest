<template>
    <view
        class="custom-navbar"
        :style="{ paddingTop: navBarInfo.statusBarHeight + 'px' }"
    >
        <view
            class="navbar-content"
            :style="{ height: navBarInfo.navBarHeight + 'px' }"
        >
            <!-- #ifdef H5 -->
            <view class="nav-left">
                <text class="nav-title">{{ title }}</text>
            </view>
            <view class="nav-right">
                <slot name="right-content"></slot>
            </view>
            <!-- #endif -->
            <!-- #ifndef H5 -->
            <view class="nav-center">
                <text class="nav-title">{{ title }}</text>
            </view>
            <!-- #endif -->
        </view>

        <!-- 搜索框集成到头部中 -->
        <view v-if="showSearch" class="search-container">
            <navigator
                :url="searchUrl"
                hover-class="none"
                animation-type="pop-in"
                animation-duration="300"
            >
                <uniSearch :placeholder="searchPlaceholder" />
            </navigator>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from "vue";
import uniSearch from "./uniSearch.vue";
import navBarHeightUtil from "../../util/navBarHeight";

// 组件属性定义
const props = defineProps({
    // 导航栏标题
    title: {
        type: String,
        default: "标题",
    },
    // 是否显示刷新按钮
    showRefresh: {
        type: Boolean,
        default: false,
    },
    // 刷新按钮文本
    refreshText: {
        type: String,
        default: "刷新",
    },
    // 是否显示搜索框
    showSearch: {
        type: Boolean,
        default: false,
    },
    // 搜索框占位符
    searchPlaceholder: {
        type: String,
        default: "搜索...",
    },
    // 搜索页面路径
    searchUrl: {
        type: String,
        default: "/pages/public/searchview",
    },
    // 加载状态
    loading: {
        type: Boolean,
        default: false,
    },
});

// 导航栏信息
const navBarInfo = ref(navBarHeightUtil.getNavBarInfo());

// 计算内容区域的 padding-top，确保不被导航栏遮挡
const contentPaddingTop = computed(() => {
    // 导航栏总高度 + 搜索框高度 + 一些边距
    return navBarInfo.value.totalHeight + (props.showSearch ? 80 : 0);
});

// 暴露给父组件的方法和数据
defineExpose({
    contentPaddingTop,
});
</script>

<style scoped lang="scss">
.custom-navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    // 根据规范，使用匹配的多段式渐变色，确保无缝过渡
    background: linear-gradient(
        135deg,
        #e0f2ff 0%,
        #e8f4ff 25%,
        #f0f8ff 50%,
        #f8fcff 75%,
        #fcfeff 100%
    );
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 0.5px solid rgba(255, 255, 255, 0.3);
}

.navbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20rpx;
}

/* #ifdef H5 */
.nav-left {
    flex: 1;
}

.nav-right {
    display: flex;
    align-items: center;
}
/* #endif */

/* #ifndef H5 */
.nav-center {
    flex: 1;
    text-align: left;
}
/* #endif */

.nav-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
}

// 搜索框样式（集成在导航栏中）
.search-container {
    padding: 0 20rpx 20rpx 20rpx;
}
</style>
