<template>
    <div class="search-container">
        <van-search 
            v-model="SearchText"
            placeholder="请输入搜索关键词"
            shape="round"
            clearable
            @focus="showResults = true"
        />
        <!-- 搜索结果列表 -->
        <div 
            v-show="showResults && SearchexamStem.length"
            class="search-results"
        >
            <div 
                v-for="data in SearchexamStem" 
                :key="data._id" 
                class="result-item"
            >
                <span class="result-text">{{ data.name }}</span>
            </div>
        </div>
        
        <!-- 空白页面 -->
        <div 
            v-if="SearchText && !SearchexamStem.length"
            class="empty-state"
        >
            <Empty 
            :ImageSize="80"
            Description="暂无相关科目"/>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import getExamDetails from '@/API/Index/getExamDetails'
import Empty from '@/components/FuntionComponents/Empty.vue'

const SearchText = ref('')
const ExamData = ref([])
const showResults = ref(false)

// 获取考试数据
const fetchData = async () => {
    try {
        ExamData.value = await getExamDetails()
    } catch (error) {
        console.error('获取考试数据失败:', error)
    }
}
// 搜索逻辑
const SearchexamStem = computed(() => {
    if (!SearchText.value) return []
    return ExamData.value.filter(item => 
        item.name?.toLowerCase().includes(SearchText.value.toLowerCase())
    )
})

fetchData()// 初始化时获取数据
</script>

<style scoped>
.search-container {
    position: relative;
    padding: 2px;
    background: #ffffff;
}

.search-results {
    position: absolute;
    z-index: 999;
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    margin-top: 4px;
}

.result-item {
    padding: 12px 16px;
    border-bottom: 1px solid #f5f5f5;
    transition: background 0.2s;
}

.result-item:hover {
    background: #f8f8f8;
}

.result-text {
    font-size: 14px;
    color: #333;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #999;
}

.empty-text {
    margin-top: 12px;
    font-size: 14px;
}


</style>