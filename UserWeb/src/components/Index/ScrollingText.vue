<template>
    <div class="ticker-container">
        <div class="ticker-content">
            <span v-for="(item, index) in notices" :key="index" class="ticker-item">
                {{ item }} <span v-if="index !== notices.length -1" class="divider">|</span>
            </span>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
// 临时占位数据，后续替换为后端API获取
const notices = ref([
    '系统维护通知：本周五凌晨进行系统升级',
    '欢迎使用在线答题系统',
    '最新题库已更新，快来挑战吧！'
])
</script>
<style scoped>
.ticker-container {
    background-color: rgb(253, 195, 67); /* 橙色背景 */
    color: rgb(255, 255, 255); /* 白色字体 */
    padding: 3px 0px; /* 上下内边距 */
    overflow: hidden; /* 溢出隐藏 */
    border-radius: 4px; /* 圆角 */;
}

.ticker-content {
    display: inline-block;
    white-space: nowrap; /* 不换行 */
    animation: marquee 20s linear infinite;/* 滚动动画 */
}

.ticker-item {
    display: inline-block;
    margin-right: 40px;
}

.divider {
    margin: 0 20px;
    opacity: 0.6;
}

@keyframes marquee {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
}
</style>