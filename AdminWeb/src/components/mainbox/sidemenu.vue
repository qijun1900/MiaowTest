<template>
  <el-aside :width="appStore.isCollapse ? '64px' : '150px'" style="transition: width 0.3s ease;">
    <el-menu 
      :collapse="appStore.isCollapse" 
      :router="true" :collapse-transition="true" 
      :default-active="route.fullPath"
      style="transition: all 0.3s;">
      <el-menu-item index="/index">
        <span class="title">题喵喵后台管理系统</span>
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

      <el-sub-menu index="/news-manage">
        <template #title>
          <el-icon>
            <MessageBox />
          </el-icon>
          <span>信息管理</span>
        </template>
        <el-menu-item index="/news/announcement">通知公告</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="/learn-manage">
        <template #title>
          <el-icon>
            <DocumentCopy />
          </el-icon>
          <span>学习管理</span>
        </template>
        <el-menu-item index="/exam/exammanage">科目管理</el-menu-item>
        <el-menu-item index="/learn/wordbooks">词书管理</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="/Feedback-manage">
        <template #title>
          <el-icon>
            <ChatDotSquare />
          </el-icon>
          <span>反馈管理</span>
        </template>
        <el-menu-item index="/consumer/message">用户意见</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="/resource-manage">
        <template #title>
          <el-icon>
            <FolderOpened />
          </el-icon>
          <span>资源管理</span>
        </template>
        <el-menu-item index="/resource/fileupload">资源上传</el-menu-item>
        <el-menu-item index="/resource/filelist">资源列表</el-menu-item>
      </el-sub-menu>
      
      <el-sub-menu index="/Model-manage">
        <template #title>
          <el-icon><Cpu /></el-icon>
          <span>模型管理</span>
        </template>
        <el-menu-item index="/model/modelmanage">模型管理</el-menu-item>
      </el-sub-menu>

      <el-menu-item index="/model/chat">
        <el-icon>
          <ChatLineRound />
        </el-icon>
        <span>模型对话</span>
      </el-menu-item>
      
    </el-menu>
  </el-aside>
</template>

<script setup>
import { useAppStore } from '@/stores/index';
import { 
  HomeFilled, 
  Avatar, 
  UserFilled, 
  MessageBox,
  DocumentCopy,
  Cpu ,
  ChatLineRound,
  ChatDotSquare,
  FolderOpened} 
  from '@element-plus/icons-vue'
import { useRoute } from 'vue-router';

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
.title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}
</style>