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
                            :src="
                                subject.coverImage ||
                                `${escconfig.ossDomain}${subject.cover}`
                            "
                            mode="aspectFill"
                            class="subject-image"
                        />
                    </view>
                    <view class="subject-info">
                        <text class="subject-name">{{ subject.name }}</text>
                        <text class="update-time"
                            >更新时间:{{
                                formatTime.getTime2(
                                    subject.updateTime || subject.createdTime,
                                )
                            }}</text
                        >
                    </view>
                    <view class="subject-arrow">›</view>
                </view>
            </view>

            <!-- 空状态显示 -->
            <view v-else class="empty-state">
                <image
                    class="empty-image"
                    src="/static/other/exam-favorite.png"
                    mode="aspectFit"
                ></image>
                <text class="empty-text">暂无收藏考试</text>
                <text class="empty-desc">快去收藏你的第一个考试吧！</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getUserFavorites } from "../../../API/My/FavoriteAPI";
import formatTime from "../../../util/formatTime";
import escconfig from "../../../config/esc.config";
import ThemeLoading from "../../core/ThemeLoading.vue";

const favoriteExam = ref([]);
const loading = ref(false);

const fetchFavoriteExam = async () => {
    loading.value = true;
    try {
        const response = await getUserFavorites();
        if (response.code === 200) {
            favoriteExam.value = response.data.map((item) => ({
                id: item._id,
                name: item.name,
                coverImage: `${escconfig.ossDomain}${item.cover}`,
                updateTime: item.createdTime,
                ...item,
            }));
        }
    } catch (error) {
        // 处理错误
        console.error("获取收藏考试失败:", error);
        uni.showModal({
            title: "提示",
            content: "您尚未登录，是否前往登录？",
            confirmText: "去登录",
            success: function (res) {
                if (res.confirm) {
                    uni.navigateTo({
                        url: "/pages/my/UserLoginView",
                    });
                }
            },
        });
    } finally {
        loading.value = false;
    }
};
// 点击事件处理
const handleClick = (item) => {
    uni.navigateTo({
        url: `/pages/exam/subjectdetailview?data=${encodeURIComponent(JSON.stringify(item))}`,
    });
};

onMounted(() => {
    fetchFavoriteExam();
});
</script>

<style scoped lang="scss">
.container {
    padding: 20rpx 20rpx 5rpx 20rpx;
}

.exam-list {
    width: 100%;
}

.subject-list {
    width: 100%;
}

.subject-item {
    background-color: transparent;
    padding: 29rpx;
    margin-bottom: 0;
    display: flex;
    align-items: center;
    border-bottom: 1rpx solid var(--app-border);
    transition: transform 0.2s ease;
}

.subject-item:last-child {
    border-bottom: none;
}

.subject-item:active {
    transform: scale(0.98);
}

.subject-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: var(--app-brand-light);
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
    font-size: calc(32rpx * var(--app-font-scale, 1));
    font-weight: bold;
    color: var(--app-text-primary);
    margin-bottom: 8rpx;
}

.update-time {
    font-size: calc(24rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
}

.subject-arrow {
    font-size: calc(32rpx * var(--app-font-scale, 1));
    color: var(--app-brand);
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
    background-color: transparent;
}

.empty-image {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 30rpx;
    opacity: 0.79;
}

.empty-text {
    font-size: calc(32rpx * var(--app-font-scale, 1));
    font-weight: bold;
    color: var(--app-text-primary);
    margin-bottom: 20rpx;
}

.empty-desc {
    font-size: calc(26rpx * var(--app-font-scale, 1));
    color: var(--app-text-secondary);
    text-align: center;
}
</style>
