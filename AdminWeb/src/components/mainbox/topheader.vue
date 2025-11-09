<template>
    <el-header>
        <div class="left">
            <el-space :size="10" spacer="|">
            <el-icon :size="25" @click="handleCollapse">
                <Expand v-if="appStore.isCollapse" />
                <Fold v-else />
            </el-icon>
            <PageHeader/>
            </el-space>
        </div>
        <div class="right">
            <div class="action">
                <div @click="handleMessage">
                <el-tooltip content="通知消息" placement="bottom">
                    <el-badge 
                        :value="messageCount" 
                        :max="99" 
                        class="notification-badge">
                        <el-icon class="bell-icon"><Bell /></el-icon>
                    </el-badge>
                </el-tooltip>
                </div>
            </div>
            <div class="action">
                <span>欢迎 {{ appStore.userInfo.username }} 回来</span>
                <el-dropdown :hide-on-click="false">
                    <span class="el-dropdown-link">
                        <el-icon :size="30">
                            <User />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="handleCenter">个人中心</el-dropdown-item>
                            <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
    </el-header>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useAppStore } from '@/stores/index';
import { User, Expand, Fold,Bell } from '@element-plus/icons-vue'; 
import { useRouter } from 'vue-router';
import PageHeader from '../FunComponents/PageHeader.vue';
import { getMessageCount } from '@/API/consumer/consumer_messageAPI';

const router = useRouter()
const appStore = useAppStore()
const messageCount = ref(0)//消息数量

const handleCollapse = () => {
    appStore.changeCollapse()
}

const handleCenter = () => {
    router.push('/center')
}

const handleLogout = () => {
    localStorage.removeItem("token")
    appStore.clearUserInfo() 
    router.push('/login')
}

// 跳转消息页面
const handleMessage = () => {
  router.push('/consumer/message')
}

//设置定时器，每30秒刷新消息数量
setInterval(() => {
    getMessageCount().then(res=>{
        if(res.code === 200){
            messageCount.value = res.data
        }
    })
}, 30000);

// 页面加载时获取消息数量
onMounted(()=>{
    getMessageCount().then(res=>{
        if(res.code === 200){
            messageCount.value = res.data
        }
    })
})

</script>
<style scoped>
.el-header {
    background-color: rgba(216, 235, 255, 0.769);
    width: 100%;
    height: 50px;
    line-height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.right{
    display: flex;
}
.left {
    display: flex;
    

}

.left {
    i {
        margin: auto;
    }
}

.right {
    .el-dropdown {
        margin: auto;
    }
}
.action {
    display: flex;
    align-items: center;
    margin-right: 10px;
}

.notification-badge {
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    z-index: 10;
    margin-top: 20px;
    margin-right: 10px;
}

.notification-badge:hover {
    transform: scale(1.1);
}

.bell-icon {
    font-size: 20px;
    color: #606266;
    transition: all 0.3s ease;
}

.notification-badge:hover .bell-icon {
    color: #409EFF;
    animation: shake 0.5s;
}

/* 确保徽章不被遮挡 */
.notification-badge :deep(.el-badge__content) {
    z-index: 100;
}

@keyframes shake {
    0%, 100% { transform: rotate(0deg); }
    10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
    20%, 40%, 60%, 80% { transform: rotate(10deg); }
}
</style>