<template>
  <div class="container">
    <el-page-header @back="handleBack" title="考试列表">
      <template #content>
        <div>
          <el-icon>
            <Connection />
          </el-icon>
          <span>题目面板</span>
        </div>
      </template>
    </el-page-header>
    <el-row :gutter="8">
      <el-col :span="10">
        <el-card shadow="hover" class="info-card">
          <div class="info-container">
            <div class="info-item">
              <div class="info-icon-text">
                <el-icon class="text-success">
                  <Collection />
                </el-icon>
                <span class="text-success info-label">科目名称:</span>
              </div>
              <span class="text-primary info-value">{{ examData.name }}</span>
            </div>
            <div class="info-item">
              <div class="info-icon-text">
                <el-icon class="text-info">
                  <Document />
                </el-icon>
                <span class="text-info info-label">科目代码:</span>
              </div>
              <span class="text-purple-500 info-value">{{ examData.code }}</span>
            </div>
            <div class="info-item">
              <div class="info-icon-text">
                <el-icon class="text-warning">
                  <Timer />
                </el-icon>
                <span class="text-info info-label">最近更新时间:</span>
              </div>
              <span class="text-purple-500 info-value">{{ formatTime.getTime(examData.createdTime) }}</span>
            </div>
            <div class="info-item">
              <div class="info-icon-text">
                <el-icon class="text-warning">
                  <View v-if="isPublish === 1" />
                  <Hide v-else />
                </el-icon>
                <span class="text-info info-label">发布状态:</span>
              </div>
              <el-switch class="info-value" 
                :active-value="1" 
                :inactive-value="0" 
                v-model="isPublish"
                :active-action-icon="View" 
                :inactive-action-icon="Hide" 
                @change="updateExamStatus(isPublish )"/>
            </div>
          </div>
        </el-card>
        <el-card shadow="hover">
          <div>
            <el-button 
              color="#626aef"  
              @click="handlesubmit"
              :disabled="isSubmitDisabled">全部提交</el-button>
            <el-divider content-position="left">为考试添加题型</el-divider>
            <el-form-item 
              v-for="(item, index) in createExamFrom.questionTitle" 
              :key="index"
              :prop="'questionTitle.' + index + '.content'"
              :rules="{ required: true, message: '题型名称不能为空', trigger: 'submit' }" 
              class="form-item-container">
              <div class="input-group">
                <span class="index-badge">题型{{ index + 1 }}</span>
                <el-input 
                  v-model="item.content" 
                  placeholder="输入题型名称" 
                  class="option-input"
                  :class="{ 'success-border': item.content }"
                  clearable />
                <div class="button-group">
                  <el-button 
                    type="success" 
                    @click="addquestionTitle" 

                    class="add-button"
                    v-show="index === createExamFrom.questionTitle.length - 1">
                    <el-icon class="icon"><Plus /></el-icon>
                    添加题型
                  </el-button>
                  <el-button 
                    v-if="index > 0" 
                    type="danger" 
                    @click="removeQuestionTitle(index)" 
                    class="remove-button">
                    <el-icon class="icon"><Delete /></el-icon>
                    删除题型
                  </el-button>
                </div>
              </div>
            </el-form-item>
          </div>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card shadow="hover">
            <div>
              
            </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import { ref, onMounted,computed} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Connection, Collection, Document, Timer, View, Hide, CirclePlusFilled,Plus,Delete } from '@element-plus/icons-vue'
import formatTime from '@/util/formatTime'
import axios from 'axios'
import { ElMessage } from 'element-plus'


const router = useRouter()
const route = useRoute()
const examData = ref(JSON.parse(route.query.examData))
const isPublish = ref(examData.value.isPublish)
const createExamRef = ref()

const createExamFrom = ref({
  name: examData.value.name,
  questionTitle: [
    { content: '' ,questionIdS:[],questionType:[]},
  ],
  code: examData.value.code,
  isPublish: isPublish.value,
  category:examData.value.category,
  examId:examData.value._id,
})

