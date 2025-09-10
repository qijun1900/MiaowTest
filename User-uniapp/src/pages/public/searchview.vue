<template>
    <view class="container">
        <uniSearch  
            placeholder="请输入考试科目~" 
            bgColor="#ebebeb"/>   
    </view>
</template>
<script setup>
import { ref,onMounted } from 'vue';
import uniSearch from '../../components/core/uniSearch.vue';
import { getExamSubjects } from '../../API/Exam/ExamAPI';

const examSubjects = ref([]);


const fetchExamSubjects = async (forceRefresh = false) => {
        try{
            const data = await getExamSubjects(forceRefresh);
            examSubjects.value = data.data.map(item => ({
                id: item._id,
                name: item.name,
            }))
            console.log(examSubjects.value)

        }catch(err){
            console.log(err)
        }
}
onMounted(() => {
    fetchExamSubjects();
})
</script>
<style scoped>
.container{
    height: 100vh;
    background-color: #F8F8F8;
}
</style>
