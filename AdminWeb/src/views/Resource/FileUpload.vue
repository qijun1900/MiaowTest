<template>
  <div class="upload-page">
    <!-- 页面头部 -->
    <div class="page-header-box">
      <div class="header-title">
        <div class="icon-wrapper">
          <el-icon class="header-icon"><FolderAdd /></el-icon>
        </div>
        <div class="title-content">
          <h2>资源上传中心</h2>
          <p class="header-desc">支持上传文档、图片、音视频等多种格式文件，自动识别文件类型并提取元数据</p>
        </div>
      </div>
    </div>

    <el-card class="main-card" shadow="never">
      <el-row :gutter="32" class="upload-row">
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
                <div v-if="!form.file" class="upload-empty-state">
                  <div class="icon-box">
                    <el-icon><UploadFilled /></el-icon>
                  </div>
                  <div class="upload-text">
                    <h3>点击或拖拽文件到此处上传</h3>
                    <p>支持 JPG, PNG, PDF, MP4, MP3 等常见格式</p>
                  </div>
                </div>
                
                <!-- 选中文件后的精简预览 -->
                <div v-else class="file-selected-state">
                  <div class="file-icon-wrapper">
                    <div class="file-icon">
                      <el-icon v-if="form.category === 1"><Picture /></el-icon>
                      <el-icon v-else-if="form.category === 2"><Document /></el-icon>
                      <el-icon v-else-if="form.category === 3"><VideoPlay /></el-icon>
                      <el-icon v-else-if="form.category === 4"><Headset /></el-icon>
                      <el-icon v-else><Files /></el-icon>
                    </div>
                  </div>
                  <div class="file-name" :title="form.file.name">{{ form.file.name }}</div>
                  <div class="file-actions">
                    <el-button type="primary" text bg @click.stop="handleRemove">
                      <el-icon style="margin-right: 4px;"><RefreshLeft /></el-icon>
                      更换文件
                    </el-button>
                  </div>
                </div>
              </div>
            </el-upload>
          </div>

          <!-- 文件详情卡片 (选中文件后显示) -->
          <transition name="el-fade-in">
            <div v-if="fileInfo" class="file-meta-card">
              <div class="meta-header">
                <el-icon><InfoFilled /></el-icon>
                <span>文件元数据</span>
              </div>
              <div class="meta-grid">
                <div class="meta-item">
                  <span class="label">文件大小</span>
                  <span class="value">{{ formatFileSize(fileInfo.size) }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">文件类型</span>
                  <span class="value">{{ fileInfo.mimeType || '未知' }}</span>
                </div>
                <div class="meta-item full">
                  <span class="label">智能分类</span>
                  <span class="value">
                    <el-tag :type="getCategoryTagType(form.category)" effect="plain" round size="small">
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
          <div class="form-title">
            <span class="title-line"></span>
            <span class="title-text">资源详情配置</span>
          </div>
          <el-form 
            ref="uploadFormRef" 
            :model="form" 
            :rules="rules" 
            label-position="top"
            class="resource-form"
          >
            <el-form-item label="资源名称" prop="name">
              <el-input 
                v-model="form.name" 
                placeholder="请输入资源显示名称" 
                prefix-icon="Edit"
                clearable
                size="large"
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
              <div class="form-tip">
                <el-icon><InfoFilled /></el-icon>
                支持选择已有标签或直接输入新标签
              </div>
            </el-form-item>

            <el-form-item label="资源描述" prop="description">
              <el-input 
                v-model="form.description" 
                type="textarea" 
                :rows="3" 
                placeholder="请输入资源描述或备注信息..." 
                resize="none"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <div class="form-actions">
              <el-button @click="resetForm" size="large" class="reset-btn">
                <el-icon style="margin-right: 6px;"><RefreshLeft /></el-icon>
                重置表单
              </el-button>
              <el-button 
                type="primary" 
                :loading="uploading" 
                @click="submitUpload" 
                size="large"
                class="submit-btn">
                <el-icon style="margin-right: 6px;"><Upload /></el-icon>
                {{ uploading ? '上传中...' : '确认上传' }}
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
  UploadFilled, FolderAdd, RefreshLeft, Upload, InfoFilled,
  Picture, Document, VideoPlay, Headset, Files, More
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { 
  formatFileSize, 
  getCategoryLabel, 
  getCategoryTagType, 
  autoDetectCategory 
} from '@/util/resourceUtils'
import { uploadFile, getTags } from '@/API/Resource/FileAPI'
import { useAppStore } from '@/stores';

const uploadRef = ref()
const uploadFormRef = ref()
const uploading = ref(false)
const appStore = useAppStore()

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
  creator:appStore.userInfo.username,// 上传人
})

// 标签选项
const tagOptions = ref([])

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

// 计算属性：文件信息用来显示元数据
const fileInfo = computed(() => {
  if (!form.file) return null
  return {
    size: form.file.size,
    mimeType: form.file.type,
  }
})

// 从后端获取业务标签数组
const fetchTags = async () => {
  try {
    const response = await getTags()
    if( response.code === 200){
      tagOptions.value = response.data.map(tag => ({
        label: tag,
        value: tag
      }))
    }
  } catch (error) {
    console.error('获取标签失败', error)
  }
}

