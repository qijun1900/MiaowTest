<template>
    <div class="container">
        <TopBack title="题目练习"/>
        <div v-for="(questionGroup,index) in practiceQuestion" :key="index">
            <template v-for="question in questionGroup">
                <component 
                    :is="questionComponents[question.Type]"
                    :index="questionIndex(index)"
                    v-if="question.Type in questionComponents"
                    :key="question._id"
                    :questionID="question._id"
                />
            </template>
        </div>
    </div>
</template>

<script setup>
import { useExamStore } from '@/stores/counter'
import { onMounted, ref } from 'vue';
import TopBack from '../FuntionComponents/TopBack.vue';
import SelectQuestion from '../Index/SelectQuestion.vue';
import JudgeQuestion from '../Index/JudgeQuestion.vue';
import ShortQuestion from '../Index/ShortQuestion.vue'; 
import BlankQuestion from '../Index/BlankQuestion.vue';

const store = useExamStore()
const practiceQuestion = ref([]);

const questionComponents = {
    1: SelectQuestion,
    2: JudgeQuestion,
    3: BlankQuestion,
    4: ShortQuestion
}

const questionIndex = (index) => index + 1;

onMounted(() => {   
    practiceQuestion.value = store.getSelectedQuestions();
});
</script>
<style scoped>

</style>