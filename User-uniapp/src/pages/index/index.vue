<template>
  <view class="content">
    <view class="text-area">
      <uni-card title="基础卡片" sub-title="副标题" extra="额外信息" thumbnail="https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/unicloudlogo.png">
        <text>这是一个带头像和双标题的基础卡片，此示例展示了一个完整的卡片。</text>
      </uni-card>
    </view>
  </view>
  <view>用户信息：{{ userInfo.userInfo }}</view>
  <button @click="handleLogin" type="primary">登录</button>
  <button @click="handleOut" type="warn">退出</button>
  <button @click="handGet">请求</button>
</template>

<script setup>
import { ref } from 'vue'
import { useUserInfo } from '../../stores/modules/info';
import { http } from '../../util/http';
const userInfo = useUserInfo()


const handleLogin = () => {
  userInfo.setInfo({ username: 'Jack' })
}
const handleOut = () => {
  userInfo.clearInfo()
}
const handGet = async() => {
  const res = await http({
    method: 'GET',
    url: '/uniappAPI/get/test',
  })
  console.log(res);
  
}

</script>

<style>

</style>
