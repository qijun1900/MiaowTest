<template>
    <div>
        <el-row :gutter="20" class="el-row">
            <el-col :span="8">
                <el-card class="box-card">
                    <el-avatar :size="80" :src="avatarUrl" />
                    <h3>{{ appStore.userInfo.username }}</h3>
                    <h5>{{ appStore.userInfo.role === 1 ? '管理员' : '编辑' }}</h5>
                </el-card>
                <el-card class="box-card-statistic">
                    <el-statistic  :value="50">
                        <template #title>
                            <div style="display: inline-flex; align-items: center">
                                待完成任务
                                <el-icon style="margin-left: 4px" :size="20">
                                    <List/>
                                </el-icon>
                            </div>
                        </template>
                        <template #suffix>/100</template>
                    </el-statistic>
                </el-card>
                <!-- 新增待办事项组件 -->
                <el-card class="box-card-statistic" style="margin-top: 15px;">
                    <template #header>
                        <div class="card-header">
                            <span>待办事项管理</span>
                        </div>
                    </template>
                    <TodoList />
                </el-card>
            </el-col>
            <el-col :span="16">
                <el-card class="box-card">
                    <template #header>
                        <div class="card-header">
                            <span>个人信息</span>
                        </div>
                    </template>
                    <el-form 
                        ref="userFormRef" 
                        :model="userForm" 
                        :rules="userFormrules" 
                        label-width="100px"
                        class="demo-ruleForm">
                        <el-form-item label="用户名" prop="username">
                            <el-input v-model="userForm.username" />
                        </el-form-item>
                        <el-form-item label="性别" prop="gender">
                            <el-select v-model="userForm.gender" placeholder="Select">
                                <el-option v-for="item in options" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="个人简介" prop="introduction">
                            <el-input v-model="userForm.introduction" type="textarea" />
                        </el-form-item>
                        <el-form-item label="个人头像" prop="avatar">
                            <Upload :avatar='userForm.avatar' @AvatarChange="handleChange" />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="submitForm" class="login-button">
                                提交信息
                            </el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>
<script setup>
import { computed, ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import Upload from '@/components/upload/Upload.vue';
import escconfig from '@/config/esc.config';
import { useAppStore } from '@/stores';
import { postUploadInfo } from '@/API/Users/postUploadInfo';
import { List } from '@element-plus/icons-vue'
import TodoList from '@/components/FunComponents/TodoList.vue';
const appStore = useAppStore()

const avatarUrl = computed(() => appStore.userInfo.avatar ? `http://${escconfig.serverHost}:${escconfig.serverPort}` + appStore.userInfo.avatar : `https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png`)
const { username, gender, introduction, avatar } = appStore.userInfo
const userFormRef = ref(username, gender, introduction, avatar)
const userFormrules = reactive({
    username: [
        {
            required: true,
            message: '请输入名字',
            trigger: 'blur'
        }
    ],
    gender: [
        {
            required: true,
            message: '请选择性别',
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
const userForm = reactive({
    username,
    gender,
    introduction,
    avatar,
    file: null
})
//性别选择字段
const options = [
    {
        label: '保密',
        value: 0
    },
    {
        label: '男',
        value: 1
    },
    {
        label: '女',
        value: 2
    }
]
const handleChange = file => {
    userForm.avatar = URL.createObjectURL(file)
    userForm.file = file
}

//submitForm
const submitForm = async () => {
    try {
        const res = await postUploadInfo(userForm)
        console.log(res)
        if (res.ActionType === "OK") {
            appStore.userInfo = res.data
            ElMessage.success("更新成功")
        }
    } catch {
        ElMessage.error("更新失败")
    }

}
</script>
<style scoped lang="scss">
.el-row {
    margin-top: 5px;

    .box-card {
        text-align: center;
        border-radius: 15px;

    }
    .box-card-statistic{
        text-align: center;
        border-radius: 15px;
        margin-top: 15px;

    }
}
</style>
