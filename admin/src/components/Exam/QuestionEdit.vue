<template>
  <div class="container">
    <el-page-header @back="handleBack" title="题目面板" class="page-header">
      <template #content>
        <div class="flex items-center">
          <el-icon class="mr-2">
            <Edit />
          </el-icon>
          <span class="text-xl font-bold">编辑题目</span>
        </div>
      </template>
    </el-page-header>
    <!-- 动态加载对应类型的编辑组件 -->
    <component :is="currentEditComponent" :questionId="questionId" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Edit } from '@element-plus/icons-vue'
import BlankQu from './BlankQu.vue'
import SelectQu from './SelectQu.vue'
import JudgeQu from './JudgeQu.vue'
import ShortQu from './ShortQu.vue'


const route = useRoute()
const router = useRouter()
const questionId = ref(route.params.questionId)// 从路由参数中获取题目ID,:questionId="questionId"父组件传值给子组件

// 根据题目类型返回对应编辑组件
const currentEditComponent = computed(() => {
  const componentMap = {
    1: SelectQu,  // 选择题组件
    2: BlankQu,   // 填空题组件
    3: JudgeQu,  // 判断题组件
    4: ShortQu   // 简答题组件
  }
  return componentMap[Number(route.query.questionType)] || null
})

const handleBack = () => {
  router.back()
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
.page-header {
  margin-bottom: 20px;
}
:deep(.el-page-header__content) {
  color: #2c94fd;
}
</style>
