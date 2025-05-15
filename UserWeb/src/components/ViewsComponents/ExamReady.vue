<template>
    <div class="container">
        <div>
            <TopBack
            title="考试题库"  
            :iconSize="27"
            navBarHeight="54px"
            navBarIconColor="#3b3c3d"/>
        </div>
        <div>
            <ExamDtail 
            :ExamID="route.params.id"/>
        </div>
        <van-divider 
            content-position="left"
            :style="{ color: '#1989fa', borderColor: '#1989fa',padding: '0 16px' }">考试题型</van-divider> 
        <div>
            <ExamTitle 
            :UserExamID="route.params.id"
            @updateData="isExamID"/>
            <Empty/>
        </div>
    </div>
</template>
<script setup>
import { useRoute } from 'vue-router';
import TopBack from '@/components/FuntionComponents/TopBack.vue';
import ExamDtail from '../Index/ExamDtail.vue';
import ExamTitle from '../Index/ExamTitle.vue';
import Empty from '../FuntionComponents/Empty.vue';
import { ref } from 'vue';
const route = useRoute();
const examID = ref();
const isExamID= (data)=>{
console.log(data)
}



 

</script>
