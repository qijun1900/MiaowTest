<template>
     <el-drawer 
        v-model="drawerVisible" 
        :title="props.drawerTitle"
        :size="props.drawerSize"
        :modal="props.drawerModal">
        <slot name="drawercontent"></slot>
     </el-drawer>
</template>
<script setup>
import { ref,watch } from 'vue'
const drawerVisible = ref(false)
const props = defineProps({
  modelValue: { // 外部的v-model
    type: Boolean,
    default: false
  },
  drawerTitle: { // 对话框标题  
    type: String,
    default: "对话内容"
  },
  drawerModal: { // 是否显示遮罩层
    type: Boolean,
    default: true
  } ,
  drawerSize: { // 对话框宽度
    type: String,
    default: '50%'
  },
  isChildren: { // 是子组件嵌套
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue'])

// 同步父组件的 v-model 值
watch(() => props.modelValue, (newVal) => {
  drawerVisible.value = newVal
})
// 当对话框关闭时同步状态
watch(drawerVisible, (val) => {
  emit('update:modelValue', val)
})

</script>