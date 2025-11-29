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
                        label: '科目名称',
                        placeholder: '请输入科目名称',
                        field: 'nameSearch',  // 存储值的字段名,初始化时会清空
                        fields: ['name'] // 要搜索的字段
                    },
                    {
                        type: 'input',
                        label: '科目代码',
                        placeholder: '请输入科目代码',
                        field: 'codeSearch',  
                        fields: ['_id']// 要搜索的字段,csID
                    },
                    {
                        type: 'select',
                        label: '科目状态',
                        placeholder: '请选择科目状态',
                        field: 'isPublishFilter',
                        fields: ['isPublish'],
                        options: isPublishOptions
                    }
                ]" 
                @onsearch="handleOnSearch" />
            </el-card>
        </transition>
        <div class="eidt-card">
            <el-card style="border-radius: 4px," shadow="never">
                <div class="edit-btn">
                    <el-row :gutter="20" type="flex" justify="space-between" align="middle">
                        <el-col :xs="24" :sm="24" :md="18" :lg="18" :xl="18" class="left-buttons">
                            <el-button 
                                type="success" 
                                plain 
                                @click="handleAdd">新建科目
                            </el-button>
                            <Popconfirm
                                :title="`您确定删除选中的 ${selectedRows ? selectedRows.length : 0} 个科目吗？删除后不可恢复！`"
                                @confirm="handleDeleteMany">
                                <el-button type="danger" 
                                    plain 
                                    :disabled="!selectedRows || selectedRows.length === 0 || isDeleting"
                                    :loading="isDeleting">删除科目
                                </el-button>
                            </Popconfirm>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6" class="right-buttons">
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
                                        @click="handleRefreshExamData" />
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
                :stripe="IsOpenStripe"
                v-loading="tableLoading"
                element-loading-text="加载中...">
                <el-table-column type="selection" width="40" />
                <el-table-column 
                    type="index" 
                    label="序号" 
                    width="60" 
                    :index="(index) => index + 1" />
                <el-table-column label="科目名称" width="140">
                    <template #default="scope">
                        {{ scope.row.name }}
                    </template>
                </el-table-column>
                <el-table-column label="科目代码" width="140">
                    <template #default="scope">
                        <el-button 
                            plain 
                            type="info" 
                            @click="handleLooked(scope.row.code)">科目代码</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="科目题库" width="280">
                    <template #default="scope">
                        <div class="question-tags-container">
                            <el-check-tag 
                                v-for="value in scope.row.category" 
                                :key="value"
                                class="question-tag"
                                @click="handleCheckQuestion(scope.row,value)">
                                <el-icon class="tag-icon"><Histogram /></el-icon>
                                {{ getCategoryName(value) }}
                            </el-check-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="120">
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
                <el-table-column label="创建者" width="140">
                    <template #default="scope">
                        {{ scope.row.creator }}
                    </template>
                </el-table-column>
                <el-table-column label="更新时间" width="180">
                    <template #default="scope">
                        {{ formatTime.getTime2(scope.row.createdTime) }}
                    </template>
                </el-table-column>
                <el-table-column 
                    label="操作"
                    fixed="right"
                    min-width="380"
                    >
                    <template #default="scope">
                        <el-button 
                            type="primary" 
                            plain 
                            @click="handleEdit(scope.row)">
                            编辑
                        </el-button>
                        <Popconfirm 
                            :title="`您确定删除科目「${scope.row.name}」吗？删除后不可恢复！`" 
                            @confirm="handleDeleteOne(scope.row)">
                            <el-button 
                                type="danger" 
                                plain
                                :loading="isDeleting">
                                删除
                            </el-button>
                        </Popconfirm>
                        <el-button 
                            type="success" 
                            plain 
                            @click="handleEdit(scope.row)">
                            仪表盘
                        </el-button>
                        <el-button 
                            color="#626aef"
                            type="info" 
                            plain 
                            @click="handleCreate(scope.row)">
                            考试/资料
                            <el-icon><CirclePlusFilled /></el-icon>
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>  
        </div>
        <div class="pagination">
            <Pagination 
                :total="total"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                @page-change="handlePageChange"/>
        </div>
    </div>
    <Dialog
        :DilogTitle="isEditMode ? '编辑科目' : '新增科目'" 
        :DilogButContent="isEditMode ? '提交更改' : '添加科目'"
        DilogWidth="900px"
        :draggable="true" 
        top="6vh" 
        v-model="dialogVisible"
        @dialog-confirm="handleConfirm">
        <template #dialogcontent>
            <el-form 
                ref="subjectFormRef" 
                :model="subjectForm" 
                :rules="subjectFormrules"
                label-position="top"
                class="subject-form">
                <el-row :gutter="24">
                    <el-col :span="12">
                        <el-form-item label="科目名称" prop="name">
                            <el-input 
                                v-model="subjectForm.name" 
                                placeholder="请输入科目名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="科目代码" prop="code">
                            <el-input 
                                v-model="subjectForm.code" 
                                placeholder="请输入科目代码"/>
                        </el-form-item>
                    </el-col>
                </el-row>
                
                <el-form-item label="题目类型" prop="category">
                    <el-select
                        v-model="subjectForm.category"
                        multiple
                        value-format="number"  
                        placeholder="请选择题库题目类型"
                        class="full-width-select">
                        <el-option
                            v-for="item in questionOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"/>
                    </el-select>
                </el-form-item>

                <el-form-item label="考试年份" prop="year">
                    <el-date-picker
                        v-model="subjectForm.year"
                        type="year"
                        value-format="YYYY"
                        placeholder="选择年份"
                        style="width: 100%"
                    />
                </el-form-item>

                <el-form-item label="开考时间" prop="day">
                    <el-date-picker
                    v-model="subjectForm.day"
                    type="date"
                    placeholder="选择考试时间"/>
                </el-form-item>
                
                <el-form-item label="封面图片" prop="cover">
                    <Upload 
                        height="240px" 
                        width="160px" 
                        :avatar="subjectForm.cover" 
                        @AvatarChange="handleChange" />
                </el-form-item>
            </el-form>
        </template>
    </Dialog>
