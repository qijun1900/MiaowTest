<template>
    <view class="container">
        <!-- 自定义导航栏组件 -->
        <PageHead
            ref="pageHeadRef"
            title="所有考试科目"
            :show-search="true"
            search-placeholder="搜索考试科目~"
            :loading="loading"
        />

        <!-- 内容区域 -->
        <view
            class="content"
            :style="{ paddingTop: pageHeadRef?.contentPaddingTop + 'px' }"
        >
            <!-- 考试列表 -->
            <view class="exam-list">
                <view v-if="loading" class="subject-list skeleton-list">
                    <view
                        v-for="index in 6"
                        :key="`exam-skeleton-${index}`"
                        class="subject-item skeleton-item"
                    >
                        <view class="subject-icon skeleton-icon shimmer"></view>
                        <view class="subject-info">
                            <view class="skeleton-line skeleton-title shimmer"></view>
                            <view class="skeleton-line skeleton-time shimmer"></view>
                        </view>
                        <view class="skeleton-arrow shimmer"></view>
                    </view>
                </view>
                <view v-else class="subject-list">
                    <view
                        v-for="subject in examSubjects"
                        :key="subject._id"
                        class="subject-item"
                        @click="handleSubjectClick(subject)"
                    >
                        <view class="subject-icon">
                            <view
                                v-if="!isCoverLoaded(subject)"
                                class="cover-placeholder"
                                :style="getCoverPlaceholderStyle(subject)"
                            ></view>
                            <image
                                :src="subject.coverImage"
                                mode="aspectFill"
                                class="subject-image"
                                :class="{
                                    'subject-image-visible': isCoverLoaded(subject),
                                }"
                                @load="handleCoverLoaded(subject)"
                                @error="handleCoverError(subject)"
                            />
                        </view>
                        <view class="subject-info">
                            <text class="subject-name">{{ subject.name }}</text>
                            <text class="update-time"
                                >更新时间:{{
                                    formatTime.getTime2(subject.updateTime)
                                }}</text
                            >
                        </view>
                        <view class="subject-arrow">›</view>
                    </view>
                </view>
            </view>

            <!-- 回到顶部组件 -->
            <BackToTop ref="backToTopRef" position="bottom-right" />
            <up-divider
                text="已经到底了"
                :dashed="true"
                v-if="examSubjects.length > 0 && !loading"
            >
            </up-divider>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
    getExamSubjects,
    clearExamSubjectsCache,
} from "../../API/Exam/ExamAPI";
import BackToTop from "../../components/core/BackToTop.vue";
import PageHead from "../../components/core/PageHead.vue";
import escconfig from "../../config/esc.config";
import { onPageScroll, onPullDownRefresh } from "@dcloudio/uni-app";
import formatTime from "../../util/formatTime";
import showShareMenu from "../../util/wechatShare.js";
import checkLogin from "../../util/checkLogin.js";

// 响应式数据
const examSubjects = ref([]);
const loading = ref(false);
const backToTopRef = ref();
const pageHeadRef = ref();
const coverLoadedMap = ref({});

const COVER_PLACEHOLDER_COLORS = [
    ["#f2c37a", "#ef8f6f"],
    ["#8fd1a8", "#57b78f"],
    ["#f5b7a1", "#eb8c8c"],
    ["#f2d177", "#d7ad5b"],
    ["#c7d88c", "#97b06a"],
];

const getSubjectId = (subject = {}) =>
    String(subject.id || subject._id || "").trim();

const getHashCode = (value = "") => {
    let hash = 0;
    const text = String(value || "");
    for (let index = 0; index < text.length; index += 1) {
        hash = (hash << 5) - hash + text.charCodeAt(index);
        hash |= 0;
    }
    return Math.abs(hash);
};

const isCoverLoaded = (subject = {}) => {
    const subjectId = getSubjectId(subject);
    return Boolean(subjectId && coverLoadedMap.value[subjectId]);
};

const handleCoverLoaded = (subject = {}) => {
    const subjectId = getSubjectId(subject);
    if (!subjectId) return;
    coverLoadedMap.value = {
        ...coverLoadedMap.value,
        [subjectId]: true,
    };
};

const handleCoverError = (subject = {}) => {
    const subjectId = getSubjectId(subject);
    if (!subjectId) return;
    coverLoadedMap.value = {
        ...coverLoadedMap.value,
        [subjectId]: false,
    };
};

