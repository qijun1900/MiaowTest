<template>
    <div class="wordbooks-container">
        <!-- 搜索区域 -->
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
                            label: '书籍名称',
                            placeholder: '请输入书籍名称',
                            field: 'titleSearch',
                            fields: ['title']
                        },
                        {
                            type: 'input',
                            label: '书籍ID',
                            placeholder: '请输入书籍ID',
                            field: 'bookIdSearch',
                            fields: ['bookId']
                        },
                        {
                            type: 'select',
                            label: '标签筛选',
                            placeholder: '请选择标签',
                            field: 'tagFilter',
                            fields: ['tags'],
                            options: tagOptions
                        }
                    ]" 
                    @onsearch="handleOnSearch" />
            </el-card>
        </transition>

        <!-- 操作按钮区域 -->
        <div class="edit-card">
            <el-card 
                style="border-radius: 4px" 
                shadow="never">
                <div class="edit-btn">
                    <el-row 
                        :gutter="20" 
                        type="flex" 
                        justify="space-between" 
                        align="middle">
                        <el-col :xs="24" :sm="24" :md="18" :lg="18" :xl="18" class="left-buttons">
                            <Popconfirm
                                :title="`您确定删除选中的 ${selectedRows ? selectedRows.length : 0} 本词书吗？删除后不可恢复！`"
                                @confirm="handleDeleteMany">
                                <el-button 
                                    type="danger" 
                                    plain 
                                    :disabled="!selectedRows || selectedRows.length === 0 || isDeleting"
                                    :loading="isDeleting">
                                    批量删除
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
                                        @click="handleRefreshData" />
                                </template>
                            </Tooltip>
                        </el-col>
                    </el-row>
                </div>
            </el-card>
        </div>

        <!-- 表格区域 -->
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
                    :index="(index) => (currentPage - 1) * pageSize + index + 1" 
                    />
                
                <el-table-column label="书籍ID" width="140" prop="bookId">
                    <template #default="scope">
                        <el-tag type="info">{{ scope.row.bookId }}</el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="书籍名称" min-width="200" prop="title" show-overflow-tooltip>
                    <template #default="scope">
                        <div class="book-title">
                            <el-icon class="book-icon"><Reading /></el-icon>
                            <span>{{ scope.row.title }}</span>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="标签" width="200">
                    <template #default="scope">
                        <div class="tags-container">
                            <el-tag 
                                v-for="(tag, index) in scope.row.tags" 
                                :key="index"
                                :type="getTagType(tag)"
                                size="small"
                                class="tag-item">
                                {{ tag }}
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="单词数量" width="120" prop="words" sortable>
                    <template #default="scope">
                        <el-statistic 
                            :value="scope.row.words" 
                            :precision="0"
                            class="statistic-item">
                            <template #suffix>
                                <span class="statistic-suffix">词</span>
                            </template>
                        </el-statistic>
                    </template>
                </el-table-column>

                <el-table-column label="背诵人数" width="140" prop="reciteCount" sortable>
                    <template #default="scope">
                        <el-statistic 
                            :value="scope.row.reciteCount" 
                            :precision="0"
                            class="statistic-item">
                            <template #prefix>
                                <el-icon class="statistic-icon"><TrendCharts /></el-icon>
                            </template>
                        </el-statistic>
                    </template>
                </el-table-column>

                <el-table-column label="创建时间" width="160" prop="createdAt" sortable>
                    <template #default="scope">
                        <div class="time-cell">
                            <el-icon><Clock /></el-icon>
                            <span>{{ formatTime.formatTime(scope.row.createdAt) }}</span>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="更新时间" width="160" prop="updatedAt" sortable>
                    <template #default="scope">
                        <div class="time-cell">
                            <el-icon><Clock /></el-icon>
                            <span>{{ formatTime.formatTime(scope.row.updatedAt) }}</span>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column 
                    label="操作"
                    fixed="right"
                    min-width="240"
                    >
                    <template #default="scope">
                        <el-button 
                            type="primary" 
                            plain 
                            @click="handleEdit(scope.row)">
                            编辑
                        </el-button>
                        <Popconfirm 
                            :title="`您确定删除词书「${scope.row.title}」吗？删除后不可恢复！`" 
                            @confirm="handleDeleteOne(scope.row)">
                            <el-button 
                                type="danger" 
                                plain
                                :loading="isDeleting">
                                删除
                            </el-button>
                        </Popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 分页器 -->
        <div class="pagination">
            <Pagination 
                :total="total"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                @page-change="handlePageChange"/>
        </div>

        <!-- 编辑对话框 -->
        <Dialog
            :DilogTitle="'编辑词书信息'" 
            :DilogButContent="'提交更改'"
            DilogWidth="700px"
            :draggable="true" 
            top="8vh" 
            v-model="dialogVisible"
            @dialog-confirm="handleConfirm">
            <template #dialogcontent>
                <el-form 
                    ref="bookFormRef" 
                    :model="bookForm" 
                    :rules="bookFormRules"
                    label-position="top"
                    class="book-form">
                    <el-form-item label="书籍ID" prop="bookId">
                        <el-input 
                            v-model="bookForm.bookId" 
                            placeholder="书籍ID"
                            disabled />
                    </el-form-item>

                    <el-form-item label="书籍名称" prop="title">
                        <el-input 
                            v-model="bookForm.title" 
                            placeholder="请输入书籍名称" />
                    </el-form-item>

                    <el-form-item label="标签" prop="tags">
                        <el-select
                            v-model="bookForm.tags"
                            multiple
                            filterable
                            allow-create
                            default-first-option
                            placeholder="请选择或输入标签"
                            style="width: 100%">
                            <el-option
                                v-for="item in allTags"
                                :key="item"
                                :label="item"
                                :value="item"/>
                        </el-select>
                    </el-form-item>

                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="单词数量" prop="words">
                                <el-input-number 
                                    v-model="bookForm.words" 
                                    :min="0"
                                    :step="1"
                                    style="width: 100%" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="背诵人数" prop="reciteCount">
                                <el-input-number 
                                    v-model="bookForm.reciteCount" 
                                    :min="0"
                                    :step="1"
                                    style="width: 100%" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                
                    <el-form-item label="封面图片" prop="cover">
                        <Upload 
                            height="250px" 
                            width="180px" 
                            :avatar="bookForm.cover" 
                            @AvatarChange="handleChange" />
                    </el-form-item>
                </el-form>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, defineAsyncComponent } from 'vue'