</template>
<script setup>
import SearchFilter from '@/components/FunComponents/SearchFilter.vue'
import { RefreshRight, Hide, Open,Histogram ,CirclePlusFilled} from '@element-plus/icons-vue'
import Tooltip from '@/components/ReuseComponents/Tooltip.vue'
import { useTableState } from '@/composables/State/useTableState'
import { useTableActions } from '@/composables/Action/useTableActions'
import Popconfirm from '@/components/ReuseComponents/Popconfirm.vue'
import {ref,reactive ,defineAsyncComponent,onMounted} from 'vue'
import formatTime from '@/util/formatTime'
import Pagination from '@/components/ReuseComponents/Pagination.vue'
import { useAppStore } from '@/stores';
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
        postAddExam,
        getExamList,
        postUpdateExam,
        updateExamStatus,
        PostDeleteOneExam,
        PostDeleteManyExam
    } 
from '@/API/Exam/subjectAPI'//api
import { getCategoryName } from '@/util/formatExamname'
import handleLooked from '@/util/CheckInfo'
import RouterPush from '@/util/RouterPush'

// 动态导入较大的组件
const Dialog = defineAsyncComponent(() =>
    import('@/components/ReuseComponents/Dialog .vue')
)
const Upload = defineAsyncComponent(() =>
    import('@/components/upload/Upload.vue')
)
//pinia
const appStore = useAppStore()
//tableData数据
const tableData = ref([]);
// 表格加载状态
const tableLoading = ref(false);
// 对话框状态
const dialogVisible = ref(false)
// 添加编辑状态
const isEditMode = ref(false)
const currentEditId = ref(null)
//表格分页器
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
// 删除操作冷却状态
const isDeleting = ref(false)
// 删除操作冷却时间（毫秒）
const DELETE_COOLDOWN = 2000

