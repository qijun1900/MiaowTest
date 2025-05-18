<!-- icon.sucai999.com 版权所有 -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="computedSize"
    :height="computedSize"
    viewBox="0 0 128 128"
  >
    <!-- 使用原始颜色定义 -->
    <radialGradient id="notoUpsideDownFace0" cx="-528.4" cy="-16.9" r="56.96" gradientTransform="matrix(-1 0 0 1 -464.8 79.8)" gradientUnits="userSpaceOnUse">
      <stop offset=".5" stop-color="#FDE030"/>
      <stop offset=".919" stop-color="#F7C02B"/>
      <stop offset="1" stop-color="#F4A223"/>
    </radialGradient>
    <path fill="url(#notoUpsideDownFace0)" :d="pathData"/>
    <path fill="#422B0D" :d="eyesData"/>
    <path fill="#896024" :d="eyeBrowsData"/>
    <path fill="#422B0D" :d="mouthData"/>
  </svg>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // 图标尺寸（支持数字或带单位的字符串）
  size: {
    type: [Number, String],
    default: 24
  },

});

// 处理尺寸（自动添加 px 单位）
const computedSize = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : props.size
);

// 路径数据（保持原始SVG结构）
const pathData = 'M63.6 7c27.9 0 58 17.5 58 55.9s-30.1 55.9-58 55.9c-15.5 0-29.8-5.1-40.4-14.4C11.7 94.2 5.6 79.8 5.6 62.9s6.1-31.2 17.6-41.4C33.8 12.2 48.2 7 63.6 7';
const eyesData = 'M83.16 84.86c4.19 0 8-3.54 8-9.42c0-5.87-3.81-9.42-8-9.42c-4.19 0-8 3.54-8 9.42s3.8 9.42 8 9.42M44.8 84.86c4.19 0 8-3.54 8-9.42c0-5.87-3.81-9.42-8-9.42c-4.19 0-8 3.54-8 9.42s3.81 9.42 8 9.42';
const eyeBrowsData = 'M83.55 80.93c1.03.72 2.58.49 3.58-.95c1-1.45.67-2.97-.36-3.69c-1.03-.72-2.58-.49-3.58.95s-.68 2.97.36 3.69M45.19 80.93c1.03.72 2.58.49 3.58-.95s.67-2.97-.36-3.69c-1.03-.72-2.58-.49-3.58.95s-.67 2.97.36 3.69';
const mouthData = 'M64.18 34.19c10.69 0 19.15 5.07 23.82 10.48c.47.54.58 1.28.28 1.92c-.3.65-.94 1.08-1.65 1.08c-.32 0-.63-.09-.92-.25c-4.81-2.77-12.88-6.21-21.51-6.21h-.14c-8.63 0-16.7 3.43-21.51 6.21c-.29.16-.6.25-.92.25c-.7 0-1.35-.43-1.65-1.08a1.8 1.8 0 0 1 .28-1.92c4.67-5.42 13.13-10.48 23.82-10.48';
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: middle;
}
</style>
