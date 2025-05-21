<template>
    <div class="container">
        <TopBack
        title="题目练习"/>
    </div>
</template>
<script setup>
import { useExamStore } from '@/stores/counter'
import { onMounted, ref } from 'vue';
import TopBack from '../FuntionComponents/TopBack.vue';

const store = useExamStore()
const practiceQuestion = ref([]);
onMounted(() => {   
    console.log('PractisePage mounted');
    practiceQuestion.value = store.getSelectedQuestions();
    console.log(practiceQuestion.value)
});
</script>
<style scoped>

</style>