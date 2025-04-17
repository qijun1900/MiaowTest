<template>
  <div class="exam-page-container">
    <el-page-header content="科目列表" icon="" title="考试管理"></el-page-header>
    <div class="search-container">
      <el-popover 
          placement="bottom" 
          title="搜索结果" 
          width="50%" 
          :visible="visible" 
          :show-arrow="false">
        <template #reference>
          <el-input 
            v-model="searchText" 
            style="width: 80%; margin: 20px auto" 
            size="large" 
            placeholder="请输入考试科目名称" 
            :prefix-icon="Search"
            type="search" 
            @input="visible = true" 
            @blur="visible = false" />
        </template>
        <div v-if="searchexamlist.length" class="search-results">
          <div 
            v-for="data in searchexamlist" 
            :key="data._id" 
            class="result-item" 
            @click="handleDetail(data._id)">
            {{ data.name }}
          </div>
        </div>
        <div v-else>
          <el-empty description="空空如也" :image-size="50" />
        </div>
      </el-popover>
    </div>
    <div class="exam-container">
      <el-row :gutter="24">
        <el-col :span="8" v-for="item in examList" :key="item._id" class="exam-col">
          <el-card shadow="hover" class="exam-card">
            <el-row :gutter="2" class="exam-row">
              <el-col :span="10" class="image-col">
                <div class="image-wrapper" @mouseenter="hoverImage = item._id" @mouseleave="hoverImage = null">
                  <el-image 
                    :src="`http://${escconfig.serverHost}:${escconfig.serverPort}` + item.cover" 
                    class="exam-image"/>
                  <div v-if="hoverImage === item._id" class="image-overlay" @click="handleEditExam(item._id)">
                    <el-icon class="edit-icon"><Edit /></el-icon>
                  </div>
                </div>
              </el-col>
              <el-col :span="14">
                <el-card shadow="hover" style="height: 100%">
                  <div class="examinfo">
                    <div class="info-item">
                      <el-icon class="text-success"><Collection /></el-icon>
                      <span class="text-success">科目名称:</span><br>
                      <span class="text-primary">{{ item.name }}</span>
                    </div>
                    <div class="info-item">
                      <el-icon class="text-info"><Document /></el-icon>
                      <span class="text-info">科目代码:</span><br>
                      <span class="text-purple-500">{{ item.code }}</span>
                    </div>
                    <div class="info-item">
                      <el-icon class="text-info"><Document /></el-icon>
                      <span class="text-info">创建时间:</span><br>
                      <span class="text-purple-500">{{formatTime.getTime(item.createdTime) }}</span>
                    </div>
                    <div class="info-item">
                      <div style="display: inline-block" class="text-warning">
                        <el-icon><PriceTag /></el-icon>
                        题目类型:
                      </div>
                      <div style="margin-top: 8px; min-height:96px">
                        <el-check-tag 
                          type="success"
                          v-for="(value, index) in item.category" 
                          :key="item._id"
                          @click="handelquestion(index,item._id)">
                          <el-icon style="margin-right:4px"><Histogram /></el-icon>
                          {{ getCategoryName(value) }}
                        </el-check-tag>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
  <el-backtop :right="100" :bottom="100" />
</template>
<script setup>
import { Search, Collection, Document, PriceTag, Histogram, Edit } from '@element-plus/icons-vue'
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import formatTime from '@/util/formatTime'
import escconfig  from '@/config/esc.config';

const searchText = ref('')
const visible = ref(false)
const examList = ref([])
const router = useRouter()
const hoverImage = ref(null)


//后端api，获取科目列表   
onMounted(async () => {
  const res = await axios.get("/adminapi/exam/list")
  examList.value = res.data.data
  console.log(examList.value)
})

//搜索功能
const searchexamlist = computed(() => {
  return searchText.value ? examList.value.filter(item => item.name?.includes(searchText.value)) : []
})

//点击跳转考试详情页（搜索框内）
const handleDetail = (id) => {
  router.push(`/exam/editexam/${id}`)

}

// 类型映射方法
const getCategoryName = (val) => {
  const CategoryName = {
    1: '选择类题',
    2: '填空类题',
    3: '判断类题',
    4: '简答类题'
  }
  return CategoryName[val] || '其他类型'// 返回映射后的类型名称，如果值不存在于map中则返回'未知类型'
}

//考试编辑跳转
const handleEditExam = (id) => {
  router.push(`/exam/editexam/${id}`)
}

//类题页面跳转
const handelquestion = (index, id) => {
  console.log(index, id)
  const routeNames = [
    'selectquestion',
    'blankquestion',
    'judgequestion',
    'shortquestion'
  ]
  // 通过索引获取对应的路由名称，未匹配时使用'otherquestion'
  const routeName = routeNames[index] || 'otherquestion'
  router.push(`/exam/${routeName}/${id}`)
}




</script>
<style scoped>
:deep(.el-page-header__content) {
  color: #2c94fd;
}
.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(49, 49, 50, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-icon {
  color: white;
  font-size: 24px;
}
.search-container {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.result-item:hover {
  background-color: #f5f7fa;
}

.exam-col {
  display: flex; 
  margin-bottom: 24px;
}

.exam-card {
  flex: 1; 
  display: flex; 
  flex-direction: column;
}

.exam-row {
  flex: 1;
}

.image-col {
  display: flex; 
  height: 100%; 
  align-items: center; 
  justify-content: center;
}

.exam-image {
  width: 100%; 
  max-height: 200px; 
  object-fit: cover;
}

.info-item {
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.8;
}

.text-success {
  color: #696a6c;
}
.text-primary {
  color: #0062ff;
}
.text-info {
  color: #696a6c;
}
.text-warning {
  color: #696a6c;
}
.text-purple-500 {
  color: #804df5;
}

.examinfo {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
}

/* 修改标签样式 */
.el-check-tag {
  transition: all 0.3s;
  font-size: 14px;  /* 增大字体 */
  padding: 10px 12px;  /* 增大内边距 */
  margin-right: 8px;  /* 增大右边距 */
  margin-bottom: 8px;  /* 增大下边距 */
  background-color: #cde8fa;  /* 添加浅蓝色背景 */
  border-radius: 13px;  /* 增大圆角 */
}

.el-check-tag:hover {
  transform: translateY(-2px);
  background-color: #90cef7;  /* 悬停时加深背景色 */
}





/* 优化图片相关样式 */
.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 4px;
}

.exam-image {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  transition: all 0.3s ease;
}

.image-wrapper:hover .exam-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(52, 55, 64, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;
}

.image-wrapper:hover .image-overlay {
  opacity: 1;
}

.edit-icon {
  color: white;
  font-size: 24px;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.image-wrapper:hover .edit-icon {
  transform: scale(1);
}

</style>

