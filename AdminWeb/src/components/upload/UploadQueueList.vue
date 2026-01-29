<template>
  <div class="upload-queue-list">
    <div class="queue-header">
      <div class="header-left">
        <el-icon><List /></el-icon>
        <span>上传队列</span>
      </div>
      <div class="header-actions">
        <el-button 
          v-if="!isUploading"
          type="primary" 
          size="small"
          @click="$emit('start-upload')"
          :disabled="queueItems.length === 0"
        >
          <el-icon><Upload /></el-icon>
          开始上传
        </el-button>
        <el-button 
          v-else
          type="warning" 
          size="small"
          @click="$emit('pause-all')"
        >
          <el-icon><VideoPause /></el-icon>
          暂停全部
        </el-button>
      </div>
    </div>
    
    <div class="queue-list">
      <UploadQueueItem
        v-for="item in queueItems"
        :key="item.id"
        :item="item"
        @upload="$emit('upload-single', item)"
        @pause="$emit('pause-single', item)"
        @retry="$emit('retry-single', item)"
        @remove="$emit('remove-single', item.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { List, Upload, VideoPause } from '@element-plus/icons-vue'
import UploadQueueItem from './UploadQueueItem.vue'

defineProps({
  // ========== 队列数据 ==========
  queueItems: {
    type: Array,
    default: () => [],
    // 上传队列项数组，每项包含：id, file, name, size, status, progress等
  },
  
  // ========== 上传状态 ==========
  isUploading: {
    type: Boolean,
    default: false,
    // 是否正在批量上传
  }
})

// ========== 事件定义 ==========
defineEmits([
  'start-upload',   // 开始批量上传
  'pause-all',      // 暂停所有上传
  'upload-single',  // 上传单个文件
  'pause-single',   // 暂停单个文件
  'retry-single',   // 重试单个文件
  'remove-single'   // 移除单个文件
])
</script>

<style scoped>
.upload-queue-list {
  background: linear-gradient(135deg, #f6f8fa 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.header-left .el-icon {
  color: #409eff;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.queue-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.queue-list::-webkit-scrollbar {
  width: 6px;
}

.queue-list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}
</style>