onMounted(() => {
  fetchTags()
})

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
        if(response.code === 200){
          ElMessage.success('上传成功')
          tagOptions.value.push({ label: form.tag, value: form.tag })
          // 刷新标签选项，避免重复
          tagOptions.value = tagOptions.value.filter((item, index, self) =>
            index === self.findIndex((t) => t.value === item.value)
          )
        }
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

// 重置表单
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
  padding: 10px;
  height: calc(100vh - 100px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 头部样式 - 优化布局 */
.page-header-box {
  margin-bottom: 10px;
  flex-shrink: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
  flex-shrink: 0;
}

.header-icon {
  font-size: 24px;
  color: #ffffff;
}

.title-content {
  flex: 1;
}

.title-content h2 {
  margin: 0 0 4px 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.header-desc {
  margin: 0;
  color: #909399;
  font-size: 13px;
  line-height: 1.5;
}

/* 主卡片样式 - 优化阴影和圆角 */
.main-card {
  flex: 1;
  border-radius: 16px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-card :deep(.el-card__body) {
  padding: 24px;
  height: 100%;
  overflow: hidden;
}

.upload-row {
  height: 100%;
}

/* 左侧面板 */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

/* 上传区域样式 - 增强视觉效果 */
.upload-wrapper {
  flex: 1;
  min-height: 280px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

:deep(.el-upload-dragger::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(64, 158, 255, 0.03) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409eff;
  background: linear-gradient(135deg, #ecf5ff 0%, #ffffff 100%);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

:deep(.el-upload-dragger:hover::before) {
  opacity: 1;
}

.upload-inner-content {
  text-align: center;
  padding: 20px;
  width: 100%;
}

.upload-empty-state {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-box {
  font-size: 72px;
  color: #c0c4cc;
  margin-bottom: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
}

:deep(.el-upload-dragger:hover) .icon-box {
  color: #409eff;
  transform: translateY(-8px) scale(1.05);
}

.upload-text h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.upload-text p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

/* 文件选中后状态 - 增强动画效果 */
.file-selected-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.file-icon-wrapper {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
  animation: bounce 0.6s ease-out;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.file-icon {
  font-size: 40px;
  color: #ffffff;
}

.file-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
  max-width: 85%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-actions {
  margin-top: 8px;
}

/* 元数据卡片 - 优化设计 */
.file-meta-card {
  background: linear-gradient(135deg, #f6f8fa 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 16px 18px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

.meta-header {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-header .el-icon {
  color: #409eff;
  font-size: 16px;
}

.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #f0f2f5;
  transition: all 0.2s;
}

.meta-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.meta-item.full {
  grid-column: span 2;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.meta-item .label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.meta-item .value {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

/* 右侧表单样式 - 优化间距和视觉 */
.right-panel {
  padding-left: 24px;
  border-left: 1px solid #e4e7ed;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.right-panel::-webkit-scrollbar {
  width: 6px;
}

.right-panel::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.right-panel::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

@media (max-width: 1200px) {
  .right-panel {
    padding-left: 0;
    border-left: none;
    margin-top: 20px;
  }
}

.form-title {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-line {
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
  border-radius: 2px;
}

.title-text {
  flex: 1;
}

/* 表单样式优化 */
.resource-form {
  padding-right: 8px;
}

.resource-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.resource-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.resource-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.2s;
}

.resource-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

.resource-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.resource-form :deep(.el-textarea__inner) {
  border-radius: 8px;
  border-color: #dcdfe6;
  transition: all 0.2s;
}

.resource-form :deep(.el-textarea__inner:hover) {
  border-color: #c0c4cc;
}

.resource-form :deep(.el-textarea__inner:focus) {
  border-color: #409eff;
}

/* 分类单选按钮组 - 优化样式 */
.category-radio-group {
  width: 100%;
  display: flex;
  gap: 8px;
}

.category-radio-group :deep(.el-radio-button) {
  flex: 1;
}

.category-radio-group :deep(.el-radio-button__inner) {
  width: 100%;
  display: flex;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  background: #ffffff;
  transition: all 0.2s;
  padding: 10px 12px;
}

.category-radio-group :deep(.el-radio-button__inner:hover) {
  border-color: #409eff;
  background: #ecf5ff;
}

.category-radio-group :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

/* 提示文本 */
.form-tip {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-tip .el-icon {
  font-size: 14px;
  color: #409eff;
}

/* 按钮区域 - 优化样式 */
.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #f0f2f5;
}

.reset-btn {
  border-radius: 8px;
  border-color: #dcdfe6;
  transition: all 0.2s;
}

.reset-btn:hover {
  border-color: #409eff;
  color: #409eff;
  background: #ecf5ff;
}

.submit-btn {
  border-radius: 8px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s;
  padding: 12px 32px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

/* 响应式优化 */
@media (max-width: 1200px) {
  .upload-page {
    height: auto;
    overflow: auto;
  }
  
  .main-card {
    flex: none;
  }
  
  .left-panel {
    height: auto;
  }
  
  .upload-wrapper {
    min-height: 240px;
  }
}

/* 动画优化 */
.el-fade-in-enter-active,
.el-fade-in-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-fade-in-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.el-fade-in-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
