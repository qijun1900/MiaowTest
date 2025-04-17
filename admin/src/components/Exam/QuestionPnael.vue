<template>
    <div>
        <el-page-header @back="handleBack" title="选择类题">
            <template #content>
                <div class="flex items-center">
                    <el-icon class="mr-2">
                        <DocumentAdd />
                    </el-icon>
                    <span class="text-xl font-bold">考试题目编辑</span>
                </div>
            </template>
        </el-page-header>
        <el-row :gutter="25">
            <el-col :span="8">
                <el-card shadow="hover">
                    <div>
                        <div class="info-item">
                            <el-icon class="text-success">
                                <Collection />
                            </el-icon>
                            <span class="text-success">科目名称:</span><br>
                            <span class="text-primary">{{ examinfo.name }}</span>
                        </div>
                        <div class="info-item">
                            <el-icon class="text-info">
                                <Document />
                            </el-icon>
                            <span class="text-info">科目代码:</span><br>
                            <span class="text-purple-500">{{ examinfo.code }}</span>
                        </div>
                        <div class="info-item">
                            <el-icon class="text-info">
                                <Timer />
                            </el-icon>
                            <span class="text-info">更新时间:</span><br>
                            <span class="text-purple-500">{{ formatTime.getTime(examinfo.createdTime) }}</span>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="16">
                <el-card shadow="hover">
                   <div>
                      <el-row :gutter="10">
                            <el-col :span="12">
                                <el-card shadow="hover" style="max-width: 480px">
                                    <el-statistic title="已添加题目数量" :value="268500" />
                                </el-card>  
                            </el-col>
                            <el-col :span="12">
                            <el-card shadow="hover">
                                <el-statistic title="已添加题目数量" :value="268500" />
                            </el-card>  
                        </el-col>
                      </el-row>  
                   </div> 
                </el-card>
            </el-col>

        </el-row>
    </div>
</template>


<script setup>
import { onMounted ,ref} from 'vue';   
import { useRoute,useRouter } from 'vue-router';
import axios from 'axios';
import{DocumentAdd,Collection,Document,Timer} from '@element-plus/icons-vue'
import formatTime from '@/util/formatTime';


const route = useRoute();
const router = useRouter();
const examinfo = ref([])

//向后端请求数据加载数据
const getData = async () => {
    const res = await axios.get(`/adminapi/exam/list/${route.params.id}`)
    examinfo.value = res.data.data[0]
}
onMounted(() => {
    getData()
    console.log("@@@ID",route.params.id);
});
// 添加返回方法
const handleBack = () => {
    router.back()
}





</script>
<style lang="css" scoped>
:deep(.el-page-header__content) {
  color: #2c94fd;
}
.el-card{
    border-radius: 10px;
}
</style>