import { RefreshRight, Hide, Open, Clock, Reading, TrendCharts } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchFilter from '@/components/FunComponents/SearchFilter.vue'
import Tooltip from '@/components/ReuseComponents/Tooltip.vue'
import Pagination from '@/components/ReuseComponents/Pagination.vue'
import Popconfirm from '@/components/ReuseComponents/Popconfirm.vue'
import { useTableState } from '@/composables/State/useTableState'
import { useTableActions } from '@/composables/Action/useTableActions'
import formatTime from '@/util/formatTime'
import { 
    getWordBooksList, 
    deleteOneWordBook, 
    deleteManyWordBooks,
    updateWordBook 
} from '@/API/WordBooks/wordBooksAPI'

// 动态导入对话框组件
const Dialog = defineAsyncComponent(() =>
    import('@/components/ReuseComponents/Dialog .vue')
)

const Upload = defineAsyncComponent(() =>
    import('@/components/upload/Upload.vue')
)

// 表格数据
const tableData = ref([])
// 原始数据备份（用于搜索恢复）
const originalTableData = ref([])
// 表格加载状态
const tableLoading = ref(false)
// 对话框状态
const dialogVisible = ref(false)
// 当前编辑的词书ID
const currentEditId = ref(null)
// 删除操作冷却状态
const isDeleting = ref(false)
// 删除操作冷却时间（毫秒）
const DELETE_COOLDOWN = 2000

// 分页器
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// UI 状态与方法管理
const { showSearch, IsOpenStripe, HandleHideSearch, handleOpenStripe } = useTableState()
// 表格数据与方法管理
const { selectedRows, handleSelectionChange, handleDelete, handleRefresh } = useTableActions()

// 标签选项
const tagOptions = [
    { label: '四级', value: '四级' },
    { label: '六级', value: '六级' },
    { label: '考研', value: '考研' },
    { label: '专四', value: '专四' },
    { label: '专八', value: '专八' },
    { label: '有道', value: '有道' },
    { label: '新东方', value: '新东方' }
]

// 所有可用标签
const allTags = computed(() => {
    const tags = new Set()
    tagOptions.forEach(option => tags.add(option.value))
    originalTableData.value.forEach(book => {
        if (book.tags && Array.isArray(book.tags)) {
            book.tags.forEach(tag => tags.add(tag))
        }
    })
    return Array.from(tags)
})

// 表单引用
const bookFormRef = ref()

// 表单数据
const bookForm = reactive({
    bookId: '',
    title: '',
    tags: [],
    words: 0,
    reciteCount: 0,
    cover: '',
    file: null
})

