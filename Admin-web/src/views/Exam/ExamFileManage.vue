<template>
  <div class="exam-file-manage">
    <el-card class="exam-info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>考试信息</span>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="科目名称">
          {{ appStore.examInfo.name }}
        </el-descriptions-item>
        <el-descriptions-item label="科目代码">
          {{ appStore.examInfo.code }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatTime.getTime2(appStore.examInfo.createdTime) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="file-manage-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>网盘资料管理</span>
          <div class="header-buttons">
            <el-button type="success" :icon="Refresh" @click="handleRefresh">刷新数据</el-button>
            <el-button type="primary" :icon="Plus" @click="handleAdd">添加网盘资料</el-button>
          </div>
        </div>
      </template>

      <div class="filter-container">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="资料名称">
            <el-input v-model="searchForm.title" placeholder="请输入资料名称" clearable />
          </el-form-item>
          <el-form-item label="网盘类型">
            <el-select v-model="searchForm.diskType" placeholder="请选择网盘类型" clearable>
              <el-option label="夸克网盘" :value="1" />
              <el-option label="百度网盘" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="发布状态">
            <el-select v-model="searchForm.isPublish" placeholder="请选择发布状态" clearable>
              <el-option label="已发布" :value="true" />
              <el-option label="未发布" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="tableData" style="width: 100%" v-loading="loading" height="440">
        <el-table-column prop="title" label="资料名称" min-width="100" />
        <el-table-column prop="diskType" label="网盘类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.content[0].type === 1 ? 'success' : 'primary'">
              {{ scope.row.content[0].type === 1 ? "夸克网盘" : "百度网盘" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="链接" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <a
              :href="scope.row.content[0].url"
              target="_blank"
              rel="noopener noreferrer"
              class="url-link"
            >
              {{ scope.row.content[0].url }}
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="isPublish" label="发布状态" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.isPublish" @change="handlePublishChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatTime.formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <div class="pagination">
      <Pagination
        :total="total"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        @page-change="handlePageChange"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <Dialog
      :DilogTitle="isEditMode ? '编辑网盘资料' : '添加网盘资料'"
      :DilogButContent="isEditMode ? '更新' : '添加'"
      v-model="dialogVisible"
      :draggable="true"
      DilogWidth="600px"
      @dialogConfirm="handleSubmit"
    >
      <template #dialogcontent>
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
          <el-form-item label="资料名称" prop="title">
            <el-input v-model="formData.title" placeholder="请输入资料名称" />
          </el-form-item>
          <el-form-item label="网盘类型" prop="type">
            <el-radio-group v-model="formData.type">
              <el-radio :value="1">夸克网盘</el-radio>
              <el-radio :value="2">百度网盘</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="链接" prop="url">
            <el-input v-model="formData.url" placeholder="请输入网盘链接" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入描述信息（可选）"
            />
          </el-form-item>
          <el-form-item label="发布状态">
            <el-switch v-model="formData.isPublish" />
          </el-form-item>
        </el-form>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { useAppStore } from "@/stores";
import { ref, reactive, onMounted, defineAsyncComponent } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Refresh } from "@element-plus/icons-vue";
import {
  getNetDiskListAPI,
  postAddNetDiskAPI,
  updateNetDiskAPI,
  deleteOneNetDiskAPI,
  updateNetDiskStateAPI,
} from "@/API/Exam/netDiskAPI.js";
import { useRoute } from "vue-router";
import formatTime from "@/util/formatTime";
import Pagination from "@/components/ReuseComponents/Pagination.vue";
import { useNetDiskFilter } from "@/util/SearchFilter.js";
// 动态导入较大的组件
const Dialog = defineAsyncComponent(() => import("@/components/ReuseComponents/Dialog .vue"));

const appStore = useAppStore();
const route = useRoute();
const loading = ref(false);
const dialogVisible = ref(false); // 对话框状态
const formRef = ref(null);
const rawData = ref([]); // 存储原始数据

// 搜索表单
const searchForm = reactive({
  title: "",
  diskType: null,
  isPublish: null,
});

// 使用筛选函数处理数据
const tableData = useNetDiskFilter(rawData, searchForm);

//表格分页器
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
// 添加编辑状态
const isEditMode = ref(false);

// 添加分页变化处理方法
const handlePageChange = ({ page, size }) => {
  currentPage.value = page;
  pageSize.value = size;
  fetchNetDiskList();
};

// 表单数据
const formData = reactive({
  title: "",
  type: 1,
  url: "",
  description: "",
  isPublish: false,
});

// 表单验证规则
const formRules = {
  title: [{ required: true, message: "请输入资料名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择网盘类型", trigger: "change" }],
  url: [{ required: true, message: "请输入网盘链接", trigger: "blur" }],
};

// 处理添加
const handleAdd = () => {
  Object.assign(formData, {
    title: "",
    type: 1,
    url: "",
    description: "",
    isPublish: false,
  });
  dialogVisible.value = true;
  isEditMode.value = false;
};

// 处理编辑
const handleEdit = (row) => {
  Object.assign(formData, {
    _id: row._id,
    title: row.title,
    type: row.content[0].type,
    url: row.content[0].url,
    description: row.description || "",
    isPublish: row.isPublish,
  });
  dialogVisible.value = true;
  isEditMode.value = true;
};

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    title: "",
    diskType: null,
    isPublish: null,
  });
};

