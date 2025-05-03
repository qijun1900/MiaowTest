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
              class="form-item-container"
              >
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
            <el-table
            ref="singleTableRef"
            :data="UserExamInfo?.questionTitle || []" 
            highlight-current-row
            style="width:100%"
            stripe
            max-height="593">
            <el-table-column type="index" width="50" />
            <el-table-column label="题型名称" width="200">
              <template #default="scope">
                {{ scope.row.content }} 
              </template>
            </el-table-column>
            <el-table-column label="是否发布" width="120">
              <template #default="scope">
                <el-switch 
                  v-model="scope.row.isPublishType"
                  :active-value="1" 
                  :inactive-value="0"
                  @change="updateQuestionTitleStatus(scope.row)"/>
              </template>
            </el-table-column>
            <el-table-column label="题目数量" width="120">
              <template #default="scope">
                {{ scope.row.questionIdS.length }}
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button size="small" circle :icon="Plus" @click="handleAddquestion(scope.row)" type="success"></el-button>
                <el-popconfirm title="你确定要删除吗" confirm-button-text="确定" cancel-button-text="取消"
                  @confirm="handleDelete(scope.row)">
                  <template #reference>
                    <el-button size="small" circle :icon="Delete" type="danger">
                    </el-button>
                  </template>
                </el-popconfirm>
              </template>
          </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
  <el-drawer v-model="visible" :show-close="false" size="30%">
    <template #header="{ close, titleId, titleClass }">
      <h4 :id="titleId" :class="titleClass">选择题目类型</h4>
      <el-button type="danger" @click="close">
        <el-icon class="el-icon--left"><CircleCloseFilled /></el-icon>
        关闭
      </el-button>
    </template>
    <div>
      <div class="category-buttons">
      <el-button
        v-for="data in examData.category" 
        :key="data._id"
        @click="handelquestion(data,examData._id)"
        class="category-button"
        :class="`type-${data}`">
        <el-icon class="button-icon">
          <component :is="getCategoryInfo(data).icon" />
        </el-icon>
        {{ getCategoryInfo(data).name}}
      </el-button>
    </div>
      <el-drawer
        v-model="innerDrawer"
        title="题目列表"
        :append-to-body="true"
        size="40%">
        <el-card shadow="hover" >
          <el-table
          ref="multipleTableRef"
          :data="questionListTbledata"
          stripe>
          <el-table-column type="selection" width="55" />
          <el-table-column prop="stem" label="题目名称" width="150" />
          <el-table-column label="添加状态" width="120">
            <template #default="scope">
            <el-switch v-model="scope.row.isAddUserList" :active-value="1" :inactive-value="0"
              @change="handleSinglePublish(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column prop="" label="更新时间" with="100">
          <template #default="scope">
            {{ formatTime.getTime(scope.row.createdTime) }}
          </template>
        </el-table-column>
          </el-table>
        </el-card>
      </el-drawer>
    </div>
  </el-drawer>
</template>
<script setup>
import { ref, onMounted,computed, watch} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Connection, Collection, Document, Timer, View, Hide, Delete, Plus, CircleCloseFilled, List, Edit, Check } from '@element-plus/icons-vue'
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
const visible = ref(false)
const innerDrawer = ref(false)
const questionListTbledata = ref([])
const questionTitleID = ref()

onMounted(async () => {
  await getUserExamInfo()//获取用户端使用的考试信息
  console.log(examData.value)
})
watch(isChange, (newValue) => {
  if(newValue) {
    getUserExamInfo()
  }
},{ immediate: true }) //添加立即执行选项

