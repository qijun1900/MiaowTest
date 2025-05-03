<template>
    <div class="container">
      <el-page-header @back="handleBack" title="题目面板" class="page-header"  v-show="!props.questionId">
        <template #content>
          <div class="flex items-center">
            <el-icon class="mr-2">
              <DocumentAdd />
            </el-icon>
            <span class="text-xl font-bold">添加判断类题</span>
          </div>
        </template>
      </el-page-header>
      
      <el-card class="form-card" shadow="hover">
        <el-form :model="form" ref="formRef" label-width="120px" label-position="top">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-divider content-position="left">题目题干</el-divider>
              <el-form-item 
                prop="stem"
                :rules="[{ required: true, message: '题干不能为空', trigger: 'blur' }]">
                <el-input
                  v-model="form.stem"
                  placeholder="请输入题干内容"
                  type="textarea"
                  :rows="3"
                  clearable
                  show-word-limit
                  maxlength="5000"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">题目选项</el-divider>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item
                prop="answer"
                :rules="[{ required: true, message: '请选择正确答案', trigger: 'blur' }]">
                <el-radio-group v-model="form.answer">
                    <div>
                        <el-radio :value="1" size="large">正确</el-radio>
                        <br>
                        <el-radio :value="0" size="large">错误</el-radio>
                    </div>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row :gutter="20" class="mt-4">
            <el-col :span="24" class="flex justify-between">
                <el-button 
                  type="success" 
                  @click="submitForm"
                  :icon="Checked">
                  {{ props.questionId ? '更新题目' : '添加题目' }}
                </el-button>
            </el-col>
          </el-row>
          <el-divider content-position="left">题目解析</el-divider>
          <el-form-item 
              prop="analysis">
              <el-input
              v-model="form.analysis"
              placeholder="请输入题目解析内容(如没有请忽略)   |   (答案如果为Ai生成请务必勾选下方选项)"
              type="textarea"
              :rows="3"/>
          </el-form-item>
          <el-form-item>
              <el-checkbox v-model="form.isAIanswer" :true-value="1" :false-value="0">
              是否由AI生成的解析
              </el-checkbox>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { DocumentAdd, Checked } from '@element-plus/icons-vue'; // 移除未使用的图标
  import { reactive, ref ,onMounted} from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import axios from 'axios';
  
  const router = useRouter();
  const route = useRoute();
  const formRef = ref();
  const form = reactive({
    stem: '',
    answer: null,// 正确答案 1:正确 0:错误
    isPublish: 0,
    analysis: '',
    isAIanswer: 0,
    isAddUserList: 0,
    Type:3, // 题目类型
  });
// 返回上一页
const handleBack = () => {
  router.back();
};

const props = defineProps({
  questionId: String
})
  
onMounted(async() => {
    if(props.questionId){
      try{
        const res = await axios.get(`/adminapi/exam/whichOneQuestion/${props.questionId}`,{
          params: {
            questionType: route.query.questionType,
          }
        })
        const data = res.data.data[0]//单一数据我们取第一个元素
        Object.assign(form,data)
      }catch(error){
        console.error(ElMessage.error('获取题目详情失败'));
      }
    }  
  })
  //根据props 更新或者添加问题，向后端提交表单
const submitForm = async () => {
  try {
    const valid = await formRef.value.validate()
    if(!valid) return

    const payload = {
      examId: route.params.id,
      stem: form.stem,
      answer: form.answer,
      isPublish: 0,
      analysis: form.analysis,
      isAIanswer: form.isAIanswer,
      isAddUserList: 0,
      Type: 3,
    };
    
    const url = props.questionId
      ? `/adminapi/exam/judgequestionUpdate/${props.questionId}`
      : '/adminapi/exam/judgequestion'
    const res = await axios.post(url, payload)

    if(res.data.code === 200) {
      ElMessage.success(props.questionId ? '题目更新成功' : '题目提交成功')
      if(!props.questionId) {
        form.stem = ''
        form.answer = null
        form.analysis = ''
        form.isAIanswer = 0
        form.isAddUserList = 0
        form.Type = 3 // 重置表单
      }else{
        router.back()
      }
    } else {
      ElMessage.error(res.data.message || '操作失败')
    }
  } catch(error) {
    console.error('提交失败:', error)
    ElMessage.error(error.response?.data?.message || '提交失败，请稍后重试')
  }
}
  </script>
  
  <style scoped>
  :deep(.el-page-header__content) {
    color: #2c94fd;
  }
  .container {
    max-width: 1200px;
  }
  
  .page-header {
    margin-bottom: 5px;
  }
  
  .form-card {
    border-radius: 15px;
    margin-top: 20px;
  }
  
  .option-input {
    width: 100%;
  }
  
  :deep(.el-form-item__label) {
    font-weight: 600;
    color: #606266;
  }
  
  :deep(.el-divider__text) {
    font-size: 15px;
    font-weight: bold;
    color: #409eff;
  }
  </style>