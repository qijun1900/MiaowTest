<template>
    <Bubble 
        :content="props.content"
        :placement="props.placement" 
        :loading="props.isLoading"
        :typing="{ 
            step:props.typingstep ,
            interval: props.typinginterval, 
            suffix: props.typingsuffix 
        }"
        :isMarkdown="true"
        :is-fog="props.isFog"
        >
        <template #avatar>
            <el-avatar 
                :size="props.bubbleAvatarSize" 
                :src="props.bubbleAvatarSrc" />
        </template>
        <template #header>
            <span>{{ props.bubbleHeaderTitle }}</span>
        </template>
    </Bubble>    
</template>
<script setup>

const props = defineProps({
    content: {// 编辑器占位符
        type: String,
        default: '这个是默认文本 ~'
    },
    placement: {// 位置，start | end 
        type: String,
        default: 'start'
    },
    bubbleAvatarSize: {// 头像大小
        type: Number,
        default: 48
    },
    bubbleAvatarSrc: {// 头像地址
        type: String,
        default:"https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
    },
    bubbleHeaderTitle: {//气泡的头部
        type: String,
        default: '气泡的头部'
    },
    isLoading: {// 是否显示加载中状态
        type: Boolean,
        default: false
    },
    typingstep: {// 打字的步数
        type: Number,
        default: 2
    },
    typinginterval: {// 打字的时间间隔
        type: Number,
        default: 50
    },
    typingsuffix: {// 打字的后缀
        type: String,
        default: '|'
    },
    isFog: {// 是否雾化效果
        type: Boolean,
        default: false
    }
})






</script>