<!-- icon.sucai999.com 版权所有 -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="computedSize"
    :height="computedSize"
    viewBox="0 0 256 256"
    :class="{ 'is-active': active }"
    :style="{ color: computedColor }"
  >
    <path fill="currentColor" :d="pathData" />
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
  // 激活状态颜色
  activeColor: {
    type: String,
    default: '#1989fa' // Vant 主题蓝色
  },
  // 默认颜色
  color: {
    type: String,
    default: '#646566' // Vant 默认图标色
  },
  // 是否激活状态
  active: Boolean
});

// 计算最终颜色
const computedColor = computed(() => 
  props.active ? props.activeColor : props.color
);

// 处理尺寸（自动添加 px 单位）
const computedSize = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : props.size
);

// 保持你的原始路径数据
const pathData = 'M69.12 94.15L28.5 128l40.62 33.85a8 8 0 1 1-10.24 12.29l-48-40a8 8 0 0 1 0-12.29l48-40a8 8 0 0 1 10.24 12.3m176 27.7l-48-40a8 8 0 1 0-10.24 12.3L227.5 128l-40.62 33.85a8 8 0 1 0 10.24 12.29l48-40a8 8 0 0 0 0-12.29m-82.39-89.37a8 8 0 0 0-10.25 4.79l-64 176a8 8 0 0 0 4.79 10.26A8.1 8.1 0 0 0 96 224a8 8 0 0 0 7.52-5.27l64-176a8 8 0 0 0-4.79-10.25';
</script>

<style scoped>
svg {
  display: inline-block;/*  内联显示 */
  vertical-align: middle; /* 对齐优化 */
  transition: color 0.3s ease; /* 颜色过渡动画 */
}

.is-active {
  color: var(--active-color, inherit); /* 支持 CSS 变量覆盖 */
}
</style>