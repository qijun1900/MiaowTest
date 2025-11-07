<template>
    <div>
        <el-container>
            <el-aside width="350px">
                <el-card style="border-radius: 5px" shadow="never">
                    <el-descriptions :column="1">
                        <el-descriptions-item label="科目名称" label-class-name="info-label"
                            content-class-name="info-content">
                            <el-tag type="success">{{ appStore.examInfo.name }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="科目代码" label-class-name="info-label"
                            content-class-name="info-content">
                            <el-tag>{{ appStore.examInfo.code }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="创建时间" label-class-name="info-label"
                            content-class-name="info-content">
                            <el-tag type="info">{{ formatTime.getTime2(appStore.examInfo.createdTime) }}</el-tag>
                        </el-descriptions-item>
                    </el-descriptions>
                </el-card>
            </el-aside>
            <el-container>
                <el-header v-show="showSearch">
                    <transition name="slide-up">
                        <el-card style="border-radius: 5px" shadow="never">
                            <SearchFilter :Data="tableData" :filterConfig="[
                                {
                                    type: 'input',
                                    label: '题干',
                                    placeholder: '请输入搜索题干',
                                    field: 'contentSearch',  // 存储值的字段名,初始化时会清空
                                    fields: ['content'] // 要搜索的字段
                                },
                                {
                                    type: 'input',
                                    label: '题型ID',
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

                            ]" @onsearch="handleOnSearch" />
                        </el-card>
                    </transition>
                </el-header>
                <el-main>
                    <div class="eidt-card">
                        <el-card style="border-radius: 4px," shadow="never">
                            <div class="edit-btn">
                                <el-row :gutter="200">
                                    <el-col :span="17">
                                        <el-button type="success" plain @click="handleAdd">
                                            增加题型
                                        </el-button>
                                        <Popconfirm title="您确定删除吗？" @confirm="handleDeleteMany">
                                            <el-button type="danger" plain
                                                :disabled="!selectedRows || selectedRows.length === 0">
                                                删除
                                            </el-button>
                                        </Popconfirm>
                                    </el-col>
                                    <el-col :span="7">
                                        <Tooltip content="隐藏/显示搜索">
                                            <template #description>
                                                <el-button type="primary" :icon="Hide" circle
                                                    @click="HandleHideSearch" />
                                            </template>
                                        </Tooltip>
                                        <Tooltip content="开启/关闭斑马纹">
                                            <template #description>
                                                <el-button type="primary" :icon="Open" circle
                                                    @click="handleOpenStripe" />
                                            </template>
                                        </Tooltip>
                                        <Tooltip content="刷新表格">
                                            <template #description>
                                                <el-button type="primary" :icon="RefreshRight" circle
                                                    @click="handleRefreshData" />
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
                <el-table-column label="题型名称" width="300">
                    <template #default="scope">
                        <div >{{ scope.row.content }}</div>
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
                <el-table-column label="题型描述" width="230">
                    <template #default="scope">
                        <div >{{ scope.row.description || '无描述' }}</div>
                    </template>
                </el-table-column> 
                <el-table-column label="题目数量" width="100">
                    <template #default="scope">
                       <div>{{ scope.row.questionIdS.length }}</div>
                    </template>
                </el-table-column> 
                <el-table-column label="更改" width="200">
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
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                    <el-button 
                            type="success" 
                            plain 
                            @click="handleCheck(scope.row)">
                            查看题目<el-icon><View /></el-icon>
                        </el-button>
                        <el-button 
                            type="success" 
                            plain 
                            @click="handleChooseQuestionType(scope.row)">
                            添加题目<el-icon><Plus /></el-icon>
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
            :DilogTitle="isEditMode ? '编辑题型' : '新增题型'" 
            :DilogButContent="isEditMode ? '提交更改' : '添加题型'"
            :draggable="true"
            v-model="dialogVisible" 
            DilogWidth="700px"
            @dialog-confirm="handleConfirm">
            <template #dialogcontent>
                <el-form 
                    ref="FormRef"
                    :model="Form" 
                    :rules="Formrules">
                    <el-form-item label="题型名称" prop="content">
                        <el-input 
                            v-model="Form.content" 
                            placeholder="请输入题型名称"/>
                    </el-form-item>
                    <el-form-item label="描述" prop="description">
                        <el-input 
                        placeholder="请输入描述"
                        v-model="Form.description"  
                        :rows="3"
                        type="textarea"/>
                    </el-form-item>
                </el-form>
            </template>
        </Dialog>
        <Drawer 
            v-model="drawerVisible1"
            drawerTitle="选择题目类型"
            drawerSize="30%">
            <template #drawercontent>
                   <div class="category-buttons">
                    <el-button
                        v-for="(item, index) in appStore.examInfo.category"
                        :key="index"
                        :class="`category-btn category-btn-${index}`"
                        plain
                        block
                        @click="handleAddQuestion(item)">
                        <el-icon>
                            <component :is="getCategoryIcon(item)" />
                        </el-icon>
                        <span>{{ getCategoryName(item) }}</span>
                    </el-button>
                </div>
            </template>
        </Drawer>
        <Drawer
            v-model="drawerVisible2"
            drawerTitle="添加题目"
            drawerSize="50%">
                <template #drawercontent>
                    <QuestionAddList
                        :QuestionTitleId="QuestionTitleId" 
                        :WhichCategory="WhichCategory"
                        :examId="route.params.id"/>
                </template>
        </Drawer>
        <Drawer
            v-model="drawerVisible3"
            drawerTitle="题目列表"
            drawerSize="50%">
            <template #drawercontent>
               <QuestionCheckList
                    :QuestionTitleId="QuestionTitleId"
                    :examId="route.params.id"/>
            </template>
        </Drawer>
    </div>
</template>
<script setup>
import { useAppStore } from '@/stores';
import { onMounted ,ref,defineAsyncComponent,reactive} from 'vue';
import formatTime from '@/util/formatTime'
import SearchFilter from '@/components/FunComponents/SearchFilter.vue'
import Tooltip from '@/components/ReuseComponents/Tooltip.vue'
import { RefreshRight, Hide, Open ,Plus ,View} from '@element-plus/icons-vue'
import { useTableState } from '@/composables/State/useTableState'
import { useTableActions } from '@/composables/Action/useTableActions'
import Popconfirm from '@/components/ReuseComponents/Popconfirm.vue'
import Pagination from '@/components/ReuseComponents/Pagination.vue'
import { useRoute } from 'vue-router';
import { 
        postAddQuestionTitle,
        getQuestionTitleList,
        UpdateQuestionTitleList,
        DeleteOneQuestionTitle,
        DeleteManyQuestionTitle,
        UpdateQuestionTitleOneState,
        CheckQuestionTitle
    } from '@/API/Exam/questionTitleAPI';
import { ElMessage } from 'element-plus';
import Drawer from '@/components/ReuseComponents/Drawer.vue';
import {getCategoryName,getCategoryIcon} from '@/util/formatExamname'
// 动态导入较大的组件
const Dialog = defineAsyncComponent(() =>
    import('@/components/ReuseComponents/Dialog .vue')
)
const QuestionAddList = defineAsyncComponent(() =>
    import('@/components/Exam/QuestionAddList.vue')
)
const QuestionCheckList = defineAsyncComponent(() =>
    import('@/components/Exam/QuestionCheckList.vue')
)
const appStore = useAppStore();
const route = useRoute()
//UI 状态与方法管理
const { showSearch, IsOpenStripe, HandleHideSearch, handleOpenStripe } = useTableState()
// 表格数据与方法管理
const { selectedRows, handleSelectionChange, handleRefresh} = useTableActions()
//tableData数据
const tableData = ref([]);
//表格分页器
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
// 对话框状态
const dialogVisible = ref(false)
//抽屉状态
const drawerVisible1 = ref(false)
const drawerVisible2 = ref(false)
const drawerVisible3 = ref(false)
// 添加编辑状态
const isEditMode = ref(false)
const currentEditId = ref(null)
//WhichCategory 选择的题目类型
const WhichCategory = ref(null)
//QuestionTitleID 选择的题型ID
const QuestionTitleId = ref(null)

//表单数据
const Form = reactive({
    content: '',           // 题型名称
    description: '',       // 题型描述
    questionIdS: [],       // 关联的题目ID集合
    isPublish: 0,      // 发布状态
    examId:route.params.id             // 考试ID
})
//FormRef表单引用
const FormRef = ref()
//表单验证规则
const Formrules = reactive({
    content: [
        { 
            required: true, 
            message: '请输入题型名称', 
            trigger: 'blur' 
        },
    ],
})
//重置表单
const resetForm = () => {
    Form.content = ''
    Form.description = ''
    Form.questionIdS = []
    Form.isPublish = 0
}
// 添加分页变化处理方法
const handlePageChange = ({ page, size }) => {
    currentPage.value = page
    pageSize.value = size
    handleRefreshData()
}
// 添加对话框标题
const handleAdd = () => {
    dialogVisible.value = true
}
// 编辑
const handleEdit = (row) => {
    isEditMode.value = true
    dialogVisible.value = true
    currentEditId.value = row._id
    Form.content = row.content
    Form.description = row.description
}
//按下搜索按钮
const handleOnSearch = (data) => {
    if (data.length === 0) {
        ElMessage.error('未搜索到该信息')
    } else {
        tableData.value = data
    }
}
//删除单个
const handleDeleteOne = async (row) => {
    CheckQuestionTitle(row._id,route.params.id).then(res=>{
        console.log(res)
        if(res.code===200&&res.data.hasQuestion===true){
            ElMessage.error('该题型下有题目，无法删除')
            return   
        }
        if(res.code===200&&res.data.hasQuestion===false){
            DeleteOneQuestionTitle(row._id,route.params.id).then(res=>{
                if(res.code===200){
                    ElMessage.success('题型删除成功')
                    handleRefreshData()
                }
            })
        }
    })
}
//删除多个
const handleDeleteMany = async () => {
    const ids = selectedRows.value.map(item => item._id)
    
    // 检查每个选中的题型下是否有题目
    const checkPromises = ids.map(id => CheckQuestionTitle(id, route.params.id))
    const checkResults = await Promise.all(checkPromises)
    
    // 找出有题目的题型
    const hasQuestionTypes = []
    const canDeleteIds = []
    
    checkResults.forEach((result, index) => {
        if (result.code === 200 && result.data.hasQuestion === true) {
            // 找到对应的题型名称
            const questionType = selectedRows.value.find(item => item._id === ids[index])
            hasQuestionTypes.push(questionType.content)
        } else if (result.code === 200 && result.data.hasQuestion === false) {
            canDeleteIds.push(ids[index])
        }
    })
    
    // 如果有题型下有题目，提示用户
    if (hasQuestionTypes.length > 0) {
        ElMessage.error(`以下题型下有题目，无法删除：${hasQuestionTypes.join(', ')}`)
        // 如果有可以删除的题型，继续删除
        if (canDeleteIds.length > 0) {
            const res = await DeleteManyQuestionTitle(canDeleteIds, route.params.id)
            if (res.code === 200) {
                ElMessage.success(`成功删除${canDeleteIds.length}个题型`)
                await handleRefreshData()
            }
        }
        return
    }
    
    // 所有题型都可以删除
    const res = await DeleteManyQuestionTitle(ids, route.params.id)
    if (res.code === 200) {
        ElMessage.success('题型删除成功')
        await handleRefreshData()
    }
}
//发布状态改变
const handlePublishChange = async (row) => {
    const res = await UpdateQuestionTitleOneState({
        _id:row._id,
        examId:route.params.id,
        state:row.isPublish
    })
    if(res.code===200){
        ElMessage.success('题型状态改变成功')
        await handleRefreshData()
    }
}
//提交表单
const handleConfirm = async() => {
    const submitData= {
        ...Form, 
        _id: currentEditId.value, 
        examId: route.params.id
    }
    try{
        if(isEditMode.value){
            const res = await UpdateQuestionTitleList(submitData)
            if(res.code===200){
                ElMessage.success('题型编辑成功')
                isEditMode.value = false
                resetForm()
                dialogVisible.value = false
                await handleRefreshData()
            }
        }
        const vaild = await FormRef.value.validate()
        if(vaild){
            const res = await postAddQuestionTitle(submitData)
           if(res.code===200){
                ElMessage.success('题型添加成功')
                resetForm()
                dialogVisible.value = false
                await handleRefreshData()
            }
        }

    }catch(error){
        console.log(error)
    }
}
//获取列表+刷新
const handleRefreshData = async() => {
  try{
    const res = await handleRefresh({
        page: currentPage.value,
        size: pageSize.value,
        examId:route.params.id,
    },getQuestionTitleList)
    if(res.code===200){
        tableData.value = res.data[0].data
        total.value = res.data[0].total
    }
  }catch(error){
    console.log(error)
  }
}
//查看已添加题目
const handleCheck = (row) => {
   drawerVisible3.value = true
   QuestionTitleId.value = row._id
}
//选择题目类型
const handleChooseQuestionType = (row) => {
    drawerVisible1.value = true
    QuestionTitleId.value = row._id

}
//添加题目
const handleAddQuestion = (category) => {
    drawerVisible2.value = true
    WhichCategory.value = category
}


onMounted(() => {
    handleRefreshData()
});
</script>
<style scoped>
.eidt-card {
    margin-top: 10px;
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
.category-buttons {
    display: flex;
    flex-direction: column;
    gap: 15px; /* 增大按钮间距 */
    padding: 15px; /* 增大内边距 */
    margin-top: 100px;
}

.category-btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 70px; /* 增大按钮高度 */
    border-radius: 10px; /* 稍微增大圆角 */
    transition: all 0.3s ease;
    border: 1px solid #dcdfe6;
    padding-left: 25px; /* 增大左内边距 */
    font-size: 16px; /* 增大字体 */
    font-weight: 500; /* 美化字体粗细 */
}

.category-btn:hover {
    transform: translateX(5px); /* 增大悬停效果位移 */
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); /* 增强阴影效果 */
}

.category-btn .el-icon {
    margin-right: 12px; /* 增大图标右边距 */
    font-size: 20px; /* 增大图标大小 */
}

/* 为前几个按钮添加个性化颜色 */
.category-btn-0 {
    border-color: #409eff;
    color: #409eff;
}

.category-btn-0:hover {
    background-color: #ecf5ff;
}

.category-btn-1 {
    border-color: #67c23a;
    color: #67c23a;
}

.category-btn-1:hover {
    background-color: #f0f9ec;
}

.category-btn-2 {
    border-color: #e6a23c;
    color: #e6a23c;
}

.category-btn-2:hover {
    background-color: #fdf6ec;
}

.category-btn-3 {
    border-color: #f56c6c;
    color: #f56c6c;
}

.category-btn-3:hover {
    background-color: #fef0f0;
}

.category-btn-4 {
    border-color: #909399;
    color: #909399;
}

.category-btn-4:hover {
    background-color: #f4f4f5;
}
</style>