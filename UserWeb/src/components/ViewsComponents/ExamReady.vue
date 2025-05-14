<template>
    <div class="container">
        <div>
            <TopBack
            title="科目题库"  
            :iconSize="27"
            navBarHeight="54px"
            navBarIconColor="#3b3c3d"/>
        </div>
        <div>
            <ExamDtail 
            :ExamID="route.params.id"/>
        </div> 
    </div>
</template>
<script setup>
import { useRoute } from 'vue-router';
import TopBack from '@/components/FuntionComponents/TopBack.vue';
import ExamDtail from '../Index/ExamDtail.vue';
const route = useRoute();
</script>
