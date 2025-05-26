<template>
    <van-config-provider :theme-vars="themeVars">
        <div class="container">
            <TopBack title="题目练习" iconName="question" :iconSize="29" navBarIconColor="#3b3c3d"/>
            <div v-if="currentQuestion">
                <template v-for="question in currentQuestion" :key="question._id">
                    <component 
                        :is="questionComponents[question.Type]" 
                        :index="currentPage"
                        v-if="question.Type in questionComponents" 
                        :questionData="question" 
                        :IsShowAnswer="IsShowAnswer"
                        />

                </template>
            </div>
            <div class="pagination-container">
                <van-pagination 
                    v-model="currentPage" 
                    :page-count="practiceQuestion.length" 
                    mode="simple" 
                    prev-text="上一题"
                    next-text="下一题"
                    />
            </div>
            <div class="action-bar-container">
                <van-action-bar class="bottom">
                    <div class="error-item">
                        <ErrorIcon />
                        <span class="count-badge1">5</span>
                    </div>
                    <div class="right-item">
                        <RightIcon />
                        <span class="count-badge2">5</span>
                    </div>
                    <van-button type="primary" :round='true' color="#4f6beb" class="bottom-button">
                        <AnsweSheetIcon />
                        查看答题卡
                    </van-button>
                </van-action-bar>
            </div>

        </div>
    </van-config-provider>
</template>

<script setup>
import { useExamStore } from '@/stores/counter'
import { onMounted, ref, computed } from 'vue';
import TopBack from '../FuntionComponents/TopBack.vue';
import SelectQuestion from '../Index/SelectQuestion.vue';
import JudgeQuestion from '../Index/JudgeQuestion.vue';
import ShortQuestion from '../Index/ShortQuestion.vue';
import BlankQuestion from '../Index/BlankQuestion.vue';
import ErrorIcon from '../icons/ErrorIcon.vue';
import RightIcon from '../icons/RightIcon.vue';
import AnsweSheetIcon from '../icons/AnsweSheetIcon.vue';

const store = useExamStore()

const practiceQuestion = ref([]);
const currentPage = ref(1); // 添加当前页码
const IsShowAnswer = computed(() => store.IsShowAnswer);
const IsRandom = computed(() => store.IsRandom);

// 计算当前显示的题目
const currentQuestion = computed(() => {
    if (practiceQuestion.value.length > 0) {
        return practiceQuestion.value[currentPage.value - 1];
    }
    return null;
});

onMounted(() => {
    const questions = store.getSelectedQuestions();
    if (IsRandom.value) {
        // 随机打乱题目顺序
        practiceQuestion.value = [...questions].sort(() => Math.random() - 0.5);
    } else {
        practiceQuestion.value = questions;
    }
    console.log("练习题目：", practiceQuestion.value);
});
// 定义组件映射关系
const questionComponents = {
    1: SelectQuestion,
    2: BlankQuestion,
    3: JudgeQuestion,
    4: ShortQuestion
}

const themeVars = ref({
    actionBarBackground: "#ededed",
    actionBarHeight: "64px"
})
</script>
<style scoped>
.bottom {
    justify-content: flex-end;
    padding-right: 25px;
}

.error-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 8px;
    margin-top: 4px;
    margin-bottom: 2px;
}

.right-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 8px;
    margin-bottom: 1px;
}

.count-badge1 {
    margin-top: 4px;
    font-size: 16px;
    color: #646464;
    font-weight: bolder;
    margin-bottom: 2px;
}

.count-badge2 {
    margin-top: 2px;
    font-size: 16px;
    color: #646464;
    font-weight: bolder;
    margin-bottom: 1px;
}

.bottom-button {
    margin-bottom: 4px;
}
.pagination-container {
    position: fixed;
    bottom: 85px; /* 操作栏高度64px + 间距25px */
    left: 0;
    right: 0;
    padding: 0 16px;
    background-color: white;
    z-index: 99;
}

.action-bar-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
}
.container {
    padding-bottom: 150px; /* 为固定元素预留空间，防止内容被遮挡 */
}

</style>

