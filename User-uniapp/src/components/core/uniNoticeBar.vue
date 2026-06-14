<template>
    <view class="noticeBar">
        <uni-notice-bar
            v-if="displayText"
            :color="brandColor"
            :background-color="brandLight"
            show-icon
            scrollable
            :text="displayText"
            showIcon
            single
        />
    </view>
</template>
<script setup>
import { computed } from "vue";
import { AppearanceStore } from "../../stores/modules/AppearanceStore";

const appearanceStore = AppearanceStore();

const props = defineProps({
    noticeData: {
        type: Array,
        default: () => [],
    },
});

// 从主题 store 获取当前品牌色
const brandColor = computed(() => {
    const preset = appearanceStore.getCurrentPreset?.();
    return preset?.primary || "#2979ff";
});

// 浅色底：用 getComputedStyle 读 CSS 变量太重，直接按预设映射
const brandLight = computed(() => {
    const key = appearanceStore.themePreset;
    // Claude 暖色底 / Aurora 蓝色底
    if (key === "claude") return "#fbeee5";
    return "#eaf1ff";
});

const displayText = computed(() => {
    if (props.noticeData && props.noticeData.length > 0) {
        const firstNotice = props.noticeData[0];
        if (firstNotice.content) {
            return firstNotice.content.replace(/<[^>]*>/g, "");
        }
        return firstNotice.title || "";
    }
    return "服务器为微信云托管，可能出现服务器自动关闭导致网络请求失败，请耐心等待服务器自动启动。";
});
</script>
