<template>
  <div class="upload-page">
    <!-- 页面头部 -->
    <div class="page-header-box">
      <div class="header-title">
        <div class="icon-wrapper">
          <el-icon class="header-icon"><FolderAdd /></el-icon>
        </div>
        <div class="title-content">
          <h2>资源上传中心</h2>
          <p class="header-desc">支持批量拖拽上传，自动识别文件类型并提取元数据，实时显示上传进度</p>
        </div>
      </div>
    </div>

    <el-card class="main-card" shadow="never">
      <el-row :gutter="32" class="upload-row">
        <!-- 左侧：批量上传交互区 -->
        <el-col :xs="24" :lg="10" class="left-panel">
          <!-- 上传区域 -->
          <BatchUploadArea
            ref="uploadAreaRef"
            :has-files="uploadQueue.length > 0"
            :file-count="uploadQueue.length"
            :is-uploading="isUploading"
            :uploaded-count="uploadedCount"
            :overall-progress="overallProgress"
            :progress-status="overallProgressStatus"
            :max-file-size-m-b="maxFileSizeMB"
            :max-file-count="maxFileCount"
            :accepted-file-types="acceptedFileTypes"
            @file-change="handleFileChange"
            @clear-queue="handleClearQueue"
          />

          <!-- 上传队列列表 -->
          <transition name="el-fade-in">
            <UploadQueueList
              v-if="uploadQueue.length > 0"
              :queue-items="uploadQueue"
              :is-uploading="isUploading"
              @start-upload="handleStartUpload"
              @pause-all="pauseAllUploads"
              @upload-single="(item) => uploadSingleFile(item, tagOptions)"
              @pause-single="pauseUpload"
              @retry-single="(item) => retryUpload(item, tagOptions)"
              @remove-single="removeFromQueue"
            />
          </transition>
        </el-col>

        <!-- 右侧：批量配置表单 -->
        <el-col :xs="24" :lg="14" class="right-panel">
          <BatchConfigForm
            :config="batchConfig"
            :tag-options="tagOptions"
          />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { FolderAdd } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores'
import { getTags } from '@/API/Resource/FileAPI'
import { useBatchUpload } from '@/composables/useBatchUpload'
import BatchUploadArea from '@/components/upload/BatchUploadArea.vue'
import UploadQueueList from '@/components/upload/UploadQueueList.vue'
import BatchConfigForm from '@/components/upload/BatchConfigForm.vue'

const appStore = useAppStore()
const uploadAreaRef = ref()

// 使用批量上传组合式函数
const {
  isUploading,
  uploadQueue,
  batchConfig,
  uploadedCount,
  overallProgress,
  overallProgressStatus,
  maxFileSizeMB,
  maxFileCount,
  acceptedFileTypes,
  addFilesToQueue,
  clearQueue,
  removeFromQueue,
  uploadSingleFile,
  startBatchUpload,
  pauseUpload,
  pauseAllUploads,
  retryUpload
} = useBatchUpload(appStore)

// 标签选项
const tagOptions = ref([])

// 获取标签列表
const fetchTags = async () => {
  try {
    const response = await getTags()
    if (response.code === 200) {
      tagOptions.value = response.data.map(tag => ({
        label: tag,
        value: tag
      }))
    }
  } catch (error) {
    console.error('获取标签失败', error)
  }
}

onMounted(() => {
  fetchTags()
})

// 文件变动处理
const handleFileChange = (data) => {
  if (Array.isArray(data)) {
    // 拖拽多个文件
    addFilesToQueue(data)
  } else if (data.raw) {
    // 点击选择单个文件
    addFilesToQueue([data.raw])
  }
}

// 清空队列
const handleClearQueue = async () => {
  const result = await clearQueue()
  if (result && uploadAreaRef.value) {
    uploadAreaRef.value.clearFiles()
  }
}

// 开始上传
const handleStartUpload = () => {
  startBatchUpload(tagOptions)
}
</script>

<style scoped>
.upload-page {
  padding: 10px;
  height: calc(100vh - 100px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.page-header-box {
  margin-bottom: 10px;
  flex-shrink: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
  flex-shrink: 0;
}

.header-icon {
  font-size: 24px;
  color: #ffffff;
}

.title-content {
  flex: 1;
}

.title-content h2 {
  margin: 0 0 4px 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.header-desc {
  margin: 0;
  color: #909399;
  font-size: 13px;
  line-height: 1.5;
}

.main-card {
  flex: 1;
  border-radius: 16px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-card :deep(.el-card__body) {
  padding: 24px;
  height: 100%;
  overflow: hidden;
}

.upload-row {
  height: 100%;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.left-panel::-webkit-scrollbar {
  width: 6px;
}

.left-panel::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.right-panel {
  padding-left: 24px;
  border-left: 1px solid #e4e7ed;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.right-panel::-webkit-scrollbar {
  width: 6px;
}

.right-panel::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.el-fade-in-enter-active,
.el-fade-in-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-fade-in-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.el-fade-in-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 1200px) {
  .upload-page {
    height: auto;
    overflow: auto;
  }
  
  .main-card {
    flex: none;
  }
  
  .left-panel {
    height: auto;
  }
  
  .right-panel {
    padding-left: 0;
    border-left: none;
    margin-top: 20px;
  }
}
</style>