onMounted(async () => {
  console.log(examData.value)
})
// 添加题目类型
const addquestionTitle = () => {
  createExamFrom.value.questionTitle.push({ content: '' ,questionIdS:[] });
};

// 新增删除方法
const removeQuestionTitle = (index) => {
  createExamFrom.value.questionTitle.splice(index, 1);
};
// 添加计算属性判断禁用状态
const isSubmitDisabled = computed(() => {
  return createExamFrom.value.questionTitle.some(item => 
    item.content.trim() === '' // 只判断名称是否为空
  ) || createExamFrom.value.questionTitle.length === 0
})

const handleBack = () => {
  router.back()
}
//更新考试状态
const updateExamStatus = async () => {
  try {
    const payload = {
    examId: examData.value._id,
    isPublish: isPublish.value,
   } 
    console.log(payload)
    const res = await axios.post('/adminapi/exam/updateExamStatus', payload)
    console.log(res.data)
    if(res.data.code === 200) {
      ElMessage.success('更新考试状态成功') 
    }
  }catch(error) {
    ElMessage.error('更新考试状态失败')
    console.error('更新考试状态失败:', error)
  }
}

//向后端提交添加用户端使用的考试信息
const handlesubmit = async () => {
  try {
    const res = await axios.post('/adminapi/exam/AddUserExamInfo', createExamFrom.value)
    if(res.data.code === 200) {
      ElMessage.success('创建成功')
      //清空表单
      createExamFrom.value.questionTitle = [
        { content: '',questionIdS:[],questionType:[]},
      ]
    }
  }catch(error) {
    console.log(createExamFrom.value)
    ElMessage.error('提交失败')
    console.error('提交失败:', error)
  } 
}

</script>
<style scoped>
:deep(.el-page-header__content) {
  color: #2c94fd;
}

.el-card {
  margin-top: 12px;
  border-radius: 10px;
}

.info-card .info-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card .info-container .info-item {
  padding: 8px;
  border-radius: 8px;
  background-color: #f9fafb;
  transition: background-color 0.3s;
}

.info-card .info-container .info-item:hover {
  background-color: #f3f4f6;
}

.info-card .info-container .info-item .info-icon-text {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.info-card .info-container .info-item .info-icon-text .el-icon {
  margin-right: 8px;
}

.info-card .info-container .info-item .info-icon-text .info-label {
  font-size: 14px;
  font-weight: 500;
}

.info-card .info-container .info-item .info-value {
  display: block;
  padding-left: 32px;
  font-size: 16px;
  font-weight: 600;
}

.info-card .info-container .text-success {
  color: #67C23A;
}

.info-card .info-container .text-info {
  color: #909399;
}

.info-card .info-container .text-warning {
  color: #E6A23C;
}

.info-card .info-container .text-primary {
  color: #409EFF;
}

.info-card .info-container .text-purple-500 {
  color: #8B5CF6;
}

.form-item-container {
  margin-bottom: 20px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.form-item-container:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.index-badge {
  display: inline-block;
  min-width: 60px;
  padding: 4px 8px;
  background: #f0f9eb;
  color: #67c23a;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}

.option-input {
  flex: 1;
  transition: all 0.3s ease;
}

.option-input.success-border :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #67c23a inset !important;
}

.add-button :deep(.icon),
.remove-button :deep(.icon) {
  width: 1em;
  height: 1em;
  margin-right: 1px;
}

.button-group {
  display: flex;
  gap: 8px;
  margin-left: 12px;  /* 添加左侧间距 */
}

.remove-button {
  transition: transform 0.2s ease;
}

.remove-button:hover {
  transform: scale(1.1);
}
:deep(.el-divider__text) {
  font-size: 15px;
  font-weight: bold;
  color: #409eff;
}

</style>