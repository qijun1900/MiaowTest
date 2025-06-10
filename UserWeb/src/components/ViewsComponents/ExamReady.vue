<template>
    <div class="container">
        <div>
            <TopBack
            title="考试题库"  
            :iconSize="29"
            navBarHeight="54px"
            navBarIconColor="#3b3c3d"
            iconName="question"/>
        </div>
        <div>
            <ExamDtail 
            :ExamID="route.params.id"/>
        </div>
        <Divider
        position="left"
        title="| 考试题型 |"
        color="#1989fa"/>
        <div class="title">
            <ExamTitle 
            :UserExamID="route.params.id"
            @hasData="onHasData"/>
        </div>
        <div class="empty">
                <Empty v-if="!hasData"
                Description="暂无题目添加"/> 
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
import Divider from '../FuntionComponents/Divider.vue';

const route = useRoute();
const hasData = ref(false); // 新增状态变量

const onHasData = (status) => {
  hasData.value = status;
};
</script>
<style scoped>
.empty{
    margin-top: 60px;
}
.title{
    margin-top: 20px; 
}
</style>
