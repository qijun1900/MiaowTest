<template>
  <div class="rag-source-card" @click="handleClick">
    <div class="source-header">
      <div class="source-title">
        <el-icon class="source-icon"><Document /></el-icon>
        <span class="title-text">{{ source.metadata?.title || '未知文档' }}</span>
      </div>
      <div class="source-meta">
        <el-tag :type="scoreTagType" size="small" effect="plain" class="score-tag">
          相似度 {{ similarityPercent }}%
        </el-tag>
        <el-tag v-if="source.metadata?.fileType" size="small" type="info" effect="plain">
          {{ source.metadata.fileType.toUpperCase() }}
        </el-tag>
      </div>
    </div>
    <div class="source-body">
      <div
        class="source-content"
        :class="{ 'is-expanded': expanded }"
      >
        {{ source.content }}
      </div>
      <el-button
        v-if="isLongContent"
        link
        type="primary"
        size="small"
        class="expand-btn"
        @click="expanded = !expanded"
      >
        {{ expanded ? '收起' : '展开全部' }}
      </el-button>
    </div>
    <div v-if="source.metadata?.originalName" class="source-footer">
      <span class="file-name">{{ source.metadata.originalName }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Document } from '@element-plus/icons-vue'

const props = defineProps({
  source: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['preview'])

const handleClick = () => {
  const docId = props.source.metadata?.docId
  if (docId) {
    emit('preview', docId)
  }
}

const expanded = ref(false)

const similarityPercent = computed(() => {
  // score 是距离，越小越相似；转为百分比相似度
  const sim = 1 - (props.source.score || 0)
  return (sim * 100).toFixed(1)
})

const scoreTagType = computed(() => {
  const sim = 1 - (props.source.score || 0)
  if (sim >= 0.9) return 'success'
  if (sim >= 0.7) return ''
  return 'info'
})

const isLongContent = computed(() => {
  return (props.source.content || '').length > 200
})
</script>

<style scoped>
.rag-source-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px 16px;
  background: #fafbfc;
  transition: border-color 0.2s;
  cursor: pointer;
}

.rag-source-card:hover {
  border-color: #c0c4cc;
}

.source-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 8px;
}

.source-title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.source-icon {
  color: #909399;
  flex-shrink: 0;
}

.title-text {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-meta {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.score-tag {
  font-variant-numeric: tabular-nums;
}

.source-body {
  position: relative;
}

.source-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 80px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.source-content.is-expanded {
  max-height: none;
}

.expand-btn {
  margin-top: 4px;
  padding: 0;
  font-size: 12px;
}

.source-footer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #ebeef5;
}

.file-name {
  font-size: 12px;
  color: #909399;
}
</style>
