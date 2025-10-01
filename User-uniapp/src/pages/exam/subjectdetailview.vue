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

        <up-divider text="|考试题型|" textPosition="left" textColor="#007AFF" lineColor="#86bbf5">
        </up-divider>

        <!-- 加载状态 -->
        <ThemeLoading v-if="isLoading" text="正在加载题型数据..." />
        
        <!-- 题型列表 -->
        <view class="subject-types-container" v-else-if="subjectTypes && subjectTypes.length > 0">
            <scroll-view scroll-y class="subject-types-scroll">
                <view class="subject-types-list">
                    <view class="subject-type-item" v-for="(item, index) in subjectTypes" :key="index"
                        @click="navigateToQuestions(item)">
                        <view class="subject-type-info">
                            <view class="type-header">
                                <text class="subject-type-name">{{ item.content }}</text>
                                <view class="question-badge"
                                    :class="{ 'no-questions': !item.questionIdS || item.questionIdS.length === 0 }">
                                    <text class="question-count">
                                        {{ item.questionIdS ? item.questionIdS.length : 0 }}题</text>
                                </view>
                            </view>
                        </view>
                        <view class="arrow-container">
                            <uni-icons type="forward" size="16" color="#007AFF"></uni-icons>
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>

        <!-- 数据为空 -->
        <Empty description="暂无题型数据" class="empty" v-else />

        <!-- 自定义底部 -->
        <view class="bottom">
            <up-button type="primary" class="bottom-button" :icon="isFavorited ? 'star-fill' : 'star'"
                :plain="!isFavorited" @click="handleFavoriteExam" shape="circle"
                :iconColor="isFavorited ? '#ffae34' : '#007AFF'">
                {{ isFavorited ? '已收藏' : '收藏考试' }}
            </up-button>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import formatTime from '../../util/formatTime';
import { getExamSubjectTypes } from '../../API/Exam/ExamAPI';
import Empty from '../../components/core/Empty.vue';
import { useQuestionStore } from '../../stores/modules/QuestionStore';
import { addExamFavorite, removeExamFavorite, getExamFavorites } from '../../API/My/FavoriteAPI';
import ThemeLoading from '../../components/core/ThemeLoading.vue';

const examInfo = ref({});
const subjectTypes = ref([]); // 考试题型数据
const questionStore = useQuestionStore();
const isFavorited = ref(false); // 添加收藏状态变量
const isLoading = ref(false); // 加载状态

