<template>
    <div>
        <el-container>
        <el-aside width="350px">
                <el-card style="border-radius: 5px" shadow="never">
                    <div>
                        <span>科目名称:</span><span>{{ appStore.examInfo.name }}</span>
                    </div>
                    <div>
                        <span>科目代码:</span><span>{{ appStore.examInfo.code }}</span>
                    </div>
                    <div>
                        <span>创建时间:</span><span>{{formatTime.getTime2(appStore.examInfo.createdTime)}}</span>
                    </div>
                    <div>
                        <span>当前题目类别:</span><span>{{getCategoryName(appStore.examInfo.category) }}</span>
                    </div>
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
                                field: 'titleSearch',  // 存储值的字段名,初始化时会清空
                                fields: ['title'] // 要搜索的字段
                            },
                            {
                                type: 'input',
                                label: '题目ID',
                                placeholder: '请输入搜索题目ID',
                                field: 'titleSearch',  // 存储值的字段名,初始化时会清空
                                fields: ['title'] // 要搜索的字段
                            },
                            {
                                type: 'input',
                                label: '题目ID',
                                placeholder: '请输入搜索题目ID',
                                field: 'titleSearch',  // 存储值的字段名,初始化时会清空
                                fields: ['title'] // 要搜索的字段
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
                            <el-row :gutter="200">
                                <el-col :span="17">
                                    <el-button 
                                        type="success" 
                                        plain 
                                        @click="handleAdd">新建科目
                                    </el-button>
                                    <Popconfirm
                                        title="您确定删除吗？"
                                        @confirm="handleDeleteMany">
                                        <el-button type="danger" 
                                            plain 
                                            :disabled="!selectedRows || selectedRows.length === 0">删除科目
                                        </el-button>
                                    </Popconfirm>
                                </el-col>
                                <el-col :span="7">
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
                                                @click="handleRefreshExamData" />
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
                <el-table-column label="题目题干" width="250">
                    <template #default="scope">
                        {{ scope.row.title }}
                    </template>
                </el-table-column>
                <el-table-column label="题目答案" width="180">
                    <template #default="scope">
                        {{ scope.row.title }}
                    </template>
                </el-table-column>
                <el-table-column label="是否为AI答案" width="150">
                    <template #default="scope">
                        {{ scope.row.title }}
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
                <el-table-column label="操作">
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
                            type="info" 
                            plain 
                            @click="handleMore(scope.row)">
                            预览
                        </el-button>
                        <el-button 
                            type="info" 
                            plain 
                            @click="handleMore(scope.row)">
                            更多
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
    </div>
</template>
<script setup>
import { useRoute } from 'vue-router';
import { RefreshRight, Hide, Open } from '@element-plus/icons-vue'
import { onMounted ,ref} from 'vue';
import SearchFilter from '@/components/FunComponents/SearchFilter.vue'
import { useTableState } from '@/composables/State/useTableState'
import { useTableActions } from '@/composables/Action/useTableActions'
import { useAppStore } from '@/stores';
import formatTime from '@/util/formatTime'
import getCategoryName from '@/util/formatExamname'
import Tooltip from '@/components/ReuseComponents/Tooltip.vue'
import Popconfirm from '@/components/ReuseComponents/Popconfirm.vue'
import Pagination from '@/components/ReuseComponents/Pagination.vue'



//UI 状态与方法管理
const { showSearch, IsOpenStripe, HandleHideSearch, handleOpenStripe } = useTableState()
// 表格数据与方法管理
const { selectedRows, handleSelectionChange, handleDelete, handleRefresh } = useTableActions()
const route = useRoute();
const appStore = useAppStore()
//tableData数据
const tableData = ref([]);
//表格分页器
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
//题目ID和类型
const ExamID = route.params.id;
const QuestionType = appStore.examInfo.category;

//删除单个
const handleDeleteOne = async (row) => {
    await handleDelete(row)
}
//删除多个
const handleDeleteMany = async () => {
    await handleDelete()
}
onMounted(()=>{
    console.log(ExamID)
    console.log(QuestionType)
})
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
.pagination {
    margin-top: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>