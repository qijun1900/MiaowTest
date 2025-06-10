<template>
    <div class="container">
        <el-page-header content="大模型信息" title="模型管理"></el-page-header>
        <el-card shadow="hover">
            <div class="input_button">
                <el-space :size="size" spacer="|">
                    <el-input v-model="payload.modelName" placeholder="模型名称" style="width: 300px" clearable />
                    <el-input v-model="payload.modelValue" placeholder="模型值" style="width: 300px" clearable />
                    <el-button type="primary" :disabled="!payload.modelName || !payload.modelValue" @click="submitFrom">
                        添加模型
                        <el-icon class="el-icon--right"><Plus /></el-icon>
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
                <el-table-column prop="modelName" label="模型名称" width="200"></el-table-column>
                <el-table-column prop="modelValue" label="模型值" width="200"></el-table-column>
                <el-table-column label="发布状态">
                    <template #default="scope">
                        <el-switch v-model="scope.row.isPublish" :active-value="1" :inactive-value="0"
                            @change="handleSwitchChange(scope.row)" />
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button size="small" circle :icon="Edit" @click="handleEdit(scope.row)" type="success" />
                        <el-popconfirm title="确认删除该模型？" @confirm="handleDelete(scope.row)">
                            <template #reference>
                                <el-button size="small" circle :icon="Delete" type="danger" />
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 编辑对话框 -->
        <el-dialog v-model="centerDialogVisible" title="编辑模型信息" width="600" center>
            <el-form :model="dialogForm">
                <el-form-item label="模型名称">
                    <el-input v-model="dialogForm.modelName" />
                </el-form-item>
                <el-form-item label="模型值">
                    <el-input v-model="dialogForm.modelValue" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="centerDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleUpdate">确认修改</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import formatTime from '@/util/formatTime';

const size = ref(10);
const payload = reactive({
    modelName: '',
    modelValue: '',
    isPublish: 0
});
const tableData = ref([]);
const centerDialogVisible = ref(false);
const dialogForm = reactive({
    modelName: '',
    modelValue: '',
    _id: ''
});

// 获取模型列表
const getTableData = async () => {
    try {
        const res = await axios.get('/adminapi/model/getmodel');
        if (res.data.code === 200) {
            tableData.value = res.data.data;
        }
    } catch (error) {
        ElMessage.error('获取数据失败');
    }
};

// 提交新增
const submitFrom = async () => {
    try {
        const res = await axios.post('/adminapi/model/addmodel', payload);
        if (res.data.code === 200) {
            ElMessage.success('添加成功');
            Object.assign(payload, { modelName: '', modelValue: '', isPublish: 0 });
            await getTableData();
        }
    } catch {
        ElMessage.error('添加失败');
    }
};

// 编辑处理
const handleEdit = (item) => {
    Object.assign(dialogForm, {
        modelName: item.modelName,
        modelValue: item.modelValue,
        _id: item._id
    });
    centerDialogVisible.value = true;
};

// 更新处理
const handleUpdate = async () => {
    try {
        const res = await axios.put('/adminapi/model/updatempdelinfo', dialogForm);
        if (res.data.code === 200) {
            ElMessage.success('更新成功');
            centerDialogVisible.value = false;
            await getTableData();
        }
    } catch {
        ElMessage.error('更新失败');
    }
};
// 删除处理
const handleDelete = async (item) => {
    try {
        const res = await axios.delete(`/adminapi/model/deletemodel/${item._id}`);
        if (res.data.code === 200) {
            ElMessage.success('删除成功');
            await getTableData();
        }
    } catch {
        ElMessage.error('删除失败');
    }
};

// 状态切换
const handleSwitchChange = async (item) => {
    try {
        const res = await axios.put('/adminapi/model/changestatus', {
            _id: item._id,
            isPublish: item.isPublish
        });
        if (res.data.code === 200) {
            ElMessage.success('状态更新成功');
        }
    } catch {
        ElMessage.error('状态更新失败');
    }
};

onMounted(() => {
    getTableData();
});
</script>

<style scoped>
/* 保持与NoticeBar.vue相同的样式 */
.el-card {
    margin: 25px auto 0;
    padding: 10px;
    border-radius: 10px;
    width: 90%;
}
.input_button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px 0;
}
</style>