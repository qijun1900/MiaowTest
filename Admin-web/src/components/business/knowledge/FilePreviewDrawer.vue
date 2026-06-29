<template>
  <el-drawer
    :model-value="modelValue"
    :title="fileName || '文件预览'"
    direction="rtl"
    size="70%"
    :destroy-on-close="true"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="file-preview-container">
      <OpenFileViewer
        v-if="fileUrl"
        :file="resolvedUrl"
        :file-name="fileName"
        width="100%"
        height="100%"
        :toolbar="true"
        theme="auto"
        :plugins="plugins"
        @error="handleError"
      />
      <div v-else class="preview-empty">
        <el-icon :size="48" color="#c0c4cc"><Document /></el-icon>
        <p>暂无文件可预览</p>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { Document } from '@element-plus/icons-vue'
import { OpenFileViewer } from '@open-file-viewer/vue'
import {
  imagePlugin,
  textPlugin,
  pdfPlugin,
  officePlugin,
} from '@open-file-viewer/core'
import '@open-file-viewer/core/style.css'
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url'
import formatImageUrl from '@/util/formatImageUrl'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  fileUrl: {
    type: String,
    default: '',
  },
  fileName: {
    type: String,
    default: '',
  },
  fileType: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])

const resolvedUrl = computed(() => formatImageUrl(props.fileUrl))

const plugins = computed(() => [
  pdfPlugin({ workerSrc: pdfWorkerSrc }),
  officePlugin(),
  textPlugin(),
  imagePlugin(),
])

const handleError = (err) => {
  console.error('[FilePreviewDrawer] 预览出错:', err)
}
</script>

<style scoped>
.file-preview-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  gap: 12px;
}

.preview-empty p {
  margin: 0;
  font-size: 14px;
}
</style>
