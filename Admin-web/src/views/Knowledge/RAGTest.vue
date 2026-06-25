<template>
  <div class="rag-test-page">
    <!-- 左侧配置栏 -->
    <aside class="rag-sidebar">
      <div class="sidebar-header">
        <el-icon><Setting /></el-icon>
        <span>RAG 配置</span>
      </div>
      <RAGSettingsPanel
        :knowledge-bases="knowledgeBases"
        v-model="ragConfig"
        :history="chatHistory"
        @clear-history="handleClearHistory"
      />
    </aside>

    <!-- 右侧对话区域 -->
    <main class="rag-main">
      <!-- 空态 Welcome -->
      <div v-show="chatHistory.length === 0" class="rag-welcome-wrapper">
        <XWelcome
          icon="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
          title="RAG 知识问答测试"
          :extra="`当前知识库：${selectedKBName || '全部知识库'}`"
          description="基于知识库的检索增强生成，输入问题后 AI 将从知识库中检索相关内容并生成回答"
        />
      </div>

      <!-- 对话消息列表 -->
      <div
        v-show="chatHistory.length > 0"
        ref="chatContainerRef"
        class="chat-container"
      >
        <div v-for="(msg, index) in chatHistory" :key="index" class="message-group">
          <!-- 用户消息 -->
          <XBubble
            :content="msg.question"
            placement="end"
            bubble-header-title="我"
            :bubble-avatar-src="userAvatar"
            :typingstep="1"
            :typinginterval="0"
            :is-fog="false"
          />
          <!-- AI 回答 -->
          <XBubble
            :content="msg.answer"
            placement="start"
            bubble-header-title="RAG 助手"
            :is-loading="msg.isLoading"
            :typingstep="4"
            :typinginterval="30"
            typingsuffix=""
            :is-fog="true"
          />
          <!-- 引用来源 -->
          <div v-if="msg.sources && msg.sources.length > 0" class="sources-wrapper">
            <div class="sources-header">
              <el-icon><Link /></el-icon>
              <span>引用来源（{{ msg.sources.length }} 条）</span>
            </div>
            <div class="sources-grid">
              <RAGSourceCard
                v-for="(source, sIdx) in msg.sources"
                :key="sIdx"
                :source="source"
                :index="sIdx"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 底部输入框 -->
      <div class="sender-wrapper">
        <XEditorSender
          ref="editorRef"
          placeholder="输入问题，例如：什么是计算机网络？"
          :iSclearable="true"
          :is-senderloading="loading"
          :iSshowPrefixFlog="false"
          :isShowHeaderFlog="false"
          @user-submit="handleUserSend"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, Link } from '@element-plus/icons-vue'
import { postRAGQuery, getKnowledgeBaseList } from '@/API/Knowledge/knowledgeAPI'
import { useAppStore } from '@/stores'
import formatImageUrl from '@/util/formatImageUrl'
import XBubble from '@/components/Element-plus-x/XBubble.vue'
import XWelcome from '@/components/Element-plus-x/XWelcome.vue'
import XEditorSender from '@/components/Element-plus-x/XEditorSender .vue'
import RAGSettingsPanel from '@/components/Knowledge/RAGSettingsPanel.vue'
import RAGSourceCard from '@/components/Knowledge/RAGSourceCard.vue'

const appStore = useAppStore()
const userAvatar = computed(() =>
  appStore.userInfo.avatar
    ? formatImageUrl(appStore.userInfo.avatar)
    : 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
)

// RAG 配置
const ragConfig = ref({
  knowledgeBaseId: '',
  modelName: 'qwen-plus',
  topK: 4,
  temperature: 0.7,
})

const knowledgeBases = ref([])
const chatHistory = ref([])
const loading = ref(false)
const editorRef = ref()
const chatContainerRef = ref()

const selectedKBName = computed(() => {
  if (!ragConfig.value.knowledgeBaseId) return ''
  const kb = knowledgeBases.value.find(k => k._id === ragConfig.value.knowledgeBaseId)
  return kb ? kb.name : ''
})

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

const handleUserSend = async (data) => {
  if (!data || !data.text || !data.text.trim()) {
    ElMessage.warning('请输入问题')
    return
  }

  const question = data.text.trim()

  // 添加用户消息 + AI loading 占位
  chatHistory.value.push({
    question,
    answer: '',
    sources: [],
    isLoading: true,
  })

  loading.value = true
  editorRef.value?.clearContent()
  await scrollToBottom()

  try {
    const res = await postRAGQuery(
      question,
      ragConfig.value.topK,
      ragConfig.value.modelName,
      ragConfig.value.knowledgeBaseId
    )

    if (res && res.data) {
      const lastMsg = chatHistory.value[chatHistory.value.length - 1]
      lastMsg.answer = res.data.answer
      lastMsg.sources = res.data.sources || []
      lastMsg.isLoading = false
    } else {
      chatHistory.value[chatHistory.value.length - 1].answer = '查询失败，请稍后重试'
      chatHistory.value[chatHistory.value.length - 1].isLoading = false
    }
  } catch (error) {
    chatHistory.value[chatHistory.value.length - 1].answer = '查询出错：' + (error.message || '未知错误')
    chatHistory.value[chatHistory.value.length - 1].isLoading = false
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

const handleClearHistory = () => {
  chatHistory.value = []
}

const loadKnowledgeBases = async () => {
  try {
    const res = await getKnowledgeBaseList()
    if (res) knowledgeBases.value = res.data
  } catch (error) {
    console.error('loadKnowledgeBases error:', error)
  }
}

onMounted(() => {
  loadKnowledgeBases()
})
</script>

<style scoped>
.rag-test-page {
  display: flex;
  height: calc(100vh - 100px);
  gap: 0;
  overflow: hidden;
}

/* 左侧配置栏 */
.rag-sidebar {
  width: 280px;
  min-width: 280px;
  background: #fff;
  border-right: 1px solid #ebeef5;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

/* 右侧主区域 */
.rag-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  overflow: hidden;
}

.rag-welcome-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.message-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 引用来源区域 */
.sources-wrapper {
  margin-left: 48px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.sources-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 12px;
}

.sources-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 底部输入框 */
.sender-wrapper {
  padding: 16px 24px;
  background: #f9f9f9;
  border-top: 1px solid #ebeef5;
}
</style>