// 表单验证规则
const bookFormRules = reactive({
    title: [
        {
            required: true,
            message: '请输入书籍名称',
            trigger: 'blur'
        }
    ],
    tags: [
        {
            type: 'array',
            required: true,
            message: '请至少选择一个标签',
            trigger: 'change'
        }
    ],
    words: [
        {
            required: true,
            message: '请输入单词数量',
            trigger: 'blur'
        }
    ],
    reciteCount: [
        {
            required: true,
            message: '请输入背诵次数',
            trigger: 'blur'
        }
    ]
})

/**
 * 根据标签获取对应的类型样式
 */
const getTagType = (tag) => {
    const tagTypeMap = {
        '四级': 'primary',
        '六级': 'success',
        '考研': 'warning',
        '专四': 'danger',
        '专八': 'info',
        '有道': 'info',
        '新东方': "info"
    }
    return tagTypeMap[tag] || undefined
}

/**
 * 搜索处理
 */
const handleOnSearch = (data) => {
    if (data.length === 0) {
        ElMessage.error('未搜索到该信息')
        // 恢复原始数据
        tableData.value = [...originalTableData.value]
    } else {
        tableData.value = data
    }
}

/**
 * 编辑词书
 */
const handleEdit = (row) => {
    currentEditId.value = row._id
    // 填充表单数据
    Object.assign(bookForm, {
        bookId: row.bookId,
        title: row.title,
        tags: row.tags || [],
        words: row.words || 0,
        reciteCount: row.reciteCount || 0,
        cover: row.cover || '',
        file: null
    })
    dialogVisible.value = true
}

/**
 * 确认编辑
 */
const handleConfirm = async () => {
    try {
        // 表单验证
        const valid = await bookFormRef.value.validate()
        if (!valid) {
            ElMessage.error('请填写完整信息')
            return
        }

        dialogVisible.value = false
        tableLoading.value = true

        const submitData = {
            _id: currentEditId.value,
            ...bookForm
        }

        const res = await updateWordBook(submitData)

        if (res.ActionType === 'OK') {
            ElMessage.success('词书信息更新成功')
            await handleRefreshData()
            resetForm()
        } else {
            ElMessage.error('词书信息更新失败')
        }
    } catch (error) {
        ElMessage.error('提交失败，请稍后重试')
        console.error('更新词书时发生错误:', error)
    } finally {
        tableLoading.value = false
    }
}

/**
 * 处理封面图片更改
 */
const handleChange = (file)=>{
    bookForm.cover = URL.createObjectURL(file)
    bookForm.file = file
}

/**
 * 重置表单
 */
const resetForm = () => {
    bookForm.bookId = ''
    bookForm.title = ''
    bookForm.tags = []
    bookForm.words = 0
    bookForm.reciteCount = 0
    currentEditId.value = null
}

/**
 * 删除单个词书
 */
const handleDeleteOne = async (row) => {
    // 如果正在删除中，则阻止操作
    if (isDeleting.value) {
        ElMessage.warning('操作过于频繁，请稍后再试')
        return
    }

    // 二次验证
    try {
        await ElMessageBox.confirm(
            `请再次确认：您即将删除词书「${row.title}」，此操作不可恢复！`,
            '删除确认',
            {
                confirmButtonText: '确认删除',
                cancelButtonText: '取消',
                type: 'error',
                center: true
            }
        )
    } catch {
        return
    }

    // 设置删除状态
    isDeleting.value = true

    try {
        await handleDelete(row, deleteOneWordBook)
        ElMessage.success('词书删除成功')
        await handleRefreshData()
    } catch (error) {
        ElMessage.error('删除失败，请稍后重试')
        console.error('删除词书时发生错误:', error)
    } finally {
        setTimeout(() => {
            isDeleting.value = false
        }, DELETE_COOLDOWN)
    }
}

/**
 * 批量删除词书
 */
const handleDeleteMany = async () => {
    // 如果正在删除中，则阻止操作
    if (isDeleting.value) {
        ElMessage.warning('操作过于频繁，请稍后再试')
        return
    }

    // 检查是否有选中的项目
    if (!selectedRows.value || selectedRows.value.length === 0) {
        ElMessage.warning('请先选择要删除的词书')
        return
    }

    // 二次验证
    try {
        await ElMessageBox.confirm(
            `请再次确认：您即将删除选中的 ${selectedRows.value.length} 本词书，此操作不可恢复！`,
            '批量删除确认',
            {
                confirmButtonText: '确认删除',
                cancelButtonText: '取消',
                type: 'error',
                center: true
            }
        )
    } catch {
        return
    }

    // 设置删除状态
    isDeleting.value = true

    try {
        await handleDelete(selectedRows.value, deleteManyWordBooks)
        ElMessage.success(`成功删除 ${selectedRows.value.length} 本词书`)
        await handleRefreshData()
    } catch (error) {
        ElMessage.error('批量删除失败，请稍后重试')
        console.error('批量删除词书时发生错误:', error)
    } finally {
        setTimeout(() => {
            isDeleting.value = false
        }, DELETE_COOLDOWN)
    }
}

