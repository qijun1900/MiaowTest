
<template>
    <div class="nav-container">
        <van-config-provider :theme-vars="themeVars">
            <van-grid :border="false">
                <van-grid-item 
                    v-for="(item, index) in navItems"
                    :key="index"
                    class="nav-item"
                    :to="item.to">
                    <!-- 使用 icon 插槽自定义图标 -->
                    <template #icon>
                        <component :is="Icon[item.icon]" />
                    </template>
                    <!-- 使用 text 插槽自定义文字 -->
                    <template #text>
                        <span class="custom-text">{{ item.text }}</span>
                    </template>
                </van-grid-item>
            </van-grid>
        </van-config-provider>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import GithubCatIcon from '../icons/GithubCatIcon.vue'
import AllExamIcon from '../icons/AllExamIcon.vue'
// import HomeDockerIcon from '../icons/HomeDockerIcon.vue'
import HomeProblemIcon from '../icons/HomeProblemIcon.vue'
import HomeChatIcon from '../icons/HomeChatIcon.vue'

// 导航项配置数据
const navItems = [
    { icon: 'GithubCatIcon', text: '项目地址' , to: '/projectintroduce'},
    { icon: 'AllExamIcon', text: '所有考试' ,  to: '/ExamList'},
    // { icon: 'HomeDockerIcon', text: '私有部署' , to: '/contest'},
    { icon: 'HomeProblemIcon', text: '意见反馈' , to: '/useradvice'},
    { icon: 'HomeChatIcon', text: '喵喵智答', to: '/homechat' } 
]
const Icon = {
    'GithubCatIcon': GithubCatIcon, 
    'AllExamIcon': AllExamIcon, 
    // "HomeDockerIcon":HomeDockerIcon,
    "HomeProblemIcon": HomeProblemIcon,
    "HomeChatIcon" : HomeChatIcon

}
// 定制 Grid 组件主题
const themeVars = ref({
    gridItemIconSize:"32px",// 图标大小
})


</script>

<style scoped>
.nav-container {
    padding: 0.625rem 0; /* 10px -> 0.625rem */
    background: #ffffff;
}

/* 新增自定义文字样式 */
.custom-text {
    color: #555555;
    font-size: 0.75rem; /* 12px -> 0.75rem */
    margin-top: 0.375rem; /* 6px -> 0.375rem */
    font-weight: 800;
}

/* 隐藏滚动条 */
.nav-container::-webkit-scrollbar {
    display: none;
}

:deep(.van-grid-item__content) {
    padding: 0.5rem 0.625rem; /* 8px 10px -> 0.5rem 0.625rem */
}
</style>