// 处理刷新数据
const handleRefresh = () => {
  fetchNetDiskList();
  ElMessage.success("数据已刷新");
};

// 获取网盘资料列表
const fetchNetDiskList = async () => {
  loading.value = true;
  try {
    const res = await getNetDiskListAPI({
      page: currentPage.value,
      size: pageSize.value,
      examId: route.params.id,
    });
    if (res.code === 200) {
      rawData.value = res.data[0].data;
      total.value = res.data[0].total[0].total;
    }
  } catch (error) {
    console.error("获取网盘资料列表失败:", error);
    ElMessage.error("获取网盘资料列表失败");
  } finally {
    loading.value = false;
  }
};

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm("确定要删除该网盘资料吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const res = await deleteOneNetDiskAPI(row._id, route.params.id);
        if (res.code === 200) {
          ElMessage.success("删除成功");
          fetchNetDiskList();
        } else {
          ElMessage.error(res.message || "删除失败");
        }
      } catch (error) {
        console.error("删除失败:", error);
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {
      // 用户取消删除
    });
};

// 处理发布状态变更
const handlePublishChange = async (row) => {
  try {
    const res = await updateNetDiskStateAPI({
      _id: row._id,
      examId: route.params.id,
      state: row.isPublish,
    });
    if (res.code === 200) {
      ElMessage.success("状态更新成功");
      fetchNetDiskList();
    } else {
      // 恢复原状态
      row.isPublish = !row.isPublish;
      ElMessage.error(res.message || "状态更新失败");
    }
  } catch (error) {
    row.isPublish = !row.isPublish;
    console.error("状态更新失败:", error);
    ElMessage.error("状态更新失败");
  }
};

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          ...formData,
          examId: route.params.id,
        };

        let res;
        if (formData._id && formData._id !== "" && isEditMode.value === true) {
          // 编辑
          res = await updateNetDiskAPI(data);
        } else {
          // 添加
          res = await postAddNetDiskAPI(data);
        }
        if (res.code === 200) {
          ElMessage.success(isEditMode.value ? "更新成功" : "添加成功");
          dialogVisible.value = false;
          fetchNetDiskList();
        }
      } catch (error) {
        console.error(isEditMode.value ? "更新失败:" : "添加失败:", error);
        ElMessage.error(isEditMode.value ? "更新失败" : "添加失败");
      }
    }
  });
};

onMounted(() => {
  fetchNetDiskList(); // 初始化时获取数据
});
</script>

<style scoped>
.exam-file-manage {
  padding: 10px;
}

.exam-info-card {
  margin-bottom: 20px;
}

.file-manage-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.header-buttons .el-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.filter-container {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.pagination {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.url-link {
  display: inline-block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #409eff;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 2px 4px;
  border-radius: 3px;
  position: relative;
}

.url-link:hover {
  color: #66b1ff;
  text-decoration: underline;
  background-color: rgba(64, 158, 255, 0.1);
}

.url-link:active {
  color: #3a8ee6;
  transform: translateY(1px);
}

.url-link::before {
  content: "🔗";
  margin-right: 4px;
  font-size: 12px;
}
</style>
