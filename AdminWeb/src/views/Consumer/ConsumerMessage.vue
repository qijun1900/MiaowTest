<template>
    <div class="consumer-message-container">
        <!-- 页面标题 -->
        <div class="page-header">
            <h1 class="page-title">
                <el-icon><User /></el-icon>
                用户反馈管理
            </h1>
            <el-button 
                type="primary"
                @click="handleRefresh">
                <el-icon><Refresh /></el-icon>
                刷新数据
            </el-button>
        </div>

        <!-- 筛选条件 -->
        <el-card class="filter-card" shadow="never">
            <template #header>
                <div class="filter-header">
                    <el-icon><Filter /></el-icon>
                    <span>筛选条件</span>
                </div>
            </template>
            <el-form 
                :model="filterForm" 
                inline>
                <el-form-item label="反馈类型：">
                    <el-select v-model="filterForm.type" placeholder="请选择反馈类型" clearable>
                        <el-option label="系统反馈" :value="1" />
                        <el-option label="题目反馈" :value="2" />
                        <el-option label="功能建议" :value="3" />
                        <el-option label="其他" :value="4" />
                    </el-select>
                </el-form-item>
                <el-form-item label="处理状态：">
                    <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
                        <el-option label="待处理" :value="0" />
                        <el-option label="处理中" :value="1" />
                        <el-option label="已处理" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="用户状态：">
                    <el-select v-model="filterForm.userStatus" placeholder="请选择用户状态" clearable>
                        <el-option label="已登录用户" value="loggedIn" />
                        <el-option label="未登录用户" value="notLoggedIn" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button 
                        type="primary" 
                        @click="handleSearch">
                        <el-icon><Search /></el-icon>
                        查询
                    </el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 反馈列表 -->
        <el-card class="table-card" shadow="never">
            <template #header>
                <div class="table-header">
                    <span>反馈列表</span>
                    <span class="total-count">共 {{ total }} 条记录</span>
                </div>
            </template>
            
            <el-table 
                height="440"
                :data="filteredFeedbackList" 
                v-loading="loading" 
                stripe>
                <el-table-column 
                    type="index" 
                    label="序号" 
                    width="60" 
                    align="center" />
                
                <!-- 用户信息列 -->
                <el-table-column label="用户信息" min-width="180">
                    <template #default="{ row }">
                        <div class="user-info">
                            <div class="user-avatar">
                                <el-avatar :size="40" :src="row.userInfo?.avatar" :icon="User" />
                            </div>
                            <div class="user-details">
                                <div class="username">
                                    {{ row.uid || '匿名用户' }}
                                    <el-tag 
                                        v-if="row.uid" 
                                        size="small" 
                                        type="success" 
                                        effect="plain">
                                        已登录
                                    </el-tag>
                                    <el-tag 
                                        v-else 
                                        size="small" 
                                        type="info" 
                                        effect="plain">
                                        未登录
                                    </el-tag>
                                </div>
                                <div class="contact-info" v-if="row.contactInfo">
                                    <el-icon><Message /></el-icon>
                                    {{ row.contactInfo }}
                                </div>
                            </div>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="type" label="反馈类型" width="120" align="center">
                    <template #default="{ row }">
                        <el-tag :type="formatInfo.getTypeTagType(row.type)">
                            {{ formatInfo.getTypeText(row.type) }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="content" label="反馈内容" min-width="200" show-overflow-tooltip />

                <el-table-column prop="status" label="处理状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="formatInfo.getStatusTagType(row.status)">
                            {{ formatInfo.getStatusText(row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="createTime" label="提交时间" width="160" align="center">
                    <template #default="{ row }">
                        {{ formatTime.formatTime(row.createTime) }}
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="200" align="center" fixed="right">
                    <template #default="{ row }">
                        <el-button 
                            size="small" 
                            type="primary" 
                            link 
                            @click="handleView(row)">
                            <el-icon><View /></el-icon>
                            查看详情
                        </el-button>
                        <el-button 
                            size="small" 
                            type="warning" 
                            link 
                            @click="handleEdit(row)"
                            v-if="row.status !== 2">
                            <el-icon><Edit /></el-icon>
                            处理
                        </el-button>
                        <Popconfirm
                        title="您确定删除吗？" 
                        @confirm="handleDelete(row)">
                        <el-button 
                            size="small" 
                            type="danger" 
                            link 
                            >
                            <el-icon><Delete /></el-icon>
                            删除
                        </el-button>
                        </Popconfirm>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
               <Pagination 
                :total="total"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                @page-change="handlePageChange"/>
            </div>
        </el-card>

        <!-- 反馈详情对话框 -->
        <Dialog
            DilogTitle="反馈详情" 
            DilogWidth="600px"
            :draggable="true" 
            top="6vh" 
            v-model="detailDialogVisible">
            <template #dialogcontent>
                <el-descriptions :column="2" border v-if="currentFeedback">
                    <el-descriptions-item label="用户信息">
                        <div class="detail-user-info">
                            <el-avatar :size="50" :src="currentFeedback.userInfo?.avatar" :icon="User" />
                            <div class="user-text">
                                <div>{{ currentFeedback.userInfo?.username || '匿名用户' }}</div>
                                <el-tag 
                                    size="small" 
                                    :type="currentFeedback.uid ? 'success' : 'info'">
                                    {{ currentFeedback.uid ? '已登录用户' : '未登录用户' }}
                                </el-tag>
                            </div>
                        </div>
                    </el-descriptions-item>
                    <el-descriptions-item label="反馈类型">
                        <el-tag :type="formatInfo.getTypeTagType(currentFeedback.type)">
                            {{ formatInfo.getTypeText(currentFeedback.type) }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="处理状态">
                        <el-tag :type="formatInfo.getStatusTagType(currentFeedback.status)">
                            {{ formatInfo.getStatusText(currentFeedback.status) }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="提交时间">
                        {{ formatTime.formatTime(currentFeedback.createTime) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="联系方式" :span="2" v-if="currentFeedback.contactInfo">
                        {{ currentFeedback.contactInfo }}
                    </el-descriptions-item>
                    <el-descriptions-item label="反馈内容" :span="2">
                        <div class="feedback-content">
                            {{ currentFeedback.content }}
                        </div>
                    </el-descriptions-item>
                    <el-descriptions-item label="管理员回复" :span="2" v-if="currentFeedback.adminReply">
                        <div class="admin-reply">
                            {{ currentFeedback.adminReply }}
                        </div>
                    </el-descriptions-item>
                    <el-descriptions-item label="回复时间" v-if="currentFeedback.replyTime">
                        {{ formatTime.formatTime(currentFeedback.replyTime) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="处理管理员" v-if="currentFeedback.adminId">
                        管理员 {{ currentFeedback.adminInfo?.username || '未知' }}
                    </el-descriptions-item>
                </el-descriptions>
            </template>
        </Dialog>
        <!-- 处理反馈对话框 -->
        <Dialog
            DilogTitle="处理反馈"
            DilogWidth="600px"
            :draggable="true"
            top="6vh"
            DilogButContent="提交"
            v-model="editDialogVisible"
            @dialog-confirm="handleSubmit">
            <template #dialogcontent>
                <el-form :model="handleForm" label-width="100px">
                    <el-form-item label="处理状态">
                        <el-select v-model="handleForm.status" placeholder="请选择处理状态">
                            <el-option label="待处理" :value="0" />
                            <el-option label="处理中" :value="1" />
                            <el-option label="已处理" :value="2" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="回复内容">
                        <el-input type="textarea" 
                        v-model="handleForm.adminReply" 
                        :autosize="{ minRows: 3, maxRows: 5 }" />
                    </el-form-item>
                </el-form>
            </template>
        </Dialog>
    </div>
</template>
<script setup>
import { ref, onMounted,defineAsyncComponent } from 'vue'
import {
    User, Refresh, Filter, Search, View, Edit, Delete, Message
} from '@element-plus/icons-vue'
import Pagination from '@/components/ReuseComponents/Pagination.vue'
import {getMessageList} from '../../API/consumer/consumer_messageAPI'
import formatInfo from '@/util/formatInfo'
import formatTime from '@/util/formatTime'
import { handleFeedback,deleteFeedback } from '../../API/consumer/consumer_messageAPI'
import { ElMessage } from 'element-plus'
import Popconfirm from '@/components/ReuseComponents/Popconfirm.vue'
import { useFeedbackFilter } from '@/util/SearchFilter'
// 动态导入较大的组件
const Dialog = defineAsyncComponent(() =>
    import('@/components/ReuseComponents/Dialog .vue')
)

// 响应式数据
const feedbackList = ref([])// 反馈列表
const loading = ref(false)
const detailDialogVisible = ref(false)
const currentFeedback = ref(null)
const editDialogVisible = ref(false)
//表格分页器
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
// 筛选表单
const filterForm = ref({
    type: '',
    status: '',
    userStatus: ''
})
// 使用筛选函数
const filteredFeedbackList = useFeedbackFilter(feedbackList, filterForm)
// 处理表单
const handleForm = ref({
    status: 1,
    adminReply: ''
})
// 重置筛选条件
const handleReset = () => {
    filterForm.value = {
        type: '',
        status: '',
        userStatus: ''
    }
    currentPage.value = 1
}


// 添加分页变化处理方法
const handlePageChange = ({ page, size }) => {
    currentPage.value = page
    pageSize.value = size
    handleRefreshMessageList()
}

//获取用户信息列表+刷新+分页
const handleRefreshMessageList = async () => {
    try {
        loading.value = true
        const res = await getMessageList({
            page: currentPage.value,
            size: pageSize.value,
        })
        if (res.code === 200) {
            feedbackList.value = res.data.data// 数据列表
            total.value = res.data.total// 总条数
        } 
    }catch (error) {
        console.error('获取用户信息列表失败:', error)
    }finally {
        loading.value = false
    }
}

// 刷新数据
const handleRefresh = () => {
    handleRefreshMessageList()
    ElMessage.success('数据已刷新')
}
// 搜索
const handleSearch = () => {
    currentPage.value = 1
    handleRefreshMessageList()
}
// 查看详情
const handleView = (row) => {
    currentFeedback.value = row
    detailDialogVisible.value = true
}
// 编辑
const handleEdit = (row) => {
    currentFeedback.value = row
    editDialogVisible.value = true
}
// 删除
const handleDelete = async (row) => {
    try {
        const res = await deleteFeedback(row._id)
        if (res.code === 200) {
            ElMessage.success('删除用户信息成功')
            handleRefreshMessageList()
        }   
    }catch (error) {
        console.error('删除用户信息失败:', error)
    }
}
// 处理反馈 - 提交
const handleSubmit = async () => {
    try {
        // 发送处理请求
        const res = await handleFeedback(currentFeedback.value._id, handleForm.value)
        if (res.code === 200) {
            editDialogVisible.value = false
            ElMessage.success('反馈处理成功')
            handleRefreshMessageList()
        }
    }catch (error) {
        console.error('处理反馈失败:', error)
    }  
}

// 生命周期
onMounted(() => {
    handleRefreshMessageList()
})
</script>
<style scoped>
.consumer-message-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 60px);
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.page-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 600;
    color: #303133;
}

.filter-card {
    margin-bottom: 20px;
}

.filter-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
}

.table-card {
    margin-bottom: 20px;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.total-count {
    color: #909399;
    font-size: 14px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.username {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
}

.contact-info {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #606266;
    font-size: 12px;
}

.detail-user-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.feedback-content {
    padding: 8px;
    background-color: #f8f9fa;
    border-radius: 4px;
    line-height: 1.5;
}

.admin-reply {
    padding: 8px;
    background-color: #f0f9ff;
    border-radius: 4px;
    line-height: 1.5;
    color: #1890ff;
}

.pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .consumer-message-container {
        padding: 10px;
    }
    
    .page-header {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
    }
    
    .user-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
}
</style>