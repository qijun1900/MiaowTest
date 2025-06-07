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
    <ReflectIssue :Isshow="Isshow" issuetitle="问题反馈" @update:Isshow="val => Isshow = val" />
</template>
<script setup>
import RouterBack from '@/util/RouterBack';
import { computed, ref } from 'vue'
import RouterPush from '@/util/RouterPush';
import ReflectIssue from '../Index/ReflectIssue.vue';
import { showConfirmDialog } from 'vant';
import { useAnswerStore } from '@/stores/answerStore'

const Isshow = ref(false);
const answerStore = useAnswerStore()
// 定义 props，接收 不同 属性
const props = defineProps({
    title: { // 标题
        type: String,
    },
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
    },
    isclearAnswer: { //如果是练习页面 是否清空答题记录
        type: Boolean,
        default: false, // 默认不清空
    },
    navBarBackground: { // 导航栏背景颜色
        type: String,
        default: '#ffffff', // 默认白色
    }
})
// 计算属性，返回 title
const title = computed(() => props.title)
const iconName = computed(() => props.iconName)
const iconSize = computed(() => props.iconSize)

// 点击返回
const onClickLeft = () => {
    if (props.isclearAnswer) { // 如果 isclearAnswer 为 true，则清空答题记录
        showConfirmDialog({ // 显示确认对话框
            message: '您确定要返回吗？此操作将清空答题记录', // 提示消息
            confirmButtonText: '确定', // 确认按钮文本
            cancelButtonText: '取消', // 取消按钮文本
        })
        .then(() => {
            answerStore.clearAnswers(); // 清空答题记录
            RouterBack()
        })
        .catch(() => {
            // 取消操作，不执行任何操作
        })
    } else { // 如果 isclearAnswer 为 false，则直接返回
        RouterBack()
    }

}
// 点击右侧图标
const onClickRight = () => {
    if (iconName.value === 'search') { // 如果图标名称是 search，则跳转到 SearchInfo 页面
        RouterPush('/SearchInfo')
    } if (iconName.value === 'question') { // 如果图标名称是 question，则显示 反馈问题 弹窗
        Isshow.value = true;
    }
}
// 定制 NavBar 组件主题
const themeVars = ref({
    navBarArrowSize: "26px", // 箭头大小
    navBarHeight: props.navBarHeight,// 导航栏高度
    navBarTitleFontSize: "18px", // 标题字体大小
    navBarIconColor: props.navBarIconColor, // 图标颜色
    navBarBackground: props.navBarBackground, // 导航栏背景颜色
})
</script>
<style scoped>
/* 去除导航栏底部边框 */
.van-hairline--bottom:after {
    border-bottom-width: 0;
}

</style>
