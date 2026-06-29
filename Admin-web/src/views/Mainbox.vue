<template>
  <el-container>
    <sidemenu />
    <el-container direction="vertical">
      <topheader />
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
<script setup>
import sidemenu from "@/components/layout/SideMenu.vue";
import topheader from "@/components/layout/TopHeader.vue";
</script>
