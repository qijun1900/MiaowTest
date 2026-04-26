<template>
    <view class="container">
        <AgentHeader
            @menu-click="handleMenuClick"
            @new-chat="handleNewChat"
            @model-change="handleModelChange"
        />
        <view class="content">
            1111
        </view>
        <AgentSidebar
            v-model:show="sidebarVisible"
            @select-chat="handleSelectChat"
        />
    </view>
</template>

<script setup>
import { ref } from "vue";
import AgentHeader from "../../components/modules/agent/AgentHeader.vue";
import AgentSidebar from "../../components/modules/agent/AgentSidebar.vue";

const sidebarVisible = ref(false);

const handleMenuClick = () => {
    sidebarVisible.value = true;
};

const handleModelChange = (modelName) => {
    if (!modelName) {
        return;
    }
    uni.showToast({
        title: `已切换 ${modelName}`,
        icon: "none",
    });
};

const handleNewChat = () => {
    uni.showToast({
        title: "新建会话",
        icon: "none",
    });
};

const handleSelectChat = (chatId) => {
    uni.showToast({
        title: `切换到会话 ${chatId}`,
        icon: "none",
    });
};
</script>

<style scoped>
.container {
    min-height: 100vh;
    background: #f6f7f9;
}
.content{
    padding: 10rpx 20rpx;
}
</style>
