<template>
    <div class="container">
        <el-card shadow="hover" style=" border-radius: 10px;">
            <el-form ref="formRef" 
                :model="form"  
                label-position="top">
                <Divider content="题目题干"/>
            <el-form-item 
                prop="stem"
                :rules="[{ required: true, message: '题干不能为空', trigger: 'blur' }]">
                <Editor 
                    :key="'content-editor'"
                    @event="handlechangeStem" 
                    :height="130" 
                    placeholder="请在此处输入题目题干..."
                    :content="form.stem"/>
            </el-form-item>
            <Divider content="题目答案"/>
            <el-form-item 
                prop="content"
                :rules="[{ required: true, message: '题干不能为空', trigger: 'blur' }]">
                <Editor
                    :key="'content-editor'"
                    @event="handlechangeContent" 
                    :height="100" 
                    placeholder="请在此处输入题目答案..."
                    :content="form.content"/>
            </el-form-item>
            <el-button 
                  type="success" 
                  @click="submitForm"
                  :icon="Checked">
                添加题目
            </el-button>
            <Divider content="题目解析"/>
            <el-form-item 
              prop="analysis">
                <Editor
                    :key="'analysis-editor'"
                    @event="handlechangeAnalysis" 
                    :height="100" 
                    placeholder="请在此处输入题目解析(如果没有请忽略)..."
                    :content="form.analysis"/>
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
import {useRoute} from 'vue-router';
import {reactive, ref} from "vue";
import Divider from '../ReuseComponents/Divider.vue';
import Editor from '../FunComponents/Editor.vue';
import { ElMessage } from 'element-plus';


const route = useRoute();
const formRef = ref();
const form = reactive({
  examId: route.params.id,
  stem: '',
  content:"",
  isPublish: 0,
  analysis: '',
  isAIanswer: 0,
  isAddUserList:0,//0:不是，1：是
  Type:4, // 题目类型
});
//editor内容改变的回调
const handlechangeStem = (data) => {
    form.stem = data
}
const handlechangeContent = (data) => {
    form.content = data
}
const handlechangeAnalysis = (data) => {
    form.analysis = data
}
//提交表单
const submitForm = async () => {
    try{
        const valid = await formRef.value.validate()
        if(!valid) return
        console.log(form)


    }catch(error){
        console.error(error);
        ElMessage.error('提交失败，请稍后重试');
    }
};


</script>