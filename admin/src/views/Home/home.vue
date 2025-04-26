<template>
    <div>
        <el-page-header content="首页" icon="" title="随心所试后台管理系统"></el-page-header>
        <el-card shadow="always" class="box-card">
            <el-row>
             <el-col :span="4">
                <el-avatar :size="80" :src="avatarUrl" />
             </el-col>
             <el-col :span="20">   
                <h3 style="line-height: 80px;">{{ store.state.userInfo.username}}欢迎回来</h3>
             </el-col>
            </el-row>
        </el-card>      
    </div>
</template>
<script setup>
import axios  from 'axios';
import { useStore } from 'vuex';
import { computed } from 'vue';
import  escconfig  from '@/config/esc.config';


const store = useStore()
const avatarUrl = computed(()=>store.state.userInfo.avatar?`http://${escconfig.serverHost}:${escconfig.serverPort}` + store.state.userInfo.avatar:`https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png`)


</script>
<style scoped>
.box-card{
    margin-top:40px;
    border-radius: 15px;
                                 
}
.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>

