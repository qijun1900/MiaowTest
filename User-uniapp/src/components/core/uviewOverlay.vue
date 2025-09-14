<template>
    <up-overlay 
        :show="props.show" 
        @update:show="emit('update:show', $event)"
        @click="handleClose">
      <view class="warp">
        <view  @tap.stop>
            <slot name="overlaycontent"></slot>
        </view>
      </view>
    </up-overlay>

</template>
<script setup>
import { defineProps, defineEmits } from 'vue';
// 定义组件属性
const props = defineProps({
  // 控制弹窗显示
  show: {
    type: Boolean,
    default: false
  },
})

// 定义事件
const emit = defineEmits(['update:show']);
// 处理关闭事件
const handleClose = () => {
  emit('update:show', false);
};

</script>
<style scoped> 
.warp {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}


</style>