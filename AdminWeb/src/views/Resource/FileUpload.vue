<template>
  <div class="upload-page">
    <!-- 页面头部 -->
    <div class="page-header-box">
      <div class="header-title">
        <el-icon class="header-icon"><FolderAdd /></el-icon>
        <h2>资源上传中心</h2>
      </div>
      <p class="header-desc">支持上传文档、图片、音视频等多种格式文件，自动识别文件类型并提取元数据。</p>
    </div>

    <el-card class="main-card" shadow="hover">
      <el-row :gutter="40" class="upload-row">
        <!-- 左侧：上传交互区 -->
        <el-col :xs="24" :lg="10" class="left-panel">
          <div class="upload-wrapper" :class="{ 'has-file': !!form.file }">
            <el-upload
              ref="uploadRef"
              class="upload-dragger-custom"
              drag
              action="#"
              :auto-upload="false"
              :limit="1"
              :on-change="handleFileChange"
              :on-exceed="handleExceed"
              :on-remove="handleRemove"
              :show-file-list="false"
            >
              <div class="upload-inner-content">
                <div v-if="!form.file">
                  <div class="icon-box">
                    <el-icon><UploadFilled /></el-icon>
                  </div>
                  <div class="upload-text">
                    <h3>点击或拖拽文件到此处</h3>
                    <p>支持 JPG, PNG, PDF, MP4, MP3 等常见格式</p>
                  </div>
                </div>
                
                <!-- 选中文件后的精简预览 -->
                <div v-else class="file-selected-state">
                  <div class="file-icon">
                    <el-icon v-if="form.category === 1"><Picture /></el-icon>
                    <el-icon v-else-if="form.category === 2"><Document /></el-icon>
                    <el-icon v-else-if="form.category === 3"><VideoPlay /></el-icon>
                    <el-icon v-else-if="form.category === 4"><Headset /></el-icon>
                    <el-icon v-else><Files /></el-icon>
                  </div>
                  <div class="file-name" :title="form.file.name">{{ form.file.name }}</div>
                  <div class="file-actions">
                    <el-button type="danger" link @click.stop="handleRemove">更换文件</el-button>
                  </div>
                </div>
              </div>
            </el-upload>
          </div>

          <!-- 文件详情卡片 (选中文件后显示) -->
          <transition name="el-fade-in">
            <div v-if="fileInfo" class="file-meta-card">
              <div class="meta-header">文件元数据</div>
              <div class="meta-grid">
                <div class="meta-item">
                  <span class="label">大小</span>
                   <span class="value">{{ formatFileSize(fileInfo.size) }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">类型</span>
                  <span class="value">{{ fileInfo.mimeType || '未知' }}</span>
                </div>
                <div class="meta-item full">
                  <span class="label">智能分类</span>
                  <span class="value">
                    <el-tag :type="getCategoryTagType(form.category)" effect="light" round>
                      {{ getCategoryLabel(form.category) }}
                    </el-tag>
                  </span>
                </div>
              </div>
            </div>
          </transition>
        </el-col>

        <!-- 右侧：详细表单区 -->
        <el-col :xs="24" :lg="14" class="right-panel">
          <div class="form-title">资源详情配置</div>
          <el-form 
            ref="uploadFormRef" 
            :model="form" 
            :rules="rules" 
            label-position="top"
            size="large"
            class="resource-form"
          >
            <el-form-item label="资源名称" prop="name">
              <el-input 
                v-model="form.name" 
                placeholder="请输入资源显示名称" 
                prefix-icon="Edit"
                clearable
              />
            </el-form-item>

            <el-form-item label="资源分类" prop="category">
              <el-radio-group v-model="form.category" class="category-radio-group">
                <el-radio-button :value="1">
                  <div class="radio-content"><el-icon><Picture /></el-icon> 图片</div>
                </el-radio-button>
                <el-radio-button :value="2">
                  <div class="radio-content"><el-icon><Document /></el-icon> 文档</div>
                </el-radio-button>
                <el-radio-button :value="3">
                  <div class="radio-content"><el-icon><VideoPlay /></el-icon> 视频</div>
                </el-radio-button>
                <el-radio-button :value="4">
                  <div class="radio-content"><el-icon><Headset /></el-icon> 音频</div>
                </el-radio-button>
                <el-radio-button :value="5">
                  <div class="radio-content"><el-icon><More /></el-icon> 其他</div>
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="业务标签" prop="tag">
              <el-select
                v-model="form.tag"
                placeholder="请选择或输入标签"
                allow-create
                filterable
                clearable
                default-first-option
                style="width: 100%"
              >
                <el-option
                  v-for="item in tagOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <div class="form-tip">支持选择已有标签或直接输入新标签，仅限一个</div>
            </el-form-item>

            <el-form-item label="资源描述" prop="description">
              <el-input 
                v-model="form.description" 
                type="textarea" 
                :rows="4" 
                placeholder="请输入资源描述或备注信息..." 
                resize="none"
              />
            </el-form-item>

            <div class="form-actions">
              <el-button @click="resetForm" icon="RefreshLeft">重置</el-button>
              <el-button 
                type="primary" 
                :loading="uploading" 
                @click="submitUpload" 
                icon="Upload" 
                class="submit-btn">
                确认上传资源
              </el-button>
            </div>
          </el-form>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { 
  UploadFilled, FolderAdd,
  Picture, Document, VideoPlay, Headset, Files, More
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { 
  formatFileSize, 
  getCategoryLabel, 
  getCategoryTagType, 
  autoDetectCategory 
} from '@/util/resourceUtils'
import { uploadFile } from '@/API/Resource/FileAPI'

const uploadRef = ref()
const uploadFormRef = ref()
const uploading = ref(false)

// 计算属性：文件信息用来显示元数据
const fileInfo = computed(() => {
  if (!form.file) return null
  return {
    size: form.file.size,
    mimeType: form.file.type,
  }
})

// 表单数据
const form = reactive({
  file: null,
  name: '',
  category: 5, 
  description: '',
  tag: '', // 改为单字符串
  ext: '', // 预留扩展字段
  size: 0, // 文件大小
  mimeType: '', // 文件类型
})

// 标签选项
const tagOptions = ref([
  { value: '英语', label: '英语' },
  { value: '数学', label: '数学' },
  { value: '语文', label: '语文' },
  { value: '物理', label: '物理' },
  { value: '化学', label: '化学' }
])

// 模拟从后端获取标签数据
const fetchTags = async () => {
  try {
    // const res = await request.get('/adminapi/resource/tags')
    // tagOptions.value = res.data.map(tag => ({ value: tag, label: tag }))
    
    // 模拟延迟
    // await new Promise(resolve => setTimeout(resolve, 500))
  } catch (error) {
    console.error('获取标签失败', error)
  }
}

onMounted(() => {
  fetchTags()
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入资源名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择资源分类', trigger: 'change' }
  ],
  tag: [
    { required: true, message: '请选择或输入标签', trigger: 'change' }
  ],
}

// 文件变动处理（自动填充信息）
const handleFileChange = (uploadFile) => {
  const rawFile = uploadFile.raw
  if (!rawFile) return

  form.file = rawFile
  form.name = rawFile.name
  
  // 提取文件扩展名
  const fileName = rawFile.name
  const lastDotIndex = fileName.lastIndexOf('.')
  form.ext = lastDotIndex > -1 ? fileName.substring(lastDotIndex + 1).toLowerCase() : ''
  
  // 填充文件大小和类型
  form.size = rawFile.size
  form.mimeType = rawFile.type

  form.category = autoDetectCategory(rawFile.type, rawFile.name)
}

// 超出文件数限制处理
const handleExceed = (files) => {
  uploadRef.value.clearFiles()
  const file = files[0]
  uploadRef.value.handleStart(file)
}
//  移除文件处理
const handleRemove = () => {
  form.file = null
  form.name = ''
  form.category = 5
  form.ext = ''
  form.size = 0
  form.mimeType = ''
  // 清除upload组件内部文件列表
  if(uploadRef.value) uploadRef.value.clearFiles()
}

// 提交上传
const submitUpload = async () => {
  if (!form.file) {
    ElMessage.warning('请先选择文件')
    return
  }

  await uploadFormRef.value.validate(async (valid) => {
    if (valid) {
      uploading.value = true
      try { 
        const response =  await uploadFile(form)

        console.log('上传成功', response)
        
        ElMessage.success('上传成功')
        resetForm()
      } catch (error) {
        console.error(error)
        ElMessage.error('上传失败')
      } finally {
        uploading.value = false
      }
    }
  })
}

const resetForm = () => {
  uploadRef.value.clearFiles()
  uploadFormRef.value.resetFields()
  form.file = null
  form.tag = ''
  handleRemove()
}
</script>

<style scoped>
.upload-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 头部样式 */
.page-header-box {
  margin-bottom: 24px;
}
.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #303133;
}
.header-icon {
  font-size: 28px;
  color: #409eff;
}
.header-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}
.header-desc {
  margin: 8px 0 0 40px;
  color: #909399;
  font-size: 14px;
}

