<template>
    <div>
        <el-page-header @back="handleBack" title="考试列表">
            <template #content>
                <div>
                    <el-icon>
                        <SetUp />
                    </el-icon>
                    <span>题目面板</span>
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
                            <span class="text-purple-500 info-value">{{ formatTime.getTime(examinfo.createdTime)
                                }}</span>
                        </div>
                    </div>
                </el-card>
                <el-card shadow="hover" class="UserDonw">
                    <el-statistic title="用户端题目数量" :value="UserpublishedQuestionNumber" class="statistic-card">
                        <template #prefix>
                            <el-icon class="statistic-icon" color="#67C23A">
                                <User />
                            </el-icon>
                        </template>
                    </el-statistic>
                    <el-button color="#626aef" @click="centerDialogVisible = true">题目重置|适用于题型删除添加暂无题目数据</el-button>
                    <el-dialog v-model="centerDialogVisible" title="注意" width="500" center>
                        <span>
                            确定要将用户端题目全部下架吗？
                            <br />
                            此操可适用于题型删除后,添加暂无题目数据的情况。
                        </span>
                        <template #footer>
                        <div class="dialog-footer">
                            <el-button @click="centerDialogVisible = false"> 取消</el-button>
                            <el-button type="primary" @click="handleConfirm">
                                确定
                            </el-button>
                        </div>
                        </template>
                    </el-dialog>
                </el-card>
            </el-col>
            <el-col :span="16">
                <el-card shadow="hover">
                    <div>
                        <el-row :gutter="10">
                            <el-col :span="12">
                                <el-card shadow="hover" style="max-width: 480px">
                                    <el-statistic title="已发布题目数量" :value="PublishedQuestionNumber"
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
                                    <el-statistic title="已添加题目数量" :value="QuestionNumber" class="statistic-card">
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
                                <el-card shadow="hover" class="square-card" :body-style="{ 
                                        height: '100%',
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        padding: '0' 
                                    }">
                                    <el-tooltip effect="dark" content="立即添加题目" placement="top"
                                        :popper-options="{ offset: 10 }" popper-class="custom-tooltip">
                                        <el-button type="primary" class="full-btn" size="large" @click="handelAddqe">
                                            <el-icon size="50">
                                                <CirclePlusFilled />
                                            </el-icon>
                                        </el-button>
                                    </el-tooltip>
                                </el-card>
                            </el-col>
                            <el-col :span="12" class="flex justify-center p-4">
                                <el-card shadow="hover" class="square-card" :body-style="{ 
                                        height: '100%',
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        padding: '0' 
                                    }">
                                    <el-tooltip effect="dark" content="立即查看题目" placement="top"
                                        popper-class="custom-tooltip">
                                        <el-button type="success" class="full-btn" size="large" @click="checkListqe">
                                            <el-icon size="50">
                                                <List />
                                            </el-icon>
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
import{Collection,Document,Timer,CirclePlusFilled,List,Histogram ,TrendCharts,SetUp,User} from '@element-plus/icons-vue'
import formatTime from '@/util/formatTime';
import { ElMessage } from 'element-plus';


const route = useRoute();
const router = useRouter();
const examinfo = ref([])
const questionType = ref(route.query.questionType)
const QuestionNumber = ref(0)
const PublishedQuestionNumber = ref(0)
const UserpublishedQuestionNumber = ref(0) 
const centerDialogVisible = ref(false)

onMounted(() => {
  getData()
  fetchQuestionCounts()  // 替换原来的两个调用
})

// 获取题目数量的函数
const fetchQuestionCounts = async () => {
    try {
        // 获取已发布题目数量
        const [publishedRes, totalRes, UserpublishedRes] = await Promise.all([
            axios.get(`/adminapi/exam/questionlist/${route.params.id}`, {
                params: {
                    questionType: route.query.questionType,
                    isPublish: 1
                }
            }),
            // 获取总题目数量
            axios.get(`/adminapi/exam/questionlist/${route.params.id}`, {
                params: {
                    questionType: route.query.questionType
                }
            }),
            // 获取用户端总题目数量
            axios.get(`/adminapi/exam/questionlist/${route.params.id}`, {
                params: {
                    questionType: route.query.questionType,
                    isAddUserList: 1
                }
            })
        ])
        PublishedQuestionNumber.value = publishedRes.data.data.length
        QuestionNumber.value = totalRes.data.data.length
        UserpublishedQuestionNumber.value = UserpublishedRes.data.data.length
    } catch (error) {
        console.error('获取题目数量失败:', error)
        ElMessage.error('获取题目数量失败')
    }
}


//向后端请求数据加载考试科目信息数据
const getData = async () => {
    const res = await axios.get(`/adminapi/exam/list/${route.params.id}`)
    examinfo.value = res.data.data[0]
}

// 添加返回方法
const handleBack = () => {
    router.back()
}
//添加题目方法
const handelAddqe =()=> {
    const routeNames = [
    'selectquestion',
    'blankquestion',
    'judgequestion',
    'shortquestion'
  ]
  // 通过索引获取对应的路由名称，未匹配时使用'otherquestion'
  const routeName = routeNames[Number(questionType.value-1)] || 'otherquestion'
  router.push(`/exam/${routeName}/${route.params.id}`)
}
//查看题目列表
const  checkListqe =()=>{
    router.push({
        path:`/exam/questionlist/${route.params.id}`,
        query:{
            questionType:questionType.value
        }
    })
} 
//用户端题目全部下架
const handleConfirm = async () => {
    centerDialogVisible.value = false
    try {
        const res = await axios.post(`/adminapi/exam/UserquestionlistDown/${route.params.id}`,
            {
                questionType: questionType.value,
                isAddUserList: 1 
            }
        )
        if (res.data.code === 200) {
            ElMessage.success('下架成功')
            fetchQuestionCounts()  // 刷新题目数量 
        }
      
    }catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败') 
    }
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
}
.UserDonw{
    margin-top: 20px;
}
</style>