// UI 状态与方法管理
const { showSearch, IsOpenStripe, HandleHideSearch, handleOpenStripe } = useTableState()
// 表格数据与方法管理
const { selectedRows, handleSelectionChange, handleDelete, handleRefresh } = useTableActions()
//表单引用
const subjectFormRef = ref()
//表单
const subjectForm  = reactive({
    name:"",
    code:"",
    category:[],
    year:"",
    isPublish:0,//0:未发布，1：发布
    cover:"",
    file:null,
    day:"",
    creator:appStore.userInfo.username,
})
//规则
const subjectFormrules = reactive({
    name:[
        {
        required: true,
        message: '请输入科目名称',
        trigger: 'blur'
        }
    ],
    code:[
        {
        required: true,
        message: '请输入科目代码',
        trigger: 'blur'
        }
    ],
    category:[
        {
        required: true,
        message: '请添加择题目类别',
        trigger: 'blur'
        }
    ],
    year:[
        {
        required: true,
        message: '请选择年份',
        trigger: 'blur'
        }
    ],
    cover:[
        {
        required: true,
        message: '请选择图片',
        trigger: 'blur' 
        } 
    ]
})
//题型下拉框
const questionOptions = [
  {
    label: '选择类题',
    value: 1,
  },
  {
    label: '填空类题',
    value: 2,
  },
  {
    label: '判断类题',
    value: 3,
  },
  {
    label: '简答类题',
    value: 4,
  },
]
//状态下拉框
const isPublishOptions = [
    {
        label: '未发布',
        value: 0,
    },
    {
        label: '已发布',
        value: 1,
    },
]
//文件上传
const handleChange = (file)=>{
    subjectForm.cover = URL.createObjectURL(file)
    subjectForm.file = file
}
//添加科目
const handleAdd = ()=>{
    dialogVisible.value = true
}
//按下搜索按钮
const handleOnSearch = (data) => {
    if (data.length === 0) {
        ElMessage.error('未搜索到该信息')
    } else {
        tableData.value = data
    }
}
//重置
const handleReset = () => {
    subjectForm.name = ''
    subjectForm.code = ''
    subjectForm.category = []
    subjectForm.year = ''
    subjectForm.isPublish = 0
    subjectForm.cover = ''
    subjectForm.file = null
    subjectForm.day = ''
    subjectForm.creator = appStore.userInfo.username
}
// 添加编辑方法
const handleEdit = (row) => {
    isEditMode.value = true
    currentEditId.value = row._id
    // 填充表单数据
    Object.assign(subjectForm, {
        name: row.name,
        code: row.code,
        category: row.category,
        year: row.year,
        isPublish: row.isPublish,
        cover: row.cover,
        file: null,
        day: row.day,
        creator: row.creator
    })
    dialogVisible.value = true
}
// 添加分页变化处理方法
const handlePageChange = ({ page, size }) => {
    currentPage.value = page
    pageSize.value = size
    handleRefreshExamData()
}
// 处理发布状态变化
const handlePublishChange = async (row) => {
    try {
        const res =await updateExamStatus(row._id,row.isPublish)
        if (res.code === 200) {
            ElMessage.success('考试科目状态更新成功')
        }
    } catch (error) {
        ElMessage.error('状态更新失败')
        console.error(error)
    }
}
//删除单个
const handleDeleteOne = async (row) => {
    // 如果正在删除中，则阻止操作
    if (isDeleting.value) {
        ElMessage.warning('操作过于频繁，请稍后再试')
        return
    }
    
    // 二次验证
    try {
        await ElMessageBox.confirm(
            `请再次确认：您即将删除科目「${row.name}」，此操作不可恢复！`,
            '删除确认',
            {
                confirmButtonText: '确认删除',
                cancelButtonText: '取消',
                type: 'error',
                center: true
            }
        )
    } catch {
        // 用户取消删除
        return
    }
    
    // 设置删除状态
    isDeleting.value = true
    
    try {
        await handleDelete(row, PostDeleteOneExam)
        ElMessage.success('科目删除成功')
        handleRefreshExamData()
    } catch (error) {
        ElMessage.error('删除失败，请稍后重试')
        console.error('删除科目时发生错误:', error)
    } finally {
        // 冷却时间后重置状态
        setTimeout(() => {
            isDeleting.value = false
        }, DELETE_COOLDOWN)
    }
}

