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
                        label: '名称',
                        placeholder: '请输入用户名',
                        field: 'userSearch',  // 存储值的字段名,初始化时会清空
                        fields: ['username'] // 要搜索的字段
                    },
                    {
                        type: 'select',
                        label: '性别',
                        placeholder: '请选择性别',
                        field: 'genderFilter',
                        fields: ['gender'],
                        options: genderOptions
                    },
                    {
                        type: 'select',
                        label: '角色',
                        placeholder: '请选择角色',
                        field: 'roleFilter',
                        fields: ['role'],
                        options: roleOptions
                    }
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
                                @click="handleAddUser">新建用户
                            </el-button>
                            <Popconfirm
                                title="您确定删除吗？"
                                @confirm="handleDeleteMany">
                            <el-button type="danger" 
                                plain 
                                :disabled="!selectedRows || selectedRows.length === 0">删除用户
                            </el-button>
                            </Popconfirm>
                            <el-button 
                                type="warning" 
                                plain 
                                :disabled="!selectedRows || selectedRows.length === 0"
                                @click="handleExportUser">导出用户
                            </el-button>
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
                                        @click="handleRefreshUserData" />
                                </template>
                            </Tooltip>
                        </el-col>
                    </el-row>
                </div>
                <div class="edit-table">
                    <el-table 
                        :data="tableData" 
                        style="width: 100%" 
                        @selection-change="handleSelectionChange"
                        max-height="690" 
                        :stripe="IsOpenStripe">
                        <el-table-column type="selection" width="55" />
                        <el-table-column 
                            type="index" 
                            label="序号" 
                            width="70" 
                            :index="(index) => index + 1" />
                        <el-table-column label="名称" width="100">
                            <template #default="scope">
                                {{ scope.row.username }}
                            </template>
                        </el-table-column>
                        <el-table-column label="头像" width="100">
                            <template #default="scope">
                                <div v-if="scope.row.avatar">
                                    <el-avatar :size="50"
                                        :src="`http://${escconfig.serverHost}:${escconfig.serverPort}` + scope.row.avatar"></el-avatar>
                                </div>
                                <div v-else>
                                    <el-avatar :size="50"
                                        :src="'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="简介" width="200">
                            <template #default="scope">
                                {{ scope.row.introduction }}
                            </template>
                        </el-table-column>
                        <el-table-column label="性别" width="100">
                            <template #default="scope">
                                <el-tag v-if="scope.row.gender === 1" type="primary">男</el-tag>
                                <el-tag v-else-if="scope.row.gender === 2" type="danger">女</el-tag>
                                <el-tag v-else type="info">保密</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="角色" width="150">
                            <template #default="scope">
                                <el-tag v-if="scope.row.role === 1" type="success">管理员</el-tag>
                                <el-tag v-else-if="scope.row.role === 2" type="warning">编辑</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="状态" width="150">
                            <template #default="scope">
                                <el-tag v-if="scope.row.state === 1" type="success" round>启用</el-tag>
                                <el-tag v-else type="danger" round>禁用</el-tag>
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
                                    title="您确定删除吗？" 
                                    @confirm="handleDeleteOne(scope.row)">
                                    <el-button 
                                        type="danger" 
                                        plain>
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
            </el-card>
        </div>
        <div>
            <Dialog 
                :DilogTitle="isEditMode ? '编辑用户' : '添加用户'" 
                :DilogButContent="isEditMode ? '提交更改' : '添加用户'"
                DilogWidth="700px" 
                v-model="dialogVisible"
                @dialog-confirm="handleConfirmUser">
                <template #dialogcontent>
                    <el-form   
                        ref="userFormRef" 
                        :model="userForm" 
                        :rules="userFormrules">
                        <el-form-item label="用户名" prop="username">
                            <el-input v-model="userForm.username" />
                        </el-form-item>
                        <el-form-item label="密码" prop="password" v-show="!isEditMode">
                            <el-input v-model="userForm.password" type="password" />
                        </el-form-item>
                        <el-form-item label="角色" prop="role">
                            <el-select v-model="userForm.role" placeholder="Select">
                                <el-option v-for="item in roleOptions" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="性别" prop="gender">
                            <el-select v-model="userForm.gender" placeholder="Select">
                                <el-option v-for="item in genderOptions" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="个人简介" prop="introduction">
                            <el-input v-model="userForm.introduction" type="textarea" />
                        </el-form-item>
                        <el-form-item label="个人头像" prop="avatar" v-show="!isEditMode" >
                            <Upload 
                            :avatar='userForm.avatar' 
                            @AvatarChange="handleChange" />
                        </el-form-item>
                        <el-form-item label="用户状态" prop="state">
                            <el-switch
                                v-model="userForm.state"
                                inline-prompt
                                :active-value="1"
                                :inactive-value="0"
                                :active-icon="Check"
                                :inactive-icon="Close">
                            </el-switch>
                        </el-form-item> 
                    </el-form>
                </template>
            </Dialog>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted, defineAsyncComponent  } from 'vue'
import { RefreshRight, Hide, Open,Check,Close } from '@element-plus/icons-vue'
import Tooltip from '@/components/ReuseComponents/Tooltip.vue'
import Pagination from '@/components/ReuseComponents/Pagination.vue'
import { useTableState } from '@/composables/State/useTableState'
import { useTableActions } from '@/composables/Action/useTableActions'
import escconfig from '../../config/esc.config';
import { postAddUser, postEditUser } from '@/API/Users/userAPI'//API
import { ElMessage } from 'element-plus'
import formatTime from '@/util/formatTime'
import Popconfirm from '@/components/ReuseComponents/Popconfirm.vue'
import SearchFilter from '@/components/FunComponents/SearchFilter.vue'
import {getUserList,PostDeleteOneUser,PostDeleteManyUser} from '@/API/Users/userAPI'//API


