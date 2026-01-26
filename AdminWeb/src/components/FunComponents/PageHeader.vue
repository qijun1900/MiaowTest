<template>
  <el-page-header @back="goBack" title="返回">
    <template #content>
      <div class="header-content">
        <div>
          <el-tag type="primary" effect="dark">
            {{ Title }}
          </el-tag>
        </div>
        <div v-if="options.length > 0" class="custom-style">
          <el-segmented
            v-model="activeTab"
            :options="options"
            @change="handleSegmentedChange"
          />
        </div>
      </div>
    </template>
  </el-page-header>
</template>

<script setup>
import RouterBack from "@/util/RouterBack";
import { useRoute, useRouter } from "vue-router";
import { computed, ref, watch } from "vue";

const router = useRouter();
const route = useRoute();

const goBack = () => {
  RouterBack();
};

/**
 * 路由规则配置
 * key: 路由前缀或完整路径的正则匹配逻辑
 * value: 对应的 value (用于 segmented 选中状态)
 */
const routeRules = [
  { match: (path) => path.startsWith('/exam/questionlist/'), value: 'questionlist' },
  { match: (path) => path.startsWith('/exam/questionadd/'), value: 'questionadd' },
  { match: (path) => path.startsWith('/exam/batchadd/'), value: 'batchadd' },
  { match: (path) => path.startsWith('/exam/createExamType/'), value: 'questiontype' },
  { match: (path) => path.startsWith('/exam/examfilemanage/'), value: 'examfile' },
  { match: (path) => path.startsWith('/users'), value: 'users' },
  { match: (path) => path.startsWith('/consumer') && !path.startsWith('/consumer/message'), value: 'consumer' },
];

// 计算当前激活的 tab 值
const getCurrentTab = (path) => {
  const rule = routeRules.find(r => r.match(path));
  return rule ? rule.value : '';
};

const activeTab = ref(getCurrentTab(route.path));

// 监听路由变化自动更新选中状态
watch(
  () => route.path,
  (newPath) => {
    activeTab.value = getCurrentTab(newPath);
  }
);

/**
 * 定义不同场景下的选项组
 */
const tabGroups = {
  examQuestions: [
    { label: "题目列表", value: "questionlist" },
    { label: "添加题目", value: "questionadd" },
    { label: "批量添加", value: "batchadd" },
  ],
  examManagement: [
    { label: "考试题型管理", value: "questiontype" },
    { label: "考试资料管理", value: "examfile" },
  ],
  userManagement: [
    { label: "管理端", value: "users" },
    { label: "用户端", value: "consumer" },
  ],
};

// 根据当前路由决定显示哪组选项
const options = computed(() => {
  const path = route.path;
  if (
    path.startsWith("/exam/questionlist/") ||
    path.startsWith("/exam/questionadd/") ||
    path.startsWith("/exam/batchadd/")
  ) {
    return tabGroups.examQuestions;
  } else if (
    path.startsWith("/exam/createExamType/") ||
    path.startsWith("/exam/examfilemanage/")
  ) {
    return tabGroups.examManagement;
  } else if (
    (path === "/users" || path === "/consumer") &&
    !path.startsWith("/consumer/message")
  ) {
    return tabGroups.userManagement;
  }
  return [];
});

/**
 * 路由跳转映射表
 * key: segmented 的 value
 * action: 执行跳转的函数
 */
const navigationMap = {
  questionlist: (id, query) => `/exam/questionlist/${id}?category=${query.category}`,
  questionadd: (id, query) => `/exam/questionadd/${id}?category=${query.category}`,
  batchadd: (id, query) => `/exam/batchadd/${id}?category=${query.category}`,
  questiontype: (id) => `/exam/createExamType/${id}`,
  examfile: (id) => `/exam/examfilemanage/${id}`,
  users: () => '/users',
  consumer: () => '/consumer',
};

const handleSegmentedChange = (newValue) => {
  const examId = route.params.id;
  const query = route.query;
  const targetPathFactory = navigationMap[newValue];

  if (targetPathFactory) {
    const path = targetPathFactory(examId, query);
    router.push(path);
  }
};

/**
 * 页面标题映射表
 * 优先匹配精确路径，其次匹配正则
 */
const titleMap = [
  { pattern: /^\/index$/, title: "首页" },
  { pattern: /^\/center$/, title: "个人中心" },
  { pattern: /^\/users$/, title: "管理端" },
  { pattern: /^\/consumer$/, title: "用户端" },
  { pattern: /^\/news\/announcement$/, title: "通知公告" },
  { pattern: /^\/exam\/exammanage$/, title: "科目管理" },
  { pattern: /^\/model\/modelmanage$/, title: "模型管理" },
  { pattern: /^\/model\/chat$/, title: "模型对话" },
  { pattern: /^\/consumer\/message$/, title: "用户意见" },
  { pattern: /^\/learn\/wordbooks$/, title: "词书管理" },
  { pattern: /^\/exam\/questionlist\//, title: "题目列表" },
  { pattern: /^\/exam\/questionadd\//, title: "添加题目" },
  { pattern: /^\/exam\/batchadd\//, title: "批量添加" },
  { pattern: /^\/exam\/createExamType\//, title: "考试题型管理" },
  { pattern: /^\/exam\/examfilemanage\//, title: "考试资料管理" },
  { pattern: /^\/resource\/fileupload$/, title: "资源上传" },
  { pattern: /^\/resource\/filelist$/, title: "资源列表" },
  { pattern: /^\/learn\/wordbooks$/, title: "词书管理" },
];

const Title = computed(() => {
  const match = titleMap.find((item) => item.pattern.test(route.path));
  return match ? match.title : "后台管理系统";
});
</script>

<style>
.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.custom-style {
  margin-top: 0;
}

.custom-style .el-segmented {
  --el-segmented-item-selected-color: var(--el-text-color-primary);
  --el-segmented-item-selected-bg-color: #ffb300;
  --el-border-radius-base: 16px;
}
</style>