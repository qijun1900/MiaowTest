<template>
  <div class="consumer-container">
    <el-card class="filter-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><User /></el-icon>
            客户端用户管理
          </span>
          <el-button type="primary" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <!-- 筛选区域 -->
      <div class="filter-container">
        <el-form 
          :model="filterForm" 
          inline>
          <el-form-item label="UID">
            <el-input 
              style="width: 240px"
              v-model="filterForm._id" 
              placeholder="请输入用户UID" 
              clearable 
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="用户类型">
            <el-select 
              v-model="filterForm.userType" 
              placeholder="全部" 
              clearable>
              <el-option label="微信端用户" value="wechat" />
              <el-option label="网页端用户" value="web" />
            </el-select>
          </el-form-item>
          <el-form-item label="性别">
            <el-select 
              v-model="filterForm.gender" 
              placeholder="全部" 
              clearable>
              <el-option label="未知" :value="0" />
              <el-option label="男性" :value="1" />
              <el-option label="女性" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"/>
          </el-form-item>
          <el-form-item>
            <el-button @click="handleReset">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <el-card class="table-card" shadow="hover">
      
      <el-table 
        height="440"
        :data="filteredConsumerList" 
        style="width: 100%" 
        stripe 
        v-loading="loading"
        element-loading-text="加载中..."
        :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266' }"
        >
        <el-table-column prop="_id" label="用户UID" width="210" sortable />
        <el-table-column prop="username" label="用户名" width="150">
          <template #default="scope">
            <el-tag v-if="scope.row.username" type="primary">{{ scope.row.username }}</el-tag>
            <el-tag v-else type="info">未绑定</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="openid" label="用户类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.openid ? 'success' : 'info'">
              {{ scope.row.openid ? '微信端用户' : '网页端用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" width="150">
          <template #default="scope">
            <div class="nickname-cell">
              <el-avatar :src="scope.row.avatar || defaultAvatar" size="small" />
              <span class="nickname-text">{{ scope.row.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="100">
          <template #default="scope">
            <el-tag :type="formatInfo.getGenderTagType(scope.row.gender)">
              {{ formatInfo.getGenderText(scope.row.gender) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" sortable>
          <template #default="scope">
            <span>{{ formatTime.getTime2(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" min-width="300">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleView(scope.row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button size="small" @click="handleEdit(scope.row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button 
              size="small" 
              @click="handleAddExamAuth(scope.row._id)">
              <el-icon><CirclePlusFilled /></el-icon>
              添加考试权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <Pagination 
          :total="total"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          @page-change="handlePageChange"/>
      </div>
    </el-card>
    <Drawer
      v-model="drawerVisible"
      drawerTitle="添加考试权限"
      drawerSize="35%"
      >
      <template #drawercontent>
        <div class="exam-permission-container">
          <el-table 
            :data="AuthExamList" 
            style="width: 100%" 
            v-loading="examLoading"
            element-loading-text="加载中..."
            :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266' }"
          >
            <el-table-column prop="name" label="科目名称" width="180" />
            <el-table-column label="更新时间" width="130">
                    <template #default="scope">
                        {{ formatTime.getTime2(scope.row.createdTime) }}
                    </template>
                </el-table-column>
            <el-table-column prop="isAuthRequired" label="权限状态">
              <template #default="scope">
                <el-switch
                  size="large"
                  v-model="scope.row.isOpenAuth"
                  inline-prompt
                  :active-value="true"
                  :inactive-value="false"
                  active-text="已开启"
                  inactive-text="未开启"
                  @change="handlePermissionChange(scope.row)">
              </el-switch>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </Drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Refresh, RefreshLeft, View, Edit,CirclePlusFilled } from '@element-plus/icons-vue'
import { getConsumerList ,GetAuthExamListAPI,updateExamAuthStatusAPI} from "../../API/consumer/consumer_manageAPI"
import Pagination from '@/components/ReuseComponents/Pagination.vue'
import formatInfo from '@/util/formatInfo'
import formatTime from '@/util/formatTime'
import { useConsumerFilter } from '@/util/SearchFilter'
import Drawer from '@/components/ReuseComponents/Drawer.vue'

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

// 加载状态
const loading = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const drawerVisible = ref(false)
// 正在操作的用户ID
const currentUserId = ref('')
// 加载状态
const examLoading = ref(false)
// 考试列表数据
const AuthExamList = ref([])

// 筛选表单
const filterForm = ref({
  _id: '',
  userType: '',
  gender: null,
  dateRange: []
})

// 用户列表数据
const consumerList = ref([])

// 使用工具函数处理筛选
const filteredConsumerList = useConsumerFilter(consumerList, filterForm)

// 处理重置
const handleReset = () => {
  filterForm.value = {
    _id: '',
    userType: '',
    gender: null,
    dateRange: []
  }
  currentPage.value = 1
}

// 处理添加考试权限
const handleAddExamAuth = (row) => {
  currentUserId.value = row
  drawerVisible.value = true
  fetchAuthExamList()
}

const  fetchAuthExamList = async () => {
  try {
    examLoading.value = true
    const res = await GetAuthExamListAPI({
      uid : currentUserId.value
    })
    if(res.code === 200) {
      AuthExamList.value = res.data
    }
  }catch(error) {
    console.error('获取考试列表失败:', error)
  }finally {
    examLoading.value = false
  }
}
// 处理权限变化
const handlePermissionChange = async (row) => {
  try {
    const res = await updateExamAuthStatusAPI({
      uid: currentUserId.value,
      examId: row._id,
    })
    if (res.code === 200) {
      ElMessage.success('权限更新成功')
    }
  } catch (error) {
    ElMessage.error('权限更新失败')
    console.error('更新权限失败:', error)
  }
}
//获取用户信息列表+刷新+分页
const handleRefreshConsumerList = async () => {
  try {
    loading.value = true
    
    // 构建请求参数
    const params = {
      page: currentPage.value,
      size: pageSize.value,
    }

    const res = await getConsumerList(params)

    if (res.code === 200) {
      consumerList.value = res.data.data
      total.value = res.data.total
    }

  } catch (error) {
    ElMessage.error('获取用户列表失败', error.message)
  } finally {
    loading.value = false
  }
}
// 添加分页变化处理方法
const handlePageChange = ({ page, size }) => {
  currentPage.value = page
  pageSize.value = size
  handleRefreshConsumerList()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 处理刷新
const handleRefresh = () => {
  ElMessage.success('数据已刷新')
}

// 处理查看
const handleView = (row) => {
  ElMessage.info(`查看用户: ${row.nickname}`)
}

// 处理编辑操作
const handleEdit = (row) => {
  ElMessage.info(`编辑用户: ${row.nickname}`)
}

// 组件挂载时获取数据
onMounted(() => {
  handleRefreshConsumerList()
})
</script>

<style scoped>
.consumer-container {
  padding: 24px;
  background-color: #f0f2f5;
}

.filter-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 5px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.title .el-icon {
  margin-right: 8px;
  font-size: 20px;
}

.filter-container {
  padding: 16px 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.nickname-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nickname-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .consumer-container {
    padding: 10px;
  }
  
  .filter-container .el-form-item {
    margin-right: 0;
    margin-bottom: 10px;
    width: 100%;
  }
  
  .filter-container .el-form-item__content {
    width: 100%;
  }
  
  .el-input,
  .el-select,
  .el-date-picker {
    width: 100% !important;
  }
  
  .el-table {
    font-size: 12px;
  }
  
  .el-table .el-table__cell {
    padding: 8px 5px;
  }
  
  .pagination-container {
    justify-content: center;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

/* 表格样式优化 */
.el-table {
  border-radius: 4px;
  overflow: hidden;
  --el-table-header-bg-color: #f5f7fa;
  --el-table-border-color: #ebeef5;
  --el-table-text-color: #606266;
}

.el-table th {
  background-color: #f5f7fa !important;
  color: #606266 !important;
  font-weight: 600;
  padding: 16px 0 !important;
}


.el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafafa;
}

.el-table__body tr:hover > td {
  background-color: #f5f7fa;
}

/* 按钮样式优化 */
.el-button {
  border-radius: 4px;
}

.el-button + .el-button {
  margin-left: 5px;
}

/* 标签样式优化 */
.el-tag {
  border-radius: 4px;
}

/* 卡片阴影效果 */
.el-card {
  transition: all 0.3s ease;
}

.el-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 增加卡片内部间距 */
.el-card__body {
  padding: 24px;
}

/* 表单样式优化 */
.el-form-item {
  margin-bottom: 22px;
  margin-right: 24px;
}

.el-form-item__label {
  font-weight: 500;
  color: #606266;
  padding-right: 12px;
}
</style>