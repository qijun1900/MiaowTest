<template>
    <div class="search-container">
        <van-search 
            v-model="SearchText"
            placeholder="请输入搜索关键词"
            shape="round"
            clearable
            show-action
            @search="onSearch"
            @focus="showResults = true"
            @blur="onBlur"
        />
        <!-- 添加搜索结果悬浮窗口 -->
        <van-overlay 
            v-show="showResults && SearchexamStem.length" 
            :show="showResults" 
            @click="showResults = false"
            class="results-overlay"
        >
            <div class="search-results">
                <div 
                    v-for="data in SearchexamStem" 
                    :key="data._id" 
                    class="result-item"
                    @click.stop="selectItem(data)">
                    <div class="result-content">
                        <span class="result-text">{{ data.name }}</span>
                    </div>
                </div>
            </div>
        </van-overlay>
    </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import getExamDetails from '@/API/Index/getExamDetails'

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
const selectItem = (item) => {
    SearchText.value = item.name
    showResults.value = false
    // 这里可以添加选中后的处理逻辑
    console.log('选中的项目:', item)
}
const onSearch = () => {
    console.log('点击了搜索，关于搜索的逻辑...')
}
// 失去焦点时隐藏搜索结果
const onBlur = () => {
    setTimeout(() => {
        if (!SearchText.value) {
            showResults.value = false
        }
    }, 200)
}

// 初始化时获取数据
fetchData()
</script>

<style scoped>
.search-container {
    position: relative;
    padding: 4px 6px 6px 6px;
    background: #ffffff;
    z-index: 1;
}

.results-overlay {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 60px;
    background-color: rgba(0, 0, 0, 0.3);
}

.search-results {
    width: 90%;
    max-height: 60vh;
    overflow-y: auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.result-item {
    padding: 12px 16px;
    border-bottom: 1px solid #f5f5f5;
}

.result-item:last-child {
    border-bottom: none;
}

.result-text {
    font-size: 14px;
    color: #333;
}

/* 保留原有样式 */
:deep(.van-search) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-radius: 15px;
}

:deep(.van-field__control) {
    color: #333;
    font-size: 14px;
}

:deep(.van-icon-search) {
    color: #13c4e7;
}

:deep(.van-field__left-icon) {
    margin-right: 8px;
}
</style>