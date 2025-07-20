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
    </el-header>
</template>

<script setup>
import { useAppStore } from '@/stores/index';
import { User, Expand, Fold } from '@element-plus/icons-vue'; // 添加 Expand 和 Fold 图标
import { useRouter } from 'vue-router';
import PageHeader from '../FunComponents/PageHeader.vue';

const router = useRouter()
const appStore = useAppStore()

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
</style>