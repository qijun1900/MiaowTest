<template>
    <div class="container">
        <el-card shadow="hover" style=" border-radius: 10px;">
            <el-form :model="form" ref="formRef" label-position="top">
                <Divider content="题目题干" />
                <el-form-item prop="stem" :rules="[{ required: true, message: '题干不能为空', trigger: 'blur' }]">
                    <Editor :key="'stem-editor'" @event="handlechangeStem" :height="100" placeholder="请在此处输入题目题干..."
                        :content="form.stem" />
                </el-form-item>
                <Divider content="题目选项" />
                <el-row :gutter="20" v-for="(option, index) in form.options" :key="index">
                    <el-col :span="18">
                        <el-form-item :label="`${String.fromCharCode(65 + index)}`" :prop="`options.${index}.content`"
                            :rules="[{ required: true, message: '选项内容不能为空', trigger: 'blur' }]">
                            <el-input v-model="option.content" placeholder="输入选项内容" class="option-input" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :span="6" class="flex items-center">
                        <el-checkbox v-model="option.isCorrect" @change="updateMultipleStatus">正确答案</el-checkbox>
                        <el-button type="danger" @click="removeOption(index)" :disabled="form.options.length <= 2"
                            circle :icon="Delete" />
                    </el-col>
                </el-row>
                <el-space :size="50" spacer="|">
                    <el-button type="primary" @click="addOption" :icon="CirclePlusFilled">
                        添加选项
                    </el-button>
                    <el-button type="success" @click="submitForm" :icon="Checked">
                        {{ props.isEdit ? '更新题目' : '添加题目' }}
                    </el-button>
                </el-space>
                <Divider content="题目解析" />
                <el-form-item prop="analysis">
                    <Editor :key="'analysis-editor'" @event="handlechangeAnalysis" :height="100"
                        placeholder="请在此处输入题目解析(如果没有请忽略)..." :content="form.analysis" />
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
import { ref, reactive, onMounted, watch } from 'vue';
import Divider from '../ReuseComponents/Divider.vue';
import Editor from '@/components/FunComponents/Editor.vue'
import { Delete, CirclePlusFilled, Checked } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import selectAPI from '@/API/Question/SelectAPI';


const route = useRoute();
const formRef = ref();
const form = reactive({
    examId: route.params.id,
    stem: '',
    options:
        [
            { content: '', isCorrect: false },
            { content: '', isCorrect: false },
            { content: '', isCorrect: false },
            { content: '', isCorrect: false },
        ],
    isPublish: 0,//0:未发布，1：发布
    analysis: '', // 题目解析/答案解释
    isAIanswer: 0,//0:不是，1：是
    isAddUserList: 0,//0:不是，1：是
    Type: 1, // 题目类型
    isMultiple: 0 // 0:单选，1:多选
});
// 定义props
const props = defineProps({
    Data: Object,
    isEdit: Boolean,
})
// 添加对Data prop的监听
watch(() => props.Data, (newVal) => {
    if (newVal && props.isEdit) {
        const data = newVal
        form.stem = data.stem
        form.options = (data.options || []).map(opt => ({
            content: opt.content || opt,
            isCorrect: opt.isCorrect || false
        }))
        form.analysis = data.analysis
        form.isAIanswer = data.isAIanswer
        form.isAddUserList = data.isAddUserList
        form.Type = data.Type || 1
        form.isMultiple = data.isMultiple
        form.isPublish = data.isPublish
    }
}, { immediate: true })

//editor内容改变的回调
const handlechangeStem = (data) => {
    form.stem = data
}
const handlechangeAnalysis = (data) => {
    form.analysis = data
}
// 添加选项
const addOption = () => {
    form.options.push({ content: '', isCorrect: false });
    updateMultipleStatus();
};
// 删除选项
const removeOption = (index) => {
    if (form.options.length > 2) {
        form.options.splice(index, 1);
        updateMultipleStatus();
    }
};
// 更新多选状态
const updateMultipleStatus = () => {
    const correctCount = form.options.filter(o => o.isCorrect).length;
    form.isMultiple = correctCount > 1 ? 1 : 0;
};
//重置表单
const resetForm = () => {
    form.stem = '';
    form.options = [
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
    ];
    form.isPublish = 0;
    form.analysis = '';
    form.isAIanswer = 0;
    form.isAddUserList = 0;
    form.Type = 1;
    form.isMultiple = 0;
}

const submitForm = async () => {
    if (form.options.filter(o => o.isCorrect).length === 0) {
        ElMessage.warning('请至少选择一个正确答案');
        return;
    }
    try {
        if (props.isEdit&&props.Data) {
            const _id = props.Data._id
            const response = await selectAPI.postUpdateSelect(form,_id)
            if(response.code === 200){
                ElMessage.success("更新题目成功")
            }else{
                ElMessage.error("更新题目失败")
            }
        } else {
            const valid = await formRef.value.validate()
            if (valid) {
                const response = await selectAPI.postAddSelect(form)
                if (response.code === 200) {
                    ElMessage.success("选择题添加题目成功")
                    resetForm()
                }
                else {
                    ElMessage.error("选择题添加题目失败")
                }
            }
        }
    } catch (error) {
        console.error("添加题目失败", error)
    }
}
onMounted(() => {

})

</script>
