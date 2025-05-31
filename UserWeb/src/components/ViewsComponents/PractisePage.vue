<template>
    <van-config-provider :theme-vars="themeVars">
        <div class="container">
            <TopBack title="练习设置" iconName="question" :iconSize="29" navBarIconColor="#3b3c3d" :isclearAnswer="true" />
            <div v-if="currentQuestion">
                <template v-for="question in currentQuestion" :key="question._id">
                    <component :is="questionComponents[question.Type]" :index="currentPage"
                        v-if="question.Type in questionComponents" :questionData="question"
                        :IsShowAnswer="IsShowAnswer" />
                </template>
            </div>
            <div class="pagination-container">
                <van-pagination v-model="currentPage" :page-count="practiceQuestion.length" mode="simple"
                    prev-text="上一题" next-text="下一题" />
            </div>
            <div class="action-bar-container">
                <van-action-bar class="bottom">
                    <div class="error-item">
                        <ErrorIcon />
                        <span class="count-badge1">{{ errorCount }}</span>
                    </div>
                    <div class="right-item">
                        <RightIcon />
                        <span class="count-badge2">{{ rightCount }}</span>
                    </div>
                    <van-button @click="CheckAnswerSheet" type="primary" :round='true' color="#4f6beb"
                        class="bottom-button">
                        <AnsweSheetIcon />
                        查看答题卡
                    </van-button>
                </van-action-bar>
            </div>
        </div>
        <van-popup class="answer-sheet-popup" v-model:show="show" closeable close-icon="close" position="bottom"
            :style="{ height: '70%' }">
            <div class="action-but-container">
                <van-space :size="25">
                    <van-button type="primary" round color="#5DADE2" @click="ResetAnswerSheet">
                        <template #icon>
                            <ResetIcon color="#00d2d3" />
                        </template>
                        清空答题记录
                    </van-button>
                    <van-button type="primary" round color="#5DADE2">
                        <template #icon>
                            <SubmitIcon color="#00d2d3" />
                        </template>
                        提交题目{待开发}
                    </van-button>
                </van-space>
            </div>
            <div>
                <span class="answer-sheet-font">答题卡</span>
                <div class="answer-sheet-content">
                    <span>题目答题记录及其题序{待开发}</span>
                </div>
            </div>
        </van-popup>
    </van-config-provider>
</template>

<script setup>
import { useExamStore } from '@/stores/counter'
import { useAnswerStore } from '@/stores/answerStore'
import { onMounted, ref, computed } from 'vue';
import TopBack from '../FuntionComponents/TopBack.vue';
import SelectQuestion from '../Index/SelectQuestion.vue';
import JudgeQuestion from '../Index/JudgeQuestion.vue';
import ShortQuestion from '../Index/ShortQuestion.vue';
import BlankQuestion from '../Index/BlankQuestion.vue';
import ErrorIcon from '../icons/ErrorIcon.vue';
import RightIcon from '../icons/RightIcon.vue';
import AnsweSheetIcon from '../icons/AnsweSheetIcon.vue';
import ResetIcon from '../icons/ResetIcon.vue';
import SubmitIcon from '../icons/SubmitIcon.vue';
import { showConfirmDialog } from 'vant';

const store = useExamStore()
const answerStore = useAnswerStore()

const practiceQuestion = ref([]);
const currentPage = ref(1); // 添加当前页码
const IsShowAnswer = computed(() => store.IsShowAnswer);
const IsRandom = computed(() => store.IsRandom);
const show = ref(false);// 控制答题卡弹窗的显示状态

// 计算当前显示的题目
const currentQuestion = computed(() => {
    if (practiceQuestion.value.length > 0) {
        return practiceQuestion.value[currentPage.value - 1];
    }
    return null;
});

// 检查答题卡
const CheckAnswerSheet = () => {
    show.value = true;
}
// 重置答题卡
const ResetAnswerSheet = () => {
    showConfirmDialog({ // 显示确认对话框
        message: '您确定要清空答题记录吗，此操作不可恢复！', // 提示消息
        confirmButtonText: '确定', // 确认按钮文本
        cancelButtonText: '取消', // 取消按钮文本
    })
    .then(() => {
        answerStore.clearAnswers(); // 清空答题记录
    })
    .catch(() => {
        // 用户点击取消按钮，不执行任何操作
    })
}

// 添加计算属性，计算错误和正确的题目数量
const errorCount = computed(() => {
    return Object.values(answerStore.answerStates).filter(
        state => state.answer && state.isCorrect === false
    ).length
})

const rightCount = computed(() => {
    return Object.values(answerStore.answerStates).filter(
        state => state.answer && state.isCorrect === true
    ).length
})
onMounted(() => {
    const questions = store.getSelectedQuestions();
    if (IsRandom.value) {
        practiceQuestion.value = [...questions].sort(() => Math.random() - 0.5);// 随机打乱题目顺序
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
    actionBarHeight: "54px"
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
    bottom: 54px;
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
    padding-bottom: 150px;
    /* 为固定元素预留空间，防止内容被遮挡 */
}

.answer-sheet-popup {
    background-color: #ececec;
    border-radius: 16px;
}

.action-but-container {
    margin: 20px 20px;
    padding: 12px;
    background-color: #e3e3e3;
    border-radius: 16px;
}

.answer-sheet-font {
    font-size: 17.5px;
    font-weight: bold;
    color: #46484a;
    margin-left: 20px;
}
</style>
