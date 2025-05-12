<template>
    <div class="container">
        <el-page-header content="通知栏信息" icon="" title="信息管理"></el-page-header>
        <el-card shadow="hover">
            <div class="input_button">
                <el-space :size="size" spacer="|">
                    <el-input v-model="payload.content" style="width: 600px" placeholder="请输入通知栏信息" clearable autosize
                        size="large" :prefix-icon="CirclePlusFilled" />
                    <el-button type="primary" :disabled="payload.content == ''" @click="submitFrom">
                        添加信息
                        <el-icon class="el-icon--right">
                            <Plus />
                        </el-icon>
                    </el-button>
                </el-space>
            </div>
        </el-card>
        <el-card shadow="hover">
            <el-table :data="tableData" border style="width: 100%">
                <el-table-column label="添加时间" width="180">
                    <template #default="scope">
                        {{ formatTime.getTime(scope.row.editTime) }}
                    </template>
                </el-table-column>
                <el-table-column prop="content" label="通知栏信息内容" width="400"></el-table-column>
                <el-table-column label="发布状态">
                    <template #default="scope">
                        <el-switch v-model="scope.row.isPublish" :active-value="1" :inactive-value="0"
                            @change="handleSwitchange(scope.row)" />
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button size="small" circle :icon="Edit" @click="handleEdit(scope.row)"  type="success"></el-button>
                        <el-popconfirm title="你确定要删除吗" confirm-button-text="确定" cancel-button-text="取消"
                            @confirm="handleDelete(scope.row)">
                            <template #reference>
                                <el-button size="small" circle :icon="Delete" type="danger">
                                </el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import { CirclePlusFilled, Plus ,Edit,Delete} from '@element-plus/icons-vue';
import axios from 'axios'
import { ElMessage } from 'element-plus';
import formatTime from '@/util/formatTime'

const size = ref(10)
const payload = reactive({
    content: "",
    isPublish: 0,//0:未发布，1：发布
})
const tableData = ref([])


const submitFrom = async () => {
    try {
        const res = await axios.post('/adminapi/new/noticebar', payload)
        if (res.data.code === 200) {
            ElMessage.success('添加成功')
            payload.content = ''
            await getTableData()
        }
    } catch {
        ElMessage.error('添加失败')
    }
}
onMounted(async () => {
    await getTableData()
})
const getTableData = async () => {
    try {
        const res = await axios.get('/adminapi/new/noticebar')
        if (res.data.code === 200) {
            tableData.value = res.data.data
        }
    } catch (error) {
        console.log(error)
    }
}
//开关回调
const handleSwitchange = async (item) => {
    await axios.put('/adminapi/new/noticebar', {
        _id: item._id,
        isPublish: item.isPublish
    })
    await getTableData()//挂载时候就加载数据
}

</script>
<style scoped>
.el-card {
    margin-top: 25px;
    margin-left: 60px;
    padding: 10px;
    border-radius: 10px;
    width: 90%;
}

.input_button {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>