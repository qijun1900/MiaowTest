<template>
  <div class="file-manager-container">
    <!-- 分割布局 -->
    <div class="split-layout" ref="splitLayout">
      <!-- 左侧面板：文件列表 -->
      <div 
        class="pane-left" 
        :style="{ width: leftPaneWidth + '%' }"
      >
        <FileListTable
          :table-data="tableData"
          :loading="loading"
          :total="total"
          :current-page="currentPage"
          :page-size="pageSize"
          :tag-options="tagOptions"
          :is-refreshing="isRefreshing"
          @current-change="handleCurrentChange"
          @search="handleSearch"
          @tag-change="handleTagChange"
          @page-change="handlePageChange"
          @upload="handleUpload"
          @refresh="refreshData"
          @delete="handleDelete"
          @edit="handleEdit"
          @change-status="handleStateChange"
        />
      </div>

      <!-- 调整大小手柄 -->
      <div 
        class="resizer" 
        @mousedown="startResize" 
        :class="{ 'resizer-active': isResizing }"
      >
        <div class="resizer-line"></div>
      </div>

      <!-- 右侧面板：预览和详情 -->
      <div 
        class="pane-right" 
        :style="{ width: (100 - leftPaneWidth) + '%' }"
      >
        <FilePreviewPanel
          :file="selectedFile"
          @copy-link="copyLink"
          @download="downloadFile"
        />
      </div>
    </div>

    <!-- 编辑对话框 -->
    <FileEditDialog
      ref="editDialogRef"
      v-model="dialogVisible"
      :file-data="editingFile"
      :tag-options="tagOptions"
      :is-updating="isUpdating"
      @confirm="handleConfirmEdit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RouterPush from '@/util/RouterPush'
import { useFileList } from '@/composables/useFileList'
import FileListTable from '@/components/fileList/FileListTable.vue'
import FilePreviewPanel from '@/components/fileList/FilePreviewPanel.vue'
import FileEditDialog from '@/components/fileList/FileEditDialog.vue'

// ========== 使用文件列表组合式函数 ==========
const {
  loading,
  isRefreshing,
  currentPage,
  pageSize,
  total,
  tableData,
  selectedFile,
  tagOptions,
  fetchTags,
  fetchData,
  handleSearch,
  handleTagChange,
  handlePageChange,
  refreshData,
  handleCurrentChange,
  handleDelete,
  handleUpdate,
  copyLink,
  downloadFile,
  handleStateChange,
} = useFileList()

// ========== 布局调整逻辑 ==========
const leftPaneWidth = ref(65)
const isResizing = ref(false)
const splitLayout = ref(null)

const startResize = () => {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const handleResize = (e) => {
  if (!isResizing.value || !splitLayout.value) return
  const containerRect = splitLayout.value.getBoundingClientRect()
  const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

  if (newLeftWidth > 20 && newLeftWidth < 80) {
    leftPaneWidth.value = newLeftWidth
  }
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// ========== 编辑对话框逻辑 ==========
const dialogVisible = ref(false)
const editDialogRef = ref()
const editingFile = ref(null)
const isUpdating = ref(false)

const handleEdit = (file) => {
  editingFile.value = file
  dialogVisible.value = true
}

const handleConfirmEdit = async (data) => {
  isUpdating.value = true
  try {
    const success = await handleUpdate(data)
    if (success) {
      dialogVisible.value = false
      if (editDialogRef.value) {
        editDialogRef.value.resetForm()
      }
    }
  } finally {
    isUpdating.value = false
  }
}

// ========== 上传处理 ==========
const handleUpload = () => {
  RouterPush('/resource/fileupload')
}

// ========== 初始化 ==========
onMounted(() => {
  fetchTags()
  fetchData()
})
</script>

<style scoped>
/* ==================== 主容器样式 ==================== */
.file-manager-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  overflow: hidden;
}

/* ==================== 分割布局 ==================== */
.split-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
  height: 100%;
}

/* ==================== 左侧面板 ==================== */
.pane-left {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-right: 1px solid var(--el-border-color-light);
  height: 100%;
  transition: all 0.3s ease;
}

/* ==================== 调整大小手柄 ==================== */
.resizer {
  width: 8px;
  cursor: col-resize;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  margin-left: -4px;
  margin-right: -4px;
  position: relative;
  transition: all 0.3s ease;
}

.resizer:hover {
  background-color: rgba(103, 194, 58, 0.1);
}

.resizer-active {
  background-color: rgba(103, 194, 58, 0.2);
}

.resizer:hover .resizer-line,
.resizer-active .resizer-line {
  background-color: var(--el-color-primary);
  height: 60px;
}

.resizer-line {
  width: 2px;
  height: 40px;
  background-color: var(--el-border-color);
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* ==================== 右侧面板 ==================== */
.pane-right {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  transition: all 0.3s ease;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .pane-left {
    width: 100% !important;
  }
  
  .pane-right {
    display: none;
  }
  
  .resizer {
    display: none;
  }
}
</style>