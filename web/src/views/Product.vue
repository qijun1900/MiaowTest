<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <el-carousel 
      height="480px" 
      direction="vertical" 
      :autoplay="false"
      v-if="looplist.length">
      <el-carousel-item 
        v-for="item in looplist" 
        :key="item._id">
        <div class="item" :style="{backgroundImage:`url(http://${escconfig.serverHost}:${escconfig.serverPort}${item.cover})`}">
          <el-card style="max-width: 480px">
            <template #header>
              <div class="card-header">
                <h2>{{ item.title }}</h2>
              </div>
            </template>
            <div>{{ item.introduction }}</div>
            <div>{{ item.detail }}</div>
          </el-card>
        </div>
      </el-carousel-item>
    </el-carousel>
    <el-empty description="暂时无产品" v-else/>
  </div>
</template>
<script setup>
import axios from 'axios';
import { ref,onMounted } from 'vue';
import {escconfig } from '@/config/esc.config';

const looplist = ref([])

onMounted(async()=>{
  const res = await axios.get('/webapi/product/list')
  console.log(res.data.data)
  looplist.value = res.data.data
})


</script>
<style scoped>
.item {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  align-items: center;
  padding: 40px;
}

.item::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.4));
  z-index: 1;
}

.el-carousel {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.el-carousel-item {
  transition: all 0.8s ease-in-out;
}

.el-card {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  max-width: 480px;
  margin-left: 10%;
}

.el-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.card-header h2 {
  color: #2c3e50;
  font-size: 2.2rem;
  margin: 0;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.2);
}

.el-card__body div {
  color: #34495e;
  line-height: 1.8;
  font-size: 1rem;
}

.el-card__body div:first-child {
  font-size: 1.1rem;
  color: #e74c3c;
  margin-bottom: 1rem;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .el-card {
    margin: 0 auto;
    width: 90%;
  }
  
  .item {
    padding: 20px;
  }
  
  .card-header h2 {
    font-size: 1.8rem;
  }
}
</style>