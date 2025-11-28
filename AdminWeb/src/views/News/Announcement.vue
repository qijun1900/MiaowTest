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
                        label: '标题',
                        placeholder: '请输入搜索标题',
                        field: 'titleSearch',  // 存储值的字段名,初始化时会清空
                        fields: ['title'] // 要搜索的字段
                    },
                    {
                        type: 'select',
                        label: '公告类型',
                        placeholder: '请选择公告类型',
                        field: 'categoryFilter',
                        fields: ['category'],
                        options: options
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
                    <el-row :gutter="20" type="flex" justify="space-between" align="middle">
                        <el-col :xs="24" :sm="24" :md="18" :lg="18" :xl="18" class="left-buttons">
                            <el-button type="success" plain @click="handleAddNews">新增信息</el-button>
                            <Popconfirm
                                title="您确定删除吗"
                                @confirm="handleDeleteMany">
                            <el-button 
                                type="danger" 
                                :disabled="!selectedRows || selectedRows.length === 0" 
                                plain>删除信息
                            </el-button>
                            </Popconfirm>
                        </el-col>
                        <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6" class="right-buttons">
                            <Tooltip content="隐藏/开启搜索">
                                <template #description>
                                    <el-button type="primary" :icon="Hide" circle @click="HandleHideSearch" />
                                </template>
                            </Tooltip>
                            <Tooltip content="开启/关闭斑马纹">
                                <template #description>
                                    <el-button type="primary" :icon="Open" circle @click="handleOpenStripe" />
                                </template>
                            </Tooltip>
                            <Tooltip content="刷新表格">
                                <template #description>
                                    <el-button 
                                        type="primary" 
                                        :icon="RefreshRight" 
                                        circle 
                                        @click="handleRefreshAnData" />
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
                max-height="690" 
                :stripe="IsOpenStripe"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column type="index" label="序号" width="70" :index="(index) => index + 1" />
                <el-table-column label="信息标题" width="180">
                    <template #default="scope">
                        {{ scope.row.title }}
                    </template>
                </el-table-column>
                <el-table-column label="信息内容" width="190">
                    <template #default="scope">
                        <el-button plain type="info" @click="handleLooked(scope.row.content)">{{scope.row.category==1?"公告":"通知"}}内容</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="公告类型" width="140">
                    <template #default="scope">
                        <el-tag v-if="scope.row.category === 1" type="success">公告</el-tag>
                        <el-tag v-else-if="scope.row.category === 2" type="warning">通知</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="150">
                    <template #default="scope">
                        <el-switch
                            v-model="scope.row.isPublish"
                            inline-prompt
                            size="large"
                            :active-value="1"
                            :inactive-value="0"
                            active-text="已发布"
                            inactive-text="未发布"
                            @change="handlePublishChange(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="创建者" width="150">
                    <template #default="scope">
                        {{ scope.row.creator }}
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" width="200">
                    <template #default="scope">
                        {{ formatTime.getTime2(scope.row.createTime) }}
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
                            title="您确定删除吗"
                            @confirm="handleDeleteOne(scope.row)">
                            <el-button 
                                type="danger"
                                plain >
                                删除
                            </el-button>
                        </Popconfirm>
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
                :total="total"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                @page-change="handlePageChange"/>
        </div>
    </div>
    <div>
        <Dialog 
            :DilogTitle="isEditMode ? '编辑通知/公告' : '新增通知/公告'" 
            :DilogButContent="isEditMode ? '提交更改' : '添加通知/公告'"
            DilogWidth="1090px" 
            :draggable="true" 
            top="2vh" 
            v-model="dialogVisible"
            @dialog-confirm="handleConfirm">
            <template #dialogcontent>
                <el-form 
                    ref="FormRef" 
                    :model="Form" 
                    :rules="Formrules">
                    <el-form-item label="信息标题" prop="title">
                        <el-input v-model="Form.title" />
                    </el-form-item>
                    <el-form-item label="类别" prop="category">
                        <el-select 
                            v-model="Form.category" 
                            placeholder="Select" 
                            style="width: 280px">
                            <el-option 
                                v-for="item in options" 
                                :key="item.value" 
                                :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="内容" prop="content">
                        <Editor 
                            @event="handlechange" 
                            :height="300" 
                            :content="Form.content"/>
                    </el-form-item>
                    <el-form-item label="封面" prop="cover">
                        <Upload 
                            height="220px" 
                            width="380px" 
                            :avatar='Form.cover' 
                            @AvatarChange="handleChange" />
                    </el-form-item>
                </el-form>
            </template>
        </Dialog>
    </div>
</template>
<script setup>
import {RefreshRight, Hide, Open } from '@element-plus/icons-vue'
import { useTableState } from '@/composables/State/useTableState'
import Tooltip from '@/components/ReuseComponents/Tooltip.vue'
import { useTableActions } from '@/composables/Action/useTableActions'
import Pagination from '@/components/ReuseComponents/Pagination.vue'
import { ref, defineAsyncComponent, reactive,onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Editor from '@/components/FunComponents/Editor.vue'
import {
    postAddAnnouncement,
    getAnnouncementList,
    PostDeleteManyAnnouncement,
    PostDeleteOneAnnouncement,
    updateAnnouncementPublishStatus,
    postEditAnnouncement
    } from '@/API/News/announcementAPI'//APi
import { useAppStore } from '@/stores';
import formatTime from '@/util/formatTime'
import Popconfirm from '@/components/ReuseComponents/Popconfirm.vue'
import SearchFilter from '@/components/FunComponents/SearchFilter.vue'
import handleLooked from '@/util/CheckInfo'
// 动态导入较大的组件
const Dialog = defineAsyncComponent(() =>
    import('@/components/ReuseComponents/Dialog .vue')
)
const Upload = defineAsyncComponent(() =>
    import('@/components/upload/Upload.vue')
)
//store
const appStore = useAppStore()
//tableData数据
const tableData = ref([]);
// 对话框状态
const dialogVisible = ref(false)
// 添加编辑状态
const isEditMode = ref(false)
const currentEditId = ref(null)
//UI 状态与方法管理
const { showSearch, IsOpenStripe, HandleHideSearch, handleOpenStripe } = useTableState()
// 表格数据与方法管理
const { selectedRows, handleSelectionChange, handleDelete, handleRefresh } = useTableActions()
//表单
const FormRef = ref()
const Form = reactive({
    title: "",
    content: "",
    category: 1,//1:通知，2：公告
    cover: "",
    file: null,
    isPublish: 0,//0:未发布，1：发布，（状态）
    creator:appStore.userInfo.username,
})
const Formrules = reactive({
    title: [
        {
            required: true,
            message: '请输入标题',
            trigger: 'blur'
        }
    ],
    content: [
        {
            required: true,
            message: '请输入内容',
            trigger: 'blur'
        }
    ],
    category: [
        {
            required: true,
            message: '请选择分类',
            trigger: 'blur'
        }
    ],
    cover: [
        {
            required: true,
            message: '请选择图片',
            trigger: 'blur'
        }
    ],

})
//类别选择字段
const options = [
    {
        label: '公告',
        value: 1
    },
    {
        label: '通知',
        value: 2
    },
]
//表格分页器
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
//editor内容改变的回调
const handlechange = (data) => {
    Form.content = data
}
//上传图片
const handleChange = (file) => {
    Form.cover = URL.createObjectURL(file)
    Form.file = file
}
// 重置表单方法
const resetForm = () => {
    Form.title = ''
    Form.content = ''
    Form.category = 1
    Form.cover = ''
    Form.file = null
    Form.isPublish = 0
    Form.creator = appStore.userInfo.username
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
// 添加编辑方法
const handleEdit = (row) => {
    isEditMode.value = true
    currentEditId.value = row._id
    // 填充表单数据
    Object.assign(Form, {
        title: row.title,
        content: row.content,
        category: row.category,
        cover: row.cover,
        file: null,
        isPublish: row.isPublish,
        creator: row.creator
    })
    dialogVisible.value = true
}
// 新增信息
const handleAddNews = () => {
    dialogVisible.value = true
}
// 确认添加信息
const handleConfirm = async() => {
    dialogVisible.value = false
    try {
        const submitData = { ...Form, _id: currentEditId.value }
        
        if(isEditMode.value) {
            const res = await postEditAnnouncement(submitData)
            if(res.ActionType === "OK") {
                ElMessage.success('通知/公告修改成功')
                resetForm()
            }
        } else {
            const valid = await FormRef.value.validate()
            if (!valid) {
                ElMessage.error('请填写完整信息')
                return
            }
            const res = await postAddAnnouncement(submitData)
            if(res.ActionType === "OK") {
                ElMessage.success('通知/公告添加成功')
                resetForm()
            }
        }
        await handleRefreshAnData()
    } catch (error) {
        ElMessage.error(isEditMode.value ? "公告修改失败" : "公告添加失败")
        console.error(error)
    }
    
}
//删除单个
const handleDeleteOne = async (row) => {
    await handleDelete(row,PostDeleteOneAnnouncement)
    handleRefreshAnData()
}
//删除多个
const handleDeleteMany = async () => {
    await handleDelete(selectedRows.value,PostDeleteManyAnnouncement)
    handleRefreshAnData()
}

// 处理发布状态变化
const handlePublishChange = async (row) => {
    try {
        const res =await updateAnnouncementPublishStatus(row._id,row.isPublish)
        if (res.code === 200) {
            ElMessage.success('状态更新成功')
        }
    } catch (error) {
        ElMessage.error('状态更新失败')
        console.error(error)
    }
}
//获取用户列表+刷新
const handleRefreshAnData = async() => {
    try{
        const res = await handleRefresh({
            page: currentPage.value,
            size: pageSize.value,  
        },getAnnouncementList)
        if(res.code === 200){
            tableData.value = res.data.data
            total.value = res.data.total
        }
    }catch(error){
        ElMessage.error('获取列表失败')
        console.error('获取列表失败:', error)
    }
}
// 添加分页变化处理方法
const handlePageChange = ({ page, size }) => {
    currentPage.value = page
    pageSize.value = size
    handleRefreshAnData()
}

onMounted(()=>{
    handleRefreshAnData()
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
</style>