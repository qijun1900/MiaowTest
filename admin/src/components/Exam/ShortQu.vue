<template>
    <div>
        <el-page-header @back="handleBack" title="题目面板" class="page-header" v-show="!props.questionId">
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

          <el-divider content-position="left">题目答案</el-divider>
          <el-row :gutter="20">
            <el-col :span="24">
                <el-form-item 
                    prop="content"
                    :rules="[{ required: true, message: '答案不能为空', trigger: 'blur' }]">
                    <editor @event="handlechange" :content="form.content" />
                </el-form-item>
            </el-col>
          </el-row>
  
          <el-row :gutter="20" class="mt-4">
            <el-col :span="24" class="flex justify-between">
                <el-button 
                  type="success" 
                  @click="submitForm"
                  :icon="Checked">
                  提交题目
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
import editor from '@/components/editor/Editor.vue'

const router = useRouter();
const route = useRoute();
const formRef = ref();
const form = reactive({
  stem: '',
  content:"",
  isPublish: 0,
  analysis: '',
  isAIanswer: 0,
});
const props = defineProps({
  questionId: String
})

onMounted(async() => {
    if(props.questionId){
      const res = await axios.get(`/adminapi/exam/whichOneQuestion/${props.questionId}`,{
        params: {  
        questionType: route.query.questionType
      }
      })
      const data = res.data.data
      form.stem = data.stem
      form.content = data.content
      form.analysis = data.analysis
      form.isAIanswer = data.isAIanswer
      console.log(res.data.data)
    }
      
  })


// 返回上一页
const handleBack = () => {
  router.back();
};
//editor内容改变的回调
const handlechange = (data)=>{
    form.content = data
}

  const submitForm = async () => {
    formRef.value.validate(async(valid) => {
      if(valid){
        const payload = {
          examId: route.params.id,
          stem: form.stem,
          content: form.content,
          isPublish: 0,
          analysis: form.analysis,
          isAIanswer: form.isAIanswer,
        };
        const res = await axios.post('/adminapi/exam/shortquestion', payload); 
        console.log(payload)
        console.log("@@@",res);
        if(res.data.code  === 200) {
        ElMessage.success('题目提交成功');
        // 重置表单
            form.stem = '';
            form.content = '';
            form.analysis = '';
            form.isAIanswer = 0;
        } else {
        ElMessage.error('提交失败');
        }
    }
  })
};
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
    margin-top: 10px;
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