<template>
  <el-aside :width="appStore.isCollapse ? '64px' : '150px'" style="transition: width 0.3s ease;">
    <el-menu :collapse="appStore.isCollapse" :router="true" :collapse-transition="true" :default-active="route.fullPath"
      style="transition: all 0.3s;">
      <el-menu-item index="/index">
        <CatIcon/>
        <span>后台管理系统</span>
      </el-menu-item>

      <el-menu-item index="/index">
        <el-icon>
          <HomeFilled />
        </el-icon>
        <span>首页</span>
      </el-menu-item>

      <el-menu-item index="/center">
        <el-icon>
          <Avatar />
        </el-icon>
        <span>个人中心</span>
      </el-menu-item>

      <el-menu-item index="/users">
        <el-icon>
          <UserFilled />
        </el-icon>
        <span>用户管理</span>
      </el-menu-item>

      <!-- <el-menu-item index="/news">
        <el-icon>
          <MessageBox />
        </el-icon>
        <span>用户管理</span>
      </el-menu-item> -->

      <el-sub-menu index="/news-manage">
        <template #title>
          <el-icon>
            <MessageBox />
          </el-icon>
          <span>信息管理</span>
        </template>
        <el-menu-item index="/news/announcement">通知公告</el-menu-item>
        <!-- <el-menu-item index="/news/newslist">信息列表</el-menu-item> -->
      </el-sub-menu>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { useAppStore } from '@/stores/index';
import { HomeFilled, Avatar, UserFilled, MessageBox } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router';
import CatIcon from '../icons/CatIcon.vue';

const route = useRoute()
const appStore = useAppStore()

</script>
<style scoped>
.el-aside {
  height: 100vh;

  .el-menu {
    height: 100vh;

    /deep/ .el-sub-menu__title,
    /deep/ .el-menu-item {
      transition: all 0.3s;
    }
  }
}
</style>