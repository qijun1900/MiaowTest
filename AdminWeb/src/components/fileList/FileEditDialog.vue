<template>
  <Dialog
    :DilogTitle="'编辑文件资源'"
    :DilogButContent="isUpdating ? '更新中...' : '确认更新'"
    DilogWidth="800px"
    :draggable="true"
    top="5vh"
    v-model="visible"
    @dialog-confirm="handleConfirm"
  >
    <template #dialogcontent>
      <el-form
        ref="formRef"
        :model="formData"
        label-position="top"
        class="edit-form"
      >
        <!-- 文件上传区域 -->
        <el-form-item label="替换文件（可选）">
          <el-alert
            v-if="!formData.file"
            title="当前保持原文件不变"
            type="info"
            :closable="false"
            show-icon
            style="margin-bottom: 12px;"
          >
            <template #default>
              <span style="font-size: 13px;">如需替换文件，请上传新文件；否则仅更新文件信息</span>
            </template>
          </el-alert>
          <el-alert
            v-else
            title="将替换为新文件"
            type="warning"
            :closable="false"
            show-icon
            style="margin-bottom: 12px;"
          >
            <template #default>
              <span style="font-size: 13px;">确认后将使用新文件替换原文件，原文件将被删除</span>
            </template>
          </el-alert>
          
          <div class="upload-wrapper-edit" :class="{ 'has-file': !!formData.file }">
            <el-upload
              ref="uploadRef"
              class="upload-dragger-edit"
              drag
              action="#"
              :auto-upload="false"
              :limit="1"
              :on-change="handleFileChange"
              :on-exceed="handleExceed"
              :on-remove="handleRemove"
              :show-file-list="false"
            >
              <div class="upload-inner-edit">
                <div v-if="!formData.file" class="upload-empty-edit">
                  <div class="icon-box-edit">
                    <el-icon><UploadFilled /></el-icon>
                  </div>
                  <div class="upload-text-edit">
                    <h4>点击或拖拽文件到此处替换</h4>
                    <p>不上传则保持原文件不变</p>
                  </div>
                </div>
                
                <!-- 选中文件后的预览 -->
                <div v-else class="file-selected-edit">
                  <div class="file-icon-wrapper-edit">
                    <div class="file-icon-edit">
                      <el-icon v-if="formData.category === 1"><Picture /></el-icon>
                      <el-icon v-else-if="formData.category === 2"><Document /></el-icon>
                      <el-icon v-else-if="formData.category === 3"><VideoPlay /></el-icon>
                      <el-icon v-else-if="formData.category === 4"><Headset /></el-icon>
                      <el-icon v-else><Files /></el-icon>
                    </div>
                  </div>
                  <div class="file-name-edit" :title="formData.file.name">{{ formData.file.name }}</div>
                  <div class="file-actions-edit">
                    <el-button type="primary" text bg @click.stop="handleRemove">
                      <el-icon style="margin-right: 4px;"><RefreshLeft /></el-icon>
                      取消替换
                    </el-button>
                  </div>
                </div>
              </div>
            </el-upload>
          </div>
          
          <!-- 文件元数据 -->
          <transition name="el-fade-in">
            <div v-if="fileInfo" class="file-meta-card-edit">
              <div class="meta-header-edit">
                <el-icon><InfoFilled /></el-icon>
                <span>新文件元数据</span>
              </div>
              <div class="meta-grid-edit">
                <div class="meta-item-edit">
                  <span class="label">文件大小</span>
                  <span class="value">{{ formatSize(fileInfo.size) }}</span>
                </div>
                <div class="meta-item-edit">
                  <span class="label">文件类型</span>
                  <span class="value">{{ fileInfo.mimeType || '未知' }}</span>
                </div>
                <div class="meta-item-edit full">
                  <span class="label">智能分类</span>
                  <span class="value">
                    <el-tag :type="getCategoryTagType(formData.category)" effect="plain" round size="small">
                      {{ getCategoryLabel(formData.category) }}
                    </el-tag>
                  </span>
                </div>
              </div>
            </div>
          </transition>
        </el-form-item>

        <!-- 文件名 -->
        <el-form-item label="文件名" required>
          <el-input
            v-model="formData.name"
            placeholder="请输入文件名"
            prefix-icon="Edit"
            clearable
            size="large"
          />
        </el-form-item>

        <!-- 资源分类 -->
        <el-form-item label="资源分类" required>
          <el-radio-group v-model="formData.category" class="category-radio-group-edit">
            <el-radio-button :value="1">
              <div class="radio-content-edit"><el-icon><Picture /></el-icon> 图片</div>
            </el-radio-button>
            <el-radio-button :value="2">
              <div class="radio-content-edit"><el-icon><Document /></el-icon> 文档</div>
            </el-radio-button>
            <el-radio-button :value="3">
              <div class="radio-content-edit"><el-icon><VideoPlay /></el-icon> 视频</div>
            </el-radio-button>
            <el-radio-button :value="4">
              <div class="radio-content-edit"><el-icon><Headset /></el-icon> 音频</div>
            </el-radio-button>
            <el-radio-button :value="5">
              <div class="radio-content-edit"><el-icon><More /></el-icon> 其他</div>
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 业务标签 -->
        <el-form-item label="业务标签" required>
          <el-select
            v-model="formData.tag"
            placeholder="请选择或输入标签"
            allow-create
            filterable
            clearable
            default-first-option
            size="large"
            style="width: 100%"
          >
            <el-option
              v-for="item in tagOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <div class="form-tip-edit">
            <el-icon><InfoFilled /></el-icon>
            支持选择已有标签或直接输入新标签
          </div>
        </el-form-item>

        <!-- 资源描述 -->
        <el-form-item label="资源描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入资源描述或备注信息..."
            resize="none"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  UploadFilled, RefreshLeft, InfoFilled,
  Picture, Document, VideoPlay, Headset, Files, More
} from '@element-plus/icons-vue'
import Dialog from '@/components/ReuseComponents/Dialog .vue'
import {
  formatFileSize as formatSize,
  getCategoryLabel,
  getCategoryTagType,
  autoDetectCategory
} from '@/util/resourceUtils'

