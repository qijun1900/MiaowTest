<template>
    <div class="container">
       <el-card  shadow="hover" style=" border-radius: 10px;">
        <el-form 
            :model="form" 
            ref="formRef" 
            label-position="top">
            <Divider content="题目题干"/>
            <el-form-item
                prop="stem"
                :rules="[{ required: true, message: '题干不能为空', trigger: 'blur' }]">
                <Editor
                :key="'stem-editor'"
                    @event="handlechangeStem"
                    :height="100"
                    placeholder="请在此处输入题目题干..."
                    :content="form.stem"/>
            </el-form-item>
            <Divider content="题目答案"/>
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
                <el-button 
                    type="success" 
                    @click="submitForm"
                    :icon="Checked">
                添加题目
                </el-button>
            <Divider content="题目解析"/>
            <el-form-item  prop="analysis">
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
import { reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import Divider from '../ReuseComponents/Divider.vue';
import Editor from '../FunComponents/Editor.vue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const formRef = ref();
const form = reactive({
    examId: route.params.id,   
    stem: '',
    answer: null,// 正确答案 1:正确 0:错误
    isPublish: 0,
    analysis: '',
    isAIanswer: 0,
    isAddUserList: 0,
    Type:3, // 题目类型
});
//editor内容改变的回调
const handlechangeStem = (data) => {
    form.stem = data
}
const handlechangeAnalysis = (data) => {
    form.analysis = data
}


const submitForm = async () => {
    try {
        const valid = await formRef.value.validate()
        if (!valid) return;
        console.log(form)
    }catch (error) {
        ElMessage.error('表单验证失败')
        console.error('表单验证失败:', error)
    }
}
</script>