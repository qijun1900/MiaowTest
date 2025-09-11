<template>
    <view class="container">
        <uniSearch  
            placeholder="请输入考试科目~" 
            bgColor="#ebebeb"
            v-model:searchText="searchQuery"
            @search="handleSearch"/>   
        
        <!-- 搜索结果列表 -->
        <view class="search-results" v-if="searchResults.length > 0">
            <view 
                class="result-item" 
                v-for="(item, index) in searchResults" 
                :key="index"
                @click="selectSubject(item)">
                <view class="result-content">
                    <text class="result-text">
                        <template 
                            v-for="(part, partIndex) in highlightText(item.name, searchQuery)" 
                            :key="partIndex">
                            <text :class="part.isMatch ? 'highlight' : ''">{{ part.text }}</text>
                        </template>
                    </text>
                    <view>
                       <uni-icons 
                        type="right" 
                        size="14"></uni-icons>
                    </view>
                </view>
            </view>
        </view>
        
        <!-- 无搜索结果提示 -->
        <view class="no-results" v-else-if="searchQuery && searchResults.length === 0 && !isLoading">
            <text>没有找到相关科目</text>
        </view>
        
        <!-- 加载中提示 -->
        <view class="loading" v-if="isLoading">
            <text>加载中...</text>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import uniSearch from '../../components/core/uniSearch.vue';
import { getExamSubjects } from '../../API/Exam/ExamAPI';
import escconfig from '../../config/esc.config';


const examSubjects = ref([]); // 考试科目数据
const searchQuery = ref(''); // 搜索关键词
const searchResults = ref([]); // 搜索结果
const isLoading = ref(false); // 加载状态

// 获取考试科目数据
const fetchExamSubjects = async (forceRefresh = false) => {
    isLoading.value = true;
    try {
        const data = await getExamSubjects(forceRefresh);
        examSubjects.value = data.data.map(item => ({
            id: item._id,
            name: item.name,
            coverImage: `http://${escconfig.serverHost}:${escconfig.serverPort}${item.cover}`,
            updateTime: item.createdTime,
            year: item.year,
            day: item.day,
            ...item
        }));
    } catch(err) {
        console.error('获取考试科目失败:', err);
        uni.showToast({
            title: '获取考试科目失败',
            icon: 'none'
        });
    } finally {
        isLoading.value = false;
    }
}

// 处理搜索
const handleSearch = (query) => {
    searchQuery.value = query;
    
    if (!query.trim()) {
        searchResults.value = [];
        return;
    }
    
    const filteredResults = examSubjects.value.filter(item => {
        return item.name.toLowerCase().includes(query.toLowerCase());
    });
    
    searchResults.value = filteredResults;
}

// 高亮文本中的搜索关键字
const highlightText = (text, keyword) => {
    if (!keyword) return [{ text, isMatch: false }];
    
    const keywordLower = keyword.toLowerCase();
    const textLower = text.toLowerCase();
    const result = [];
    let lastIndex = 0;
    let index = textLower.indexOf(keywordLower);
    
    while (index !== -1) {
        // 添加匹配前的文本
        if (index > lastIndex) {
            result.push({
                text: text.substring(lastIndex, index),
                isMatch: false
            });
        }
        
        // 添加匹配的文本
        result.push({
            text: text.substring(index, index + keyword.length),
            isMatch: true
        });
        
        lastIndex = index + keyword.length;
        index = textLower.indexOf(keywordLower, lastIndex);
    }
    
    // 添加剩余的文本
    if (lastIndex < text.length) {
        result.push({
            text: text.substring(lastIndex),
            isMatch: false
        });
    }
    
    return result;
}

// 选择科目
const selectSubject = (subject) => {
    // 跳转到科目详情页面，传递完整科目数据作为参数
    uni.navigateTo({
        url: `/pages/exam/subjectdetailview?data=${encodeURIComponent(JSON.stringify(subject))}`
    });
}

onMounted(() => {
    fetchExamSubjects();
})
</script>

<style scoped>
.container {
    height: 100vh;
    background-color: #F8F8F8;
    padding: 10rpx 15rpx;
}

.search-results {
    margin-top: 10rpx;
    background-color: #fff;
    border-radius: 15rpx;
    overflow: hidden;
    margin-bottom: 25rpx;
}

.result-item {
    padding: 23rpx 30rpx; 
    border-bottom: 2rpx solid #eee;
}

.result-item:last-child {
    border-bottom: none;
}

.result-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.result-text {
    font-size: 32rpx;
    color: #333;
    flex: 1;
}

.highlight {
    color: #ff6b00;
    font-weight: bold;
}

.no-results {
    margin-top: 20rpx;
    text-align: center;
    color: #999;
    font-size: 35rpx;
}

.loading {
    margin-top: 20rpx;
    text-align: center;
    color: #666;
    font-size: 14rpx;
}

.initial-tip {
    margin-top: 20rpx;
    text-align: center;
    color: #999;
    font-size: 35rpx;
}
</style>
