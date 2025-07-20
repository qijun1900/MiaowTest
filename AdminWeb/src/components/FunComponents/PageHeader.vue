<template>
  <el-page-header @back="goBack" title="返回">
    <template #content>
      <span> {{ Title}} </span>
    </template>
  </el-page-header>
</template>
<script setup>
import RouterBack from '@/util/RouterBack';
import { useRoute } from 'vue-router'
import {computed} from 'vue';
const route = useRoute()
const goBack = ()=>{
  RouterBack();  
}

const Title = computed(() => {
  switch (route.path) {
    case '/index':
      return '首页';
    case '/center':
      return '个人中心';
    case '/users':
      return '用户管理';
    case '/news/notice':
      return '通知公告';
    default:
      return '后台管理系统';
  }
});




</script>