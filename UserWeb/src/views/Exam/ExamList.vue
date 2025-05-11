<template>
    <div class="container">
        <TopBack 
            title="所有考试" 
            iconName="search"
            :iconSize="27">
        </TopBack>
        <div class="examlist">
            <HotExamContainer
            :IsHotExamContainer="false"
            :Ishasborder="true"
            :GutterNumber="15"/>

        </div>
    </div>
</template>
<script setup>
import TopBack from '@/components/FuntionComponents/TopBack.vue';
import HotExamContainer from '@/components/Index/ExamContainer.vue';

</script>
<style scoped>
.examlist{
    margin-top: 10px;

}
</style>