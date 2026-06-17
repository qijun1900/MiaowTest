<template>
    <!--
        ThemeProvider
        =================================================================
        包裹页面根节点，将当前主题 class（theme-xxx + mode-xxx）注入到根 view，
        让所有 var(--app-*) / var(--td-*) 在小程序 / APP / H5 都能命中。

        用法：
            <template>
                <ThemeProvider>
                    <view class="container">...</view>
                </ThemeProvider>
            </template>

        实现要点：
            1. 通过 page 选择器 + 根 view class 同时挂载，覆盖 H5/小程序两种场景
            2. 订阅 AppearanceStore 的 'app:theme-change' 事件实时更新
            3. style="display: contents" 在小程序中无效，所以用一个透明 view
               并通过 :class 把主题 class 挂到这个 view 上
    -->
    <view :class="themeClass" class="theme-provider">
        <slot />
    </view>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { AppearanceStore } from "../../stores/modules/AppearanceStore";

const appearanceStore = AppearanceStore();

const preset = ref(appearanceStore.themePreset || "aurora");
const mode = ref(appearanceStore.resolveMode());
const fontKey = ref(
    appearanceStore.fontSizeKeys[appearanceStore.fontSizeIndex] || "standard"
);

const themeClass = computed(
    () => `theme-${preset.value} mode-${mode.value} font-${fontKey.value}`
);

const handleThemeChange = (payload) => {
    if (!payload) return;
    if (payload.preset) preset.value = payload.preset;
    if (payload.mode) mode.value = payload.mode;
    if (payload.fontKey) fontKey.value = payload.fontKey;
};

onMounted(() => {
    // 首次挂载时同步一次最新状态（处理 store 在 provider 之前已初始化的情况）
    preset.value = appearanceStore.themePreset || "aurora";
    mode.value = appearanceStore.resolveMode();
    fontKey.value =
        appearanceStore.fontSizeKeys[appearanceStore.fontSizeIndex] ||
        "standard";
    uni.$on("app:theme-change", handleThemeChange);
});

onBeforeUnmount(() => {
    uni.$off("app:theme-change", handleThemeChange);
});
</script>

<style scoped>
/*
 * ThemeProvider 根 view 必须撑满页面并带上背景色，
 * 否则 uni-app 底层 page 元素的白色背景会透出来。
 */
.theme-provider {
    width: 100%;
    min-height: 100vh;
    background-color: var(--app-bg-page);
}
</style>
