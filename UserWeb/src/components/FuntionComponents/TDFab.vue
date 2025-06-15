<template>
    <div>
        <TFab 
            :icon="iconFunc" 
            :text="props.text" 
            @click="onClick" 
            draggable="true"
            :style="'right: 30px; bottom: 45px'"
            /> 
    </div>
</template>
<script setup>
import { h } from 'vue';
import { Fab as TFab } from 'tdesign-mobile-vue'; 
import { ControlPlatformIcon } from 'tdesign-icons-vue-next';

const emit = defineEmits(['handleClick']);
const props = defineProps({
  text: { 
    type: String,
    default: '悬浮按钮',
  },
})

const iconFunc = () => h(ControlPlatformIcon, { size: '24px' });
const onClick = () => {
  emit('handleClick', true);
};
</script>