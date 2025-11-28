<template>
<div>
    <el-container>
        <el-aside width="350px">
            <el-card style="border-radius: 5px" shadow="never">
                <el-descriptions 
                    :column="1">
                    <el-descriptions-item 
                        label="科目名称" 
                        label-class-name="info-label"
                        content-class-name="info-content">
                        <el-tag type="success">{{ appStore.examInfo.name }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item 
                        label="科目代码" 
                        label-class-name="info-label"
                        content-class-name="info-content">
                        <el-tag>{{ appStore.examInfo.code }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item 
                        label="创建时间" 
                        label-class-name="info-label"
                        content-class-name="info-content">
                        <el-tag type="info">{{ formatTime.getTime2(appStore.examInfo.createdTime) }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item 
                        label="题目类别" 
                        label-class-name="info-label"
                        content-class-name="info-content">
                        <el-tag type="warning">{{ getCategoryName(appStore.examInfo.category) }}</el-tag>
                    </el-descriptions-item>
                </el-descriptions>
            </el-card>
        </el-aside>
    <el-container>
            <el-header v-show="showSearch">
                <transition name="slide-up">
                <el-card 
                    style="border-radius: 5px" 
                    shadow="never">
                        <SearchFilter 
                            :Data="tableData" 
                            :filterConfig="[
                            {
                                type: 'input',
                                label: '题干',
                                placeholder: '请输入搜索题干',
                                field: 'stemeSearch',  // 存储值的字段名,初始化时会清空
                                fields: ['stem'] // 要搜索的字段
                            },
                            {
                                type: 'input',
                                label: '题目ID',
                                placeholder: '请输入搜索题目ID',
                                field: '_idSearch',  // 存储值的字段名,初始化时会清空
                                fields: ['_id'] // 要搜索的字段
                            },
                            {
                                type: 'select',
                                label: '题目状态',
                                placeholder: '请输入搜索题目ID',
                                field: 'isPublishSearch',  // 存储值的字段名,初始化时会清空
                                fields: ['isPublish'], // 要搜索的字段
                                options: [
                                    { label: '未发布', value: 0 },
                                    { label: '已发布', value: 1 },
                                ]
                            }
                            
                        ]" 
                        @onsearch="handleOnSearch" />
                </el-card>
                </transition>
            </el-header>
            <el-main>
                <div class="eidt-card">
                    <el-card style="border-radius: 4px," shadow="never">
                        <div class="edit-btn">
                            <el-row :gutter="20" type="flex" justify="space-between" align="middle">
                                <el-col :xs="24" :sm="24" :md="18" :lg="18" :xl="18" class="left-buttons">
                                    <el-button 
                                        type="success" 
                                        plain 
                                        @click="handleAdd">
                                        添加题目
                                    </el-button>
                                    <el-button 
                                        type="primary" 
                                        plain 
                                        @click="handlePublishMany"
                                        :disabled="!selectedRows || selectedRows.length === 0">
                                        批量改变状态
                                    </el-button>
                                    <Popconfirm
                                        title="您确定删除吗？"
                                        @confirm="handleDeleteMany">
                                        <el-button type="danger" 
                                            plain 
                                            :disabled="!selectedRows || selectedRows.length === 0">
                                            删除
                                        </el-button>
                                    </Popconfirm>
                                </el-col>
                                <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6" class="right-buttons">
                                    <Tooltip content="隐藏/显示搜索">
                                        <template #description>
                                            <el-button 
                                                type="primary" 
                                                :icon="Hide" 
                                                circle 
                                                @click="HandleHideSearch" />
                                        </template>
                                    </Tooltip>
                                    <Tooltip content="开启/关闭斑马纹">
                                        <template #description>
                                            <el-button 
                                                type="primary" 
                                                :icon="Open" 
                                                circle 
                                                @click="handleOpenStripe" />
                                        </template>
                                    </Tooltip>
                                    <Tooltip content="刷新表格">
                                        <template #description>
                                            <el-button 
                                                type="primary" 
                                                :icon="RefreshRight" 
                                                circle
                                                @click="handleRefreshQuestionData" />
                                        </template>
                                    </Tooltip>
                                </el-col>
                            </el-row>
                        </div>
                    </el-card>
                </div>
            </el-main>
        </el-container>
        </el-container>
        <div class="eidt-card">
            <el-table 
                :data="tableData" 
                style="width: 100%" 
                max-height="690" 
                :stripe="IsOpenStripe"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column type="index" label="序号" width="70" :index="(index) => index + 1"/> 
                <el-table-column 
                    label="题目题干" 
                    width="250"
                    :show-overflow-tooltip="true"
                >
                    <template #default="scope">
                        <div v-html="scope.row.stem"></div>
                    </template>
                </el-table-column>
                <el-table-column label="题目答案" width="180">
                    <template #default="scope">
                        <template v-if="QuestionType === 1">
                            <el-tag type="success">{{ formatSelectAnswer(scope.row.options) }}</el-tag>
                        </template>
                        <template v-else-if="QuestionType === 2">
                            <div  v-for="(option, index) in scope.row.options" :key="index">
                                <el-tag class="blank-tag">空{{ index + 1 }}</el-tag>
                                <span class="blank-content">{{ option.content }}</span>
                            </div>
                        </template>
                        <template v-else-if="QuestionType ===3 ">
                           <el-tag :type="scope.row.answer == 1 ? 'success' : 'danger'">
                                {{ scope.row.answer === 1 ? '正确' : '错误' }}
                            </el-tag>
                        </template>
                        <template v-else-if="QuestionType===4">
                            <el-tag type="info" @click="handleLooked(scope.row.content)">查看答案</el-tag>
                        </template>
                    </template>
                </el-table-column>
                <el-table-column label="是否为AI答案" width="150">
                    <template #default="scope">
                        <el-tag 
                            :type="scope.row.isAIanswer === 1 ? 'warning' : 'info'" 
                            size="small"
                            >
                            {{ isAianswer(scope.row.isAIanswer) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="200">
                    <template #default="scope">
                        <el-switch
                            v-model="scope.row.isPublish"
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
                <el-table-column label="创建时间" width="200">
                    <template #default="scope">
                        {{ formatTime.getTime2(scope.row.createTime) }}
                    </template>
                </el-table-column>
                <el-table-column 
                    label="操作" 
                    fixed="right"
                    min-width="360"
                    >
                    <template #default="scope">
                        <el-button 
                            type="primary" 
                            plain 
                            @click="handleEdit(scope.row)">
                            编辑
                        </el-button>
                        <Popconfirm
                            title="您确定删除吗"
                            @confirm="handleDeleteOne(scope.row)">
                            <el-button 
                                type="danger"
                                plain>
                                删除
                            </el-button>
                        </Popconfirm>
                        <el-button 
                            type="success" 
                            plain 
                            @click="handlePreview(scope.row)">
                            预览
                        </el-button>
                        <el-button 
                            type="warning" 
                            plain 
                            :loading-icon="Eleme" 
                            :loading="aiAnalysisLoadingArr.includes(scope.row._id)"
                            @click="handleGetAnalysis(scope.row)"
                            :disabled="scope.row.isAIanswer===1 && scope.row.analysis !==''">
                            AI解析
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="pagination">
            <Pagination 
                :total="total"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                @page-change="handlePageChange"/>
        </div>
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
        <QuestionPreview
            v-model="PreviewdialogVisible"
            :Data="QuestionData"/>
</div>
</template>
<script setup>
import { useRoute } from 'vue-router';
import { RefreshRight, Hide, Open } from '@element-plus/icons-vue'
import { onMounted ,ref,defineAsyncComponent,computed} from 'vue';
import SearchFilter from '@/components/FunComponents/SearchFilter.vue'
import { useTableState } from '@/composables/State/useTableState'
import { useTableActions } from '@/composables/Action/useTableActions'
import { useAppStore } from '@/stores';
import formatTime from '@/util/formatTime'
import {getCategoryName} from '@/util/formatExamname'
import Tooltip from '@/components/ReuseComponents/Tooltip.vue'
import Popconfirm from '@/components/ReuseComponents/Popconfirm.vue'
import Pagination from '@/components/ReuseComponents/Pagination.vue'
import Select from '@/components/Exam/Select.vue';//1
import Blank from '@/components/Exam/Blank.vue';//2
import Judge from '@/components/Exam/Judge.vue';//3
import Short from '@/components/Exam/Short.vue';//4
import { ElMessage } from 'element-plus';
import { formatSelectAnswer,isAianswer } from '@/util/formatAnswer';
import {
    getQuestionList,
    UpdateOneQuestion,
    UpdateManyQuestion,
    DeleteOneQuestion,
    DeleteManyQuestion
    } from '@/API/Question/QuestionPublicAPI';
import handleLooked from '@/util/CheckInfo'
import formatQuestion from '@/util/formatQuestion';
import {modelappGetQuestionAnalysis} from '@/API/LLM/modelappAPI'
import { Eleme } from '@element-plus/icons-vue'
// 动态导入较大的组件
const Dialog = defineAsyncComponent(() =>
    import('@/components/ReuseComponents/Dialog .vue')
)
const QuestionPreview = defineAsyncComponent(() =>
    import('@/components/Exam/QuestionPreview.vue')
)

//UI 状态与方法管理
const { showSearch, IsOpenStripe, HandleHideSearch, handleOpenStripe } = useTableState()
// 表格数据与方法管理
const { selectedRows, handleSelectionChange, handleRefresh } = useTableActions()
const route = useRoute();
const appStore = useAppStore()
//tableData数据
const tableData = ref([]);
//表格分页器
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
//题目ID和类型
const ExamID = route.params.id;
const QuestionType = appStore.examInfo.category;
// 对话框状态
const dialogVisible = ref(false)
// 添加编辑状态
const isEditMode = ref(false)
// 单个题目数据,用来预览和编辑题目
const QuestionData = ref(null)
//预览对话框
const PreviewdialogVisible = ref(false)
//AI解析状态
const aiAnalysisLoadingArr = ref([])

//删除单个
const handleDeleteOne = async (row) => {
    try{
        const res  = await DeleteOneQuestion(row._id,QuestionType)
        if(res.code===200){
            ElMessage.success('删除题目成功')
            handleRefreshQuestionData()
        }
    }catch(error){
        console.error('删除题目失败:',error)
    }
   
}
//删除多个
const handleDeleteMany = async () => {
    try{
        const res = await DeleteManyQuestion(selectedRows.value,QuestionType)
        if(res.code===200){
            ElMessage.success('删除批量题目成功')
            handleRefreshQuestionData()
        }
    }catch(error){
        console.error('删除题目失败:',error)
    }

}
// 根据题目类型返回对应编辑组件
const currentComponent = computed(() => {
  const componentMap = {
    1: Select,  // 选择题组件
    2: Blank,   // 填空题组件
    3: Judge,  // 判断题组件
    4: Short   // 简答题组件
  }
  return componentMap[Number(QuestionType)]  || null
}) 
//添加题目按钮，打开对话框
const handleAdd = () => {
    dialogVisible.value = true
    isEditMode.value = false
}
//按下搜索按钮
const handleOnSearch = (data) => {
    if (data.length === 0) {
        ElMessage.error('未搜索到该信息')
    } else {
        tableData.value = data
    }
}
// 添加分页变化处理方法
const handlePageChange = ({ page, size }) => {
    currentPage.value = page
    pageSize.value = size
    handleRefreshQuestionData()
}
//发布状态改变
const handlePublishChange = async (row) => {
    try{
        const res = await UpdateOneQuestion({
            _id: row._id,
            isPublish: row.isPublish,
            questionType: QuestionType,
        })
        if(res.code===200){
            ElMessage.success('发布状态改变成功')
        }
    }catch(error){
        console.error('发布状态改变失败:',error)
    }
}
//批量发布(改变状态)
const handlePublishMany = async () => {
  try{
    const res = await UpdateManyQuestion(selectedRows.value,QuestionType)
    if(res.code===200){
        ElMessage.success('批量切换状态成功')
        handleRefreshQuestionData()
    }
  }catch(error){
    console.error('批量发布失败:',error)
  }
}
//编辑  
const handleEdit = (row) => {
    dialogVisible.value = true
    isEditMode.value = true
    QuestionData.value = row
}
//获取考试列表+刷新+分页
const handleRefreshQuestionData = async () => {
    try{
        const res = await handleRefresh({
            examId: ExamID,
            page: currentPage.value,
            size: pageSize.value,
            questionType: QuestionType,
        },getQuestionList)
        if(res.code===200){
            tableData.value = res.data.data
            total.value = res.data.total
            appStore.changecurrentQuestionTotal(res.data.total)//更新总题目数
        }
    }catch(error){
        console.error('获取题目列表失败:',error)
    }
}
//预览
const handlePreview = (row) => {
  PreviewdialogVisible.value = true
  QuestionData.value = row
}

//AI解析
const handleGetAnalysis = async (row) => {
    try{
       // 将题目ID添加到loading数组中
       aiAnalysisLoadingArr.value.push(row._id)
       const question = formatQuestion(row)
       const res = await modelappGetQuestionAnalysis({
        message: question,
        questionType: QuestionType,
        _id: row._id,
       })
       if(res.code===200){
        handleRefreshQuestionData()
        ElMessage.success('AI解析成功')
       }
       // 从loading数组中移除题目ID
       aiAnalysisLoadingArr.value = aiAnalysisLoadingArr.value.filter(id => id !== row._id)
    }catch(error){
        ElMessage.error('AI解析失败')
        console.error('AI解析失败:',error)
        // 从loading数组中移除题目ID
        aiAnalysisLoadingArr.value = aiAnalysisLoadingArr.value.filter(id => id !== row._id)
    }
}
onMounted(()=>{
    handleRefreshQuestionData()
})
</script>
<style scoped>
.eidt-card {
    margin-top: 10px;
}

.edit-btn {
    width: 100%;
}

.left-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    padding: 4px 0;
}

.right-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    padding: 4px 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .left-buttons,
    .right-buttons {
        justify-content: center;
        margin: 8px 0;
    }
}

.edit-table {
    margin-top: 10px;
}

.pagination {
    margin-top: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
}

:deep(.el-table__header th) {
    background-color: #f5f7fa !important;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
.info-label {
    width: 120px;
    font-weight: bold;
    color: #606266;
    background-color: #f5f7fa;
}
.info-content {
    color: #409eff;
}
</style>