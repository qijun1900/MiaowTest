<template>
  <div 
    class="queue-item"
    :class="{
      'is-uploading': item.status === 'uploading',
      'is-success': item.status === 'success',
      'is-error': item.status === 'error',
      'is-paused': item.status === 'paused'
    }"
  >
    <div class="item-icon">
      <el-icon v-if="item.category === 1"><Picture /></el-icon>
      <el-icon v-else-if="item.category === 2"><Document /></el-icon>
      <el-icon v-else-if="item.category === 3"><VideoPlay /></el-icon>
      <el-icon v-else-if="item.category === 4"><Headset /></el-icon>
      <el-icon v-else><Files /></el-icon>
    </div>
    
    <div class="item-content">
      <div class="item-header">
        <span class="item-name" :title="item.name">{{ item.name }}</span>
        <span class="item-size">{{ formatFileSize(item.size) }}</span>
      </div>
      
      <div class="item-meta">
        <el-tag 
          :type="getCategoryTagType(item.category)" 
          size="small" 
          effect="plain"
        >
          {{ getCategoryLabel(item.category) }}
        </el-tag>
        <span class="item-tag" v-if="item.tag">{{ item.tag }}</span>
      </div>
      
      <!-- 上传进度 -->
      <div v-if="item.status === 'uploading'" class="item-progress">
        <el-progress 
          :percentage="item.progress" 
          :stroke-width="4"
          :show-text="false"
        />
      </div>
      
      <!-- 状态提示 -->
      <div class="item-status">
        <span v-if="item.status === 'waiting'" class="status-waiting">
          <el-icon><Clock /></el-icon>
          等待上传
        </span>
        <span v-else-if="item.status === 'uploading'" class="status-uploading">
          <el-icon class="rotating"><Loading /></el-icon>
          上传中 {{ item.progress }}%
        </span>
        <span v-else-if="item.status === 'success'" class="status-success">
          <el-icon><CircleCheck /></el-icon>
          上传成功
        </span>
        <span v-else-if="item.status === 'error'" class="status-error">
          <el-icon><CircleClose /></el-icon>
          {{ item.errorMsg || '上传失败' }}
        </span>
        <span v-else-if="item.status === 'paused'" class="status-paused">
          <el-icon><VideoPause /></el-icon>
          已暂停
        </span>
      </div>
    </div>
    
    <div class="item-actions">
      <el-button 
        v-if="item.status === 'waiting' || item.status === 'paused'"
        type="primary" 
        text 
        size="small"
        @click="$emit('upload')"
      >
        <el-icon><VideoPlay /></el-icon>
      </el-button>
      <el-button 
        v-if="item.status === 'uploading'"
        type="warning" 
        text 
        size="small"
        @click="$emit('pause')"
      >
        <el-icon><VideoPause /></el-icon>
      </el-button>
      <el-button 
        v-if="item.status === 'error'"
        type="success" 
        text 
        size="small"
        @click="$emit('retry')"
      >
        <el-icon><RefreshRight /></el-icon>
      </el-button>
      <el-button 
        type="danger" 
        text 
        size="small"
        @click="$emit('remove')"
        :disabled="item.status === 'uploading'"
      >
        <el-icon><Delete /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import {
  Picture, Document, VideoPlay, Headset, Files,
  Clock, Loading, CircleCheck, CircleClose, VideoPause,
  RefreshRight, Delete
} from '@element-plus/icons-vue'
import { formatFileSize, getCategoryLabel, getCategoryTagType } from '@/util/resourceUtils'

defineProps({
  // ========== 队列项数据 ==========
  item: {
    type: Object,
    required: true,
    // 包含：id, file, name, size, category, tag, status, progress, errorMsg等
    // status: 'waiting' | 'uploading' | 'success' | 'error' | 'paused'
  }
})

// ========== 事件定义 ==========
defineEmits([
  'upload',  // 开始上传此文件
  'pause',   // 暂停上传此文件
  'retry',   // 重试上传此文件
  'remove'   // 从队列移除此文件
])
</script>

<style scoped>
.queue-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.queue-item:hover {
  border-color: #c0c4cc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.queue-item.is-uploading {
  border-color: #409eff;
  background: #ecf5ff;
}

.queue-item.is-success {
  border-color: #67c23a;
  background: #f0f9ff;
}

.queue-item.is-error {
  border-color: #f56c6c;
  background: #fef0f0;
}

.queue-item.is-paused {
  border-color: #e6a23c;
  background: #fdf6ec;
}

.item-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-icon .el-icon {
  font-size: 20px;
  color: #ffffff;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.item-size {
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.item-tag {
  font-size: 12px;
  color: #606266;
  padding: 2px 8px;
  background: #f0f2f5;
  border-radius: 4px;
}

.item-progress {
  margin-top: 8px;
}

.item-status {
  margin-top: 6px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-waiting {
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-uploading {
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-success {
  color: #67c23a;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-error {
  color: #f56c6c;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-paused {
  color: #e6a23c;
  display: flex;
  align-items: center;
  gap: 4px;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}
</style>