const getCoverPlaceholderStyle = (subject = {}) => {
    const subjectId = getSubjectId(subject);
    const hash = getHashCode(subjectId || subject.name || "default");
    const colorPair = COVER_PLACEHOLDER_COLORS[hash % COVER_PLACEHOLDER_COLORS.length];

    return {
        background: `linear-gradient(145deg, ${colorPair[0]} 0%, ${colorPair[1]} 100%)`,
    };
};

/**
 * 获取考试科目数据
 * @param {boolean} forceRefresh 是否强制刷新
 */
const fetchExamSubjects = async (forceRefresh = false) => {
    loading.value = true;
    try {
        const data = await getExamSubjects(forceRefresh);
        const nextSubjects = data.data.map((item) => ({
            id: item._id,
            name: item.name,
            coverImage: `${escconfig.ossDomain}${item.cover}`,
            updateTime: item.createdTime,
            ...item,
        }));
        examSubjects.value = nextSubjects;
        coverLoadedMap.value = nextSubjects.reduce((accumulator, item) => {
            const subjectId = getSubjectId(item);
            if (subjectId) {
                accumulator[subjectId] = false;
            }
            return accumulator;
        }, {});
    } catch (error) {
        console.error("获取考试科目失败:", error);
        uni.showToast({
            title: "获取考试科目失败",
            icon: "none",
        });
    } finally {
        loading.value = false;
    }
};

const handleSubjectClick = async (subject) => {
    // 跳转到考试详情页，传递完整科目数据作为参数
    const isLoggedIn = await checkLogin("请登录后再操作");
    if (!isLoggedIn) {
        return;
    }
    uni.navigateTo({
        url: `/pages/exam/subjectdetailview?data=${encodeURIComponent(JSON.stringify(subject))}`,
    });
};

// 下拉刷新事件
onPullDownRefresh(async () => {
    // 清除缓存并重新获取数据
    clearExamSubjectsCache();
    await fetchExamSubjects(true);
    // 停止下拉刷新动画
    uni.stopPullDownRefresh();
});

// 页面滚动事件
onPageScroll((e) => {
    // 调用BackToTop组件的滚动处理方法
    if (backToTopRef.value) {
        backToTopRef.value.handlePageScroll(e);
    }
});

// 页面加载时获取数据
onMounted(() => {
    fetchExamSubjects();
    //#ifdef MP-WEIXIN
    showShareMenu();
    //#endif
});
</script>

<style scoped lang="scss">
.container {
    min-height: 100vh;
    background-color: #f8f8f8;
}

// 内容区域样式
.content {
    padding: 0 20rpx 20rpx 20rpx;
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
    margin-bottom: 13rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
}

.skeleton-item {
    pointer-events: none;
}

.skeleton-icon {
    background: #e8dccf;
}

.skeleton-line {
    border-radius: 12rpx;
}

.skeleton-title {
    width: 72%;
    height: 34rpx;
    margin-bottom: 14rpx;
}

.skeleton-time {
    width: 54%;
    height: 24rpx;
}

.skeleton-arrow {
    width: 24rpx;
    height: 36rpx;
    border-radius: 10rpx;
    background: #e6d8ca;
}

.shimmer {
    position: relative;
    overflow: hidden;
}

.shimmer::after {
    content: "";
    position: absolute;
    top: 0;
    left: -130%;
    width: 130%;
    height: 100%;
    background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.72) 48%,
        rgba(255, 255, 255, 0) 100%
    );
    animation: skeletonSweep 1.2s ease-in-out infinite;
}

.subject-item:active {
    transform: scale(0.98);
}

.subject-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: #eadfce;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 30rpx;
    flex-shrink: 0;
    overflow: hidden;
    position: relative;
}

.subject-image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.22s ease;
}

.subject-image-visible {
    opacity: 1;
}

.cover-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cover-placeholder::after {
    content: "";
    position: absolute;
    width: 140%;
    height: 140%;
    background: radial-gradient(
        circle at 28% 22%,
        rgba(255, 255, 255, 0.35) 0%,
        rgba(255, 255, 255, 0) 48%
    );
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
    color: #c77f4d;
    font-weight: bold;
    margin-left: 20rpx;
}

@keyframes skeletonSweep {
    to {
        left: 130%;
    }
}
</style>