const props = defineProps({
  // ========== 对话框状态 ==========
  modelValue: {
    type: Boolean,
    default: false,
    // 对话框显示状态
  },
  
  // ========== 文件数据 ==========
  fileData: {
    type: Object,
    default: null,
    // 要编辑的文件数据
  },
  
  // ========== 标签选项 ==========
  tagOptions: {
    type: Array,
    default: () => [],
    // 标签选项列表
  },
  
  // ========== 更新状态 ==========
  isUpdating: {
    type: Boolean,
    default: false,
    // 是否正在更新
  }
})

// ========== 事件定义 ==========
const emit = defineEmits([
  'update:modelValue',  // 更新对话框状态
  'confirm'             // 确认更新
])

// ========== 本地状态 ==========
const uploadRef = ref()
const formRef = ref()
const formData = ref({
  _id: '',
  file: null,
  name: '',
  category: 5,
  description: '',
  tag: '',
  ext: '',
  size: 0,
  mimeType: '',
  originalUrl: ''
})

// ========== 计算属性 ==========
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const fileInfo = computed(() => {
  if (!formData.value.file) return null
  return {
    size: formData.value.file.size,
    mimeType: formData.value.file.type
  }
})

// ========== 监听文件数据变化 ==========
watch(() => props.fileData, (newData) => {
  if (newData) {
    Object.assign(formData.value, {
      _id: newData._id,
      file: null,
      name: newData.name,
      category: newData.category || 5,
      description: newData.description || '',
      tag: newData.tag || '',
      ext: newData.ext || '',
      size: newData.size || 0,
      mimeType: newData.mimeType || '',
      originalUrl: newData.url
    })
  }
}, { immediate: true })

