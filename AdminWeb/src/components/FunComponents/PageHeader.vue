<template>
  <el-page-header 
    @back="goBack" 
    title="返回">
    <template #content>
      <div class="header-content">
        <div>
          <el-tag 
            type="primary" 
            effect="dark">
            {{ Title }}
          </el-tag>
        </div>
        <div
          v-if="/^\/exam\/(questionadd|questionlist|batchadd)\//.test(route.path) 
          || /^\/(users|consumer)$/.test(route.path) 
          || /^\/exam\/(createExamType|examfilemanage)\//.test(route.path)"
          class="custom-style">
          <el-segmented 
            v-model="value" 
            :options="options" 
            @change="handleSegmentedChange" />
        </div>
      </div>
    </template>
  </el-page-header>
</template>

<script setup>
//TODO 优化代码结构
import RouterBack from '@/util/RouterBack';
import { useRoute } from 'vue-router'
import {computed} from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { watch } from 'vue'
const router = useRouter()
const route = useRoute()
const goBack = ()=>{
  RouterBack();  
}
const value = ref(
  route.path.startsWith('/exam/questionlist/') ? 'questionlist' :
  route.path.startsWith('/exam/questionadd/') ? 'questionadd' :
  route.path.startsWith('/exam/batchadd/') ? 'batchadd' :
  route.path.startsWith('/users') ? 'users' :
  route.path.startsWith('/consumer') ? 'consumer' :
  route.path.startsWith('/exam/createExamType/') ? 'questiontype' :
  route.path.startsWith('/exam/examfilemanage/') ? 'examfile' : 'questionadd'
)

// 根据当前路径类型获取选项
const getOptions = () => {
  if (route.path.startsWith('/exam/questionlist/') 
      || route.path.startsWith('/exam/questionadd/') 
      || route.path.startsWith('/exam/batchadd/')) {
    return [
      { label: '题目列表', value: 'questionlist' },
      { label: '添加题目', value: 'questionadd' },
      { label: '批量添加', value: 'batchadd' }
    ]
  } else if (route.path.startsWith('/exam/createExamType/') || route.path.startsWith('/exam/examfilemanage/')) {
    return [
      { label: '考试题型管理', value: 'questiontype' },
      { label: '考试资料管理', value: 'examfile' }
    ]
  } else if (route.path === '/users' || route.path === '/consumer') {
    return [
      { label: '管理端', value: 'users' },
      { label: '用户端', value: 'consumer' }
    ]
  }
  return []
}

const options = computed(() => getOptions())

const handleSegmentedChange = (newValue) => {
  const examId = route.params.id
  const query = route.query
  if (newValue === 'questionlist') {
    router.push(`/exam/questionlist/${examId}?category=${query.category}`)
  } else if (newValue === 'questionadd') {
    router.push(`/exam/questionadd/${examId}?category=${query.category}`)
  } else if (newValue === 'batchadd') {
    router.push(`/exam/batchadd/${examId}?category=${query.category}`)
  } else if (newValue === 'questiontype') {
    router.push(`/exam/createExamType/${examId}`)
  } else if (newValue === 'examfile') {
    router.push(`/exam/examfilemanage/${examId}`)
  } else if (newValue === 'users') {
    router.push('/users')
  } else if (newValue === 'consumer') {
    router.push('/consumer')
  }
}

const Title = computed(() => {
  switch (route.path) {
    case '/index':
      return '首页';
    case '/center':
      return '个人中心';
    case '/users':
      return '管理端';
    case '/consumer':
      return '用户端';
    case '/news/announcement':
      return '通知公告';
    case '/exam/exammanage':
      return '科目管理';
    case (route.path.match(/^\/exam\/questionlist\//) ? route.path : ''):
      return '题目列表';
    case (route.path.match(/^\/exam\/questionadd\//) ? route.path : ''):
      return '添加题目';
    case (route.path.match(/^\/exam\/batchadd\//)? route.path : ''):
      return '批量添加';
    case '/model/modelmanage':
      return '模型管理';
    case (route.path.match(/^\/exam\/createExamType\//) ? route.path : ''):
      return '考试题型管理';
    case (route.path.match(/^\/exam\/examfilemanage\//) ? route.path : ''):
      return '考试资料管理';
    case '/model/chat':
      return '模型对话';
    case '/consumer/message':
      return '用户意见';
    case '/learn/wordbooks':
      return '词书管理';
    default:
      return '后台管理系统';
  }
});

watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/exam/questionlist/')) {
    value.value = 'questionlist'
  } else if (newPath.startsWith('/exam/questionadd/')) {
    value.value = 'questionadd'
  } else if (newPath.startsWith('/exam/batchadd/')) {
    value.value = 'batchadd'
  } else if (newPath.startsWith('/exam/createExamType/')) {
    value.value = 'questiontype'
  } else if (newPath.startsWith('/exam/examfilemanage/')) {
    value.value = 'examfile'
  } else if (newPath.startsWith('/users')) {
    value.value = 'users'
  } else if (newPath.startsWith('/consumer')) {
    value.value = 'consumer'
  }
})
</script>
<style>
.header-content {
  display: flex;
  align-items: center; /* 垂直居中 */
  gap: 16px; /* 元素间距 */
}

.custom-style {
  margin-top: 0; /* 移除之前的顶部间距 */
}

/* 保留原有的分段控件样式 */
.custom-style .el-segmented {
  --el-segmented-item-selected-color: var(--el-text-color-primary);
  --el-segmented-item-selected-bg-color: #ffb300;
  --el-border-radius-base: 16px;
}
</style>