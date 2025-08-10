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
                                :disabled="!selectedRows || selectedRows.length === 0 || tableData.length === 0">
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
                        <el-button 
                            type="primary" 
                            plain 
                            @click="handleEdit(scope.row)">
                            编辑题目
                        </el-button>
                    </template>
                </el-table-column>
             </el-table>
            <el-empty v-else description="暂无添加题目" />
        </el-card>
        <QuestionPreview
            v-model="PreviewdialogVisible"
            :Data="QuestionData"/>
        <Dialog
        :DilogTitle="isEditMode ? '编辑题目' : '新增题目'" 
        :DilogButContent="isEditMode ? '取消' : '取消'"
        DilogWidth="1200px"
        :draggable="true"
        top="2vh" 
        v-model="dialogVisible">
            <template #dialogcontent>
                <component 
                :is="currentComponent" 
                :Data="QuestionData" 
                :isEdit="isEditMode"/>
            </template>
        </Dialog>
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
import Select from '@/components/Exam/Select.vue';//1
import Blank from '@/components/Exam/Blank.vue';//2
import Judge from '@/components/Exam/Judge.vue';//3
import Short from '@/components/Exam/Short.vue';//4
const QuestionPreview = defineAsyncComponent(() =>
    import('@/components/Exam/QuestionPreview.vue')
)
const Dialog = defineAsyncComponent(() =>
    import('@/components/FunComponents/Dialog .vue')
)
const { selectedRows,handleSelectionChange } = useTableActions()

const tableData = ref([]) // 表格数据
const tableSearchText = ref('')//搜索框
const PreviewdialogVisible = ref(false)//预览对话框
const QuestionData = ref(null)// 单个题目数据
const dialogVisible = ref(false)// 编辑对话框状态
const isEditMode = ref(false)// 添加编辑状态
const whichcategory= ref(null) // 题目类型
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
//预览题目
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
//编辑题目
const handleEdit = (row) => {
    console.log("row",row)
    dialogVisible.value = true
    isEditMode.value = true
    QuestionData.value = row
    whichcategory.value = row.Type
}
// 根据题目类型返回对应编辑组件
const currentComponent = computed(() => {
  const componentMap = {
    1: Select,  // 选择题组件
    2: Blank,   // 填空题组件
    3: Judge,  // 判断题组件
    4: Short   // 简答题组件
  }
  return componentMap[Number(whichcategory.value)]  || null
}) 

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