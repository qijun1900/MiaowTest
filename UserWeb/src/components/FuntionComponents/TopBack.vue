<template>
    <van-config-provider :theme-vars="themeVars">
        <van-nav-bar 
            :title="title" 
            left-arrow 
            @click-left="onClickLeft">
                <template #right>
                    <van-icon :name="iconName" :size="iconSize" />
                </template>
        </van-nav-bar>
    </van-config-provider>
    
</template>
<script setup>
import RouterBack from '@/util/RouterBack';
import { computed ,ref} from 'vue'
// 定义 props，接收 不同 属性
const props = defineProps({
    title: { // 标题
        type: String,
        required: true,
    } ,
    iconName: { // 图标名称
        type: String,
    },
    iconSize: { // 图标大小
        type: Number,
        default: 20, 
    }
})
// 计算属性，返回 title
const title = computed(() => props.title)
const iconName = computed(() => props.iconName)
const iconSize = computed(() => props.iconSize)

// 点击返回
const onClickLeft = () => {
    RouterBack();
}
// 定制 NavBar 组件主题
const themeVars = ref({
    navBarArrowSize: "25px", // 箭头大小
    navBarHeight:"54px",// 导航栏高度
    navBarTitleFontSize: "18px", // 标题字体大小
})
</script>
