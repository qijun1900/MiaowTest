<!-- 根据题型的不同来选择相应组件 -->
<template>
  <div>
    <component :is="currentComponent" />
  </div>
</template>
<script setup>
import { computed } from "vue";
import { useAppStore } from "@/stores";
import Select from "@/components/business/exam/QuestionTypeSelect.vue"; //1
import Blank from "@/components/business/exam/QuestionTypeBlank.vue"; //2
import Judge from "@/components/business/exam/QuestionTypeJudge.vue"; //3
import Short from "@/components/business/exam/QuestionTypeShort.vue"; //4

const appStore = useAppStore();
const QuestionType = appStore.examInfo.category; // 题目类型

// 根据题目类型返回对应编辑组件
const currentComponent = computed(() => {
  const componentMap = {
    1: Select, // 选择题组件
    2: Blank, // 填空题组件
    3: Judge, // 判断题组件
    4: Short, // 简答题组件
  };
  return componentMap[Number(QuestionType)] || null;
});
</script>
