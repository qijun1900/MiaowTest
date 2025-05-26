<!-- icon.sucai999.com 版权所有 -->
<template>
  <svg :width="size" :height="size" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <!-- 这里放置你的SVG路径数据 -->
    <path fill="#ffce31" d="M5.9 62c-3.3 0-4.8-2.4-3.3-5.3L29.3 4.2c1.5-2.9 3.9-2.9 5.4 0l26.7 52.5c1.5 2.9 0 5.3-3.3 5.3z"></path>
    <g fill="#231f20">
      <path d="m27.8 23.6l2.8 18.5c.3 1.8 2.6 1.8 2.9 0l2.7-18.5c.5-7.2-8.9-7.2-8.4 0"></path>
      <circle cx="32" cy="49.6" r="4.2"></circle>
    </g>
  </svg>
</template>

<script setup>
import { defineProps, toRefs } from 'vue';

// 定义props
const props = defineProps({
  size: {
    type: [Number, String],
    default:20
  }
});

// 使用toRefs确保响应式
const { size } = toRefs(props);
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: middle;
}
</style>