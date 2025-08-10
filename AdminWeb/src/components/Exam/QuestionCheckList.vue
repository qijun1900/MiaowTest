<template>
    <div>
        <el-card>
            <div class="header-container">
                <el-input
                    v-model="tableSearchText"
                    placeholder="搜索表格题目"
                    clearable
                    style="width: 300px"
                    :prefix-icon="Search"
                    />
                    <div class="header-right">
                        <Popconfirm
                            title="您确定删除吗"
                            @confirm="handleDelete()">
                            <el-button
                                type="danger"
                                plain
                                :disabled="!selectedRows || selectedRows.length === 0">
                                批量删除
                            </el-button>
                        </Popconfirm>
                        <el-button
                            type="primary"
                            plain
                            @click="handleRefresh">
                            刷新数据
                        </el-button>
                    </div>
            </div>
            <el-table 
                :data="SearchTextfilteredQuestionListData"
                style="width: 100%"
                stripe 
                @selection-change="handleSelectionChange"
                v-if="tableData.length>0">
                <el-table-column type="selection" width="65" />
                <el-table-column type="index" label="序号" width="90" :index="(index) => index + 1"/>
                <el-table-column label="题目题干" width="200">
                    <template #default="scope">
                        <div v-html="scope.row.stem"></div>
                    </template>
                </el-table-column>
                <el-table-column label="题目类型" width="120">
                    <template #default="scope">
                        <el-tag :type="getTagType(scope.row.Type)">
                            {{ getCategoryName(scope.row.Type) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button 
                            type="success" 
                            plain 
                            @click="handlePreview(scope.row)">
                            预览题目
                        </el-button>
                    </template>
                </el-table-column>
             </el-table>
            <el-empty v-else description="暂无添加题目" />
        </el-card>
        <QuestionPreview
            v-model="PreviewdialogVisible"
            :Data="QuestionData"/>
    </div>
</template>
<script setup>
import { onMounted ,ref,computed,watch,defineAsyncComponent} from 'vue';
import { FetchCheckQuestionList ,FetchMatchQuestionList,RemoveUserList} from '@/API/Exam/usersQusetionAPI';
import { Search } from '@element-plus/icons-vue';
import {getCategoryName} from '@/util/formatExamname'
import { useTableActions } from '@/composables/Action/useTableActions'
import Popconfirm from '@/components/ReuseComponents/Popconfirm.vue'
import { ElMessage } from 'element-plus';
const QuestionPreview = defineAsyncComponent(() =>
    import('@/components/Exam/QuestionPreview.vue')
)
const { selectedRows,handleSelectionChange } = useTableActions()

const tableData = ref([]) // 表格数据
const tableSearchText = ref('')//搜索框
const PreviewdialogVisible = ref(false)//预览对话框
const QuestionData = ref(null)// 单个题目数据
const props=defineProps({
    examId: { // 科目ID
        type: String,
        default: ""
   },
    QuestionTitleId: { // 题型ID
      type: String,
      default: ""
   }
})
// 获取已添加题目列表
const fechData = async () => {
    try{
        const res = await FetchCheckQuestionList(props.examId,props.QuestionTitleId)
        if (res.code === 200) {
           const extractedData = res.data.map(subArray =>{
                const obj =subArray[0]  
                return {
                    _id:obj._id, // 题目ID
                category:obj.category, // 题目类型
                }
            })
            const matchData = FetchMatchQuestionList(extractedData)
            matchData.then((res)=>{
                console.log("matchData",res.data)
                if(res.code === 200) {
                    tableData.value = res.data
                }
            }).catch((error)=>{
                console.error('Error matching question list:', error);
            })
        }  

    }catch(error) {
        console.error('Error fetching data:', error);
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
//预览
const handlePreview = (row) => {
  PreviewdialogVisible.value = true
  QuestionData.value = row
}
// 获取标签类型
const getTagType = (type) => {
  const typeMap = {
    1: 'primary',
    2: 'success',
    3: 'warning',
    4: 'danger'
  }
  return typeMap[type] || 'info'
}
// 批量删除
const handleDelete = async()=> {
   // 提取所有选中行的ID和题目类型
    const chooseInfo = selectedRows.value.map(item => ({
        _id: item._id, // 题目ID
        category: item.Type // 题目类型
    }))
    const res = await RemoveUserList({
        chooseInfo: chooseInfo, // 选中题目信息
        examId: props.examId, // 科目ID
        QuestionTitleId: props.QuestionTitleId // 题型ID
    })
    if(res.code === 200) {
        ElMessage({
            message: '删除题目成功',
            type:'success',
        })
        fechData()
    }
}
// 刷新数据
const handleRefresh = () => {
    fechData()
    ElMessage({
        message: '刷新成功',
        type:'success',
    })
}

// 监听props变化，变化时重新请求数据
watch([() => props.QuestionTitleId, () => props.examId], () => {
    if(props.QuestionTitleId && props.examId) {
        fechData()
    }
},{immediate:true})

onMounted(()=>{
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