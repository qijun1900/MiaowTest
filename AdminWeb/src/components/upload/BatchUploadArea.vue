<template>
  <div 
    class="batch-upload-area" 
    :class="{ 
      'has-file': hasFiles,
      'is-dragging': isDragging,
      'is-expanded': !hasFiles
    }"
    @drop.prevent="handleDrop"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @dragenter.prevent="handleDragEnter"
  >
    <el-upload
      ref="uploadRef"
      class="upload-dragger-custom"
      drag
      action="#"
      :auto-upload="false"
      multiple
      :on-change="handleFileChange"
      :show-file-list="false"
      :accept="acceptedFileTypes"
    >
      <div class="upload-inner-content">
        <!-- 空状态 -->
        <div v-if="!hasFiles" class="upload-empty-state">
          <div class="icon-box">
            <el-icon><UploadFilled /></el-icon>
          </div>
          <div class="upload-text">
            <h3>点击或拖拽文件到此处批量上传</h3>
            <p>支持 JPG, PNG, PDF, MP4, MP3 等常见格式</p>
            <p class="upload-limit">单个文件最大 {{ maxFileSizeMB }}MB，最多同时上传 {{ maxFileCount }} 个文件</p>
          </div>
          <div class="upload-features">
            <div class="feature-item">
              <el-icon><Files /></el-icon>
              <span>支持批量上传</span>
            </div>
            <div class="feature-item">
              <el-icon><MagicStick /></el-icon>
              <span>自动识别分类</span>
            </div>
            <div class="feature-item">
              <el-icon><CircleCheck /></el-icon>
              <span>实时进度显示</span>
            </div>
          </div>
        </div>
        
        <!-- 队列统计 -->
        <div v-else class="queue-stats">
          <div class="stats-header">
            <div class="stats-info">
              <el-icon class="stats-icon"><Files /></el-icon>
              <span class="stats-text">已选择 <strong>{{ fileCount }}</strong> 个文件</span>
            </div>
            <el-button 
              type="danger" 
              text 
              bg 
              size="small"
              @click.stop="handleClearQueue"
              :disabled="isUploading"
            >
              <el-icon><Delete /></el-icon>
              清空队列
            </el-button>
          </div>
          
          <!-- 整体进度条 -->
          <div v-if="isUploading && overallProgress !== null" class="overall-progress">
            <div class="progress-info">
              <span>总体进度</span>
              <span class="progress-text">{{ uploadedCount }}/{{ fileCount }}</span>
            </div>
            <el-progress 
              :percentage="overallProgress" 
              :status="progressStatus"
              :stroke-width="8"
            />
          </div>
        </div>
      </div>
    </el-upload>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  UploadFilled, Files, Delete, MagicStick, CircleCheck
} from '@element-plus/icons-vue'

const props = defineProps({
  // ========== 文件状态 ==========
  hasFiles: {
    type: Boolean,
    default: false,
    // 是否有文件在队列中
  },
  fileCount: {
    type: Number,
    default: 0,
    // 队列中的文件数量
  },
  
  // ========== 上传状态 ==========
  isUploading: {
    type: Boolean,
    default: false,
    // 是否正在上传
  },
  uploadedCount: {
    type: Number,
    default: 0,
    // 已完成上传的文件数量
  },
  
  // ========== 进度信息 ==========
  overallProgress: {
    type: Number,
    default: null,
    // 整体上传进度（0-100）
  },
  progressStatus: {
    type: String,
    default: undefined,
    // 进度状态：success/exception/undefined
  },
  
  // ========== 上传限制 ==========
  maxFileSizeMB: {
    type: Number,
    default: 100,
    // 单个文件最大大小（MB）
  },
  maxFileCount: {
    type: Number,
    default: 20,
    // 最多上传文件数量
  },
  
  // ========== 文件格式 ==========
  acceptedFileTypes: {
    type: String,
    default: '.jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.mp4,.avi,.mov,.wmv,.flv,.mp3,.wav,.aac,.flac',
    // 支持的文件格式（逗号分隔的扩展名）
  }
})

const emit = defineEmits(['file-change', 'clear-queue'])

const uploadRef = ref()
const isDragging = ref(false)

const handleFileChange = (uploadFile) => {
  emit('file-change', uploadFile)
}

const handleDragEnter = () => {
  isDragging.value = true
}

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = (e) => {
  if (e.target.classList.contains('batch-upload-area')) {
    isDragging.value = false
  }
}

const handleDrop = () => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  emit('file-change', files)
}

const handleClearQueue = () => {
  emit('clear-queue')
}

const clearFiles = () => {
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

defineExpose({
  clearFiles
})
</script>

<style scoped>
.batch-upload-area {
  flex-shrink: 0;
  min-height: 200px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.batch-upload-area.is-expanded {
  flex: 1;
  min-height: 100%;
}

.batch-upload-area.is-dragging :deep(.el-upload-dragger) {
  border-color: #409eff;
  background: linear-gradient(135deg, #ecf5ff 0%, #ffffff 100%);
  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.1);
  transform: scale(1.01);
}

.upload-dragger-custom {
  height: 100%;
}

:deep(.el-upload) {
  width: 100%;
  height: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 100%;
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409eff;
  background: linear-gradient(135deg, #ecf5ff 0%, #ffffff 100%);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
}

.upload-inner-content {
  text-align: center;
  width: 100%;
}

.upload-empty-state {
  animation: fadeIn 0.4s ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-box {
  font-size: 80px;
  color: #c0c4cc;
  margin-bottom: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
}

:deep(.el-upload-dragger:hover) .icon-box {
  color: #409eff;
  transform: translateY(-8px) scale(1.05);
}

.upload-text {
  text-align: center;
  margin-bottom: 32px;
}

.upload-text h3 {
  margin: 0 0 12px;
  font-size: 18px;
  color: #606266;
  font-weight: 600;
}

.upload-text p {
  margin: 6px 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
}

.upload-limit {
  font-size: 13px !important;
  color: #c0c4cc !important;
  margin-top: 12px !important;
}

.upload-features {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px dashed #e4e7ed;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(64, 158, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s;
}

.feature-item:hover {
  background: rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.feature-item .el-icon {
  font-size: 24px;
  color: #409eff;
}

.feature-item span {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.queue-stats {
  width: 100%;
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stats-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-icon {
  font-size: 24px;
  color: #409eff;
}

.stats-text {
  font-size: 15px;
  color: #606266;
}

.stats-text strong {
  color: #409eff;
  font-size: 18px;
}

.overall-progress {
  margin-top: 16px;
  padding: 16px;
  background: #f6f8fa;
  border-radius: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
}

.progress-text {
  font-weight: 600;
  color: #409eff;
}

@media (max-width: 1200px) {
  .batch-upload-area.is-expanded {
    min-height: 400px;
  }
  
  .upload-features {
    gap: 16px;
  }
  
  .feature-item {
    padding: 10px 12px;
  }
  
  .icon-box {
    font-size: 64px;
  }
}
</style>
