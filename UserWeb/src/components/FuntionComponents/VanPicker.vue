<template>
  <van-popup 
    v-model:show="showValue" 
    round 
    position="bottom"
    :style="{height:'45%'}">
      <van-picker
        :title="props.PickTitle"
        :columns="optionsValue"
        @cancel="showValue = false"
        @confirm="handleConfirm"/>
  </van-popup>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: Boolean,
  PickTitle: String, // 新增标题属性
  options: Array, // 新增选项数据
  
});

const optionsValue = computed(() => {
  return props.options
});

const emit = defineEmits(['update:show', 'confirm']);

const showValue = computed({
    get: () => props.show,
    set: (val) => emit('update:show', val)
});
const handleConfirm = (selectedOptions) => {
    emit('confirm',selectedOptions);
}


</script>