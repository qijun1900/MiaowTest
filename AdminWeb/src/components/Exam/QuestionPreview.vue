<!-- 题目预览组件 -->
<template>
    <el-dialog 
        :draggable="true"
        v-model="PreviewdialogVisible" 
        width="60%" 
        title="题目预览" 
        class="preview-dialog">
        <div v-if="previewData" class="preview-content">
            <el-divider content-position="left"><span class="divider-title">题目题干</span></el-divider>
            <h3 class="question-stem" v-html="previewData.stem"></h3>

            <!-- 选择题预览 -->
            <el-divider content-position="left"><span class="divider-title">题目详情</span></el-divider>
            <div v-if="previewData.Type === 1" class="options-container">
                <div v-for="(option, index) in previewData.options" :key="index" class="option-item">
                    <el-tag :type="option.isCorrect ? 'success' : 'info'" class="option-tag">
                        {{ String.fromCharCode(65 + index) }}
                    </el-tag>
                    <span class="option-content">{{ option.content }}</span>
                </div>
                <div class="correct-answer">
                    <el-tag type="success" size="large">正确答案: {{ formatSelectAnswer(previewData.options) }}</el-tag>
                </div>
            </div>

            <!-- 填空题预览 -->
            <div v-else-if="previewData.Type === 2" class="fill-blank-container">
                <div v-for="(option, index) in previewData.options" :key="index" class="blank-item">
                    <el-tag class="blank-tag">空{{ index + 1 }}</el-tag>
                    <span class="blank-content">{{ option.content }}</span>
                </div>
            </div>
            
            <!-- 判断题预览 -->
            <div v-else-if="previewData.Type === 3" class="judge-container">
                <el-tag :type="previewData.answer == 1 ? 'success' : 'danger'" size="large" class="judge-tag">
                    {{ previewData.answer === 1 ? '正确' : '错误' }}
                </el-tag>
            </div>

            <!-- 简答题预览 -->
            <div v-else-if="previewData.Type === 4" class="short-answer-container">
                <el-card shadow="hover" class="answer-card">
                    <div v-html="previewData.content" class="answer-content"></div>
                </el-card>
            </div>

        <div class="info-footer">
          <el-tag type="info" class="info-tag">更新时间: {{ formatTime.getTime2(previewData.createdTime) }}</el-tag>
          <el-tag :type="previewData.isAIanswer === 1 ? 'warning' : 'info'" class="info-tag">
            是否AI生成答案：{{ isAianswer(previewData.isAIanswer) }}
          </el-tag>
        </div>

        </div>
        <template #footer>
            <el-button type="primary" @click="dialogConfirmClose" class="close-btn">
              关闭
            </el-button>
        </template>
    </el-dialog>
</template>
<script setup>
import { ref, watch, computed } from 'vue';
import { formatSelectAnswer,isAianswer } from '@/util/formatAnswer';
import formatTime from '@/util/formatTime'

const PreviewdialogVisible = ref(false)
const emit = defineEmits(['dialogConfirmColse', 'update:modelValue'])

const props = defineProps({
    Data: {
        type: Object,
    },
    modelValue: {
        type: Boolean,
        default: false
    },

})
const previewData = computed(() => props.Data)

// 同步父组件的 v-model 值
watch(() => props.modelValue, (newVal) => {
  PreviewdialogVisible.value = newVal
})
// 当对话框关闭时同步状态
watch(PreviewdialogVisible, (val) => {
  emit('update:modelValue', val)
})
// 点击确认按钮的逻辑
const dialogConfirmClose = () => {
    emit('dialogConfirmColse')
    PreviewdialogVisible.value = false
}
</script>
<style scoped>
:deep(.el-page-header__content) {
  color: #2c94fd;
}
.contain_card{
  margin-top: 8px;
  border-radius: 12px;
}
.preview-dialog {
  border-radius: 12px;
}

.preview-content {
  padding: 0 20px;
}

.divider-title {
  font-size: 16px;
  color: #409eff;
  font-weight: bold;
}

.question-stem {
  margin: 15px 0;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 6px;
  line-height: 1.6;
}

/* 选择题样式 */
.options-container {
  margin: 15px 0;
}

.option-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.option-tag {
  margin-right: 15px;
  width: 30px;
  text-align: center;
  font-weight: bold;
}

.option-content {
  flex: 1;
}

.correct-answer {
  margin: 20px 0;
  text-align: center;
}

/* 填空题样式 */
.fill-blank-container {
  margin: 15px 0;
}

.blank-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
  padding: 8px;
}

.blank-tag {
  margin-right: 15px;
  background-color: #e6f7ff;
  color: #1890ff;
}

/* 简答题样式 */
.short-answer-container {
  margin: 15px 0;
}

.answer-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.answer-content {
  line-height: 1.8;
}

/* 底部信息样式 */
.info-footer {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.info-tag {
  font-size: 13px;
}

/* 关闭按钮样式 */
.close-btn {
  width: 100px;
}
</style>