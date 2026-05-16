<template>
  <div>
    <transition name="slide-up">
      <el-card style="border-radius: 4px" shadow="never" v-show="showSearch">
        <SearchFilter
          :Data="tableData"
          :filterConfig="[
            {
              type: 'input',
              label: '版本名称',
              placeholder: '请输入版本名称',
              field: 'versionNameSearch',
              fields: ['versionName'],
            },
            {
              type: 'select',
              label: '平台',
              placeholder: '请选择平台',
              field: 'platformFilter',
              fields: ['platform'],
              options: [
                { label: 'Android', value: 'android' },
                { label: 'iOS', value: 'ios' },
                { label: '全部', value: 'all' },
              ],
            },
            {
              type: 'select',
              label: '状态',
              placeholder: '请选择状态',
              field: 'statusFilter',
              fields: ['status'],
              options: [
                { label: '禁用', value: 0 },
                { label: '启用', value: 1 },
              ],
            },
          ]"
          @onsearch="handleOnSearch"
        />
      </el-card>
    </transition>

    <div class="eidt-card">
      <el-card style="border-radius: 4px" shadow="never">
        <div class="edit-btn">
          <el-row :gutter="20" type="flex" justify="space-between" align="middle">
            <el-col :xs="24" :sm="24" :md="18" :lg="18" :xl="18" class="left-buttons">
              <el-button type="success" plain @click="handleAdd">新增版本</el-button>
              <Popconfirm title="您确定删除吗" @confirm="handleDeleteMany">
                <el-button
                  type="danger"
                  :disabled="!selectedRows || selectedRows.length === 0"
                  plain
                  >批量删除</el-button
                >
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
                  <el-button type="primary" :icon="RefreshRight" circle @click="handleRefreshData" />
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
        @selection-change="handleSelectionChange"
        v-loading="tableLoading"
        element-loading-text="加载中..."
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="70" :index="(index) => index + 1" />
        <el-table-column label="版本名称" width="120">
          <template #default="scope">{{ scope.row.versionName }}</template>
        </el-table-column>
        <el-table-column label="版本号" width="100">
          <template #default="scope">{{ scope.row.versionCode }}</template>
        </el-table-column>
        <el-table-column label="平台" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.platform === 'android'" type="success">Android</el-tag>
            <el-tag v-else-if="scope.row.platform === 'ios'" type="primary">iOS</el-tag>
            <el-tag v-else type="info">全部</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.forceUpdate ? 'danger' : 'success'" effect="dark">
              {{ scope.row.forceUpdate ? '强制' : '可选' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              inline-prompt
              size="large"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="文件大小" width="100">
          <template #default="scope">
            {{ scope.row.fileSize ? (scope.row.fileSize / 1024 / 1024).toFixed(1) + ' MB' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="scope">{{ formatTime.getTime2(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" min-width="180">
          <template #default="scope">
            <el-button type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
            <Popconfirm title="您确定删除吗" @confirm="handleDeleteOne(scope.row)">
              <el-button type="danger" plain>删除</el-button>
            </Popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination">
      <Pagination
        :total="total"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        @page-change="handlePageChange"
      />
    </div>
  </div>

  <!-- 新增/编辑弹窗 -->
  <Dialog
    :DilogTitle="isEditMode ? '编辑版本' : '新增版本'"
    :DilogButContent="isEditMode ? '提交更改' : '添加版本'"
    DilogWidth="680px"
    :draggable="true"
    v-model="dialogVisible"
    @dialog-confirm="handleConfirm"
  >
    <template #dialogcontent>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="版本名称" prop="versionName">
              <el-input v-model="formData.versionName" placeholder="如 1.5.0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本号" prop="versionCode">
              <el-input-number v-model="formData.versionCode" :min="1" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="平台" prop="platform">
              <el-select v-model="formData.platform" placeholder="请选择平台" style="width: 100%">
                <el-option label="Android" value="android" />
                <el-option label="iOS" value="ios" />
                <el-option label="全部" value="all" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="强制更新">
              <el-switch v-model="formData.forceUpdate" active-text="是" inactive-text="否" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="更新日志">
          <el-input v-model="formData.changelog" type="textarea" :rows="3" placeholder="请输入更新日志" />
        </el-form-item>
        <el-form-item label="安装包">
          <el-upload
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
          >
            <el-button type="primary" plain>选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持 APK/IPA 文件，上传后将自动填写下载地址</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="下载地址（无文件时可手动填写）">
          <el-input v-model="formData.downloadUrl" placeholder="https://... 或 /appversionuploads/xxx.apk" />
        </el-form-item>
      </el-form>
    </template>
  </Dialog>
</template>

<script setup>
import { RefreshRight, Hide, Open } from "@element-plus/icons-vue";
import { useTableState } from "@/composables/State/useTableState";
import { useTableActions } from "@/composables/Action/useTableActions";
import Tooltip from "@/components/ReuseComponents/Tooltip.vue";
import Pagination from "@/components/ReuseComponents/Pagination.vue";
import Popconfirm from "@/components/ReuseComponents/Popconfirm.vue";
import SearchFilter from "@/components/FunComponents/SearchFilter.vue";
import { ref, defineAsyncComponent, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import formatTime from "@/util/formatTime";
import {
  postAddVersion,
  getVersionList,
  postEditVersion,
  postDeleteOneVersion,
  postDeleteManyVersions,
  updateVersionStatus,
} from "@/API/version/versionAPI";

const Dialog = defineAsyncComponent(() => import("@/components/ReuseComponents/Dialog .vue"));

// UI 状态
const { showSearch, IsOpenStripe, HandleHideSearch, handleOpenStripe } = useTableState();
const { selectedRows, handleSelectionChange, handleDelete, handleRefresh } = useTableActions();

// 表格
const tableData = ref([]);
const tableLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 弹窗
const dialogVisible = ref(false);
const isEditMode = ref(false);
const currentEditId = ref(null);
const formRef = ref();
const fileList = ref([]);

// 表单
const formData = reactive({
  versionName: "",
  versionCode: 1,
  platform: "android",
  forceUpdate: false,
  changelog: "",
  downloadUrl: "",
  file: null,
});

const formRules = {
  versionName: [{ required: true, message: "请输入版本名称", trigger: "blur" }],
  versionCode: [{ required: true, message: "请输入版本号", trigger: "blur" }],
  platform: [{ required: true, message: "请选择平台", trigger: "change" }],
};

// 文件选择
const handleFileChange = (file) => {
  formData.file = file.raw;
  fileList.value = [file];
};

const handleFileRemove = () => {
  formData.file = null;
  fileList.value = [];
};

// 重置表单
const resetForm = () => {
  formData.versionName = "";
  formData.versionCode = 1;
  formData.platform = "android";
  formData.forceUpdate = false;
  formData.changelog = "";
  formData.downloadUrl = "";
  formData.file = null;
  fileList.value = [];
  isEditMode.value = false;
  currentEditId.value = null;
};

// 搜索
const handleOnSearch = (data) => {
  if (data.length === 0) {
    ElMessage.error("未搜索到版本信息");
  } else {
    tableData.value = data;
  }
};

// 新增
const handleAdd = () => {
  resetForm();
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row) => {
  isEditMode.value = true;
  currentEditId.value = row._id;
  Object.assign(formData, {
    versionName: row.versionName,
    versionCode: row.versionCode,
    platform: row.platform,
    forceUpdate: row.forceUpdate,
    changelog: row.changelog,
    downloadUrl: row.downloadUrl,
    file: null,
  });
  fileList.value = [];
  dialogVisible.value = true;
};

// 提交
const handleConfirm = async () => {
  try {
    if (!isEditMode.value) {
      const valid = await formRef.value.validate();
      if (!valid) return;
    }

    dialogVisible.value = false;
    const submitData = { ...formData, _id: currentEditId.value };

    let res;
    if (isEditMode.value) {
      res = await postEditVersion(submitData);
    } else {
      res = await postAddVersion(submitData);
    }

    if (res?.ActionType === "OK") {
      ElMessage.success(isEditMode.value ? "版本修改成功" : "版本添加成功");
      resetForm();
    }
    await handleRefreshData();
  } catch (error) {
    ElMessage.error(isEditMode.value ? "版本修改失败" : "版本添加失败");
    console.error(error);
  }
};

// 删除
const handleDeleteOne = async (row) => {
  await handleDelete(row, postDeleteOneVersion);
  handleRefreshData();
};

const handleDeleteMany = async () => {
  await handleDelete(selectedRows.value, postDeleteManyVersions);
  handleRefreshData();
};

// 状态切换
const handleStatusChange = async (row) => {
  try {
    const res = await updateVersionStatus(row._id, row.status);
    if (res?.code === 200) ElMessage.success("状态更新成功");
  } catch (error) {
    ElMessage.error("状态更新失败");
    console.error(error);
  }
};

// 刷新数据
const handleRefreshData = async () => {
  tableLoading.value = true;
  try {
    const res = await handleRefresh(
      { page: currentPage.value, size: pageSize.value },
      getVersionList,
    );
    if (res?.code === 200) {
      tableData.value = res.data.data;
      total.value = res.data.total;
    }
  } catch (error) {
    ElMessage.error("获取版本列表失败");
    console.error(error);
  } finally {
    tableLoading.value = false;
  }
};

// 分页
const handlePageChange = ({ page, size }) => {
  currentPage.value = page;
  pageSize.value = size;
  handleRefreshData();
};

onMounted(() => {
  handleRefreshData();
});
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
