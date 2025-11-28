<template>
    <div>
        <transition name="slide-up">
            <el-card 
                style="border-radius: 4px" 
                shadow="never" 
                v-show="showSearch">
                <SearchFilter 
                    :Data="tableData" 
                    :filterConfig="[
                    {
                        type: 'input',
                        label: '模型名称',
                        placeholder: '请输入模型名称',
                        field: 'modelNameSearch',  // 存储值的字段名,初始化时会清空
                        fields: ['modelName'] // 要搜索的字段
                    },
                    {
                        type: 'input',
                        label: '模型值',
                        placeholder: '请输入模型值',
                        field: 'modelValueSearch',  
                        fields: ['modelValue']// 要搜索的字段,csID
                    },
                    {
                        type: 'select',
                        label: '状态',
                        placeholder: '请选择发布状态',
                        field: 'isPublishFilter',
                        fields: ['isPublish'],
                        options: [
                            {
                                label: '未发布',
                                value: 0
                            },
                            {
                                label: '已发布',
                                value: 1
                            },
                        ]
                    },
                ]" 
                @onsearch="handleOnSearch" />
            </el-card>
        </transition>
        <div class="eidt-card">
            <el-card style="border-radius: 4px," shadow="never">
                <div class="edit-btn">
                    <el-row :gutter="200">
                        <el-col :span="18">
                            <el-button 
                                type="success" 
                                plain 
                                @click="handleAdd">增加模型
                            </el-button>
                            <Popconfirm
                                title="您确定删除吗？"
                                @confirm="handleDeleteMany">
                            <el-button type="danger" 
                                plain 
                                :disabled="!selectedRows || selectedRows.length === 0">删除模型
                            </el-button>
                            </Popconfirm>
                        </el-col>
                        <el-col :span="6">
                            <Tooltip content="隐藏/显示搜索">
                                <template #description>
                                    <el-button 
                                        type="primary" 
                                        :icon="Hide" 
                                        circle 
                                        @click="HandleHideSearch" />
                                </template>
                            </Tooltip>
                            <Tooltip content="开启/关闭斑马纹">
                                <template #description>
                                    <el-button 
                                        type="primary" 
                                        :icon="Open" 
                                        circle 
                                        @click="handleOpenStripe" />
                                </template>
                            </Tooltip>
                            <Tooltip content="刷新表格">
                                <template #description>
                                    <el-button 
                                        type="primary" 
                                        :icon="RefreshRight" 
                                        circle
                                        @click="handleRefreshModelData" />
                                </template>
                            </Tooltip>
                        </el-col>
                    </el-row>
                </div>
            </el-card>
        </div>
        <div class="edit-table">
            <el-table 
                :data="tableData" 
                style="width: 100%"
                @selection-change="handleSelectionChange"
                max-height="690"
                :stripe="IsOpenStripe">
                <el-table-column type="selection" width="40" />
                <el-table-column 
                    type="index" 
                    label="序号" 
                    width="60" 
                    :index="(index) => index + 1"/>
                <el-table-column label="模型名称" width="200">
                    <template #default="scope">
                        {{ scope.row.modelName }}
                    </template>
                </el-table-column>
                <el-table-column label="模型值" width="180">
                    <template #default="scope">
                        {{ scope.row.modelValue }}
                    </template>
                </el-table-column>
                <el-table-column 
                    label="描述" 
                    width="280"
                    :show-overflow-tooltip="true"
                    >
                    <template #default="scope">
                        {{ scope.row.description || '无描述' }}
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="150">
                    <template #default="scope">
                        <el-switch
                            size="large"
                            v-model="scope.row.isPublish"
                            inline-prompt
                            :active-value="1"
                            :inactive-value="0"
                            active-text="已发布"
                            inactive-text="未发布"
                            @change="handlePublishChange(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" width="180">
                    <template #default="scope">
                        {{ formatTime.getTime2(scope.row.createTime) }}
                    </template>
                </el-table-column>
                <el-table-column 
                    label="操作"
                    fixed="right"
                    min-width="360"
                >
                    <template #default="scope">
                        <el-button 
                            type="primary" 
                            plain 
                            @click="handleEdit(scope.row)">
                            编辑
                        </el-button>
                        <Popconfirm
                            title="您确定删除吗"
                            @confirm="handleDeleteOne(scope.row)">
                            <el-button 
                                type="danger"
                                plain >
                                删除
                            </el-button>
                        </Popconfirm>
                        <el-button 
                            type="success" 
                            plain 
                            @click="handleChat(scope.row)"
                            :disabled="scope.row.isPublish===0">
                            立即对话
                        </el-button>
                        <el-button 
                            type="info" 
                            plain 
                            @click="handleMore(scope.row)">
                            更多
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="pagination">
            <Pagination 
                DilogWidth="900px"
                :total="total"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                @page-change="handlePageChange"/>
        </div>
        <div>
            <Dialog
            :DilogTitle="isEditMode ? '编辑模型' : '新增模型'" 
            :DilogButContent="isEditMode ? '提交更改' : '添加模型'"
            :draggable="true" 
            DilogWidth="700px"
            v-model="dialogVisible"
            @dialog-confirm="handleConfirm">
                <template #dialogcontent>
                    <el-form 
                        ref="FormRef"
                        :model="Form" 
                        :rules="Formrules">
                    <el-form-item label="模型名称" prop="modelName">
                        <el-input v-model="Form.modelName" placeholder="请输入模型名称"/>
                    </el-form-item>
                    <el-form-item label="模型值" prop="modelValue">
                        <el-input v-model="Form.modelValue" placeholder="请输入模型值"/>
                    </el-form-item>
                    <el-form-item label="描述" prop="description">
                        <el-input 
                        placeholder="请输入描述"
                        v-model="Form.description"  
                        :rows="3"
                        type="textarea"/>
                    </el-form-item>
                    </el-form>
                </template>
            </Dialog>
        </div>
    </div>
