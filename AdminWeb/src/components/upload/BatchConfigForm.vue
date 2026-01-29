<template>
  <div class="batch-config-form">
    <div class="form-title">
      <span class="title-line"></span>
      <span class="title-text">批量配置</span>
    </div>
    
    <el-form 
      ref="formRef" 
      :model="config" 
      :rules="rules"
      label-position="top"
      class="resource-form"
    >
      <el-alert
        title="批量配置说明"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 20px;"
      >
        <template #default>
          以下配置将应用到所有上传文件，文件名将自动使用原始文件名。<strong style="color: #409eff;">标签为必填项</strong>，请务必填写。
        </template>
      </el-alert>

      <el-form-item label="默认分类">
        <el-radio-group v-model="config.category" class="category-radio-group">
          <el-radio-button :value="0">
            <div class="radio-content"><el-icon><MagicStick /></el-icon> 自动识别</div>
          </el-radio-button>
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

      <el-form-item label="统一标签" prop="tag">
        <el-select
          v-model="config.tag"
          placeholder="请选择或输入标签（必填）"
          allow-create
          filterable
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
          为所有文件设置相同的业务标签（必填）
        </div>
      </el-form-item>

      <el-form-item label="统一描述">
        <el-input 
          v-model="config.description" 
          type="textarea" 
          :rows="3" 
          placeholder="为所有文件添加统一描述（可选）" 
          resize="none"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-divider content-position="left">
        <el-icon><Setting /></el-icon>
        上传设置
      </el-divider>

      <el-form-item label="并发上传数">
        <el-slider 
          v-model="config.concurrency" 
          :min="1" 
          :max="5" 
          :marks="{ 1: '1', 3: '3', 5: '5' }"
          show-stops
        />
        <div class="form-tip">
          <el-icon><InfoFilled /></el-icon>
          同时上传 {{ config.concurrency }} 个文件，建议设置为 2-3
        </div>
      </el-form-item>

      <el-form-item label="失败处理">
        <el-radio-group v-model="config.errorHandling">
          <el-radio value="continue">继续上传其他文件</el-radio>
          <el-radio value="stop">停止所有上传</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  MagicStick, Picture, Document, VideoPlay, Headset, More,
  InfoFilled, Setting
} from '@element-plus/icons-vue'

const props = defineProps({
  // ========== 配置对象 ==========
  config: {
    type: Object,
    required: true,
    // 包含：category(分类), tag(标签), description(描述), concurrency(并发数), errorHandling(错误处理)
  },
  
  // ========== 标签选项 ==========
  tagOptions: {
    type: Array,
    default: () => [],
    // 格式：[{ label: '标签名', value: '标签值' }]
  }
})

const formRef = ref()

const rules = {
  tag: [
    { required: true, message: '请选择或输入标签', trigger: 'change' }
  ]
}

const validate = () => {
  return formRef.value?.validate()
}

defineExpose({
  validate
})
</script>

<style scoped>
.batch-config-form {
  height: 100%;
  display: flex;
  flex-direction: column;
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

.resource-form {
  padding-right: 8px;
  flex: 1;
  overflow-y: auto;
}

.resource-form::-webkit-scrollbar {
  width: 6px;
}

.resource-form::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.resource-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.resource-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.category-radio-group {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  padding: 10px 8px;
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
  gap: 4px;
  font-size: 13px;
}

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

@media (max-width: 1200px) {
  .category-radio-group {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
