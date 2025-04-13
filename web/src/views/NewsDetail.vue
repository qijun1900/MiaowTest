<!-- eslint-disable vue/valid-template-root -->
<template>
<el-row>
    <el-col :span="17" :offset="1">
        <h2>{{ currentNews.tittle }}</h2>
        <div class="time">{{ newTime(currentNews.editTime) }}</div>
        <el-divider>
            <el-icon><star-filled/></el-icon>
        </el-divider>
        <div v-html="currentNews.content"></div>
    </el-col>
    <el-col :span="4" :offset="1" :pull="1">
        <el-card style="max-width: 480px">
            <template #header>
            <div class="card-header">
                <span style="font-size: 16px;font-weight: bold;">最近XXX</span>
            </div>
            </template>
            <div 
                class="textitem" 
                v-for="item in topNews" 
                :key="item._id"
                @click="handleDetail(item._id)">
                <span>{{ item.tittle }}</span>
                <time class="time">{{ newTime(item.editTime) }}</time>
            </div>
        </el-card>
    </el-col>
</el-row>


</template>
<script setup>
import { ref,watchEffect} from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import moment from 'moment';
import { StarFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router';



const route = useRoute()
const currentNews = ref({})
moment.locale("zh-cn")
const topNews = ref({})
const router = useRouter()


 watchEffect(async()=>{
    // console.log(route.params.id)
    const  res1 =  await axios.get(`/webapi/news/list/${route.params.id}`)
    const  res2 =  await axios.get(`/webapi/news/toplist?limit=4`)
    //console.log(res1.data.data[0])
    // console.log(res2.data.data)
    currentNews.value = res1.data.data[0]
    topNews.value = res2.data.data
})


const newTime = (time)=>{
  return moment(time).format('ll');
}
const handleDetail = (id)=>{
    // console.log(id)
    router.push(`/news/${id}`)
    

}


</script>

<style lang="scss">
/* 全局样式 */
.el-row {
  margin-top: 30px;

  /* 左侧新闻详情 */
  .el-col:nth-child(1) {
    h2 {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }

    .time {
      font-size: 14px;
      color: #888;
      margin-bottom: 15px;
    }

    .el-divider {
      margin: 15px 0;
    }

    .el-divider__text {
      font-size: 16px;
      color: #666;
    }

    .news-content {
      font-size: 16px;
      color: #555;
      line-height: 1.6;
      margin-top: 15px;
    }
  }

  /* 右侧最近热点 */
  .el-col:nth-child(2) {
    .el-card {
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

      .card-header {
        text-align: center;

        span {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
      }

      .textitem {
        cursor: pointer;
        margin-bottom: 15px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          color: #409eff;
        }

        span {
          font-size: 14px;
          color: #333;
          display: block;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        time {
          font-size: 12px;
          color: #999;
          display: block;
        }
      }
    }
  }
}
</style>
