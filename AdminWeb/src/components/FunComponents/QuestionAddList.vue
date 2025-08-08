<template>
    <div>
        <el-card  shadow="hover">
            <div class="header-container">
                <el-input
                v-model="tableSearchText"
                placeholder="搜索表格题目"
                clearable
                style="width: 300px"
                :prefix-icon="Search"
                />
                <div class="header-right">
                    <el-button 
                        type="primary" 
                        plain 
                        @click="handlePublishMany"
                        :disabled="!selectedRows || selectedRows.length === 0">
                        批量改变状态
                    </el-button>
                </div>
            </div>
            <el-table
                @selection-change="handleSelectionChange"
                :data="SearchTextfilteredQuestionListData"
                style="width: 100%"
                v-if="tableData.length>0">
                <el-table-column type="selection" width="65" />
                <el-table-column type="index" label="序号" width="90" :index="(index) => index + 1"/> 
                <el-table-column label="题目题干" width="300">
                    <template #default="scope">
                        <div v-html="scope.row.stem"></div>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-switch
                            v-model="scope.row.isAddUserList"
                            inline-prompt
                            size="large"
                            :active-value="1"
                            :inactive-value="0"
                            active-text="已发布"
                            inactive-text="未发布"
                            @change="handlePublishChange(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
            </el-table>
            <el-empty v-else description="暂无题目数据要添加" />
        </el-card>
    </div>
</template>
<script setup>
import { onMounted, watch,ref,computed} from 'vue';
import { FetchAddQuestionList,AddOneQuestion,AddManyQuestion } from '@/API/Exam/addQusetionAPI';
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useTableActions } from '@/composables/Action/useTableActions'

const { selectedRows,handleSelectionChange } = useTableActions()

const tableData = ref([]) // 表格数据
const tableSearchText = ref('')//搜索框
const props = defineProps({  
   WhichCategory: { // 题目类型
      type: Number,
      default: 0
   },
   examId: { // 科目ID
      type: String,
      default: ""
   },
   QuestionTitleId: { // 题型ID
      type: String,
      default: ""
   }
})
const fechData = async () => {
    // 调用接口获取数据
    const res = await FetchAddQuestionList(props.WhichCategory,props.examId)
    console.log(res)
    if (res.code === 200) {
        tableData.value = res.data
    }
}
// 处理表格内搜索
const SearchTextfilteredQuestionListData = computed(() => {
  return tableSearchText.value
    ? tableData.value.filter(item => 
        item.stem?.toLowerCase().includes(tableSearchText.value.toLowerCase())
      )
    : tableData.value
})
// 处理发布状态切换
const handlePublishChange = async(row) => {
    const res = await AddOneQuestion({
        _id:row._id,// 题目ID
        examId:props.examId,// 科目ID
        category:props.WhichCategory,// 题目类型
        QuestionTitleId:props.QuestionTitleId,// 题型ID
    })
    if(res.code === 200) {
        ElMessage({
            message: '添加题目成功',
            type: 'success',
        })
    }
}
// 批量发布
const handlePublishMany = async() => {
   const _ids = selectedRows.value.map(item => item._id) // 提取所有选中行的ID
  const res = await AddManyQuestion({
    _ids,// 题目IDs
    examId:props.examId,// 科目ID
    category:props.WhichCategory,// 题目类型
    QuestionTitleId:props.QuestionTitleId,// 题型ID
  })
  if(res.code === 200) {
    ElMessage({
        message: '批量添加题目成功',
        type:'success',
    })
    fechData()
  }
}

// 监听props变化，变化时重新请求数据
watch([() => props.WhichCategory, () => props.examId], () => {
    if(props.WhichCategory && props.examId) {
        fechData()
    }
}, {immediate: true})
// 在组件挂载时获取数据
onMounted(() => {
    fechData()
})
</script>
<style scoped>
.header-container{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

</style>