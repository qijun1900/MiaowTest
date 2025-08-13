<template>
    <el-select 
        v-model="value" 
        :placeholder="props.placeholder" 
        :style="{width:props.selectWith}">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
    </el-select>
</template>
<script setup>
import { ref, watch } from 'vue'
const value = ref('')
const props = defineProps({
    options: {
      type: Array,
      default: () => []
    },
    placeholder: {// 编辑器占位符
      type: String,
      default: 'value'
    },
    selectWith: {// 编辑器占位符
      type: String,
      default: '200px'
    }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 监听 value 的变化
watch(value, (newValue) => {
  emit('update:modelValue', newValue)// 更新父组件的 v-model
  emit('change', newValue)//触发父组件的 change 事件
})

</script>