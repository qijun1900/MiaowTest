<template>
    <t-divider
        :content="props.text"
        :align="props.textPosition"
        :custom-style="dividerStyle"
    >
    </t-divider>
</template>
<script setup>
import { computed } from "vue";

const props = defineProps({
    text: {
        // 分割线文字
        type: String,
        default: "分割线",
    },
    textPosition: {
        // 文字位置
        type: String,
        default: "left", // 可选值：left、right
    },
});

const dividerStyle = computed(() => ({
    color: 'var(--app-text-secondary)',
    borderColor: 'var(--app-border)',
}));
</script>