</template>
<script setup>
import SearchFilter from '@/components/FunComponents/SearchFilter.vue'
import { RefreshRight, Hide, Open } from '@element-plus/icons-vue'
import Tooltip from '@/components/ReuseComponents/Tooltip.vue'
import { useTableState } from '@/composables/State/useTableState'
import { useTableActions } from '@/composables/Action/useTableActions'
import Popconfirm from '@/components/ReuseComponents/Popconfirm.vue'
import {ref,reactive,defineAsyncComponent,onMounted} from 'vue'
import formatTime from '@/util/formatTime'
import Pagination from '@/components/ReuseComponents/Pagination.vue'
import { ElMessage } from 'element-plus'
import { 
        postAddModel,
        getModelList,
        updateModelPublishStatus,
        postDeleteOneModel,
        postDeleteManyModel,
        postUpdateModel,
    } 
from '@/API/LLM/LLMAPI'//api
import { useAppStore } from '@/stores';
import RouterPush from '@/util/RouterPush'

// 动态导入较大的组件
const Dialog = defineAsyncComponent(() =>
    import('@/components/ReuseComponents/Dialog .vue')
)
// UI 状态与方法管理
const { showSearch, IsOpenStripe, HandleHideSearch, handleOpenStripe } = useTableState()
// 表格数据与方法管理
const { selectedRows, handleSelectionChange, handleDelete, handleRefresh } = useTableActions()

const appStore = useAppStore()
//tableData数据
const tableData = ref([]);
// 对话框状态
const dialogVisible = ref(false)
//表格分页器
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
// 添加编辑状态
const isEditMode = ref(false)
const currentEditId = ref(null)
//表单数据
const Form = reactive({
    modelName: '',
    modelValue: '',
    description: '',
    isPublish: 0,
    creator:appStore.userInfo.username,
})
//FormRef表单引用
const FormRef = ref()
//表单验证规则
const Formrules = reactive({
    modelName: [
        { 
            required: true, 
            message: '请输入模型名称', 
            trigger: 'blur' 
        },
    ],
    modelValue: [
        { 
            required: true, 
            message: '请输入模型值', 
            trigger: 'blur' 
        },
    ],
    description: [
        {
            required: true,
            message: '请输入描述',
            trigger: 'blur'
        },
    ],
})
//重置表单
const resetForm = () => {
    Form.modelName = ''
    Form.modelValue = ''
    Form.description = ''
    Form.isPublish = 0
    isEditMode.value = false
    currentEditId.value = null
}

//按下搜索按钮
const handleOnSearch = (data) => {
    if (data.length === 0) {
        ElMessage.error('未搜索到该信息')
    } else {
        tableData.value = data
    }
}
// 添加分页变化处理方法
const handlePageChange = ({ page, size }) => {
    currentPage.value = page
    pageSize.value = size
    handleRefreshModelData()// 刷新数据，立即向后端请求新数据
}
//删除单个
const handleDeleteOne = async (row) => {
    await handleDelete(row,postDeleteOneModel)
    handleRefreshModelData()

}
//删除多个
const handleDeleteMany = async () => {
    await handleDelete(selectedRows.value,postDeleteManyModel)
    handleRefreshModelData()
}
// 处理发布状态变化
const handlePublishChange = async (row) => {
    try {
        const res =await updateModelPublishStatus(row._id,row.isPublish)
        if (res.code === 200) {
            ElMessage.success('状态更新成功')
        }
    } catch (error) {
        ElMessage.error('状态更新失败')
        console.error(error)
    }
}
// 添加编辑方法
const handleEdit = (row) => {
    dialogVisible.value = true
    isEditMode.value = true
    currentEditId.value = row._id
    Form.modelName = row.modelName
    Form.modelValue = row.modelValue
    Form.description = row.description
}
//添加模型
const handleAdd = ()=>{
    dialogVisible.value = true
}
//跳转对话页面
const handleChat = (row) => {
   RouterPush('/model/chat',{modelValue:row.modelValue})
}
//提交
const handleConfirm = async () => {
    try{
        const submitData = { ...Form, _id: currentEditId.value }
        if(isEditMode.value){
            const res = await postUpdateModel(submitData)
            if (res.code === 200) {
                ElMessage.success('模型更新成功')
                dialogVisible.value = false
                resetForm()
                handleRefreshModelData() // 刷新数据
            }
        }else{
            const valid = await FormRef.value.validate()
            if (!valid) {
                ElMessage.error('请填写完整信息')
                return
            }
            const res = await postAddModel(submitData)
            if (res.code === 200) {
                ElMessage.success('模型添加成功')
                resetForm()
                dialogVisible.value = false
                handleRefreshModelData() // 刷新数据
            }
        }
    }catch (error) {
        console.error('提交失败:', error)
    }
}
//获取列表+刷新
const handleRefreshModelData = async () => {
    try {
        const res = await handleRefresh({
            page: currentPage.value,
            size: pageSize.value,
        },getModelList)
         if(res.code === 200){
            tableData.value = res.data.data
            total.value = res.data.total
        }
    }catch (error) {
        console.error('刷新数据失败:', error)
    }
}
onMounted(() => {
    handleRefreshModelData()
})

</script>
<style scoped>
.eidt-card {
    margin-top: 10px;
}

.edit-table {
    margin-top: 10px;
}

.pagination {
    margin-top: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
}

:deep(.el-table__header th) {
    background-color: #f5f7fa !important;
}

/* 添加滑动过渡效果 */
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease-in-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(-20px);
    opacity: 0;
}





</style>