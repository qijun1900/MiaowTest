<template>
    <div class="container">
      <el-page-header @back="handleBack" title="题目面板" class="page-header">
        <template #content>
          <div class="flex items-center">
            <el-icon class="mr-2">
              <DocumentAdd />
            </el-icon>
            <span class="text-xl font-bold">添加填空类题</span>
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
          <el-row :gutter="20" v-for="(option, index) in form.options" :key="index">
            <el-col :span="18">
              <el-form-item
                :label="`空${index + 1}`"  
                :prop="`options.${index}.content`"
                :rules="[{ required: true, message: '答案内容不能为空', trigger: 'blur' }]">
                <el-input
                  v-model="option.content"
                  placeholder="输入选项内容"
                  class="option-input"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="6" class="flex items-center">
              <el-button
                type="danger"
                @click="removeOption(index)"
                :disabled="form.options.length <= 1"
                 circle
                :icon="Delete"
              />
            </el-col>
          </el-row>
  
          <el-row :gutter="20" class="mt-4">
            <el-col :span="24" class="flex justify-between">
              <el-space :size="50" spacer="|">
              <el-button 
                type="primary" 
                @click="addOption"
                :icon="CirclePlusFilled">
                添加填空
              </el-button>
                <el-button 
                  type="success" 
                  @click="submitForm"
                  :icon="Checked">
                  提交题目
                </el-button>
              </el-space>
            </el-col>
          </el-row>
          <el-divider content-position="left">题目解析</el-divider>
          <el-form-item 
              prop="analysis">
              <el-input
              v-model="form.analysis"
              placeholder="请输入题目解析内容(如没有请忽略)   |    (答案如果为Ai生成请务必勾选下方选项)"
              type="textarea"
              :rows="2"/>
          </el-form-item>
          <el-form-item>
              <el-checkbox v-model="form.isAIanswer" :true-value="1" :false-value="0">
                是否由AI生成的解析
              </el-checkbox>
          </el-form-item>
        </el-form>
      </el-card>
      <el-backtop :right="100" :bottom="100" />
    </div>
  </template>
  
  <script setup>
  import { DocumentAdd, CirclePlusFilled, Checked, Delete } from '@element-plus/icons-vue';
  import { onMounted, reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import axios from 'axios';
  
  const router = useRouter();
  const route = useRoute();
  const formRef = ref();
  const form = reactive({
    stem: '',
    options: [
        { content:"" },
    ],
    isPublish:0,//0:未发布，1：发布
    analysis:'', // 题目解析/答案解释
    isAIanswer:0,//0:不是，1：是
  });
  // 添加选项
  const addOption = () => {
    form.options.push({ content: ''});
  };
  
  const removeOption = (index) => {
    if (form.options.length > 1) {
      form.options.splice(index, 1);
    }
  };
  // 返回上一页
  const handleBack = () => {
    router.back();
  };
  // 向后端提交表单
  const submitForm = async () => {
      formRef.value.validate(async(valid)=>{
          if(valid){
              const payload = {
                  examId:route.params.id,
                  stem: form.stem,
                  options: form.options,
                  isPublish:0,  
                  analysis:form.analysis,
                  isAIanswer:form.isAIanswer,
              };
              const res = await axios.post('/adminapi/exam/blankquestion',payload);
              console.log(payload)
              console.log("@@@",res);
              if(res.data.code  === 200) {
              ElMessage.success('题目提交成功');
              // 重置表单
              form.stem = '';
                  form.options = [
                      { content: '' },
                  ];
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