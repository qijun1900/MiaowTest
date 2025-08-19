<template>
  <view class="content">
    <view class="text-area">
      <uni-card title="基础卡片" sub-title="副标题" extra="额外信息" thumbnail="https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/unicloudlogo.png">
        <text>这是一个带头像和双标题的基础卡片，此示例展示了一个完整的卡片。</text>
      </uni-card>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
const title = ref('欢迎使用uni-app--项目环境')

</script>

<style>

</style>
