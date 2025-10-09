<template>
    <view class="container">
        <view class="exam-list">
            <ThemeLoading v-if="loading" text="正在加载收藏考试..." />
            <view v-else-if="favoriteExam.length > 0" class="subject-list">
                <view 
                    v-for="subject in favoriteExam" 
                    :key="subject._id" 
                    class="subject-item"
                    @click="handleClick(subject)"
                >
                    <view class="subject-icon">
                        <image 
                            :src="subject.coverImage || `${escconfig.useTunnel ? escconfig.tunnelUrl : `http://${escconfig.serverHost}:${escconfig.serverPort}`}${subject.cover}`" 
                            mode="aspectFill"
                            class="subject-image"
                        />
                    </view>
                    <view class="subject-info">
                        <text class="subject-name">{{ subject.name }}</text>
                        <text class="update-time">更新时间:{{ formatTime.getTime2(subject.updateTime || subject.createdTime) }}</text>
                    </view>
                    <view class="subject-arrow">›</view>
                </view>
            </view>
            
            <!-- 空状态显示 -->
            <view v-else class="empty-state">
                <image class="empty-image" src="/static/other/exam-favorite.png" mode="aspectFit"></image>
                <text class="empty-text">暂无收藏考试</text>
                <text class="empty-desc">快去收藏你的第一个考试吧！</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserFavorites } from '../../../API/My/FavoriteAPI'
import formatTime from '../../../util/formatTime'
import escconfig from '../../../config/esc.config'
import ThemeLoading from '../../core/ThemeLoading.vue'

const favoriteExam = ref([])
const loading = ref(false)

const fetchFavoriteExam = async () => {
    loading.value = true
    try {
        const response = await getUserFavorites()
        if (response.code === 200) {
            favoriteExam.value = response.data.map(item => ({
                id: item._id,
                name: item.name,
                coverImage: `${escconfig.useTunnel ? escconfig.tunnelUrl : `http://${escconfig.serverHost}:${escconfig.serverPort}`}${item.cover}`,
                updateTime: item.createdTime,
                ...item
            }))
        }
    } catch (error) {
        // 处理错误
        console.error('获取收藏考试失败:', error)
        uni.showModal({
            title: '提示',
            content: '您尚未登录，是否前往登录？',
            confirmText: '去登录',
            success: function (res) {
                if (res.confirm) {
                    uni.navigateTo({
                        url: '/pages/my/UserLoginView'
                    });
                }
            }
        });
    } finally {
        loading.value = false
    }
}
// 点击事件处理
const handleClick = (item) => {
    uni.navigateTo({
        url: `/pages/exam/subjectdetailview?data=${encodeURIComponent(JSON.stringify(item))}`
    })
}

onMounted(() => {
    fetchFavoriteExam()
})
</script>

<style scoped lang="scss">
.container {
    padding: 20rpx 20rpx 5rpx 20rpx ;
}

.exam-list {
    width: 100%;
}



.subject-list {
    width: 100%;
}

.subject-item {
    background-color: #ffffff;
    border-radius: 12rpx;
    padding: 29rpx;
    margin-bottom: 15rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
}

.subject-item:active {
    transform: scale(0.98);
}

.subject-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #c0ccff 0%, #6b9fe8 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 30rpx;
    flex-shrink: 0;
    overflow: hidden;
}

.subject-image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
}

.subject-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.subject-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 8rpx;
}

.update-time {
    font-size: 24rpx;
    color: #999999;
}

.subject-arrow {
    font-size: 32rpx;
    color: #007AFF;
    font-weight: bold;
    margin-left: 20rpx;
}

/* 空状态样式 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80rpx 40rpx;
    background-color: #ffffff;
    border-radius: 12rpx;
    margin-top: 20rpx;
}

.empty-image {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 30rpx;
    opacity: 0.79;
}

.empty-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #666666;
    margin-bottom: 20rpx;
}

.empty-desc {
    font-size: 26rpx;
    color: #999999;
    text-align: center;
}
</style>
