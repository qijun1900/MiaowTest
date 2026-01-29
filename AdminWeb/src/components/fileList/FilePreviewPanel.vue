<template>
  <div class="file-preview-panel">
    <div 
      v-if="file" 
      class="preview-container"
    >
      <!-- 预览头部 -->
      <div class="preview-header">
        <h3 class="preview-title">
          <el-icon class="preview-title-icon">
            <component :is="getFileIcon(file, { Picture, VideoPlay, Headset, Document })" />
          </el-icon>
          {{ fileName }}
        </h3>
        <div class="preview-actions">
          <el-button 
            type="primary" 
            link 
            :icon="CopyDocument"
            @click="$emit('copy-link', file.url)"
          >
            复制链接
          </el-button>
          <el-button 
            type="success"       
            link 
            :icon="Download"
            @click="$emit('download', file)"
          >
            下载
          </el-button>
        </div>
      </div>

      <!-- 预览区域 -->
      <div class="preview-stage">
        <!-- 图片预览 -->
        <div v-if="isImage(file)" class="media-wrapper image-wrapper">
          <div class="image-preview-container">
            <el-image 
              :src="file.url" 
              :preview-src-list="[file.url]" 
              fit="contain"
              class="preview-image"
              :preview-teleported="true"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <span>图片加载失败</span>
                </div>
              </template>
            </el-image>
            <div class="image-overlay">
              <el-icon class="zoom-icon"><ZoomIn /></el-icon>
              <span class="zoom-text">点击查看大图</span>
            </div>
          </div>
        </div>
        
        <!-- 视频预览 -->
        <div v-else-if="isVideo(file)" class="media-wrapper video-wrapper">
          <video controls :src="file.url" class="preview-video" preload="metadata">
            您的浏览器不支持视频播放
          </video>
        </div>
        
        <!-- 音频预览 -->
        <div v-else-if="isAudio(file)" class="media-wrapper audio-wrapper">
          <div class="audio-icon-container">
            <el-icon class="audio-icon">
              <Headset />
            </el-icon>
          </div>
          <div class="audio-info">
            <p class="audio-name">{{ file.name }}</p>
            <audio controls :src="file.url" class="preview-audio" preload="metadata">
              您的浏览器不支持音频播放
            </audio>
          </div>
        </div>
        
        <!-- 其他文件 -->
        <div v-else class="media-wrapper file-wrapper">
          <div class="file-icon-container">
            <el-icon size="64" color="#909399">
              <Document />
            </el-icon>
          </div>
          <p class="file-not-supported">该文件类型不支持预览</p>
          <p class="file-type-hint">{{ file.mimeType || '未知类型' }}</p>
        </div>
      </div>

      <!-- 信息列表 -->
      <div class="info-list">
        <div class="info-item" v-for="(item, index) in fileInfoList" :key="index">
          <span class="label">{{ item.label }}</span>
          <span class="value" v-if="!item.isTag">
            {{ item.value }}
          </span>
          <span class="value" v-else>
            <el-tag size="small" :type="item.tagType">{{ item.value }}</el-tag>
          </span>
        </div>
        <div class="info-item block">
          <span class="label">URL</span>
          <div class="url-container">
            <span class="value link" @click="$emit('copy-link', file.url)">{{ file.url }}</span>
            <el-button 
              type="primary" 
              size="small"
              :icon="CopyDocument"
              @click="$emit('copy-link', file.url)"
            >
              复制
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-state-content">
        <el-icon class="empty-icon">
          <Document />
        </el-icon>
        <h4 class="empty-title">未选择文件</h4>
        <p class="empty-description">请从左侧列表中选择一个文件查看详情</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Picture, Document, VideoPlay, Headset,
  CopyDocument, Download, ZoomIn
} from '@element-plus/icons-vue'
import { 
  isImage,
  isVideo, 
  isAudio, 
  getFileIcon
} from '@/util/resourceUtils'
import { generateFileInfoList } from '@/util/fileListUtils'

