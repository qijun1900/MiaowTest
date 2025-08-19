<template>
    <Welcome
      :icon=props.icon
      :title=props.title
      :extra=props.extra
      :description=props.description
      :style="{ background: bgColor }">
        <template #extra>
            <slot name="welcomeExtra"></slot>
        </template>
    </Welcome>
</template>
<script setup>

const props = defineProps({
    icon: {// icon 图标
        type: String,
        default: 'https://camo.githubusercontent.com/4ea7fdaabf101c16965c0bd3ead816c9d7726a59b06f0800eb7c9a30212d5a6a/68747470733a2f2f63646e2e656c656d656e742d706c75732d782e636f6d2f656c656d656e742d706c75732d782e706e67'
    },
    title: {// title 标题
        type: String,
        default: '欢迎使用 Element Plus X💖'
    },
    extra: {// 副标题
        type: String,
        default: ''
    },
    description: {// 描述信息
        type: String,
        default: ''
    },

})
const bgColor =
  'linear-gradient(97deg, rgba(90,196,255,0.12) 0%, rgba(174,136,255,0.12) 100%)';
</script>
<style scoped> 


</style>