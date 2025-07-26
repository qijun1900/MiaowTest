<template>
    <div class="container">
        <el-card shadow="hover" style=" border-radius: 10px;">
            <el-form :model="form" ref="formRef" label-position="top">
                <Divider content="题目题干" />
                <el-form-item prop="stem" :rules="[{ required: true, message: '题干不能为空', trigger: 'blur' }]">
                    <Editor 
                        :key="'stem-editor'" 
                        @event="handlechangeStem" 
                        :height="100" placeholder="请在此处输入题目题干..."
                        :content="form.stem" />
                </el-form-item>
                <Divider content="题目选项" />
                <el-row :gutter="20" v-for="(option, index) in form.options" :key="index">
                    <el-col :span="18">
                        <el-form-item 
                            :label="`空${index + 1}`" 
                            :prop="`options.${index}.content`"
                            :rules="[{ required: true, message: '答案内容不能为空', trigger: 'blur' }]">
                            <el-input v-model="option.content" placeholder="输入选项内容" class="option-input" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :span="6" class="flex items-center">
                        <el-button type="danger" 
                            @click="removeOption(index)" 
                            :disabled="form.options.length <= 1"
                            circle :icon="Delete" />
                    </el-col>
                </el-row>
                <el-space :size="50" spacer="|">
                    <el-button type="primary" @click="addOption" :icon="CirclePlusFilled">
                        添加填空
                    </el-button>
                    <el-button type="success" @click="submitForm" :icon="Checked">
                        {{ props.isEdit ? '更新题目' : '添加题目' }}
                    </el-button>
                </el-space>
                <Divider content="题目解析" />
                <el-form-item prop="analysis">
                    <Editor 
                        :key="'analysis-editor'" 
                        @event="handlechangeAnalysis" :height="100"
                        placeholder="请在此处输入题目解析(如果没有请忽略)..." 
                        :content="form.analysis" />
                </el-form-item>
                <el-form-item>
                    <el-checkbox 
                        v-model="form.isAIanswer" 
                        :true-value="1" 
                        :false-value="0">
                        是否由AI生成的解析
                    </el-checkbox>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>
<script setup>
import Divider from '../ReuseComponents/Divider.vue';
import Editor from '../FunComponents/Editor.vue';
import { Delete,CirclePlusFilled } from '@element-plus/icons-vue';
import { reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { blankAPI } from '@/API/Question/BlankAPI';
import { Checked } from '@element-plus/icons-vue';

const route = useRoute();
const formRef = ref();
const form = reactive({
    examId: route.params.id,
    stem: '',
    options: [
        { content: "" },
    ],
    isPublish: 0,//0:未发布，1：发布
    analysis: '', // 题目解析/答案解释
    isAIanswer: 0,//0:不是，1：是
    isAddUserList: 0,//0:不是，1：是
    Type: 2 // 题目类型
});
// 定义props
const props = defineProps({
    Data: Object,
    isEdit: Boolean,
})
//editor内容改变的回调
const handlechangeStem = (data) => {
    form.stem = data
}
const handlechangeAnalysis = (data) => {
    form.analysis = data
}
// 添加选项
const addOption = () => {
    form.options.push({ content: '' });
};
// 删除选项
const removeOption = (index) => {
    if (form.options.length > 1) {
        form.options.splice(index, 1);
    }
};
//重置表单
const resetForm = () => {
    form.stem = '';
    form.options = [
        { content: "" },
    ];
    form.isPublish = 0;
    form.analysis = '';
    form.isAIanswer = 0;
    form.isAddUserList = 0;
    form.Type = 2;
}
const submitForm = async () => {
    try {
        if (props.isEdit && props.Data) {
            const _id = props.Data._id
            const response = await blankAPI.postUpdateBlank(form, _id)
            if (response.code === 200) {
                ElMessage.success("更新题目成功")
            } else {
                ElMessage.error("更新题目失败")
            }
        } else {
            const valid = await formRef.value.validate()
            if (valid) {
                const response = await blankAPI.postAddBlank(form)
                console.log(response)
                if (response.code === 200) {
                    ElMessage.success("填空题添加题目成功")
                    resetForm()
                } else {
                    ElMessage.error("填空题添加题目失败")
                }
            }

        }

    } catch (error) {
        ElMessage.error('表单验证失败')
        console.error('添加题目失败：', error);
    }
}
watch(() => props.Data, (newVal) => {
    if (newVal && props.isEdit) {
        const data = newVal;
        form.stem = data.stem;
        form.options = (data.options || []).map(opt => ({ content: opt.content || opt }));
        form.analysis = data.analysis || '';
        form.isAIanswer = data.isAIanswer || 0;
        form.isAddUserList = data.isAddUserList || 0;
        form.Type = data.Type || '';
    }
}, { immediate: true })
</script>