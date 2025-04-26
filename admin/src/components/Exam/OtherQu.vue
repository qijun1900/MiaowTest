<template>
    <div>
        <el-page-header @back="handleBack" title="题目面板" class="page-header">
        <template #content>
          <div class="flex items-center">
            <el-icon class="mr-2">
              <DocumentAdd />
            </el-icon>
            <span class="text-xl font-bold">添加判断类题</span>
          </div>
        </template>
      </el-page-header>
        如果遇到不可添加的题目,请联系管理员18756810208/微信同号。
    </div>
</template>
<script setup>

import { useRouter } from 'vue-router';

const router = useRouter();
// 返回上一页
const handleBack = () => {
  router.back();
};

</script>