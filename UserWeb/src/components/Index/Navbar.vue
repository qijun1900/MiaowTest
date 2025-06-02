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

// 导航项配置数据
const navItems = [
    { icon: 'home', text: '开源地址' , to: '/'},
    { icon: 'column', text: '所有考试' ,  to: '/ExamList'},
    { icon: 'medal', text: '竞赛占位' , to: '/contest'},
    { icon: 'wechat', text: '占位置在' , to: '/ranking'},
]
const Icon = {
    'home': GithubCatIcon, // 替换为你的自定义图标组件
}
// 定制 Grid 组件主题
const themeVars = ref({
    gridItemIconSize:"32px",// 图标大小
})


</script>

<style scoped>
.nav-container {
    padding: 10px 0;
    background: #ffffff;
}

/* 新增自定义文字样式 */
.custom-text {
    color: #666;
    font-size: 12px;
    margin-top: 6px;
    font-weight: 800;
}

/* 隐藏滚动条 */
.nav-container::-webkit-scrollbar {
    display: none;
}

:deep(.van-grid-item__content) {
    padding: 8px 10px;
}


</style>