<!-- icon.sucai999.com 版权所有 -->
 <template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="computedSize"
    :height="computedSize"
    viewBox="0 0 24 24"
    :class="{ 'is-active': active }"
    :style="{ color: computedColor }"
  >
    <path 
      fill="currentColor" 
      fill-rule="evenodd" 
      :d="pathData" 
    />
  </svg>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // 图标尺寸（支持数字或带单位的字符串）
  size: {
    type: [Number, String],
    default: 31
  },
  // 激活状态颜色
  activeColor: {
    type: String,
    default: '#53d723' // 图标原始绿色
  },
  // 默认颜色
  color: {
    type: String,
    default: '#53d723' // 默认图标色
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

// 原始路径数据
const pathData = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8z';
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
