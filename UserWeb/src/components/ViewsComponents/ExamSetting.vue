<template>
    <div class="container">
        <TopBack
        title="题目练习"  
        :iconSize="27"
        navBarHeight="54px"
        navBarIconColor="#3b3c3d"/>
        <van-divider 
            content-position="left" 
            :style="{ color: '#1f96f7', borderColor: '#1989fa',padding: '0 10px' }">
            题型信息
        </van-divider>
        <div>
            <van-cell-group inset class="info-group">
                <van-cell 
                    title="类型名称"   
                    size="large" 
                    icon="description"
                    class="info-cell">
                    <template #value>
                        <span class="info-value">{{ examStore.currentTitle }}</span>
                    </template>
                </van-cell>
                <van-cell 
                    title="题目数量"   
                    size="large" 
                    icon="bar-chart-o"
                    class="info-cell">
                    <template #value>
                        <span class="info-value">{{ questions.length }}</span>
                    </template>
                </van-cell>
                <van-cell 
                    title="解析数量"   
                    size="large" 
                    icon="smile"
                    class="info-cell">
                    <template #value>
                        <span class="info-value">{{ questions.length }}</span>
                    </template>
                </van-cell>
            </van-cell-group>
        </div>
        <van-divider 
            content-position="left" 
            :style="{ color: '#1f96f7', borderColor: '#1989fa',padding: '0 10px' }">
            练习设置
        </van-divider>
        <div>

        </div>
    </div>


</template>
<script setup>
import { useExamStore } from '@/stores/counter'
import { onMounted } from 'vue'
import TopBack from '@/components/FuntionComponents/TopBack.vue'
import {ref} from 'vue'

const questions = ref([])
const examStore = useExamStore()
const store = useExamStore()

onMounted(() => {
    console.log('当前题目标题:', examStore.currentTitle)
    questions.value = store.getCurrentQuestion()
    console.log('当前题目:', questions.value)
})
</script>
<style scoped>
.info-group {
    margin: 12px 0;
    margin-left: 5px;
    margin-right: 5px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-cell {
    font-size: 16px;
    padding: 16px;
}

.info-cell :deep(.van-cell__title) {
    font-weight: 500;
    color: #333;
}

.info-cell :deep(.van-cell__value) {
    font-weight: 600;
    color: #1989fa;
}
.info-value {
    font-size: 15px;
    letter-spacing: 0.5px;
}
</style>