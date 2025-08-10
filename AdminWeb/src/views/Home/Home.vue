<template>
    <div>
        <Divider content="快捷操作">
            <el-icon>
                <EditPen/>
            </el-icon>
        </Divider>
        <el-row :gutter="20">
            <el-col :span="6">
                <el-card shadow="hover" class="quick-card">
                    <div class="card-content">
                        <div class="card-header">
                            <el-icon class="card-icon"><Promotion /></el-icon>
                            <span class="card-title">添加用户</span>
                        </div>
                        <div class="card-body">
                            <el-statistic title="管理人员数量" :value="userTotal" />
                            <el-button 
                                type="primary" 
                                class="card-button"
                                @click="handleAddUser">
                                点击添加
                            </el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="quick-card">
                    <div class="card-content">
                        <div class="card-header">
                            <el-icon class="card-icon"><Promotion /></el-icon>
                            <span class="card-title">通知公告统计</span>
                        </div>
                        <div class="card-body">
                            <el-statistic title="通知公告数量" :value="announcementTotal" />
                            <el-button 
                                type="primary" 
                                class="card-button"
                                @click="handleCheeckAnnouncement">查看详情</el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="quick-card">
                    <div class="card-content">
                        <div class="card-header">
                            <el-icon class="card-icon"><Promotion /></el-icon>
                            <span class="card-title">科目信息</span>
                        </div>
                        <div class="card-body">
                            <el-statistic title="科目数量" :value="examTotal" />
                            <el-button 
                                type="primary" 
                                class="card-button"
                                @click="handleCheeckExam">查看详情</el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" class="quick-card">
                    <div class="card-content">
                        <div class="card-header">
                            <el-icon class="card-icon"><Promotion /></el-icon>
                            <span class="card-title">消息中心</span>
                        </div>
                        <div class="card-body">
                            <el-statistic title="未读消息" :value="3" />
                            <el-button type="primary" class="card-button">查看消息</el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <Divider content="数据概览"></Divider>
        <el-row :gutter="20">
            <el-col :span="10"><el-card shadow="hover"><BarChart/></el-card></el-col>
            <el-col :span="14"><el-card shadow="hover"><PieChart/></el-card></el-col>
        </el-row>
    </div>
</template>
<script setup>
import Divider from '@/components/ReuseComponents/Divider.vue';
import { EditPen ,Promotion} from '@element-plus/icons-vue';
import BarChart from '@/components/Chart/BarChart.vue';
import PieChart from '@/components/Chart/PieChart.vue';
import RouterPush from '@/util/RouterPush';
import { onMounted,ref} from 'vue';
import {getUserList} from '@/API/Users/userAPI'//API
import {getAnnouncementList} from '@/API/News/announcementAPI'//APi
import { getExamList } from '@/API/Exam/subjectAPI';
const userTotal = ref(0)
const announcementTotal = ref(0)
const examTotal = ref(0)

const handleAddUser = () => {
    RouterPush("/users",{showAddDialog:true })
};
const handleCheeckAnnouncement = () => {
    RouterPush("/news/announcement")
};
const handleCheeckExam = () => {
    RouterPush("/exam/exammanage")
}
const fetchData = async() => {
    try {
        const [res1, res2,res3] = await Promise.all([
            getUserList(),
            getAnnouncementList(),
            getExamList()
        ])
        
        if(res1.ActionType === "OK"){
            userTotal.value = res1.total
        } else {
            console.log("获取用户总数失败")
        }
        
        if(res2.ActionType === "OK"){
            announcementTotal.value = res2.data.total
        } else {
            console.log("获取公告总数失败")
        }
        if(res3.ActionType === "OK"){
            examTotal.value = res3.data.total
        } else {
            console.log("获取科目总数失败")
        }

    } catch (error) {
        console.error("请求异常:", error)
    }
}

onMounted(()=>{
   fetchData()
})

</script>
<style scoped>
.quick-card {
    height: 100%;
}

.card-content {
    padding: 10px;
}

.card-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.card-icon {
    font-size: 20px;
    margin-right: 8px;
}

.card-title {
    font-weight: bold;
}

.card-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.card-button {
    margin-top: 10px;
}
</style>