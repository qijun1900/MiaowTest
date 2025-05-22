<!-- icon.sucai999.com 版权所有 -->
 <template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="computedSize"
    :height="computedHeight"
    viewBox="0 0 17 16"
    :class="{ 'is-active': active }"
    :style="{ color: computedColor }"
  >
    <path fill="currentColor" fill-rule="evenodd" :d="pathData" />
  </svg>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // 图标尺寸（支持数字或带单位的字符串）
  size: {
    type: [Number, String],
    default: 27
  },
  // 激活状态颜色
  activeColor: {
    type: String,
    default: '#e82121' // 图标原始红色
  },
  // 默认颜色
  color: {
    type: String,
    default: '#e82121' // 默认图标色
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

// 计算高度（保持原始宽高比例 256:240.941 ≈ 17:16）
const computedHeight = computed(() => {
  if (typeof props.size === 'number') {
    return `${props.size * (240.941 / 256)}px`;
  }
  return props.size;
});

// 原始路径数据
const pathData = 'M13.618 2.397C10.513-.708 5.482-.713 2.383 2.386c-3.101 3.102-3.098 8.131.009 11.236c3.105 3.105 8.137 3.109 11.235.01c3.1-3.099 3.097-8.13-.009-11.235m-4.003 8.954L7.927 9.663l-1.688 1.688c-.689.689-1.207 1.289-2.029.468c-.82-.821-.223-1.339.469-2.029l1.688-1.687l-1.688-1.688c-.69-.689-1.289-1.207-.469-2.029c.822-.82 1.34-.221 2.029.469l1.688 1.686l1.688-1.686c.69-.689 1.205-1.29 2.027-.469c.822.822.223 1.34-.467 2.029L9.487 8.102l1.688 1.687c.689.691 1.289 1.209.467 2.03c-.82.821-1.337.221-2.027-.468';
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: middle;
  transition: color 0.3s ease;
}

.is-active {
  color: var(--active-color, inherit);
}
</style>