// 添加题目类型
const addquestionTitle = () => {
  createExamFrom.value.questionTitle.push({ content: '' ,questionIdS:[] ,isPublishType:0});
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
    UserExamInfo.value = res.data.data[0]
    if(res.data.code === 200) {
      ElMessage.success('获取用户端使用的考试信息成功')
      isChange.value = false //重置状态 
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
    const url = UserExamInfo.value? `/adminapi/exam/UpdateUserExamInfo`: '/adminapi/exam/AddUserExamInfo'
    const res = await axios.post(url, createExamFrom.value)
    if(res.data.code === 200) {
      ElMessage.success('创建成功')
      isChange.value = true//改变状态
      createExamFrom.value.questionTitle = [
        { content: '',questionIdS:[],isPublishType:0},
      ]
    }else if(res.data.code === 302){
      ElMessage.success('更新成功')
      isChange.value = true//改变状态
      createExamFrom.value.questionTitle = [
        { content: '',questionIdS:[],isPublishType:0},
      ]
    }
  }catch(error) {
    console.log(createExamFrom.value)
    ElMessage.error('提交失败')
    console.error('提交失败:', error)
  }
}
//更新题型状态
const updateQuestionTitleStatus = async (row) => {
  try {
    const res = await axios.post('/adminapi/exam/updateQuestionTitleStatus', {
      examId: examData.value._id,
      titleId: row._id,
      isPublishType: row.isPublishType
    });
    if(res.data.code === 200) {
      ElMessage.success('题型状态更新成功');
    }
  } catch(error) {
    ElMessage.error('状态更新失败');
    console.error('更新失败:', error);
  }
}

//删除
const handleDelete = async (data) => {
  try {
    const res = await axios.post('/adminapi/exam/deleteQuestionTitle', {
      examId: examData.value._id,
      titleId: data._id,
    })
    if(res.data.code === 200) {
      ElMessage.success('删除成功')
      isChange.value = true//改变状态,再次获取数据，函数getUserExamInfo()
    }
  }catch(error) {
    console.log(error) 
    ElMessage.error('删除失败')
  }
}

//添加题目
const handleAddquestion  = (data) => {
  visible.value = true
  console.log(data._id) 
  questionTitleID.value = data._id
}

//加载题目
const handelquestion = async(data,id) => {
innerDrawer.value = true
try{
    const res = await axios.get(`/adminapi/exam/questionlist/${id}`,{
        params:{
        questionType:data,
        isPublish: 1
      }
    })
    if(res.data.code === 200) {
      questionListTbledata.value = res.data.data
      ElMessage.success('获取题目列表成功') 
      console.log(res.data.data)
    }
  }
  catch(error) {
    console.log(error)
    ElMessage.error('获取题目列表失败')
  }
}
// 合并后的类型映射方法，返回包含名称和图标的对象
const getCategoryInfo = (val) => {
  const CategoryMap = {
    1: { name: '选择类题', icon: List },
    2: { name: '填空类题', icon: Edit },
    3: { name: '判断类题', icon: Check },
    4: { name: '简答类题', icon: Document }
  }
  return CategoryMap[val] || { name: '其他类型', icon: Collection }
}
//添加单个用户题目列表
const handleSinglePublish = async (row) => {
  console.log(row.isAddUserList)
  try {
    const url = row.isAddUserList === 1 
      ? '/adminapi/exam/AddSingUserList' 
      : '/adminapi/exam/RemoveSingUserList';
      
    const res = await axios.post(url, {
      examId: examData.value._id,
      questionId: row._id,
      isAddUserList: row.isAddUserList,
      Type: row.Type,
      titleId: questionTitleID.value,
      row: row,
    });
    
    if(res.data.code === 200) {
      const message = row.isAddUserList === 1 ? '添加成功' : '删除成功';
      ElMessage.success(message);
      isChange.value = true;
    }
  } catch(error) {
    console.log(error);
    ElMessage.error('操作失败');
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
.category-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px;
}

.category-button {
  height: 100px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.category-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.button-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

/* 不同类型按钮的颜色 */
.category-button.type-1 {
  color: #409EFF;
  background-color: #ecf5ff;
  border-color: #b3d8ff;
}

.category-button.type-2 {
  color: #67C23A;
  background-color: #f0f9eb;
  border-color: #c2e7b0;
}

.category-button.type-3 {
  color: #E6A23C;
  background-color: #fdf6ec;
  border-color: #f5dab1;
}

.category-button.type-4 {
  color: #8B5CF6;
  background-color: #f3f0ff;
  border-color: #d6c2ff;
}
</style>

