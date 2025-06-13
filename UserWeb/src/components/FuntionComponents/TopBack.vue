<template>
    <van-config-provider :theme-vars="themeVars">
        <van-nav-bar
            :title="title" 
            left-arrow 
            @click-left="onClickLeft" 
            @click-right="onClickRight">
            <template #right>
                <van-icon :name="iconName" :size="iconSize" />
                <!-- 添加插槽位置 -->
                <slot name="chooseBut"></slot>
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
import { useRoute } from 'vue-router' // 新增导入

const Isshow = ref(false);
const answerStore = useAnswerStore()
const emit = defineEmits(['showReflectquestionIssue'])
const route = useRoute() // 获取当前路由信息


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
    // 如果是/homechat路由，执行特定功能
    if (route.path === '/homechat') {
        showConfirmDialog({
            message: '确定要离开此页面吗？离开对话将清空！',
            confirmButtonText: '确定',
            cancelButtonText: '取消',
        }).then(() => {
            RouterBack()
        }).catch(() => {
            // 取消操作
        })
        return // 直接返回，不执行后续逻辑
    }
    
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
    if (iconName.value === 'search') {
        RouterPush('/SearchInfo')
    } else if (iconName.value === 'question') {  
        Isshow.value = true;
    } else if (iconName.value === 'warning-o') {  
        emit('showReflectquestionIssue', true)
    }
}
// 定制 NavBar 组件主题， 改为计算属性，确保响应式

const themeVars = computed(() => ({
    navBarArrowSize: "26px",
    navBarHeight: props.navBarHeight,
    navBarTitleFontSize: "18px", 
    navBarIconColor: props.navBarIconColor,
    navBarBackground: props.navBarBackground
}))
</script>
<style scoped>
/* 添加过渡效果 */
.van-nav-bar {
    transition: all 0.3s ease;
}
/* 保持现有的去除边框样式 */
.van-hairline--bottom:after {
    border-bottom-width: 0;
}
</style>
