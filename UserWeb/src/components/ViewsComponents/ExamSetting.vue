<template>
    <div class="container">
         <TopBack
            title="题目练习"  
            :iconSize="27"
            navBarHeight="54px"
            navBarIconColor="#3b3c3d"/>



            
    </div>
</template>
<script setup>
import { useExamStore } from '@/stores/counter'
import { onMounted } from 'vue'
import TopBack from '@/components/FuntionComponents/TopBack.vue'

const examStore = useExamStore()

onMounted(() => {
    console.log('当前题目标题:', examStore.currentTitle)
    console.log('当前题目:', examStore.currentQuestion)
})
</script>