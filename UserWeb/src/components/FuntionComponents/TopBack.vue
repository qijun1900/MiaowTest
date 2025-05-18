<template>
    <van-config-provider :theme-vars="themeVars">
        <van-nav-bar 
            :title="title" 
            left-arrow 
            @click-left="onClickLeft"
            @click-right="onClickRight">
                <template #right>
                    <van-icon :name="iconName" :size="iconSize" />
                </template>
        </van-nav-bar>
    </van-config-provider>
    <ReflectIssue 
        :Isshow="Isshow" 
        issuetitle="问题反馈"
        @update:Isshow="val =>Isshow = val"/>
</template>
<script setup>
import RouterBack from '@/util/RouterBack';
import { computed ,ref} from 'vue'
import RouterPush from '@/util/RouterPush';
import ReflectIssue from '../Index/ReflectIssue.vue';
const Isshow = ref(false);

// 定义 props，接收 不同 属性
const props = defineProps({
    title: { // 标题
        type: String,
    } ,
    iconName: { // 图标名称
        type: String,
    },
    iconSize: { // 图标大小
        type: Number,
        default: 20, 
    },
    navBarHeight: { // 导航栏高度
        type: String,
        default: '54px', // 默认高度为 54px
    },
    navBarIconColor: { // 导航栏图标颜色
        type: String,
        default: '#62bbf1', 
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
// 点击右侧图标
const onClickRight = () => {
    if(iconName.value === 'search') { // 如果图标名称是 search，则跳转到 SearchInfo 页面
        RouterPush('/SearchInfo')
    }if(iconName.value ==='question'){ // 如果图标名称是 question，则显示 反馈问题 弹窗
        Isshow.value=true;
    }
}
// 定制 NavBar 组件主题
const themeVars = ref({
    navBarArrowSize: "26px", // 箭头大小
    navBarHeight:props.navBarHeight,// 导航栏高度
    navBarTitleFontSize: "18px", // 标题字体大小
    navBarIconColor:props.navBarIconColor, // 图标颜色
})
</script>
<style scoped>
/* 去除导航栏底部边框 */
.van-hairline--bottom:after {
  border-bottom-width: 0;
} 
.container {
color: #3b3c3d;
}
</style>
