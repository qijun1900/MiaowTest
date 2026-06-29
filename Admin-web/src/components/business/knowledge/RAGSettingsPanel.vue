<template>
  <div class="rag-settings-panel">
    <div class="panel-section">
      <div class="section-title">知识库</div>
      <el-select
        :model-value="modelValue.knowledgeBaseId"
        placeholder="全部知识库"
        clearable
        filterable
        style="width: 100%"
        @update:model-value="updateField('knowledgeBaseId', $event)"
      >
        <el-option
          v-for="kb in knowledgeBases"
          :key="kb._id"
          :label="kb.name"
          :value="kb._id"
        >
          <div class="kb-option">
            <span class="kb-name">{{ kb.name }}</span>
            <span class="kb-count">{{ kb.docCount ?? 0 }} 篇</span>
          </div>
        </el-option>
      </el-select>
    </div>

    <div class="panel-section">
      <div class="section-title">模型</div>
      <el-select
        :model-value="modelValue.modelName"
        style="width: 100%"
        @update:model-value="updateField('modelName', $event)"
      >
        <el-option label="qwen-plus" value="qwen-plus" />
        <el-option label="qwen-turbo" value="qwen-turbo" />
        <el-option label="qwen-max" value="qwen-max" />
      </el-select>
    </div>

    <div class="panel-section">
      <div class="section-title">
        <span>Top-K</span>
        <span class="section-value">{{ modelValue.topK }}</span>
      </div>
      <el-slider
        :model-value="modelValue.topK"
        :min="1"
        :max="10"
        :step="1"
        show-stops
        @update:model-value="updateField('topK', $event)"
      />
    </div>

    <div class="panel-section">
      <div class="section-title">
        <span>Temperature</span>
        <span class="section-value">{{ modelValue.temperature }}</span>
      </div>
      <el-slider
        :model-value="modelValue.temperature"
        :min="0"
        :max="1"
        :step="0.1"
        @update:model-value="updateField('temperature', $event)"
      />
    </div>

    <el-divider />

    <div class="panel-section">
      <div class="section-title">
        <span>对话历史</span>
        <span class="section-value">{{ historyCount }} 条</span>
      </div>
      <div class="history-list" v-if="historyCount > 0">
        <div
          v-for="(item, idx) in history"
          :key="idx"
          class="history-item"
        >
          <el-icon class="history-icon"><ChatDotRound /></el-icon>
          <span class="history-text">{{ item.question }}</span>
        </div>
      </div>
      <div v-else class="history-empty">暂无对话记录</div>
      <el-button
        v-if="historyCount > 0"
        type="danger"
        plain
        size="small"
        style="width: 100%; margin-top: 8px"
        @click="$emit('clear-history')"
      >
        <el-icon><Delete /></el-icon>
        清空对话
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChatDotRound, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  knowledgeBases: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Object,
    required: true,
  },
  history: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'clear-history'])

const historyCount = computed(() => props.history.length)

const updateField = (field, value) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<style scoped>
.rag-settings-panel {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
}

.panel-section {
  padding: 8px 0;
}

.section-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-value {
  font-size: 12px;
  color: #909399;
  font-variant-numeric: tabular-nums;
}

.kb-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.kb-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kb-count {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
  flex-shrink: 0;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  background: #f5f7fa;
  cursor: default;
}

.history-icon {
  color: #909399;
  flex-shrink: 0;
}

.history-text {
  font-size: 12px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-empty {
  font-size: 12px;
  color: #c0c4cc;
  text-align: center;
  padding: 16px 0;
}

:deep(.el-divider) {
  margin: 8px 0;
}

:deep(.el-slider__runway) {
  margin-right: 0;
}
</style>
