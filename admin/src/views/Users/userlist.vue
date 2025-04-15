<template>
    <div>
        <el-page-header content="用户列表" icon="" title="用户管理"></el-page-header>
        <el-card shadow="always" class="box-card">
            <el-table :data="tableData" style="width: 100%">
                <el-table-column prop="username" label="用户名" />
                <el-table-column label="头像">
                    <template #default="scope">
                        <div v-if="scope.row.avatar">
                            <el-avatar :size="50" :src=" `http://${escconfig.serverHost}:${escconfig.serverPort}` + scope.row.avatar"></el-avatar>
                        </div>
                        <div v-else>
                            <el-avatar :size="50"
                                :src="'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="角色">
                    <template #default="scope">
                        <el-tag v-if="scope.row.role === 1" type="danger" round>管理员</el-tag>
                        <el-tag v-else type="success" round>编辑</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button size="small" @click="handleEdit(scope.row)">
                            编辑 
                        </el-button>
                        <el-popconfirm title="你确定要删除吗" confirm-button-text="确定" cancel-button-text="取消"
                            @confirm="handleDelete(scope.row)">
                            <template #reference>
                                <el-button size="small" type="danger">
                                    删除
                                </el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <el-dialog v-model="dialogVisible" title="编辑用户" width="500">
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
                            v-model="userForm.role"
                            placeholder="Select">
                            <el-option
                            v-for="item in options"
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
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleEditconfirm()">
                        确定
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
<script setup>
import { ref, onMounted ,reactive} from 'vue';
import axios from 'axios';
import escconfig  from '@/config/esc.config';



const tableData = ref([])
const dialogVisible = ref(false)
const userFormRef = ref()
const userForm = reactive({
    username:"",
    password:"",
    role:2,
    introduction:"",
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
})
//角色选择字段
const options = [
    {
        label:'管理员',
        value:1
    },
    {
        label:'编辑',
        value:2
    }
]

const getTableData = async () => {
    const res = await axios.get('/adminapi/user/list')
    tableData.value = res.data.data
}


onMounted(() => {
    getTableData()//挂载时候就加载数据
})

//编辑回调
const handleEdit = async (data) => {
    const res= await axios.get(`/adminapi/user/list/${data._id}`)
    // console.log(res.data.data[0])
    Object.assign(userForm,res.data.data[0])
    dialogVisible.value = true
 
}   
//编辑确认回调
const handleEditconfirm = ()=>{
    userFormRef.value.validate( async (valid)=>{
        if(valid){
            //更新 
            await axios.put(`/adminapi/user/list/${userForm._id}`,userForm)
            //对话取消
            dialogVisible.value = false
            //获取新数据
            getTableData()//再次加载一下tableData，实现数据及时更新
        }
    })
}

const handleDelete = async (data) => {
    await axios.delete(`/adminapi/user/list/${data._id}`)
    getTableData()//再次加载一下tableData，实现数据及时更新
}
</script>
<style scoped>
.box-card {
    margin-top: 20px;
    border-radius: 15px;

}
</style>