/**
 * 刷新表格数据
 */
const handleRefreshData = async () => {
    tableLoading.value = true
    try {
        const res = await handleRefresh({
            page: currentPage.value,
            size: pageSize.value
        }, getWordBooksList)
        
        if (res.ActionType === 'OK') {
            tableData.value = res.data.data || []
            originalTableData.value = [...tableData.value]
            total.value = res.data.total || 0
        } else {
            ElMessage.error('获取词书列表失败')
        }
    } catch (error) {
        ElMessage.error('获取词书列表失败')
        console.error('获取词书列表时发生错误:', error)
    } finally {
        tableLoading.value = false
    }
}

/**
 * 分页变化处理
 */
const handlePageChange = ({ page, size }) => {
    currentPage.value = page
    pageSize.value = size
    handleRefreshData()
}

// 组件挂载时获取数据
onMounted(() => {
    handleRefreshData()
})
</script>

<style scoped>
.wordbooks-container {
    padding: 0;
}

.edit-card {
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

/* 表格样式 */
:deep(.el-table__header th) {
    background-color: #f5f7fa !important;
    font-size: 15px;
    font-weight: 600;
    padding: 16px 0;
    height: 60px;
}

:deep(.el-table__body td) {
    padding: 16px 0;
    height: 60px;
}

:deep(.el-table) {
    font-size: 15px;
}

:deep(.el-table__row) {
    height: 60px;
}

/* 书籍标题样式 */
.book-title {
    display: flex;
    align-items: center;
    gap: 8px;
}

.book-icon {
    color: #409eff;
    font-size: 16px;
}

/* 标签容器 */
.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.tag-item {
    margin: 0;
    font-size: 12px;
}

/* 统计数字样式 */
.statistic-item {
    display: inline-flex;
    align-items: center;
}

.statistic-item :deep(.el-statistic__content) {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
}

.statistic-suffix {
    font-size: 12px;
    color: #909399;
    margin-left: 4px;
}

.statistic-icon {
    color: #67c23a;
    margin-right: 4px;
}

/* 时间单元格样式 */
.time-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #606266;
}

.time-cell .el-icon {
    color: #909399;
}

/* 滑动过渡效果 */
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
.book-form {
    padding: 0 20px;
}

.book-form :deep(.el-form-item) {
    margin-bottom: 22px;
}

.book-form :deep(.el-input__inner) {
    border-radius: 4px;
}

.book-form :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
    padding-bottom: 8px;
}

/* 加载动画优化 */
:deep(.el-loading-mask) {
    background-color: rgba(255, 255, 255, 0.8);
}

:deep(.el-loading-spinner .el-loading-text) {
    color: #409eff;
    font-weight: 500;
}

/* 表格行悬停效果 */
:deep(.el-table__row:hover) {
    background-color: #f5f7fa;
    transition: background-color 0.3s ease;
}

/* 按钮组样式优化 */
.el-button + .el-button {
    margin-left: 12px;
}

:deep(.el-table__fixed-right .el-button + .el-button) {
    margin-left: 12px;
}

/* 空状态样式 */
:deep(.el-table__empty-block) {
    padding: 60px 0;
}

:deep(.el-table__empty-text) {
    color: #909399;
    font-size: 14px;
}

/* 选择框样式 */
:deep(.el-table__column--selection .el-checkbox) {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 数字输入框样式 */
:deep(.el-input-number) {
    width: 100%;
}

:deep(.el-input-number .el-input__inner) {
    text-align: left;
}

/* 多选标签样式 */
:deep(.el-select__tags) {
    flex-wrap: wrap;
}

:deep(.el-tag.el-tag--info) {
    background-color: #f4f4f5;
    border-color: #e9e9eb;
    color: #909399;
}

/* 响应式表格 */
@media (max-width: 1200px) {
    .edit-table :deep(.el-table) {
        font-size: 13px;
    }
    
    .statistic-item :deep(.el-statistic__content) {
        font-size: 13px;
    }
}

/* 打印样式优化 */
@media print {
    .edit-card,
    .pagination,
    .el-table__column--selection,
    .el-table__fixed-right {
        display: none !important;
    }
}
</style>
