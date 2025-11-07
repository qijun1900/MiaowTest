<template>
    <div class="exam-file-manage">
        <el-card class="exam-info-card" shadow="never">
            <template #header>
                <div class="card-header">
                    <span>考试信息</span>
                </div>
            </template>
            <el-descriptions :column="3" border>
                <el-descriptions-item label="科目名称">
                    {{ appStore.examInfo.name }}
                </el-descriptions-item>
                <el-descriptions-item label="科目代码">
                    {{ appStore.examInfo.code }}
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">
                    {{ formatTime.getTime2(appStore.examInfo.createdTime) }}
                </el-descriptions-item>
            </el-descriptions>
        </el-card>

        <el-card class="file-manage-card" shadow="never">
            <template #header>
                <div class="card-header">
                    <span>网盘资料管理</span>
                    <el-button type="primary" @click="handleAdd">添加网盘资料</el-button>
                </div>
            </template>

            <div class="filter-container">
                <el-form :inline="true" :model="searchForm" class="search-form">
                    <el-form-item label="资料名称">
                        <el-input v-model="searchForm.title" placeholder="请输入资料名称" clearable />
                    </el-form-item>
                    <el-form-item label="网盘类型">
                        <el-select v-model="searchForm.diskType" placeholder="请选择网盘类型" clearable>
                            <el-option label="夸克网盘" :value="1" />
                            <el-option label="百度网盘" :value="2" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="发布状态">
                        <el-select v-model="searchForm.isPublish" placeholder="请选择发布状态" clearable>
                            <el-option label="已发布" :value="true" />
                            <el-option label="未发布" :value="false" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleSearch">搜索</el-button>
                        <el-button @click="resetSearch">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>

            <el-table :data="tableData" style="width: 100%" v-loading="loading"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="title" label="资料名称" min-width="150" />
                <el-table-column prop="diskType" label="网盘类型" width="120">
                    <template #default="scope">
                        <el-tag :type="scope.row.type === 1 ? 'success' : 'primary'">
                            {{ scope.row.diskType === 1 ? '夸克网盘' : '百度网盘' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="url" label="链接" min-width="200" show-overflow-tooltip />
                <el-table-column prop="isPublish" label="发布状态" width="100">
                    <template #default="scope">
                        <el-switch v-model="scope.row.isPublish" @change="handlePublishChange(scope.row)" />
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="180">
                    <template #default="scope">
                        {{ formatTime.getTime2(scope.row.createTime) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180" fixed="right">
                    <template #default="scope">
                        <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
                    批量删除
                </el-button>
                <div class="pagination">
                    <Pagination :total="total" v-model:current-page="currentPage" v-model:page-size="pageSize"
                        @page-change="handlePageChange" />
                </div>
            </div>
        </el-card>

        <!-- 添加/编辑对话框 -->
        <Dialog 
            :DilogTitle="isEditMode ? '编辑网盘资料' : '添加网盘资料'" 
            :DilogButContent="isEditMode ? '编辑' : '添加'"
            v-model="dialogVisible" 
            :draggable="true" 
            DilogWidth="600px"
            @dialogConfirm="handleSubmit">
            <template #dialogcontent>
                <el-form ref="formRef" 
                    :model="formData" 
                    :rules="formRules" 
                    label-width="100px">
                    <el-form-item label="资料名称" prop="title">
                        <el-input v-model="formData.title" placeholder="请输入资料名称" />
                    </el-form-item>
                    <el-form-item label="网盘类型" prop="type">
                        <el-radio-group 
                            v-model="formData.type">
                            <el-radio :value="1">夸克网盘</el-radio>
                            <el-radio :value="2">百度网盘</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="链接" prop="url">
                        <el-input 
                            v-model="formData.url" 
                            placeholder="请输入网盘链接" />
                    </el-form-item>
                    <el-form-item label="描述">
                        <el-input 
                            v-model="formData.description" 
                            type="textarea" :rows="3" 
                            placeholder="请输入描述信息（可选）" />
                    </el-form-item>
                    <el-form-item label="发布状态">
                        <el-switch v-model="formData.isPublish" />
                    </el-form-item>
                </el-form>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { useAppStore } from '@/stores';
import { ref, reactive, onMounted,defineAsyncComponent } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getNetDiskListAPI, postAddNetDiskAPI, updateNetDisk, deleteOneNetDisk, deleteManyNetDisk, updateNetDiskState } from '@/API/Exam/netDiskAPI.js'
import { useRoute } from 'vue-router'
import formatTime from '@/util/formatTime'
import Pagination from '@/components/ReuseComponents/Pagination.vue'
// 动态导入较大的组件
const Dialog = defineAsyncComponent(() =>
    import('@/components/ReuseComponents/Dialog .vue')
)


const appStore = useAppStore();
const route = useRoute()
const loading = ref(false)
const dialogVisible = ref(false)// 对话框状态
const formRef = ref(null)
const tableData = ref([])
const selectedRows = ref([])
//表格分页器
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
// 添加编辑状态
const isEditMode = ref(false)


// 搜索表单
const searchForm = reactive({
  title: '',
  diskType: null,
  isPublish: null
})

// 添加分页变化处理方法
const handlePageChange = ({ page, size }) => {
    currentPage.value = page
    pageSize.value = size
}

// 表单数据
const formData = reactive({
  title: '',
  type: 1,
  url: '',
  description: '',
  isPublish: false
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入资料名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择网盘类型', trigger: 'change' }
  ],
  url: [
    { required: true, message: '请输入网盘链接', trigger: 'blur' }
  ]
}


// 获取网盘资料列表
const fetchNetDiskList = async () => {
  loading.value = true
  try {
    const res = await getNetDiskListAPI({
        page: currentPage.value,
        size: pageSize.value,
        examId:route.params.id,
    })
    console.log(res)
   
  } catch (error) {
    console.error('获取网盘资料列表失败:', error)
    ElMessage.error('获取网盘资料列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchNetDiskList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    title: '',
    diskType: null,
    isPublish: null
  })
  currentPage.value = 1
  fetchNetDiskList()

}

// 处理添加
const handleAdd = () => {
  Object.assign(formData, {
    title: '',
    type: 1,
    url: '',
    description: '',
    isPublish: false
  })
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  Object.assign(formData, {
    _id: row._id,
    title: row.title,
    type: row.diskType,
    url: row.url,
    description: row.description || '',
    isPublish: row.isPublish
  })
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该网盘资料吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteOneNetDisk(row._id, route.params.examId)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchNetDiskList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条网盘资料吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedRows.value.map(row => row._id)
      const res = await deleteManyNetDisk(ids, route.params.examId)
      if (res.code === 200) {
        ElMessage.success('批量删除成功')
        fetchNetDiskList()
      } else {
        ElMessage.error(res.message || '批量删除失败')
      }
    } catch (error) {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 处理发布状态变更
const handlePublishChange = async (row) => {
  try {
    const res = await updateNetDiskState({
      _id: row._id,
      examId: route.params.examId,
      state: row.isPublish
    })
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
    } else {
      // 恢复原状态
      row.isPublish = !row.isPublish
      ElMessage.error(res.message || '状态更新失败')
    }
  } catch (error) {
    // 恢复原状态
    row.isPublish = !row.isPublish
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
  }
}

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          ...formData,
          examId: route.params.id
        }
        
        let res
        if (formData._id) {
          // 编辑
          res = await updateNetDisk(data)
        } else {
          // 添加
          res = await postAddNetDiskAPI(data)
        }
        console.log(res)
        
        // if (res.code === 200) {
        //   ElMessage.success(formData._id ? '更新成功' : '添加成功')
        //   dialogVisible.value = false
        //   fetchNetDiskList()
        // } else {
        //   ElMessage.error(res.message || (formData._id ? '更新失败' : '添加失败'))
        // }
      } catch (error) {
        console.error(formData._id ? '更新失败:' : '添加失败:', error)
        ElMessage.error(formData._id ? '更新失败' : '添加失败')
      }
    }
  })
}

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 初始化
onMounted(() => {
  // 获取网盘资料列表
  fetchNetDiskList()
})
</script>

<style scoped>
.exam-file-manage {
  padding: 10px;
}

.exam-info-card {
  margin-bottom: 20px;
}

.file-manage-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
