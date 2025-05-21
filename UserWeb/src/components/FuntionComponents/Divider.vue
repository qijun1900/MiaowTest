<template>
    <van-divider 
            :content-position="props.position" 
            :style="{ 
                color: props.color, 
                borderColor: props.borderColor,
                padding: props.padding }">
            {{ props.title }}
        </van-divider>
</template>
<script setup>
const props = defineProps({
    position: { // 位置
        type: String,
        default: 'left'
    },
    title: { // 标题
        type: String,
        required: true
    },
    color:{// 文字颜色
        type: String, 
        default:"#1f96f7"
    },
    borderColor:{// 边框颜色
        type: String,
        default:"#1989fa"
    },
    padding:{//内边距
        type: String,
        default:"0 10px"
    }
})
</script>