//删除多个
const handleDeleteMany = async () => {
    // 如果正在删除中，则阻止操作
    if (isDeleting.value) {
        ElMessage.warning('操作过于频繁，请稍后再试')
        return
    }
    
    // 检查是否有选中的项目
    if (!selectedRows.value || selectedRows.value.length === 0) {
        ElMessage.warning('请先选择要删除的科目')
        return
    }
    
    // 二次验证
    try {
        await ElMessageBox.confirm(
            `请再次确认：您即将删除选中的 ${selectedRows.value.length} 个科目，此操作不可恢复！`,
            '批量删除确认',
            {
                confirmButtonText: '确认删除',
                cancelButtonText: '取消',
                type: 'error',
                center: true
            }
        )
    } catch {
        // 用户取消删除
        return
    }
    
    // 设置删除状态
    isDeleting.value = true
    
    try {
        await handleDelete(selectedRows.value, PostDeleteManyExam)
        ElMessage.success(`成功删除 ${selectedRows.value.length} 个科目`)
        handleRefreshExamData()
    } catch (error) {
        ElMessage.error('批量删除失败，请稍后重试')
        console.error('批量删除科目时发生错误:', error)
    } finally {
        // 冷却时间后重置状态
        setTimeout(() => {
            isDeleting.value = false
        }, DELETE_COOLDOWN)
    }
}
//确认添加
const handleConfirm =async()=>{
    dialogVisible.value = false
    try{
        const submitData = { 
            ...subjectForm, 
            category: JSON.stringify(subjectForm.category) ,// 序列化数组
            _id: currentEditId.value }
        if(isEditMode.value){
            const res = await postUpdateExam(submitData)
            if(res.ActionType==="OK"){
                ElMessage.success("科目修改成功")
                handleRefreshExamData()
                handleReset()
            }
        }else{
            const valid = await subjectFormRef.value.validate()
             if (!valid) {
                ElMessage.error('请填写完整信息')
                return
            }
            const res = await postAddExam(submitData)
            if(res.ActionType==="OK"){
                ElMessage.success("科目添加成功")
                handleRefreshExamData()
                handleReset()
            }else{
                ElMessage.error("科目添加失败")
            }
        }
    }catch(error){
        ElMessage.error(isEditMode.value ? "科目修改失败" : "科目添加失败")
        console.error('提交数据时发生错误:', error)
    }
}
//查看每个科目题型,并跳转到对应页面
const handleCheckQuestion = (data,category) => {
    RouterPush(
        `/exam/questionlist/${data._id}`,
        {category} 
    )
    appStore.changeExamInfo({
        ...data,
        category:category,
    })
}
//创建题目
const handleCreate = (data) => {
    RouterPush(
        `/exam/createExamType/${data._id}`,
    )
    appStore.changeExamInfo({
       ...data,
    })
}
//获取考试列表+刷新+分页
const handleRefreshExamData = async()=>{
    tableLoading.value = true;
    try{
        const res = await handleRefresh({
            page: currentPage.value,
            size: pageSize.value,  
        },getExamList)
        if(res.ActionType==="OK"){
            tableData.value = res.data.data
            total.value = res.data.total
        }
    }catch(error){
        ElMessage.error("获取考试列表失败")
        console.error('获取考试列表时发生错误:', error)
    }finally{
        tableLoading.value = false;
    }
}
onMounted(()=>{
    handleRefreshExamData()
})

</script>

<style scoped>
.eidt-card {
    margin-top: 10px;
}

.edit-btn {
    width: 100%;
}

.left-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    padding: 4px 0;
}

.right-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    padding: 4px 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .left-buttons,
    .right-buttons {
        justify-content: center;
        margin: 8px 0;
    }
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

/* 表单样式 */
.subject-form {
    padding: 0 20px;
}

/* 表单元素间距 */
.subject-form :deep(.el-form-item) {
    margin-bottom: 22px;
}

/* 全宽选择器 */
.full-width-select {
    width: 100%;
}

/* 输入框样式 */
.subject-form :deep(.el-input__inner) {
    border-radius: 4px;
    height: 38px;
}

/* 标签样式 */
.subject-form :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
    padding-bottom: 8px;
}

/* 上传组件容器样式 */
.subject-form :deep(.upload-container) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.3s;
}

.subject-form :deep(.upload-container:hover) {
    border-color: #409eff;
}

.question-tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px 0;
}

.question-tag {
    margin: 0;
    padding: 6px 12px;
    border-radius: 14px;
    font-size: 14px;  /* 增大字体 */
    font-size: 13px;
    transition: all 0.2s ease;
    background-color: #cde8fa;  /* 添加浅蓝色背景 */
}


.question-tag:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.tag-icon {
    margin-right: 4px;
    font-size: 14px;
}
</style>