// ========== 文件处理 ==========
const handleFileChange = (uploadFile) => {
  const rawFile = uploadFile.raw
  if (!rawFile) return

  formData.value.file = rawFile
  formData.value.name = rawFile.name
  
  const fileName = rawFile.name
  const lastDotIndex = fileName.lastIndexOf('.')
  formData.value.ext = lastDotIndex > -1 ? fileName.substring(lastDotIndex + 1).toLowerCase() : ''
  
  formData.value.size = rawFile.size
  formData.value.mimeType = rawFile.type
  formData.value.category = autoDetectCategory(rawFile.type, rawFile.name)
  
  ElMessage.success('文件已选择，将替换原文件')
}

const handleExceed = (files) => {
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
    const file = files[0]
    uploadRef.value.handleStart(file)
  }
}

const handleRemove = () => {
  formData.value.file = null
  if (uploadRef.value) uploadRef.value.clearFiles()
  ElMessage.info('已取消文件替换')
}

// ========== 确认处理 ==========
const handleConfirm = () => {
  if (!formData.value.name) {
    ElMessage.warning('请输入文件名')
    return
  }
  if (!formData.value.tag) {
    ElMessage.warning('请选择或输入业务标签')
    return
  }

  const submitData = {
    _id: formData.value._id,
    name: formData.value.name,
    category: formData.value.category,
    tag: formData.value.tag,
    description: formData.value.description,
    ...(formData.value.file && {
      file: formData.value.file,
      ext: formData.value.ext,
      size: formData.value.size,
      mimeType: formData.value.mimeType
    })
  }

  emit('confirm', submitData)
}

// ========== 重置表单 ==========
const resetForm = () => {
  Object.assign(formData.value, {
    _id: '',
    file: null,
    name: '',
    category: 5,
    description: '',
    tag: '',
    ext: '',
    size: 0,
    mimeType: '',
    originalUrl: ''
  })
  if (uploadRef.value) uploadRef.value.clearFiles()
}

defineExpose({
  resetForm
})
</script>

<style scoped>
.edit-form {
  padding: 0 10px;
  max-height: 70vh;
  overflow-y: auto;
}

.edit-form::-webkit-scrollbar {
  width: 6px;
}

.edit-form::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.upload-wrapper-edit {
  width: 100%;
  min-height: 180px;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 12px;
}

.upload-dragger-edit :deep(.el-upload-dragger) {
  width: 100%;
  min-height: 180px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  transition: all 0.3s;
}

.upload-dragger-edit :deep(.el-upload-dragger:hover) {
  border-color: #409eff;
  background: linear-gradient(135deg, #ecf5ff 0%, #ffffff 100%);
}

.upload-inner-edit {
  text-align: center;
  padding: 20px;
  width: 100%;
}

.icon-box-edit {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 12px;
}

.upload-text-edit h4 {
  margin: 0 0 6px;
  font-size: 14px;
  color: #606266;
}

.upload-text-edit p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.file-selected-edit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.file-icon-wrapper-edit {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

.file-icon-edit {
  font-size: 32px;
  color: #ffffff;
}

.file-name-edit {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  max-width: 85%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta-card-edit {
  background: linear-gradient(135deg, #f6f8fa 0%, #ffffff 100%);
  border-radius: 8px;
  padding: 12px 14px;
  border: 1px solid #e4e7ed;
  margin-top: 12px;
  width: 100%;
}

.meta-header-edit {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-grid-edit {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.meta-item-edit {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #f0f2f5;
}

.meta-item-edit.full {
  grid-column: span 2;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.meta-item-edit .label {
  font-size: 12px;
  color: #909399;
}

.meta-item-edit .value {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.category-radio-group-edit {
  width: 100%;
  display: flex;
  gap: 8px;
}

.category-radio-group-edit :deep(.el-radio-button__inner) {
  width: 100%;
  border-radius: 6px;
  padding: 8px 10px;
}

.radio-content-edit {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.form-tip-edit {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
