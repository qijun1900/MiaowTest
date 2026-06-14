<template>
    <ThemeProvider>
    <view class="container">
        <!-- 消息列表区域 -->
        <view class="message-list">
            <!-- 空状态提示 -->
            <Empty description="暂无消息" />
        </view>
    </view>
    </ThemeProvider>
</template>

<script setup>
import ThemeProvider from "../../components/core/ThemeProvider.vue";
import { ref } from "vue";
import Empty from "../../components/core/Empty.vue";

// 消息列表数据（当前为空）
const messages = ref([]);

// 页面加载时获取消息
const loadMessages = () => {
    // TODO: 调用API获取消息列表
    console.log("加载消息列表...");
};

// 初始化加载
loadMessages();
</script>

<style scoped>
.container {
    min-height: 100vh;
    background-color: var(--app-bg-secondary);
}
.message-list {
    padding: 20px;
}
</style>
