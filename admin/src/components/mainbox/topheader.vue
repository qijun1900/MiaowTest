<template>
<el-header>
        <div class="left">
            <el-icon :size="25" @click="handleCollapse"><Menu /></el-icon>
            <span>随心所试后台管理系统</span>
        </div>
        <div class="right">
           <span>欢迎 {{store.state.userInfo.username }} 回来</span> 
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
import { useStore } from 'vuex';
import { Menu ,User} from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const store = useStore()
const router =useRouter()

const handleCollapse =()=>{
    store.commit("changeCollapse")
}

const handleCenter = ()=>{
    router.push('/center')
}

const handleLogout = ()=>{
    localStorage.removeItem("token")
    store.commit("clearUserInfo")
    router.push('/login')
}

</script> 
<style scoped>
.el-header{
    background-color: rgba(162, 200, 237, 0.769);
    width: 100%;
    height: 60px;
    line-height: 60px;
    display: flex;
    justify-content: space-between;/*两端对齐*/
    align-items: center;


}
.right,.left{
    display: flex;

}
.left{
   i{
    margin: auto;
   }
}
.right{
    .el-dropdown{
    margin: auto;
   }
}
</style>