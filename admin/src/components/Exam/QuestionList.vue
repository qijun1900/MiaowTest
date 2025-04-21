<template>
  <div class="container">
    <el-page-header @back="handleBack" title="题目面板" class="page-header">
      <template #content>
        <div class="flex items-center">
          <el-icon class="mr-2">
            <List />
          </el-icon>
          <span class="text-xl font-bold"> 题目列表</span>
        </div>
      </template>
    </el-page-header>

    <div class="search-container">
      <el-popover placement="bottom" title="搜索结果" width="50%" :visible="visible" :show-arrow="false">
        <template #reference>
          <el-input v-model="searchText" style="width: 80%; margin: 20px auto" size="large" placeholder="请输入搜索的题目"
            :prefix-icon="Search" type="search" @input="visible = true" @blur="visible = false" />
        </template>
        <div v-if="SearchexamStem.length" class="search-results">
          <div v-for="data in SearchexamStem" :key="data._id" class="result-item" @click="handleDetail(data._id)">
            {{data.stem}}
          </div>
        </div>
        <div v-else>
          <el-empty description="空空如也" :image-size="50" />
        </div>
      </el-popover>
    </div>

    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ questionType(route.query.questionType) }}</span>
        </div>
      </template>
      <el-table ref="multipleTableRef" :data="examQuestion" stripe  style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" :selectable="selectable" width="55" />

        <el-table-column label="批量操作" width="120">
          <template #header>
            <el-button type="primary" size="small" @click="handleBatchPublish">
              全部发布
            </el-button>
          </template>
          <template #default="scope">
            <el-switch v-model="scope.row.isPublish" :active-value="1" :inactive-value="0"
              @change="handleSinglePublish(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column prop="stem" label="题目" width="150" />
        <el-table-column label="答案" width="120">
          <template #default="scope">
            {{ formatTime.getTime(scope.row.editTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="" label="更新时间" with="120">
          <template #default="scope">
            {{ formatTime.getTime(scope.row.createdTime) }}
          </template>
        </el-table-column>
        <el-table-column label="是否AI答案" width="120">
          <template #default="scope" >
            <el-tag 
              :type="scope.row.isAIanswer === 1 ? 'warning' : 'info'" 
              size="small"
            >
              {{ isAianswer(scope.row.isAIanswer) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" circle :icon="Star" type="success" @click="handlePreview(scope.row)">
            </el-button>
            <el-button size="small" circle :icon="Edit" @click="handleEdit(scope.row)">
            </el-button>
            <el-popconfirm title="你确定要删除吗" confirm-button-text="确定" cancel-button-text="取消"
              @confirm="handleDelete(scope.row)">
              <template #reference>
                <el-button size="small" circle :icon="Delete" type="danger">
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { List, Search, Star, Edit, Delete } from '@element-plus/icons-vue';
import axios from 'axios';
import formatTime from '@/util/formatTime'
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const searchText = ref('')
const visible = ref(false)
const examQuestion = ref([])
const selectedQuestions = ref([]) // 新增选中项存储

// 处理选中项变化
const handleSelectionChange = (rows) => {
  selectedQuestions.value = rows
}
// 数据加载
onMounted(async () => {
  const res = await axios.get(`/adminapi/exam/questionlist/${route.params.id}`, {
    params: {
      questionType: route.query.questionType
    }
  })
  examQuestion.value = res.data.data
})
// 返回上一页
const handleBack = () => {
  router.back();
};
//搜索功能
const SearchexamStem = computed(() => {
  return searchText.value ? examQuestion.value.filter(item => item.stem?.includes(searchText.value)) : []
})

//卡片标题，问题的种类
const questionType = (vale) => {
  const CategoryName = {
    1: '选择类题',
    2: '填空类题',
    3: '判断类题',
    4: '简答类题'
  }
  return CategoryName[vale] || '其他类型'// 返回映射后的类型名称，如果值不存在于map中则返回'未知类型'
}
//判断是否为AI答案
const isAianswer = (value) => {
  const isAIanswer = {
    0: '否',
    1: '是'
  }
  return isAIanswer[value]
}

// 单个发布（已有开关的响应）
const handleSinglePublish = async (row) => {
  try {
    await axios.post('/adminapi/exam/updatePublish', {
      _id: row._id,
      isPublish: row.isPublish
    }, {
      params: {  // 添加查询参数questionType
        questionType: route.query.questionType
      }
    })
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.isPublish = row.isPublish === 1 ? 0 : 1
    ElMessage.error('更新失败')
  }
}
// 批量发布
const handleBatchPublish = async () => {
  try {
    await axios.post('/adminapi/exam/batchPublish', {
      ids: selectedQuestions.value.map(item => item._id),
      isPublish: 1
    })
    // 更新本地数据
    selectedQuestions.value.forEach(item => item.isPublish = 1)
    ElMessage.success('批量发布成功')
  } catch (error) {
    ElMessage.error('发布失败')
  }
}


</script>
<style scoped>
:deep(.el-page-header__content) {
  color: #2c94fd;
}
</style>