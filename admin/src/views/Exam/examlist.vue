<template>
    <div>
        <el-page-header content="科目列表" icon="" title="考试管理"></el-page-header>
        <div class="search-container">
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
              <el-empty description="空空如也" :image-size="50"/>
            </div>
          </el-popover>
        </div>
        <div class="exam-container">
            <el-row :gutter="24">
                <el-col :span="8" v-for="item in examList" :key="item._id">
                        <el-row :gutter="2">
                            <el-col :span="10">
                                <el-card shadow="hover">
                                    <el-image 
                                        :src="`https://img.shetu66.com/2022/08/31/1661926458374934.jpg`"
                                        fit="cover"
                                        style="width: 100%; height: 180px"
                                    >
                                    </el-image>
                                </el-card>
                            </el-col>
                            <el-col :span="14" >
                                <el-card shadow="hover">
                                   <p>1111</p>
                                </el-card>
                            </el-col>
                        </el-row>
                </el-col>
            </el-row>
        </div>


    </div>
</template>
<script setup>
import { Search,Picture  } from '@element-plus/icons-vue'
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const searchText = ref('')
const visible = ref(false)
const examList = ref([])
const router  = useRouter()


//api   
onMounted(async () => {
    const res = await axios.get("/adminapi/exam/list")
    examList.value = res.data.data
    console.log(examList.value)
})

//搜索功能
const searchexamlist = computed(() => {
  return searchText.value ? examList.value.filter(item => item.name?.includes(searchText.value)) : []
})

//点击跳转考试详情页
const handleDetail = (id)=>{
  router.push(`/exam/${id}`)

}



</script>