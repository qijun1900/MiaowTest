<template>
  <div class="doc-manage-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">文档管理</h2>
        <span class="page-desc">上传文档到知识库，管理文档的解析和向量化状态</span>
      </div>
      <div class="header-right">
        <el-button :icon="RefreshRight" circle @click="handleRefreshAnData" :loading="tableLoading" />
        <el-button type="primary" :icon="Upload" @click="handleAdd">上传文档</el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-left">
        <el-select
          v-model="selectedKB"
          placeholder="全部知识库"
          clearable
          filterable
          style="width: 220px"
          @change="handleKBChange"
        >
          <el-option
            v-for="kb in knowledgeBases"
            :key="kb._id"
            :label="kb.name"
            :value="kb._id"
          >
            <div class="kb-option">
              <span>{{ kb.name }}</span>
              <span class="kb-count">{{ kb.docCount ?? 0 }} 篇</span>
            </div>
          </el-option>
        </el-select>
        <el-input
          v-model="keyword"
          placeholder="搜索文档标题..."
          clearable
          :prefix-icon="Search"
          style="width: 240px"
          @keyup.enter="handleRefreshAnData"
          @clear="handleRefreshAnData"
        />
      </div>
      <div class="filter-right">
        <el-tooltip content="切换斑马纹">
          <el-button :icon="Grid" circle @click="IsOpenStripe = !IsOpenStripe" />
        </el-tooltip>
      </div>
    </div>

    <!-- 文档表格 -->
    <div class="table-wrapper">
      <el-table
        :data="tableData"
        style="width: 100%"
        max-height="calc(100vh - 320px)"
        :stripe="IsOpenStripe"
        v-loading="tableLoading"
        element-loading-text="加载中..."
        row-key="_id"
      >
        <el-table-column type="index" label="#" width="50" :index="(i) => (currentPage - 1) * pageSize + i + 1" />

        <el-table-column label="文档" min-width="240">
          <template #default="{ row }">
            <div class="doc-cell">
              <div class="doc-icon" :class="`doc-icon--${row.fileType}`">
                {{ (row.fileType || 'file').toUpperCase() }}
              </div>
              <div class="doc-info">
                <span class="doc-title">{{ row.title }}</span>
                <span class="doc-filename">{{ row.originalName }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <div class="status-cell">
              <span class="status-dot" :class="`status-dot--${row.status}`"></span>
              <span>{{ statusText[row.status] }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="分块" width="70" align="center">
          <template #default="{ row }">
            <span class="chunk-count">{{ row.chunkCount || 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column label="所属知识库" min-width="200">
          <template #default="{ row }">
            <div class="kb-tags">
              <el-tag
                v-for="kbId in (row.knowledgeBaseIds || [])"
                :key="kbId"
                size="small"
                closable
                effect="plain"
                @close="handleRemoveFromKB(row, kbId)"
              >
                {{ getKBName(kbId) }}
              </el-tag>
              <span v-if="!row.knowledgeBaseIds?.length" class="no-kb">未关联</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="创建者" width="100">
          <template #default="{ row }">
            <span class="creator-text">{{ row.creator || '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            <span class="time-text">{{ formatTime.getTime2(row.createTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <div class="action-cell">
              <el-button
                v-if="row.status === 0 || row.status === 3"
                type="primary"
                link
                size="small"
                @click="handleProcess(row)"
              >
                <el-icon><VideoPlay /></el-icon>处理
              </el-button>
              <el-button
                v-if="row.status === 3"
                type="warning"
                link
                size="small"
                @click="handleShowError(row)"
              >
                <el-icon><Warning /></el-icon>错误
              </el-button>
              <el-button
                v-if="row.status === 2"
                type="success"
                link
                size="small"
                @click="handleOpenAddToKB(row)"
              >
                <el-icon><Plus /></el-icon>入库
              </el-button>
              <Popconfirm
                title="确定删除此文档？删除后向量数据和 OSS 文件都将被清除"
                @confirm="handleDeleteOne(row)"
              >
                <el-button type="danger" link size="small">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </Popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <Pagination
        :total="total"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        @page-change="handlePageChange"
      />
    </div>
  </div>

  <!-- 上传文档对话框 -->
  <Dialog
    DilogTitle="上传知识文档"
    DilogButContent="上传"
    DilogWidth="560px"
    :draggable="true"
    v-model="dialogVisible"
    @dialog-confirm="handleConfirm"
  >
    <template #dialogcontent>
      <el-form ref="FormRef" :model="Form" :rules="Formrules" label-position="top">
        <el-form-item label="所属知识库" prop="knowledgeBaseIds">
          <el-select
            v-model="Form.knowledgeBaseIds"
            placeholder="请选择知识库（可多选）"
            multiple
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="kb in knowledgeBases"
              :key="kb._id"
              :label="kb.name"
              :value="kb._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="文档标题" prop="title">
          <el-input v-model="Form.title" placeholder="请输入文档标题" :maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="选择文件" prop="file">
          <el-upload
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            accept=".pdf,.docx,.doc,.txt,.md,.pptx,.xlsx,.xls,.csv,.html"
            drag
            class="upload-area"
          >
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="upload-text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="upload-tip">支持 PDF / DOCX / TXT / MD / PPTX / XLSX 等格式</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
    </template>
  </Dialog>

  <!-- 添加到知识库对话框 -->
  <Dialog
    DilogTitle="添加到知识库"
    DilogButContent="确认添加"
    DilogWidth="450px"
    :draggable="true"
    v-model="addToKBVisible"
    @dialog-confirm="handleConfirmAddToKB"
  >
    <template #dialogcontent>
      <div class="add-to-kb-content">
        <p class="add-to-kb-hint">
          将文档「<strong>{{ addToKBRow?.title }}</strong>」添加到以下知识库：
        </p>
        <el-select v-model="addToKBTarget" placeholder="选择目标知识库" style="width: 100%" filterable>
          <el-option
            v-for="kb in availableKBs"
            :key="kb._id"
            :label="kb.name"
            :value="kb._id"
          />
        </el-select>
        <p v-if="availableKBs.length === 0" class="add-to-kb-empty">
          该文档已关联所有知识库
        </p>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { RefreshRight, Upload, Search, Grid, VideoPlay, Warning, Plus, Delete, UploadFilled } from "@element-plus/icons-vue";
import Pagination from "@/components/ReuseComponents/Pagination.vue";
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  postAddKnowledgeDoc,
  getKnowledgeDocList,
  postDeleteKnowledgeDoc,
  postProcessKnowledgeDoc,
  getKnowledgeBaseList,
  postRemoveDocFromKnowledgeBase,
  postAddDocToKnowledgeBase,
} from "@/API/Knowledge/knowledgeAPI";
import { useAppStore } from "@/stores";
import formatTime from "@/util/formatTime";
import Popconfirm from "@/components/ReuseComponents/Popconfirm.vue";
import { defineAsyncComponent } from "vue";

const Dialog = defineAsyncComponent(() => import("@/components/ReuseComponents/Dialog .vue"));

const appStore = useAppStore();
const tableData = ref([]);
const tableLoading = ref(false);
const dialogVisible = ref(false);
const knowledgeBases = ref([]);
const selectedKB = ref("");
const keyword = ref("");
const IsOpenStripe = ref(true);
const addToKBVisible = ref(false);
const addToKBRow = ref(null);
const addToKBTarget = ref("");

const statusText = { 0: "待处理", 1: "处理中", 2: "已完成", 3: "失败" };

const FormRef = ref();
const Form = reactive({
  title: "",
  file: null,
  knowledgeBaseIds: [],
});

const Formrules = {
  knowledgeBaseIds: [{ required: true, type: "array", message: "请选择至少一个知识库", trigger: "change" }],
  title: [{ required: true, message: "请输入文档标题", trigger: "blur" }],
  file: [{ required: true, message: "请选择文件", trigger: "change" }],
};

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const handleFileChange = (uploadFile) => {
  Form.file = uploadFile.raw;
  // 自动用文件名（去掉扩展名）填充标题
  if (!Form.title && uploadFile.name) {
    Form.title = uploadFile.name.replace(/\.[^.]+$/, "");
  }
};

const handleFileRemove = () => {
  Form.file = null;
};

const resetForm = () => {
  Form.title = "";
  Form.file = null;
  Form.knowledgeBaseIds = [];
};

const handleKBChange = () => {
  currentPage.value = 1;
  handleRefreshAnData();
};

const loadKnowledgeBases = async () => {
  try {
    const res = await getKnowledgeBaseList();
    if (res) {
      knowledgeBases.value = res.data;
    }
  } catch (error) {
    console.error("loadKnowledgeBases error:", error);
  }
};

const getKBName = (kbId) => {
  const kb = knowledgeBases.value.find((k) => k._id === kbId);
  return kb ? kb.name : kbId;
};

const handleRemoveFromKB = async (row, kbId) => {
  try {
    await postRemoveDocFromKnowledgeBase(row._id, kbId);
    ElMessage.success("已从知识库移除");
    await handleRefreshAnData();
  } catch (error) {
    ElMessage.error("移除失败");
    console.error(error);
  }
};

const availableKBs = computed(() => {
  const linked = addToKBRow.value?.knowledgeBaseIds || [];
  return knowledgeBases.value.filter((kb) => !linked.includes(kb._id));
});

const handleOpenAddToKB = (row) => {
  addToKBRow.value = row;
  addToKBTarget.value = "";
  addToKBVisible.value = true;
};

const handleConfirmAddToKB = async () => {
  if (!addToKBTarget.value) {
    ElMessage.warning("请选择目标知识库");
    return;
  }
  try {
    addToKBVisible.value = false;
    ElMessage.info("正在处理，请稍候...");
    await postAddDocToKnowledgeBase(addToKBRow.value._id, addToKBTarget.value);
    ElMessage.success("添加成功");
    await handleRefreshAnData();
    await loadKnowledgeBases();
  } catch (error) {
    ElMessage.error("添加失败：" + (error.message || "未知错误"));
    console.error(error);
  }
};

const handleAdd = () => {
  resetForm();
  dialogVisible.value = true;
};

const handleConfirm = async () => {
  try {
    const valid = await FormRef.value.validate();
    if (!valid) return;
    if (!Form.file) {
      ElMessage.error("请选择文件");
      return;
    }

    dialogVisible.value = false;

    const res = await postAddKnowledgeDoc({
      title: Form.title,
      file: Form.file,
      creator: appStore.userInfo.username,
      knowledgeBaseIds: JSON.stringify(Form.knowledgeBaseIds),
    });

    if (res && res.data) {
      ElMessage.success("文档上传成功，正在自动处理...");
      try {
        await postProcessKnowledgeDoc(res.data._id);
        ElMessage.success("文档处理完成");
      } catch {
        ElMessage.warning("文档处理失败，请手动点击「处理」重试");
      }
    }

    resetForm();
    await handleRefreshAnData();
  } catch (error) {
    ElMessage.error("上传失败");
    console.error(error);
  }
};

const handleProcess = async (row) => {
  try {
    ElMessage.info("开始处理文档...");
    await postProcessKnowledgeDoc(row._id);
    ElMessage.success("文档处理完成");
    await handleRefreshAnData();
  } catch (error) {
    ElMessage.error("文档处理失败");
    console.error(error);
    await handleRefreshAnData();
  }
};

const handleShowError = (row) => {
  ElMessageBox.alert(row.errorMessage || "未知错误", "处理错误详情", {
    confirmButtonText: "确定",
  });
};

const handleDeleteOne = async (row) => {
  try {
    await postDeleteKnowledgeDoc(row._id);
    ElMessage.success("删除成功");
    await handleRefreshAnData();
  } catch (error) {
    ElMessage.error("删除失败");
    console.error(error);
  }
};

const handleRefreshAnData = async () => {
  tableLoading.value = true;
  try {
    const res = await getKnowledgeDocList({
      page: currentPage.value,
      size: pageSize.value,
      knowledgeBaseId: selectedKB.value,
      keyword: keyword.value || undefined,
    });
    if (res) {
      tableData.value = res.data.data;
      total.value = res.data.total;
    }
  } catch (error) {
    ElMessage.error("获取列表失败");
    console.error(error);
  } finally {
    tableLoading.value = false;
  }
};

const handlePageChange = ({ page, size }) => {
  currentPage.value = page;
  pageSize.value = size;
  handleRefreshAnData();
};

onMounted(() => {
  loadKnowledgeBases();
  handleRefreshAnData();
});
</script>

<style scoped>
.doc-manage-page {
  padding: 0;
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.page-desc {
  font-size: 13px;
  color: #909399;
}

.header-right {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}

.filter-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-right {
  display: flex;
  gap: 8px;
}

.kb-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.kb-count {
  font-size: 12px;
  color: #909399;
}

/* 表格 */
.table-wrapper {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

/* 文档单元格 */
.doc-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.doc-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  background: #909399;
}

.doc-icon--pdf { background: #e74c3c; }
.doc-icon--docx, .doc-icon--doc { background: #2b7cd3; }
.doc-icon--txt, .doc-icon--md { background: #67c23a; }
.doc-icon--pptx { background: #e67e22; }
.doc-icon--xlsx, .doc-icon--xls, .doc-icon--csv { background: #217346; }
.doc-icon--html { background: #e44d26; }

.doc-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.doc-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-filename {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 状态单元格 */
.status-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot--0 { background: #909399; }
.status-dot--1 { background: #e6a23c; }
.status-dot--2 { background: #67c23a; }
.status-dot--3 { background: #f56c6c; }

.chunk-count {
  font-variant-numeric: tabular-nums;
  color: #606266;
}

/* 知识库标签 */
.kb-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.no-kb {
  font-size: 12px;
  color: #c0c4cc;
}

.creator-text,
.time-text {
  font-size: 13px;
  color: #606266;
}

/* 操作按钮 */
.action-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 分页 */
.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

/* 上传区域 */
.upload-area {
  width: 100%;
}

.upload-icon {
  font-size: 40px;
  color: #c0c4cc;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #606266;
}

.upload-text em {
  color: #409eff;
  font-style: normal;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

/* 添加到知识库 */
.add-to-kb-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.add-to-kb-hint {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.add-to-kb-empty {
  font-size: 12px;
  color: #909399;
  margin: 0;
  text-align: center;
}

:deep(.el-table__header th) {
  background-color: #f5f7fa !important;
}

:deep(.el-upload-dragger) {
  padding: 24px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 12px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-left {
    flex-direction: column;
  }
}
</style>
