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
                <el-card shadow="hover" class="info-card">
                    <div class="info-container">
                        <div class="info-item">
                            <div class="info-icon-text">
                                <el-icon class="text-success icon-lg">
                                    <Collection />
                                </el-icon>
                                <span class="text-success info-label">科目名称:</span>
                            </div>
                            <span class="text-primary info-value">{{ examinfo.name }}</span>
                        </div>
                        <div class="info-item">
                            <div class="info-icon-text">
                                <el-icon class="text-info icon-lg">
                                    <Document />
                                </el-icon>
                                <span class="text-info info-label">科目代码:</span>
                            </div>
                            <span class="text-purple-500 info-value">{{ examinfo.code }}</span>
                        </div>
                        <div class="info-item">
                            <div class="info-icon-text">
                                <el-icon class="text-warning icon-lg">
                                    <Timer />
                                </el-icon>
                                <span class="text-info info-label">最近更新时间:</span>
                            </div>
                            <span class="text-purple-500 info-value">{{ formatTime.getTime(examinfo.createdTime) }}</span>
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
                                    <el-statistic 
                                        title="已发布题目数量" 
                                        :value="268500"
                                        class="statistic-card">
                                        <template #prefix>
                                            <el-icon class="statistic-icon" color="#67C23A">
                                                <Histogram />
                                            </el-icon>
                                        </template>
                                    </el-statistic>
                                </el-card>  
                            </el-col>
                            <el-col :span="12">
                                <el-card shadow="hover">
                                    <el-statistic 
                                        title="已添加题目数量" 
                                        :value="268500"
                                        class="statistic-card">
                                        <template #prefix>
                                            <el-icon class="statistic-icon" color="#409EFF">
                                                <TrendCharts />
                                            </el-icon>
                                        </template>
                                    </el-statistic>
                                </el-card>  
                            </el-col>
                      </el-row>  
                   </div> 
                </el-card>
                <el-card shadow="hover" class="add_list">
                   <div class="flex justify-center">
                      <el-row :gutter="0" class="w-full">
                            <el-col :span="12" class="flex justify-center p-4">
                                <el-card 
                                    shadow="hover" 
                                    class="square-card"
                                    :body-style="{ 
                                        height: '100%',
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        padding: '0' 
                                    }">
                                    <el-tooltip 
                                        effect="dark"
                                        content="立即添加题目" 
                                        placement="top"
                                        :popper-options="{ offset: 10 }"
                                        popper-class="custom-tooltip">
                                        <el-button 
                                            type="primary" 
                                            class="full-btn"
                                            size="large"
                                            @click="handelAddqe">
                                            <el-icon size="50"><CirclePlusFilled /></el-icon>
                                        </el-button>
                                    </el-tooltip>
                                </el-card>  
                            </el-col>
                            <el-col :span="12" class="flex justify-center p-4">
                                <el-card 
                                    shadow="hover" 
                                    class="square-card"
                                    :body-style="{ 
                                        height: '100%',
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        padding: '0' 
                                    }">
                                    <el-tooltip 
                                        effect="dark"
                                        content="立即查看题目" 
                                        placement="top"
                                        popper-class="custom-tooltip">
                                        <el-button 
                                            type="success" 
                                            class="full-btn"
                                            size="large"
                                            @click="checkListqe">
                                            <el-icon size="50"><List /></el-icon>
                                        </el-button>
                                    </el-tooltip>
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
import{DocumentAdd,Collection,Document,Timer,CirclePlusFilled,List,Upload,Histogram ,TrendCharts} from '@element-plus/icons-vue'
import formatTime from '@/util/formatTime';


const route = useRoute();
const router = useRouter();
const examinfo = ref([])
const questionType = ref(route.query.questionType) // 获取传递的index参数，默认为0

//可以根据questionType.value来显示不同的题目类型
//向后端请求数据加载数据
const getData = async () => {
    const res = await axios.get(`/adminapi/exam/list/${route.params.id}`)
    examinfo.value = res.data.data[0]
}

onMounted(() => {
    getData()
    console.log("@@@index",questionType.value);
    console.log("@@@ID",route.params.id);
});
// 添加返回方法
const handleBack = () => {
    router.back()
}
//添加题目方法
const handelAddqe =()=> {
    console.log("添加题目");
    const routeNames = [
    'selectquestion',
    'blankquestion',
    'judgequestion',
    'shortquestion'
  ]
  // 通过索引获取对应的路由名称，未匹配时使用'otherquestion'
  const routeName = routeNames[questionType.value] || 'otherquestion'
  router.push(`/exam/${routeName}/${route.params.id}`)
}
//查看题目列表
const  checkListqe =()=>{
    console.log("查看题目列表");

} 




</script>
<style lang="css" scoped>
:deep(.el-page-header__content) {
  color: #2c94fd;
}
.el-card{
    border-radius: 10px;
}
.add_list{
    margin-top: 25px;
}

.statistic-card {
    max-width: 480px;
}

.square-card {
    width: 180px;
    height: 180px;
    margin-left:70px;
}

.full-btn {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    padding: 30px;
    transition: all 0.3s;
}

.full-btn.el-button--primary {
    background: linear-gradient(45deg, #26c1dc, #79bbff);
}

.full-btn.el-button--success {
    background: linear-gradient(45deg, #b2e240, #85ce61);
}

.full-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.info-card {
    margin-top: 32px;
    padding: 20px;
    border-radius: 12px;
    background: linear-gradient(145deg, #ffffff, #f5f7fa);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.info-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-icon-text {
    display: flex;
    align-items: center;
    gap: 10px;
}

.icon-lg {
    font-size: 20px;
    width: 24px;
    height: 24px;
}

.info-label {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: 16px;
    font-weight: 600;
    margin-left: 34px; /* 与图标对齐 */
    word-break: break-all;
}

.text-success {
    color: #67c23a;
}

.text-info {
    color: #409eff;
}

.text-warning {
    color: #e6a23c;
}

.text-primary {
    color: #303133;
}

.text-purple-500 {
    color: #8b5cf6;
}
.statistic-card {
    padding: 20px;
}

.statistic-icon {
    margin-right: 8px;
    font-size: 24px;
}

:deep(.el-statistic__content) {
    font-size: 24px;
    font-weight: bold;
    color: #606266;
}

:deep(.el-statistic__head) {
    font-size: 16px;
    color: #909399;
    margin-bottom: 12px;
}
</style>
<style>
.custom-tooltip {
    background: linear-gradient(45deg, #26c1dc, #79bbff) !important;
    color: white !important;
    font-size: 16px;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    letter-spacing: 0.5px;
}

.custom-tooltip[data-popper-placement^=top] .el-popper__arrow::before {
    background: linear-gradient(45deg, #26c1dc, #79bbff) !important;
    box-shadow: -2px -2px 4px rgba(0,0,0,0.05);
}</style>
