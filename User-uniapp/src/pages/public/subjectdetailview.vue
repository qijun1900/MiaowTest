<template>
    <view class="container">
        <view class="exam-detail">
            <!-- 左侧考试封面 -->
            <view class="exam-cover">
                <image :src="examInfo.coverImage" mode="aspectFill" class="cover-image"></image>
            </view>
            
            <!-- 右侧考试信息 -->
            <view class="exam-info">
                <view class="info-item">
                    <image src="/static/other/subject-name.png" class="info-icon"></image>
                    <text class="info-title">考试名称：</text>
                    <text class="info-content">{{ examInfo.name }}</text>
                </view>
                
                <view class="info-item">
                    <image src="/static/other/year.png" class="info-icon"></image>
                    <text class="info-title">考试年份：</text>
                    <text class="info-content">{{ examInfo.year }}</text>
                </view>
                
                <view class="info-item">
                    <image src="/static/other/time.png" class="info-icon"></image>
                    <text class="info-title">更新时间：</text>
                    <text class="info-content">{{ examInfo.updateTime }}</text>
                </view>
                
                <view class="info-item">
                    <image src="/static/other/open-time.png" class="info-icon"></image>
                    <text class="info-title">开考时间：</text>
                    <text class="info-content">{{ examInfo.startTime }}</text>
                </view>
            </view>
        </view>
    <up-divider text="分割线"></up-divider>
    </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import formatTime from '../../util/formatTime';
import { getExamSubjectTypes } from '../../API/Exam/ExamAPI';
// import Divider from '../../components/core/Divider.vue';

const examInfo = ref({});
const subjectTypes = ref([]); // 考试题型数据

// 页面加载时接收参数
onLoad((options) => {
    
    if (options.data) {
        try {
            // 解析传递过来的科目数据
            const subjectData = JSON.parse(decodeURIComponent(options.data));
            console.log('科目数据:', subjectData);
            
            // 更新考试信息
            examInfo.value = {
                id: subjectData.id,
                name: subjectData.name,
                year: subjectData.year || '2023年',
                coverImage: subjectData.coverImage,
                updateTime: formatTime.getTime2(subjectData.createdTime),
                startTime: formatTime.getTime2(subjectData.day) || '待定'
            };
             // 在后台异步请求最新数据（不影响页面初始加载速度）
            fetchClickSubjectData(subjectData.id);
        } catch (error) {
            console.error('解析科目数据失败:', error);
            uni.showToast({
                title: '数据解析失败',
                icon: 'none'
            });
        }
    } else {
        console.error('未接收到科目数据参数');
        uni.showToast({
            title: '参数错误',
            icon: 'none'
        });
    }
});

// 异步请求点击的科目数据
const fetchClickSubjectData = async (subjectId) => {
    try {
        const response = await getExamSubjectTypes(subjectId);
        subjectTypes.value = response.data;
        console.log('点击的科目数据:', subjectTypes.value);
       
    }catch (error) {
        console.error('获取点击的科目数据失败:', error);
        uni.showToast({
            title: '获取数据失败',
            icon: 'none'
        });
    }
}
</script>

<style scoped>
.container {
    padding: 0rpx 12rpx;
    background-color: #ffffff;
}

.exam-detail {
    display: flex;
    flex-direction: row;
    background-color: #ffffff;
    border-radius: 12rpx;
    padding: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
    margin-top: 8rpx;
}

.exam-cover {
    margin-right: 15rpx;
    flex-shrink: 0;
}

.cover-image {
    width: 120px;
    height: 160px;
    border-radius: 6px;
    object-fit: cover;
}

.exam-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.info-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
    border-bottom: none;
}

.info-icon {
    width: 18px;
    height: 18px;
    margin-right: 8px;
    flex-shrink: 0;
}

.info-title {
    font-weight: bold;
    color: #333333;
    margin-right: 6px;
    font-size: 14px;
    flex-shrink: 0;
}

.info-content {
    color: #666666;
    font-size: 14px;
    flex: 1;
    word-break: break-all;
}
</style>