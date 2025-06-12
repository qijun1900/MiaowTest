<template>
    <div>
        <el-page-header content="添加用户" icon="" title="用户管理"></el-page-header>
        <el-form
            ref="userFormRef"
            :model="userForm"
            :rules="userFormrules"
            label-width="auto"
            class="demo-ruleForm">
                <el-form-item 
                    label="用户名" 
                    prop="username">
                    <el-input v-model="userForm.username" />
                </el-form-item>
                <el-form-item 
                    label="密码" 
                    prop="password">
                    <el-input v-model="userForm.password" type="password"/>
                </el-form-item>
                <el-form-item 
                    label="性别" 
                    prop="gender">
                        <el-select
                            v-model="userForm.gender"
                            placeholder="Select">
                            <el-option
                            v-for="item in genderOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"/>
                        </el-select>
                </el-form-item>
                <el-form-item 
                    label="权限" 
                    prop="role">
                        <el-select
                            v-model="userForm.role"
                            placeholder="Select">
                            <el-option
                            v-for="item in roleOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"/>
                        </el-select>
                </el-form-item>
                <el-form-item 
                    label="个人简介" 
                    prop="introduction">
                        <el-input v-model="userForm.introduction"
                        type="textarea" />
                </el-form-item>
                <el-form-item 
                    label="个人头像" 
                    prop="avatar">
                    <Upload 
                    :avatar='userForm.avatar'
                    @AvatarChange="handleChange"/>   
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" 
                    @click="submitForm" 
                    class="login-button">
                    添加用户
                    </el-button>
                </el-form-item>
        </el-form>
    </div>
</template>
<script setup>
import { ref,reactive } from 'vue';
import Upload from '@/components/upload/Upload.vue';
import upload from '@/util/upload'
import { useRouter } from 'vue-router';

const router = useRouter()
const userFormRef = ref()
const userForm = reactive({
    username:"",
    password:"",
    role:2,//编辑
    introduction:"",
    avatar:"",
    file:null,
    gender:0
})
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
        required: true,
        message: '请输入密码', 
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
//角色选择字段
const roleOptions = [
    {
        label:'管理员',
        value:1
    },
    {
        label:'编辑',
        value:2
    }
]
//性别选择字段
const genderOptions = [
    {
        label:'保密',
        value:0
    },
    {
        label:'男',
        value:1
    },
    {
        label:'女',
        value:2
    }
]


const handleChange = (file)=>{
    userForm.avatar = URL.createObjectURL(file)
    userForm.file = file
}

const submitForm = ()=>{
    userFormRef.value.validate(async (valid)=>{
        if(valid){
            // console.log("提交后端",userForm)
            await upload("/adminapi/user/add",userForm)
            router.push('/user/userlist')
        }
    })
} 


</script>

<style scoped lang="scss">
.demo-ruleForm{
    margin-top: 50px;
}


</style>
