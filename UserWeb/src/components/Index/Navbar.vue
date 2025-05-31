<template>
    <div class="nav-container">
        <van-config-provider :theme-vars="themeVars">
            <van-grid :border="false">
                <van-grid-item 
                    v-for="(item, index) in navItems"
                    :key="index"
                    :icon="item.icon"
                    :text="item.text"
                    icon-size="28px"
                    class="nav-item"
                    :to="item.to"/>
            </van-grid>
        </van-config-provider>
    </div>
</template>

<script setup>
import { ref } from 'vue'
// 导航项配置数据
const navItems = [
    { icon: 'wap-home', text: '开源地址' , to: '/'},
    { icon: 'column', text: '所有考试' ,  to: '/ExamList'},
    { icon: 'medal', text: '竞赛占位' , to: '/contest'},
    { icon: 'wechat-pay', text: '占位置在' , to: '/ranking'},
]
// 定制 Grid 组件主题
const themeVars = ref({
    gridItemIconSize:"32px",// 图标大小
})


</script>

<style scoped>
.nav-container {
    padding: 12px 0;
    background: #fff;
}

/* 隐藏滚动条 */
.nav-container::-webkit-scrollbar {
    display: none;
}

:deep(.van-grid-item__content) {
    padding: 8px 12px;
}

.nav-item :deep(.van-grid-item__text) {
    color: #666;
    font-size: 12px;
    margin-top: 6px;
}
</style>