// 页面加载时接收参数
onLoad((options) => {

    if (options.data) {
        try {
            // 解析传递过来的科目数据
            const subjectData = JSON.parse(decodeURIComponent(options.data));

            // 更新考试信息
            examInfo.value = {
                id: subjectData.id,
                name: subjectData.name,
                year: subjectData.year,
                coverImage: subjectData.coverImage,
                updateTime: formatTime.getTime2(subjectData.createdTime),
                startTime: formatTime.getTime2(subjectData.day) || '待定'
            };
            //获取题型详细 在后台异步请求最新数据（不影响页面初始加载速度）
            fetchClickSubjectData(subjectData.id);
            // 检测收藏状态
            checkFavoriteStatus(subjectData.id);
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
        isLoading.value = true;
        const response = await getExamSubjectTypes(subjectId);
        subjectTypes.value = response.data;
    } catch (error) {
        console.error('获取点击的科目数据失败:', error);
        uni.showToast({
            title: '获取数据失败',
            icon: 'none'
        });
    } finally {
        isLoading.value = false;
    }
}

// 检测收藏状态
const checkFavoriteStatus = async (examId) => {
    try {
        const response = await getExamFavorites(examId);
        if (response.code === 200) {
            isFavorited.value = response.data.isFavorited; // 根据返回数据判断是否已收藏
        }
    } catch (error) {
        console.error('检测收藏状态失败:', error);
    }
}

// 收藏/取消收藏考试
const handleFavoriteExam = async () => {
    try {
        if (isFavorited.value) {
            // 使用 Promise 包装 uni.showModal, 以便在异步操作完成后再执行后续逻辑
            const showModal = () => {
                return new Promise((resolve) => {
                    uni.showModal({
                        title: '您确定要取消收藏吗？',
                        success: (res) => {
                            resolve(res.confirm);
                        }
                    });
                });
            };

            const confirmed = await showModal();

            if (confirmed) {
                // 用户点击了确定，执行取消收藏操作
                const response = await removeExamFavorite(examInfo.value.id);
                if (response.code === 200) {
                    isFavorited.value = false;
                    uni.showToast({
                        title: response.message || '取消收藏成功',
                        icon: 'success'
                    });
                }
            }
        } else {
            // 如果未收藏，则添加收藏
            const response = await addExamFavorite(examInfo.value.id);
            if (response.code === 200) {
                isFavorited.value = true;
                uni.showToast({
                    title: response.message || '收藏成功',
                    icon: 'success'
                });
            }
        }
    } catch (error) {
        console.error('收藏操作失败:', error);
        uni.showToast({
            title: '操作失败',
            icon: 'none'
        });
    }
}

// 导航到题目列表页面
const navigateToQuestions = (subjectType) => {
    questionStore.setCurrentQuestionIds(subjectType.questionIdS || []);// 设置当前题目ID数组
    questionStore.FetchQuestionData();// 数据请求获取题目详细信息
    uni.navigateTo({
        url: `/pages/exam/PracticeSettingView?data=${encodeURIComponent(JSON.stringify({
            subjectTypeName: subjectType.content,
            examName: examInfo.value.name,
            updateTime: examInfo.value.updateTime,
            amount: subjectType.questionIdS ? subjectType.questionIdS.length : 0
        }))}`
    });
}
</script>

<style scoped>
.container {
    padding: 0rpx 12rpx;
    background-color: #ffffff;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.exam-detail {
    display: flex;
    flex-direction: row;
    background-color: #ffffff;
    border-radius: 12rpx;
    padding: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
    margin-top: 15rpx;
    flex-shrink: 0;
}

.exam-cover {
    margin-right: 15rpx;
    flex-shrink: 0;
}

.cover-image {
    width: 225rpx;
    height: 305rpx;
    border-radius: 8rpx;
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
    padding: 8rpx 0;
    border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
    border-bottom: none;
}

.info-icon {
    width: 33rpx;
    height: 33rpx;
    margin-right: 10rpx;
    flex-shrink: 0;
}

.info-title {
    font-weight: bold;
    color: #333333;
    margin-right: 5rpx;
    font-size: 25rpx;
    flex-shrink: 0;
}

.info-content {
    color: #666666;
    font-size: 26rpx;
    flex: 1;
    word-break: break-all;
}

.empty {
    margin-top: 150rpx;
}

/* 题型列表样式 */
.subject-types-container {
    padding: 0 6rpx;
    flex: 1;
    overflow: hidden;
    margin-bottom: 120rpx;
}

.subject-types-scroll {
    height: 100%;
}

.subject-types-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.subject-type-item {
    background: linear-gradient(to right, #ffffff, #f0f6ff);
    border-radius: 16rpx;
    padding: 26rpx 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-left: 5rpx solid #007bff;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.subject-type-item:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 6rpx rgba(0, 122, 255, 0.12);
}

.subject-type-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at top right, rgba(0, 122, 255, 0.05), transparent 70%);
    z-index: 0;
}

.subject-type-info {
    flex: 1;
    z-index: 1;
}

.type-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.subject-type-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    flex: 1;
}

.question-badge {
    background-color: #1b89ff;
    border-radius: 30rpx;
    padding: 5rpx 16rpx;
    margin-left: 16rpx;
    flex-shrink: 0;
}

.question-badge.no-questions {
    background-color: #bfbfbf;
}

.question-count {
    color: #ffffff;
    font-size: 24rpx;
    font-weight: 700;
}

.arrow-container {
    margin-left: 16rpx;
    z-index: 1;
}

/* 底部按钮样式 */
.bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100rpx;
    background-color: #ffffff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30rpx;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
    z-index: 100;
}
</style>