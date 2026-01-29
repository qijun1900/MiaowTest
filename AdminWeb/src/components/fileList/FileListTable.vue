<template>
  <div class="file-list-table">
    <!-- 表格头部 -->
    <div class="table-header">
      <div class="header-title">
        <el-icon class="folder-icon">
          <FolderOpened />
        </el-icon>
        <span>文件管理</span>
      </div>
      <div class="header-actions">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索文件名..." 
          :prefix-icon="Search" 
          clearable
          class="search-input" 
          @input="handleSearch"
          :class="{ 'search-input-focused': isSearchFocused }"
          @focus="isSearchFocused = true"
          @blur="isSearchFocused = false" 
        />
        <el-select
          v-model="selectedTag"
          placeholder="按标签筛选"
          clearable
          filterable
          default-first-option
          class="tag-select"
          @change="handleTagChange"
        >
          <el-option
            v-for="item in tagOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button 
          type="primary" 
          :icon="Upload" 
          @click="$emit('upload')"
          class="upload-button"
        >
          上传文件
        </el-button>
        <el-button 
          :icon="Refresh" 
          circle 
          @click="$emit('refresh')"
          class="refresh-button"
          :class="{ 'refresh-button-spinning': isRefreshing }" 
        />
      </div>
    </div>

    <!-- 表格内容 -->
    <div class="table-content">
      <el-table 
        :data="tableData" 
        style="width: 100%; height: 100%" 
        height="100%" 
        highlight-current-row
        @current-change="handleCurrentChange" 
        v-loading="loading"
        :row-class-name="tableRowClassName"
        class="file-table"
      >
        <el-table-column prop="name" label="文件名" min-width="180">
          <template #default="{ row }">
            <div class="file-name-cell">
              <el-icon class="file-icon" :size="20" :class="getFileIconClass(row)">
                <component :is="getFileIcon(row, { Picture, VideoPlay, Headset, Document })" />
              </el-icon>
              <span class="text-truncate">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="mimeType" label="业务标签" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag size="small" type="success">
              {{ row.tag}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100">
          <template #default="{ row }">
            <span class="file-size">{{ formatFileSize(row.size) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="mimeType" label="类型" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag size="small" :type="getFileTypeTagType(row.mimeType)">
              {{ row.mimeType.split('/')[1] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="上传时间" width="160">
          <template #default="{ row }">
            <span class="file-time">{{ formatTime.formatDate(row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <div class="file-actions">
              <el-button 
                link 
                type="danger" 
                size="small"
                @click.stop="$emit('delete', row)"
                class="action-button delete-button"
              >
                删除
              </el-button>
              <el-button
                link 
                type="primary" 
                size="small"
                @click.stop="$emit('edit', row)"
                class="action-button edit-button"
              >
                编辑
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="table-footer">
      <Pagination
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @page-change="handlePageChange"
        size="small"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  Search, Upload, Refresh, FolderOpened,
  Picture, Document, VideoPlay, Headset
} from '@element-plus/icons-vue'
import Pagination from '@/components/ReuseComponents/Pagination.vue'
import { getFileIcon } from '@/util/resourceUtils'
import { 
  getFileIconClass, 
  getFileTypeTagType, 
  tableRowClassName, 
  formatFileSize 
} from '@/util/fileListUtils'
import formatTime from '@/util/formatTime'

const props = defineProps({
  // ========== 表格数据 ==========
  tableData: {
    type: Array,
    default: () => [],
    // 文件列表数据
  },
  loading: {
    type: Boolean,
    default: false,
    // 加载状态
  },
  
  // ========== 分页信息 ==========
  total: {
    type: Number,
    default: 0,
    // 总数据量
  },
  currentPage: {
    type: Number,
    default: 1,
    // 当前页码
  },
  pageSize: {
    type: Number,
    default: 20,
    // 每页数量
  },
  
  // ========== 筛选选项 ==========
  tagOptions: {
    type: Array,
    default: () => [],
    // 标签选项列表
  },
  
  // ========== 刷新状态 ==========
  isRefreshing: {
    type: Boolean,
    default: false,
    // 是否正在刷新
  }
})

// ========== 事件定义 ==========
const emit = defineEmits([
  'current-change',  // 当前行变化
  'search',          // 搜索
  'tag-change',      // 标签筛选变化
  'page-change',     // 分页变化
  'upload',          // 上传文件
  'refresh',         // 刷新数据
  'delete',          // 删除文件
  'edit'             // 编辑文件
])

// ========== 本地状态 ==========
const searchQuery = ref('')
const selectedTag = ref('')
const isSearchFocused = ref(false)

// ========== 事件处理 ==========
const handleCurrentChange = (val) => {
  emit('current-change', val)
}

const handleSearch = () => {
  emit('search', searchQuery.value)
}

const handleTagChange = () => {
  emit('tag-change', selectedTag.value)
}

const handlePageChange = ({ page, size }) => {
  emit('page-change', { page, size })
}

// ========== 监听外部变化 ==========
watch(() => props.currentPage, () => {
  // 同步外部页码变化
})
</script>

<style scoped>
.file-list-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
}

.table-header {
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  gap: 10px;
}

.folder-icon {
  font-size: 20px;
  color: var(--el-color-primary);
  animation: folderPulse 2s infinite;
}

@keyframes folderPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 220px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.search-input-focused {
  box-shadow: 0 0 0 2px var(--el-color-primary-light-3);
  transform: translateY(-1px);
}

.tag-select {
  width: 180px;
  border-radius: 20px;
}

.upload-button {
  border-radius: 20px;
  transition: all 0.3s ease;
}

.upload-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.refresh-button {
  border-radius: 50%;
  transition: all 0.3s ease;
}

.refresh-button-spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.table-content {
  flex: 1;
  overflow: hidden;
}

.file-table ::v-deep .el-table__row {
  transition: all 0.3s ease;
}

.file-table ::v-deep .el-table__row:hover {
  background-color: var(--el-color-primary-light-9);
  transform: translateX(5px);
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-icon {
  transition: all 0.3s ease;
}

.file-icon:hover {
  transform: scale(1.1);
}

.file-icon-image {
  color: var(--el-color-primary);
}

.file-icon-video {
  color: var(--el-color-warning);
}

.file-icon-audio {
  color: var(--el-color-success);
}

.file-icon-document {
  color: var(--el-color-info);
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.file-time {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  transition: all 0.3s ease;
  border-radius: 4px;
}

.action-button:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.table-footer {
  padding: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  justify-content: flex-end;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

@media (max-width: 1200px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .header-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .search-input {
    width: 100%;
  }
  
  .tag-select {
    width: 100%;
  }
}
</style>
