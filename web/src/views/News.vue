<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="container">
    <div
      class="new_header"
      :style="{
        backgroundImage: `url(${require('@/assets/980.jpg')})`
      }">
      <div class="search-container">
        <div class="search">
          <el-popover
            placement="bottom"
            title="检索结果"
            width="50%"
            :visible="visible"
            :show-arrow="false">
            <template #reference>
              <el-input
                v-model="searchText"
                style="width: 100%"
                size="large"
                placeholder="请输入内容"
                :prefix-icon="Search"
                type="search"
                @input="visible = true"
                @blur="visible = false"/>
            </template>
            <div v-if="searchnewslist.length" class="search-results">
              <div 
                v-for="data in searchnewslist" 
                :key="data._id" 
                class="result-item" 
                @click="handleDetail(data._id)">
                {{ data.tittle }}
              </div>
            </div>
            <div v-else>
              <el-empty description="空空如也" :image-size="50"/>
            </div>
          </el-popover>
        </div>
      </div>
    </div>
    <div class="content-wrapper">
      <div class="topnews">
        <el-row :gutter="20">
            <el-col :span="6" v-for="item in topNewsList" :key="item._id"  @click="handleDetail(item._id)">
              <el-card>
                <template #header>{{ item.tittle }}</template>
                  <div class="image" :style="{
                    backgroundImage:`url(http://${escconfig.serverHost}:${escconfig.serverPort}${item.cover})`
                  }">
                  </div>
                  <template #footer>
                    <div :class="'time'">
                      {{ newTime(item.editTime) }}
                    </div>
                  </template>
              </el-card>
            </el-col>
        </el-row>
      </div>
    </div>
    <el-tabs 
      v-model="whichTab"  
      style="margin: 20px;">
      <el-tab-pane 
        v-for="item in tabList" 
        :key="item._id" 
        :label="item.label" 
        :name="item.name">
        <el-row :gutter="20">
          <el-col :span="18">
            <div v-for="data in tabnews[item.name]" :key="data._id"  @click="handleDetail(data._id)">
              <el-card class="news-card">
                <template #header>
                  <div class="card-header">{{ data.tittle }}</div>
                </template>
                <div class="card-body">
                  <div 
                    class="tabimage" 
                    :style="{ backgroundImage: `url(http://${escconfig.serverHost}:${escconfig.serverPort}${data.cover})` }">
                  </div>
                  <div class="content">
                    <div class="summary" v-html="data.content.slice(0,100)"></div>
                  </div>
                </div>
                <template #footer>
                  <div class="tabtime">
                    {{ newTime(data.editTime) }}
                  </div>
                </template>
              </el-card>
            </div>
          </el-col>
          <el-col :span="6">
            <el-timeline style="max-width: 600px">
              <el-timeline-item
                v-for="(data, index) in tabnews[item.name]"
                :key="index"
                :timestamp="newTime(item.editTime) ">
                {{ data.tittle }}
              </el-timeline-item>
            </el-timeline>
          </el-col>
      </el-row>
      </el-tab-pane>
    </el-tabs>
    <el-backtop :right="100" :bottom="100" />
  </div>
</template>


<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import moment from 'moment'
import _ from 'lodash'
import { useRouter } from 'vue-router'
import {escconfig } from '@/config/esc.config';

const searchText = ref('')
const visible = ref(false)
const newList = ref([])
moment.locale("zh-cn")
const whichTab = ref(1)
const router  = useRouter()


onMounted(async () => {
  const res = await axios.get("/webapi/news/list")
  // console.log(res.data.data)
  newList.value = res.data.data
  // console.log(_.groupBy(newList.value,item=>item.category))
 
})

const searchnewslist = computed(() => {
  return searchText.value ? newList.value.filter(item => item.tittle?.includes(searchText.value)) : []
})

const topNewsList = computed(() => newList.value.slice(0,4))

const newTime = (time)=>{
  return moment(time).format('ll');
}

const tabList = [
    {
      label: '最新动态',
      name: 1
    },
    {
      label: '典型案例',
      name: 2
    },
    {
      label: '通知公告',
      name: 3
    }
]

const tabnews = computed(()=>_.groupBy(newList.value,item=>item.category))

const handleDetail = (id)=>{
  // console.log(id)
  router.push(`/news/${id}`)
}





</script>

<style scoped>
.container {
  position: relative;
  min-height: 100vh;
}

.new_header {
  height: 400px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.search-container {
  position: absolute;
  bottom: -30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 2;
}

.search {
  width: 50%;
  min-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 30px;
  overflow: hidden;
}

.content-wrapper {
  padding: 60px 20px 20px;
  background-color: #f5f7fa;
}

.topnews {
  max-width: 1200px;
  margin: 0 auto;
  .image{
    width: 100%;
    height: 200px;
    background-size: cover;
  }
}

/* 优化卡片样式 */
.el-card {
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.el-card:hover {
  transform: translateY(-5px);
}
.time{
  font-size: 14px;
  color: rgb(134, 130, 130);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .search {
    width: 90%;
    min-width: auto;
  }
  
  .el-col {
    width: 100%;
    margin-bottom: 20px;
  }
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;
}

.result-item {
  padding: 12px 16px;
  margin: 4px 0;
  background-color: #f9f9f9;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.result-item:hover {
  background-color: #f1f1f1;
}

:deep(.el-input__wrapper) {
  border-radius: 30px;
  padding: 20px 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
.news-card {
  margin-bottom: 20px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  padding: 12px 16px;
}

.card-body {
  display: flex;
  gap: 20px;
  padding: 16px;
}

.tabimage {
  flex: 0 0 200px;
  height: 150px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  overflow: hidden;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.summary {
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tabtime {
  text-align: right;
  color: #999;
  font-size: 12px;
  padding: 8px 16px;
  border-top: 1px solid #eee;
}

</style>