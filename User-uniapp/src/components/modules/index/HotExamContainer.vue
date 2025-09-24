<template>
    <view class="container">
        <scroll-view 
            class="hot-exam-scroll" 
            scroll-x="true" 
            scroll-left="0">
            <view class="hot-exam-list">
                <view class="exam-item" 
                    v-for="(exam, index) in hotExamList" 
                    :key="index" @click="handleClickExam(exam)">
                    <image 
                        class="exam-cover" 
                        :src="exam.coverImage" 
                        :lazy-load="true"
                        mode="aspectFill">
                    </image>
                    <view class="exam-title">{{ exam.name }}</view>
                </view>
                <!-- 数据加载前显示占位图 -->
                <view v-if="isLoading" class="exam-item placeholder-item">
                    <view class="exam-cover placeholder-cover"></view>
                    <view class="exam-title placeholder-title"></view>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { ref ,onMounted} from 'vue'
import { getHotExamList } from '../../../API/Index/HotExamAPI' 
import escconfig from '../../../config/esc.config'

const hotExamList = ref([])
const isLoading = ref(true)

const fetchHotExamData = async () => {
    try {
        isLoading.value = true
        const res = await getHotExamList()
        hotExamList.value = res.data.map(item => ({
            id: item._id,
            name: item.name,
            coverImage: `${escconfig.useTunnel ? escconfig.tunnelUrl : `http://${escconfig.serverHost}:${escconfig.serverPort}`}${item.cover}`, // 根据实际情况调整URL
            ...item
        }))
    } catch (error) {
        console.error('获取热门考试数据失败:', error)
    } finally {
        isLoading.value = false
    }
}

const handleClickExam = (subject) => {
  // 跳转到考试详情页，传递完整科目数据作为参数
  uni.navigateTo({
    url: `/pages/exam/subjectdetailview?data=${encodeURIComponent(JSON.stringify(subject))}`
  });
};

onMounted(()=>{
    fetchHotExamData()
    
})
</script>

<style scoped>
.container {
    padding: 0;
    background-color: transparent;
    border-radius: 0;
    margin: 0;
}

.hot-exam-scroll {
    width: 100%;
    white-space: nowrap;
}

.hot-exam-list {
    display: flex;
    flex-direction: row;
    padding: 10rpx 0;
}

.exam-item {
    flex-shrink: 0;/*  防止元素缩小 */
    width: 218rpx;
    margin-right: 22rpx;
    background-color: #f0f0f0;
    border-radius: 12rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
}

.exam-item:active {
    transform: scale(0.98);
}

.exam-cover {
    width: 100%;
    height: 235rpx;
    background-color: #e0e0e0;
}

.exam-title {
    padding: 15rpx;
    font-size: 23rpx;
    font-weight: bold;
    color: #333333;
    text-align: center;
    white-space: normal;
    line-height: 1.4;
    height: 30rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
}

/* 占位图样式 */
.placeholder-item {
    background-color: #f5f5f5;
}

.placeholder-cover {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
}

.placeholder-title {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4rpx;
    height: 28rpx;
    margin: 16rpx;
}

@keyframes loading {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}
</style>