// 动态导入较大的组件
const Dialog = defineAsyncComponent(() =>
    import('@/components/ReuseComponents/Dialog .vue')
)
const Upload = defineAsyncComponent(() =>
    import('@/components/upload/Upload.vue')
)
//tableData数据
const tableData = ref([]);
// 对话框状态
const dialogVisible = ref(false)
// 添加编辑状态
const isEditMode = ref(false)
const currentEditId = ref(null)
// UI 状态与方法管理
const { showSearch, IsOpenStripe, HandleHideSearch, handleOpenStripe } = useTableState()
// 表格数据与方法管理
const { selectedRows, handleSelectionChange, handleDelete, handleRefresh } = useTableActions()
//角色字段
const roleOptions = [
    { label: '管理员', value: 1 },
    { label: '编辑', value: 2 }
]
//性别字段
const genderOptions = [
    { label: '保密', value: 0 },
    { label: '男', value: 1 },
    { label: '女', value: 2 }
]
//表单ref
const userFormRef = ref()
//表单数据
const userForm = reactive({
    username: "",
    password: "",
    role: 2,//1管理员，2编辑
    introduction: "",
    avatar: "",
    file: null,
    gender: 0,
    state: 1//默认状态为1,关闭状态为0
})
//表单验证规则
const userFormrules = reactive({
    username: [
        {
            required: true,
            message: '请输入名字',
            trigger: 'blur'
        }
    ],
    password: [
        {
            required: !isEditMode.value, // 编辑模式下非必填
            message: '请输入密码',
            trigger: 'blur'
        }
    ],
    role: [
        {
            required: true,
            message: '请设置权限',
            trigger: 'blur'
        }
    ],
    introduction: [
        {
            required: true,
            message: '请输入介绍',
            trigger: 'blur'
        }
    ],
    avatar: [
        {
            required: true,
            message: '请上传头像',
            trigger: 'blur'
        }
    ],
})
//表格相关，分页器
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

//头像上传
const handleChange = (file) => {
    userForm.avatar = URL.createObjectURL(file)
    userForm.file = file
}

//删除单个
const handleDeleteOne = async (row) => {
    await handleDelete(row, PostDeleteOneUser)
    handleRefreshUserData()
}

//删除选择的逻辑
const handleDeleteMany = async () => {
    await handleDelete(selectedRows.value, PostDeleteManyUser)
    handleRefreshUserData()
}

//业务逻辑
//handleEdit
const handleEdit = (row) => {
    isEditMode.value = true
    currentEditId.value = row._id
    // 填充表单数据
    Object.assign(userForm, {
        username: row.username,
        password: '', // 密码通常不显示
        role: row.role,
        introduction: row.introduction,
        avatar: row.avatar,
        file: null,
        gender: row.gender,
        state: row.state
    })
    dialogVisible.value = true
}
//增加用户,出现对话框
const handleAddUser = () => {
    dialogVisible.value = true;
}
// 修改确认方法，区分添加和编辑,提交表单数据
const handleConfirmUser = async () => {
    dialogVisible.value = false
    try {
        // 准备提交数据
        const submitData = { ...userForm, _id: currentEditId.value }

        if (isEditMode.value) {
            const res = await postEditUser(submitData)
            if (res.ActionType === "OK") {
                ElMessage.success('用户修改成功')
            }
        } else {
            const valid = await userFormRef.value.validate()
            if (!valid) {
                ElMessage.error('请完善表单信息')
                return
            }
            const res = await postAddUser(submitData)
            if (res.ActionType === "OK") {
                ElMessage.success('用户添加成功')
            }
        }
        await handleRefreshUserData()
    } catch (error) {
        ElMessage.error(isEditMode.value ? "用户修改失败" : "用户添加失败")
        console.log(error)
    }
    resetUserForm()
}

// 重置表单方法
const resetUserForm = () => {
    userForm.username = ""
    userForm.password = ""
    userForm.role = 2
    userForm.introduction = ""
    userForm.avatar = ""
    userForm.file = null
    userForm.gender = 0
    userForm.state = 1
    isEditMode.value = false
    currentEditId.value = null
}
//导出用户
const handleExportUser = () => {
    console.log('导出用户')
}
//handleMore
const handleMore = (row) => {
    console.log(row, "更多操作")
}
//获取用户列表+刷新
const handleRefreshUserData = async () => {
    try {
        const res = await handleRefresh({
            page: currentPage.value,
            size: pageSize.value,   
        },getUserList)
        tableData.value = res.data.data//表格数据
        total.value = res.data.total//
    } catch (error) {
        ElMessage.error('表格数据获取失败')
        console.log(error)
    }
}
//按下搜索按钮
const handleOnSearch = (data) => {
    if (data.length === 0) {
        ElMessage.error('未搜索到用户')
    } else {
        tableData.value = data
    }
}
// 添加分页变化处理方法
const handlePageChange = ({ page, size }) => {
    currentPage.value = page
    pageSize.value = size
    handleRefreshUserData()
}
onMounted(() => {
    handleRefreshUserData()
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
