<template>
    <div class="nav-container">
        <van-grid :border="false">
            <van-grid-item 
                v-for="(item, index) in navItems"
                :key="index"
                :icon="item.icon"
                :text="item.text"
                icon-size="28px"
                class="nav-item"
                :to="item.to"
            />
        </van-grid>
    </div>
</template>

<script setup>
// 导航项配置数据
const navItems = [
    { icon: 'home-o', text: '首页占位' , to: '/'},
    { icon: 'bar-chart-o', text: '题库占位' ,  to: '/questionbank'},
    { icon: 'medal-o', text: '竞赛占位' , to: '/contest'},
    { icon: 'bar-chart-o', text: '排名占位' , to: '/ranking'},
    { icon: 'user-o', text: '我的占位', to: '/mine' },
    { icon: 'comment-o', text: '消息占位' , to: '/message'}
]

</script>

<style scoped>
.nav-container {
    padding: 12px 0;
    background: #fff;
    overflow-x: auto; /* 允许水平滚动 */
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