<template>
    <div class="container">
        <TopBack 
            title="所有考试" 
            iconName="search"
            :iconSize="27">
        </TopBack>
        <div class="statistic">
            <el-statistic :value="outputValue" size="large">
                <template #title>
                    <span class="statistic-title">总科目数量:</span>
                </template>
                <template #suffix>
                    <el-icon size="34"><Tickets /></el-icon>
                </template>
            </el-statistic>
        </div>
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
import { ref } from 'vue'
import { useTransition } from '@vueuse/core'
import { Tickets } from '@element-plus/icons-vue'
import getExamDetails from '@/API/Index/getExamDetails';

const gridItems = ref([])
const source = ref(0)
const outputValue = useTransition(source, {
  duration: 1000,
})
// 获取考试数据
const fetchData = async () => {
    try {
        const res = await getExamDetails()
        gridItems.value = res
        source.value = gridItems.value.length // 使用实际数据长度
    } catch (error) {
        console.error('获取考试数据失败:', error)
    }
}


// 初始化时获取数据
fetchData()
</script>
<style scoped>
.examlist{
    margin-top: 30px;
}
.statistic{
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 24px;
}
.statistic :deep(.el-statistic__content) {
    font-size: 55px; /* 数值大小 */
}
.statistic-title{
    font-size: 16px; /* 标题大小 */
    color: #575555; /* 标题颜色 */
}
</style>