/* 主卡片样式 */
.main-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
}

/* 上传区域样式 */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-wrapper {
  height: 320px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
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
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  transition: all 0.3s;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.upload-inner-content {
  text-align: center;
  padding: 20px;
}

.icon-box {
  font-size: 64px;
  color: #a8abb2;
  margin-bottom: 16px;
  transition: transform 0.3s;
}

:deep(.el-upload-dragger:hover) .icon-box {
  color: #409eff;
  transform: translateY(-5px);
}

.upload-text h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #606266;
}
.upload-text p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

/* 文件选中后状态 */
.file-selected-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.file-icon {
  font-size: 56px;
  color: #409eff;
  margin-bottom: 12px;
}
.file-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 元数据卡片 */
.file-meta-card {
  background: #f4f6f8;
  border-radius: 8px;
  padding: 16px 20px;
  border: 1px solid #ebedf0;
}
.meta-header {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.meta-item.full {
  grid-column: span 2;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}
.meta-item .label {
  font-size: 12px;
  color: #909399;
}
.meta-item .value {
  font-size: 14px;
  color: #606266;
  font-family: monospace;
}

/* 右侧表单样式 */
.right-panel {
  padding-left: 20px;
  border-left: 1px solid #f0f2f5;
}
@media (max-width: 1200px) {
  .right-panel {
    padding-left: 0;
    border-left: none;
    margin-top: 30px;
  }
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
  padding-left: 12px;
  border-left: 4px solid #409eff;
  line-height: 1;
}

.resource-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.category-radio-group {
  width: 100%;
}
.category-radio-group :deep(.el-radio-button) {
  flex: 1;
}
.category-radio-group :deep(.el-radio-button__inner) {
  width: 100%;
  display: flex;
  justify-content: center;
}
.radio-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 标签样式 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 32px;
  align-items: center;
}
.input-new-tag-wrapper {
  width: 100px;
}

/* 按钮区域 */
.form-actions {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.submit-btn {
  padding: 12px 30px;
}
</style>