const props = defineProps({
  // ========== 文件数据 ==========
  file: {
    type: Object,
    default: null,
    // 当前选中的文件对象
  }
})

// ========== 事件定义 ==========
defineEmits([
  'copy-link',   // 复制链接
  'download'     // 下载文件
])

// ========== 计算属性 ==========
const fileInfoList = computed(() => {
  return generateFileInfoList(props.file)
})
//对文件名进行截断
const fileName = computed(() => {
  if (!props.file || !props.file.name) return ''
  const name = props.file.name
  const maxLength = 20
  if (name.length <= maxLength) {
    return name
  }
  const extIndex = name.lastIndexOf('.')
  const ext = extIndex !== -1 ? name.slice(extIndex) : ''
  const truncatedName = name.slice(0, maxLength - ext.length - 3)
  return `${truncatedName}...${ext}`
})

</script>

<style scoped>
.file-preview-panel {
  background-color: #f9f9fb;
  height: 100%;
  overflow-y: auto;
}

.preview-container {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: previewSlideIn 0.5s ease;
}

@keyframes previewSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.preview-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-title-icon {
  font-size: 20px;
  color: var(--el-color-primary);
}

.preview-actions {
  display: flex;
  gap: 10px;
}

.preview-stage {
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
}

.preview-stage:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}

.media-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

/* ==================== 图片预览样式 ==================== */
.image-wrapper {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  position: relative;
}

.image-preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.preview-image {
  max-width: 100%;
  max-height: 280px;
  width: auto;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
  background: #fff;
}

.preview-image:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.preview-image :deep(img) {
  display: block;
  max-width: 100%;
  max-height: 280px;
  width: auto;
  height: auto;
  object-fit: contain;
}

.image-overlay {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  font-size: 13px;
}

.image-preview-container:hover .image-overlay {
  opacity: 1;
}

.zoom-icon {
  font-size: 16px;
}

.zoom-text {
  font-size: 13px;
  font-weight: 500;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: var(--el-text-color-secondary);
}

.image-error .el-icon {
  font-size: 48px;
  color: var(--el-color-info-light-3);
}

/* ==================== 视频预览样式 ==================== */
.video-wrapper {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
}

.preview-video {
  max-width: 100%;
  max-height: 500px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  background: #000;
}

/* ==================== 音频预览样式 ==================== */
.audio-wrapper {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  gap: 24px;
  padding: 40px;
}

.audio-icon-container {
  font-size: 64px;
  color: var(--el-color-primary);
  background: rgba(255, 255, 255, 0.9);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: audioPulse 2s infinite;
}

@keyframes audioPulse {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }
}

.audio-info {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.audio-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  text-align: center;
  margin: 0;
  padding: 0 20px;
  word-break: break-word;
}

.preview-audio {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
}

/* ==================== 其他文件样式 ==================== */
.file-wrapper {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  gap: 16px;
  padding: 40px;
}

.file-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.file-not-supported {
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  margin: 0;
}

.file-type-hint {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  text-align: center;
  margin: 0;
}

.info-list {
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.info-list:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.info-item {
  display: flex;
  padding: 10px 5px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: all 0.3s ease;
}

.info-item:hover {
  background-color: var(--el-color-primary-light-9);
  padding-left: 10px;
  border-radius: 4px;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item.block {
  flex-direction: column;
  gap: 10px;
  padding: 16px 0;
}

.info-item .label {
  width: 120px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  font-weight: 500;
}

.info-item .value {
  flex: 1;
  color: var(--el-text-color-primary);
  font-size: 14px;
  word-break: break-all;
}

.url-container {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.url-container .value {
  flex: 1;
  min-width: 200px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--el-text-color-secondary);
}

.empty-state-content {
  text-align: center;
  padding: 40px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.empty-state-content:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}

.empty-icon {
  font-size: 64px;
  color: var(--el-color-info-light-3);
  margin-bottom: 20px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;
}

.empty-description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
</style>
