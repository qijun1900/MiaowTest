<template>
    <div>
        <el-page-header content="首页" icon="" title="随心所试后台管理系统"></el-page-header>
        <el-card shadow="always" class="box-card">
            <el-row>
             <el-col :span="4">
                <el-avatar :size="80" :src="avatarUrl" />
             </el-col>
             <el-col :span="20">   
                <h3 style="line-height: 80px;">欢迎{{ store.state.userInfo.username  }}回来,XXXXXXX</h3>
             </el-col>
            </el-row>
        </el-card>    
        <el-card shadow="always" class="box-card" >
                <template #header>
                    <div class="card-header">
                        <span>XXX产品</span>       
                    </div>
                </template>
                <el-carousel :interval="4000" type="card" height="300px">
                    <el-carousel-item v-for="item in loopList" :key="item._id">
                        <div 
                        :style="{
                            backgroundImage: `url(http://${escconfig.serverHost}:${escconfig.serverPort}${item.cover})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            height: '100%',
                            position: 'relative'
                        }"
                        >
                        <h6 
                            style="
                            position: absolute;
                            bottom: 20%;
                            left: 50%;
                            transform: translateX(-50%);
                            color: white;
                            font-size: 2rem;
                            text-align: center;
                            margin: 0;
                            padding: 12px 24px;
                            border-radius: 30px;
                            white-space: nowrap;
                            "
                        >
                            {{ item.title }}
                        </h6>
                        </div>
                    </el-carousel-item>
                    </el-carousel>
        </el-card>  

    </div>
</template>
<script setup>
import axios  from 'axios';
import { useStore } from 'vuex';
import { computed ,onMounted,ref} from 'vue';
import  escconfig  from '@/config/esc.config';


const loopList = ref([])
const store = useStore()
// console.log(store.state)
const avatarUrl = computed(()=>store.state.userInfo.avatar?`http://${escconfig.serverHost}:${escconfig.serverPort}` + store.state.userInfo.avatar:`https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png`)

onMounted(() => {
    getTableData()//挂载时候就加载数据
})
const getTableData = async () => {
    const res = await axios.get(`/adminapi/product/list`)
    loopList.value = res.data.data
}

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

