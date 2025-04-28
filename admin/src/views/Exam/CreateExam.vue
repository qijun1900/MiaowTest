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
                  :class="{'success-border': item.content }"
                  clearable/>
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
            <!-- <div v-for="data in UserExamInfo" :key="data_id">
              {{ data.questionTitle
                .map((item, index) => `题型${index + 1}: ${item.content}`)
                .join(',')
              }}
            </div> -->
            <el-table
            ref="singleTableRef"
            :data="tableData"
            highlight-current-row
            style="width: 100%"
            @current-change="handleCurrentChange">
            <el-table-column type="index" width="50" />
            <el-table-column property="date" label="题型" width="120" />
            <el-table-column property="name" label="是否发布" width="100" />
            <el-table-column property="address" label="题目数量"  width="100"/>
          </el-table>


        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import { ref, onMounted,computed, watch} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Connection, Collection, Document, Timer, View, Hide,Plus,Delete } from '@element-plus/icons-vue'
import formatTime from '@/util/formatTime'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const examData = ref(JSON.parse(route.query.examData))
const isPublish = ref(examData.value.isPublish)
const createExamFrom = ref({
  name: examData.value.name,
  questionTitle: [
    { content: '' ,questionIdS:[],questionType:[],isPublishType:0},
  ],
  code: examData.value.code,
  isPublish: isPublish.value,
  category:examData.value.category,
  examId:examData.value._id,
})
const UserExamInfo = ref()
const isChange = ref(false)//判断是否再此提交，如果是则重新获取


onMounted(async () => {
  getUserExamInfo()//获取用户端使用的考试信息
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
// 返回上一页
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
//获取用户端使用的考试信息
const getUserExamInfo = async () => {
  try {
    const res = await axios.get(`/adminapi/exam/getUserExamInfo/${examData.value._id}`)
    UserExamInfo.value = res.data.data
    if(res.data.code === 200) {
      ElMessage.success('获取用户端使用的考试信息成功')
      isChange.value = false //重置状态 
      console.log(UserExamInfo.value)
    }
  }
  catch(error) {
    console.error('获取用户端使用的考试信息失败:', error)
    ElMessage.error('获取用户端使用的考试信息失败')
  }
}
//向后端提交添加用户端使用的考试信息
const handlesubmit = async () => {
  try {
    const url = UserExamInfo.value.length ? `/adminapi/exam/UpdateUserExamInfo`: '/adminapi/exam/AddUserExamInfo'
    const res = await axios.post(url, createExamFrom.value)
    if(res.data.code === 200) {
      ElMessage.success('创建成功')
      isChange.value = true//改变状态
      createExamFrom.value.questionTitle = [
        { content: '',questionIdS:[],questionType:[]},
      ]
    }else if(res.data.code === 302){
      ElMessage.success('更新成功')
      isChange.value = true//改变状态
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

watch(isChange, (newValue) => {
  if(newValue) {
    getUserExamInfo()
  }
},{ immediate: true }) //添加立即执行选项



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