<template>
  <div class="retrieval-debug-panel">
    <el-tabs v-model="activeTab" class="debug-tabs">
      <!-- Tab 1: 检索测试 -->
      <el-tab-pane label="检索测试" name="retrieval">
        <div class="tab-content">
          <div class="test-form">
            <el-input
              v-model="testQuery"
              placeholder="输入测试查询，例如：什么是计算机网络？"
              clearable
              @keyup.enter="handleTestRetrieval"
            >
              <template #prepend>查询文本</template>
            </el-input>
            <div class="test-form-actions">
              <el-select
                v-model="testKBId"
                placeholder="选择知识库"
                clearable
                filterable
                style="flex: 1"
              >
                <el-option
                  v-for="kb in knowledgeBases"
                  :key="kb._id"
                  :label="kb.name"
                  :value="kb._id"
                />
              </el-select>
              <el-input-number
                v-model="testTopK"
                :min="1"
                :max="20"
                controls-position="right"
                style="width: 100px"
              />
              <el-button
                type="primary"
                :loading="retrievalLoading"
                @click="handleTestRetrieval"
              >
                测试检索
              </el-button>
            </div>
          </div>

          <!-- 检索结果 -->
          <div v-if="retrievalResults" class="retrieval-results">
            <div class="results-summary">
              <el-tag type="info" size="small">
                查询: {{ retrievalResults.query }}
              </el-tag>
              <el-tag size="small">
                Top-{{ retrievalResults.topK }} / Collection: {{ retrievalResults.collectionName }}
              </el-tag>
            </div>

            <div class="result-list">
              <div
                v-for="(item, idx) in retrievalResults.results"
                :key="idx"
                class="result-item"
              >
                <div class="result-header">
                  <div class="result-rank">
                    <span class="rank-badge" :class="getScoreLevel(item.similarity)">
                      {{ item.rank }}
                    </span>
                    <span class="result-similarity" :class="getScoreLevel(item.similarity)">
                      {{ item.similarity }}
                    </span>
                  </div>
                  <div class="result-meta">
                    <el-tag
                      v-if="item.metadata?.title"
                      size="small"
                      type="info"
                      effect="plain"
                    >
                      {{ item.metadata.title }}
                    </el-tag>
                    <el-tag
                      v-if="item.metadata?.fileType"
                      size="small"
                      effect="plain"
                    >
                      {{ item.metadata.fileType.toUpperCase() }}
                    </el-tag>
                    <span class="result-length">{{ item.contentLength }} 字符</span>
                  </div>
                </div>

                <!-- 相似度进度条 -->
                <div class="similarity-bar-wrapper">
                  <div
                    class="similarity-bar"
                    :class="getScoreLevel(item.similarity)"
                    :style="{ width: item.similarity }"
                  />
                </div>

                <!-- Chunk 内容 -->
                <div
                  class="result-content"
                  :class="{ 'is-expanded': expandedResults.has(idx) }"
                >
                  {{ item.content }}
                </div>
                <el-button
                  v-if="item.contentLength > 200"
                  link
                  type="primary"
                  size="small"
                  class="expand-btn"
                  @click="toggleExpandResult(idx)"
                >
                  {{ expandedResults.has(idx) ? '收起' : '展开全部' }}
                </el-button>

                <!-- Metadata 详情 -->
                <div v-if="item.metadata && Object.keys(item.metadata).length > 0" class="result-metadata">
                  <el-collapse>
                    <el-collapse-item title="Metadata 详情">
                      <div class="metadata-grid">
                        <div
                          v-for="(val, key) in item.metadata"
                          :key="key"
                          class="metadata-item"
                        >
                          <span class="metadata-key">{{ key }}:</span>
                          <span class="metadata-val">{{ val }}</span>
                        </div>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 2: Chunk 查看 -->
      <el-tab-pane label="Chunk 查看" name="chunks">
        <div class="tab-content">
          <div class="chunk-toolbar">
            <el-select
              v-model="chunkKBId"
              placeholder="选择知识库"
              clearable
              filterable
              style="flex: 1"
              @change="handleLoadChunks"
            >
              <el-option
                v-for="kb in knowledgeBases"
                :key="kb._id"
                :label="kb.name"
                :value="kb._id"
              />
            </el-select>
            <el-input-number
              v-model="chunkLimit"
              :min="10"
              :max="500"
              :step="10"
              controls-position="right"
              style="width: 120px"
              @change="handleLoadChunks"
            />
            <el-button
              :loading="chunksLoading"
              @click="handleLoadChunks"
            >
              加载
            </el-button>
          </div>

          <div v-if="chunksData" class="chunks-overview">
            <el-descriptions :column="3" border size="small">
              <el-descriptions-item label="知识库">
                {{ chunksData.knowledgeBase.name }}
              </el-descriptions-item>
              <el-descriptions-item label="总 Chunk 数">
                <el-tag type="primary">{{ chunksData.totalChunks }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="已加载">
                {{ chunksData.returnedChunks }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div v-if="chunksData" class="chunks-list">
            <div
              v-for="(chunk, idx) in chunksData.chunks"
              :key="chunk.id"
              class="chunk-item"
            >
              <div class="chunk-header">
                <el-tag size="small" type="info">#{{ idx + 1 }}</el-tag>
                <el-tag size="small">{{ chunk.length }} 字符</el-tag>
                <el-tag
                  v-if="chunk.metadata?.title"
                  size="small"
                  effect="plain"
                >
                  {{ chunk.metadata.title }}
                </el-tag>
                <span class="chunk-id">{{ chunk.id }}</span>
              </div>
              <div
                class="chunk-content"
                :class="{ 'is-expanded': expandedChunks.has(idx) }"
              >
                {{ chunk.content }}
              </div>
              <el-button
                v-if="chunk.length > 200"
                link
                type="primary"
                size="small"
                class="expand-btn"
                @click="toggleExpandChunk(idx)"
              >
                {{ expandedChunks.has(idx) ? '收起' : '展开全部' }}
              </el-button>
            </div>
          </div>

          <el-empty
            v-if="!chunksData && !chunksLoading"
            description="请选择知识库查看 Chunks"
          />
        </div>
      </el-tab-pane>

      <!-- Tab 3: 向量统计 -->
      <el-tab-pane label="向量统计" name="stats">
        <div class="tab-content">
          <el-button
            :loading="statsLoading"
            style="margin-bottom: 16px"
            @click="handleLoadStats"
          >
            刷新统计
          </el-button>

          <div v-if="vectorStats" class="stats-list">
            <el-table :data="vectorStats" border stripe>
              <el-table-column prop="name" label="知识库名称" min-width="150" />
              <el-table-column prop="collectionName" label="Collection" min-width="200">
                <template #default="{ row }">
                  <el-tag size="small" type="info">{{ row.collectionName }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="vectorCount" label="向量数量" width="120" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.vectorCount > 0 ? 'success' : 'warning'" size="small">
                    {{ row.vectorCount }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'ok' ? 'success' : 'danger'" size="small">
                    {{ row.status === 'ok' ? '正常' : '异常' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column v-if="hasErrors" prop="error" label="错误信息" min-width="200">
                <template #default="{ row }">
                  <span v-if="row.error" class="error-text">{{ row.error }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-empty
            v-if="!vectorStats && !statsLoading"
            description="点击刷新统计查看向量库状态"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  postTestRetrieval,
  getKnowledgeChunks,
  getVectorStats,
} from '@/API/Knowledge/knowledgeAPI'

const props = defineProps({
  knowledgeBases: {
    type: Array,
    default: () => [],
  },
})

const activeTab = ref('retrieval')

// ==================== 检索测试 ====================
const testQuery = ref('')
const testKBId = ref('')
const testTopK = ref(5)
const retrievalLoading = ref(false)
const retrievalResults = ref(null)
const expandedResults = ref(new Set())

const handleTestRetrieval = async () => {
  if (!testQuery.value.trim()) {
    ElMessage.warning('请输入测试查询文本')
    return
  }
  retrievalLoading.value = true
  expandedResults.value = new Set()
  try {
    const res = await postTestRetrieval(
      testQuery.value.trim(),
      testKBId.value,
      testTopK.value,
    )
    if (res) {
      retrievalResults.value = res.data
    }
  } catch (error) {
    ElMessage.error('检索测试失败: ' + (error.response?.data?.message || error.message))
  } finally {
    retrievalLoading.value = false
  }
}

const toggleExpandResult = (idx) => {
  const newSet = new Set(expandedResults.value)
  if (newSet.has(idx)) {
    newSet.delete(idx)
  } else {
    newSet.add(idx)
  }
  expandedResults.value = newSet
}

const getScoreLevel = (similarity) => {
  const num = parseFloat(similarity)
  if (num >= 80) return 'high'
  if (num >= 50) return 'medium'
  return 'low'
}

// ==================== Chunk 查看 ====================
const chunkKBId = ref('')
const chunkLimit = ref(50)
const chunksLoading = ref(false)
const chunksData = ref(null)
const expandedChunks = ref(new Set())

const handleLoadChunks = async () => {
  if (!chunkKBId.value) return
  chunksLoading.value = true
  expandedChunks.value = new Set()
  try {
    const res = await getKnowledgeChunks(chunkKBId.value, chunkLimit.value)
    if (res) {
      chunksData.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载 Chunks 失败: ' + (error.response?.data?.message || error.message))
  } finally {
    chunksLoading.value = false
  }
}

const toggleExpandChunk = (idx) => {
  const newSet = new Set(expandedChunks.value)
  if (newSet.has(idx)) {
    newSet.delete(idx)
  } else {
    newSet.add(idx)
  }
  expandedChunks.value = newSet
}

// ==================== 向量统计 ====================
const statsLoading = ref(false)
const vectorStats = ref(null)

const hasErrors = computed(() => {
  return vectorStats.value?.some(s => s.status === 'error')
})

const handleLoadStats = async () => {
  statsLoading.value = true
  try {
    const res = await getVectorStats()
    if (res) {
      vectorStats.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载统计失败: ' + (error.response?.data?.message || error.message))
  } finally {
    statsLoading.value = false
  }
}

onMounted(() => {
  handleLoadStats()
})
</script>

<style scoped>
.retrieval-debug-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.debug-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__header) {
  margin: 0;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

:deep(.el-tab-pane) {
  height: 100%;
  overflow-y: auto;
}

.tab-content {
  padding: 16px;
}

/* ==================== 检索测试 ==================== */
.test-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.test-form-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.retrieval-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.results-summary {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px 16px;
  background: #fff;
  transition: border-color 0.2s;
}

.result-item:hover {
  border-color: #c0c4cc;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.result-rank {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: #909399;
}

.rank-badge.high {
  background: #67c23a;
}

.rank-badge.medium {
  background: #e6a23c;
}

.rank-badge.low {
  background: #f56c6c;
}

.result-similarity {
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.result-similarity.high {
  color: #67c23a;
}

.result-similarity.medium {
  color: #e6a23c;
}

.result-similarity.low {
  color: #f56c6c;
}

.result-meta {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.result-length {
  font-size: 12px;
  color: #909399;
}

/* 相似度进度条 */
.similarity-bar-wrapper {
  height: 4px;
  background: #f0f2f5;
  border-radius: 2px;
  margin-bottom: 10px;
  overflow: hidden;
}

.similarity-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.similarity-bar.high {
  background: #67c23a;
}

.similarity-bar.medium {
  background: #e6a23c;
}

.similarity-bar.low {
  background: #f56c6c;
}

.result-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 80px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.result-content.is-expanded {
  max-height: none;
}

.expand-btn {
  margin-top: 4px;
  padding: 0;
  font-size: 12px;
}

.result-metadata {
  margin-top: 8px;
}

:deep(.el-collapse-item__header) {
  font-size: 12px;
  height: 32px;
  line-height: 32px;
  background: #fafbfc;
  padding: 0 8px;
  border-radius: 4px;
}

:deep(.el-collapse-item__content) {
  padding: 8px;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 4px 12px;
}

.metadata-item {
  font-size: 12px;
  display: flex;
  gap: 4px;
}

.metadata-key {
  color: #909399;
  font-weight: 500;
  flex-shrink: 0;
}

.metadata-val {
  color: #606266;
  word-break: break-all;
}

/* ==================== Chunk 查看 ==================== */
.chunk-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}

.chunks-overview {
  margin-bottom: 16px;
}

.chunks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chunk-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px 16px;
  background: #fff;
}

.chunk-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.chunk-id {
  font-size: 11px;
  color: #c0c4cc;
  margin-left: auto;
  font-family: monospace;
}

.chunk-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 80px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.chunk-content.is-expanded {
  max-height: none;
}

/* ==================== 向量统计 ==================== */
.stats-list {
  margin-top: 8px;
}

.error-text {
  color: #f56c6c;
  font-size: 12px;
}
</style>
