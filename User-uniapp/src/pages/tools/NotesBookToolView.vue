<template>
    <view class="container">
        <view class="bg-blob blob-1"></view>
        <view class="bg-blob blob-2"></view>

        <view class="hero">
            <view class="hero-left">
                <view class="section-header">
                    <view class="section-dot"></view>
                    <text class="section-title">所有笔记本</text>
                </view>
                <text class="hero-subtitle">整理知识，沉淀你的学习轨迹</text>
            </view>
            <view class="hero-stat">
                <text class="hero-stat-value">{{ notebookList.length }}</text>
                <text class="hero-stat-label">个笔记本</text>
            </view>
        </view>

        <view class="card-list">
            <view
                v-for="(item, index) in notebookList"
                :key="item.id"
                class="notebook-card"
                :style="[item.cardStyle, { animationDelay: `${index * 70}ms` }]"
            >
                <view class="card-aura" :style="item.auraStyle"></view>

                <view class="edit-btn" @click.stop="handleEditNotebook(item)">
                    <uni-icons
                        type="compose"
                        size="15"
                        color="#4f6184"
                    ></uni-icons>
                </view>

                <view class="card-top">
                    <view class="count-tag" :style="item.tagStyle">
                        <text class="count-text">{{ item.noteCount }} 笔记</text>
                    </view>
                </view>

                <view class="card-content">
                    <text class="book-title">{{ item.title }}</text>
                    <text class="book-desc">{{ item.description }}</text>
                </view>

                <view class="card-footer">
                    <uni-icons type="clock" size="15" color="#7d8697"></uni-icons>
                    <text class="footer-text">{{ item.updatedAtText }}</text>
                    <view class="footer-line"></view>
                    <text class="footer-hint">最近更新</text>
                </view>
            </view>

            <view class="notebook-card create-card" @click="handleCreateNotebook">
                <view class="create-content">
                    <view class="create-icon-wrapper">
                        <view class="create-icon">
                            <uni-icons
                                type="plus"
                                size="40"
                                color="#999"
                            ></uni-icons>
                        </view>
                    </view>
                    <view class="create-text">新建笔记本</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
const handleCreateNotebook = () => {
    uni.showToast({
        title: "创建功能开发中",
        icon: "none",
    });
};

const handleEditNotebook = (item) => {
    uni.showToast({
        title: `编辑 ${item.title}`,
        icon: "none",
    });
};

const notebookList = [
    {
        id: 1,
        title: "数学笔记",
        description: "高等数学和线性代数相关内容",
        noteCount: 2,
        updatedAtText: "今天",
        cardStyle: {
            borderColor: "#dce3f4",
            background: "linear-gradient(145deg, #ffffff 0%, #f7f9ff 85%)",
            boxShadow: "0 14rpx 34rpx rgba(70, 90, 132, 0.13)",
        },
        tagStyle: {
            background: "#eaf0ff",
        },
        auraStyle: {
            background:
                "radial-gradient(circle at center, rgba(111, 135, 255, 0.16) 0%, rgba(111, 135, 255, 0) 65%)",
        },
    },
    {
        id: 2,
        title: "编程学习",
        description: "Web开发、算法和数据结构",
        noteCount: 1,
        updatedAtText: "今天",
        cardStyle: {
            borderColor: "#dbe6fb",
            background: "linear-gradient(145deg, #ffffff 0%, #f2f8ff 85%)",
            boxShadow: "0 14rpx 34rpx rgba(67, 107, 169, 0.14)",
        },
        tagStyle: {
            background: "#e5f0ff",
        },
        auraStyle: {
            background:
                "radial-gradient(circle at center, rgba(82, 143, 255, 0.2) 0%, rgba(82, 143, 255, 0) 65%)",
        },
    },
    {
        id: 3,
        title: "英语笔记",
        description: "词汇、语法和阅读材料",
        noteCount: 1,
        updatedAtText: "今天",
        cardStyle: {
            borderColor: "#e0e3f8",
            background: "linear-gradient(145deg, #ffffff 0%, #f8f8ff 85%)",
            boxShadow: "0 14rpx 34rpx rgba(96, 96, 162, 0.12)",
        },
        tagStyle: {
            background: "#ecebff",
        },
        auraStyle: {
            background:
                "radial-gradient(circle at center, rgba(143, 120, 255, 0.16) 0%, rgba(143, 120, 255, 0) 65%)",
        },
    },
];
</script>

<style scoped>
.container {
    position: relative;
    min-height: 100vh;
    box-sizing: border-box;
    background: #fff9f2;
    padding: 26rpx 20rpx calc(46rpx + env(safe-area-inset-bottom));
    overflow: hidden;
    font-family: "HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.bg-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
}

.blob-1 {
    width: 360rpx;
    height: 360rpx;
    top: -110rpx;
    right: -90rpx;
    background: radial-gradient(circle, rgba(255, 211, 158, 0.34) 0%, rgba(255, 211, 158, 0) 68%);
}

.blob-2 {
    width: 300rpx;
    height: 300rpx;
    left: -120rpx;
    top: 280rpx;
    background: radial-gradient(circle, rgba(173, 196, 255, 0.24) 0%, rgba(173, 196, 255, 0) 70%);
}

.hero {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16rpx;
    margin: 4rpx 6rpx 26rpx;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 14rpx;
}

.section-dot {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    background: #4d62ff;
    box-shadow: 0 0 0 8rpx rgba(77, 98, 255, 0.12);
    flex-shrink: 0;
}

.section-title {
    font-size: 44rpx;
    color: #1a2540;
    font-weight: 700;
    letter-spacing: 0.8rpx;
}

.hero-subtitle {
    margin-top: 14rpx;
    display: block;
    font-size: 27rpx;
    color: #6e7791;
    line-height: 1.45;
}

.hero-stat {
    flex-shrink: 0;
    background: #ffffff;
    border-radius: 24rpx;
    border: 2rpx solid #e8e3db;
    padding: 12rpx 18rpx;
    box-shadow: 0 8rpx 20rpx rgba(137, 112, 84, 0.1);
    display: flex;
    align-items: baseline;
    gap: 6rpx;
    margin-top: 2rpx;
}

.hero-stat-value {
    font-size: 38rpx;
    color: #354b91;
    font-weight: 700;
}

.hero-stat-label {
    font-size: 24rpx;
    color: #7f8798;
}

.card-list {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22rpx;
}

.notebook-card {
    position: relative;
    border-radius: 34rpx;
    border: 2rpx solid #d5ddf0;
    padding: 24rpx;
    min-height: 360rpx;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: card-enter 0.5s ease both;
}

.notebook-card:active {
    transform: scale(0.985);
}

.card-aura {
    position: absolute;
    width: 320rpx;
    height: 320rpx;
    right: -70rpx;
    top: -120rpx;
}

.card-top {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
}

.edit-btn {
    position: absolute;
    top: 18rpx;
    right: 18rpx;
    z-index: 3;
    width: 52rpx;
    height: 52rpx;
    border-radius: 50%;
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.92) 0%, rgba(241, 247, 255, 0.92) 100%);
    border: 1rpx solid rgba(129, 149, 192, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 16rpx rgba(91, 108, 146, 0.2);
}

.edit-btn:active {
    transform: scale(0.93);
    box-shadow: 0 4rpx 10rpx rgba(91, 108, 146, 0.18);
}

.count-tag {
    padding: 8rpx 18rpx;
    border-radius: 999rpx;
    border: 1rpx solid rgba(108, 127, 171, 0.18);
}

.count-text {
    font-size: 23rpx;
    color: #3f56c9;
    font-weight: 600;
}

.card-content {
    position: relative;
    z-index: 1;
    margin-top: 18rpx;
}

.book-title {
    display: block;
    font-size: 36rpx;
    color: #16233e;
    font-weight: 700;
    line-height: 1.4;
}

.book-desc {
    margin-top: 12rpx;
    font-size: 27rpx;
    color: #5f6f8a;
    line-height: 1.52;
    display: block;
    min-height: 80rpx;
}

.card-footer {
    position: relative;
    z-index: 1;
    margin-top: auto;
    padding-top: 14rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.footer-text {
    font-size: 24rpx;
    color: #747f93;
}

.footer-line {
    width: 1rpx;
    height: 22rpx;
    background: #c9d1df;
    margin: 0 2rpx 0 4rpx;
}

.footer-hint {
    font-size: 22rpx;
    color: #8f96a6;
}

.create-card {
    background: #fff9f2 !important;
    border: 4rpx dashed #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.create-card:active {
    border-color: #999;
    background: #f9f9f9 !important;
}

.create-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20rpx;
}

.create-icon-wrapper {
    width: 120rpx;
    height: 120rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.create-icon {
    width: 100rpx;
    height: 100rpx;
    background: #efe9d7;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.create-card:active .create-icon {
    background: #e0e0e0;
    transform: scale(0.95);
}

.create-text {
    color: #999;
    font-size: 28rpx;
    font-weight: 500;
}

@keyframes card-enter {
    from {
        opacity: 0;
        transform: translateY(12rpx);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (min-width: 760px) {
    .container {
        padding-left: 34rpx;
        padding-right: 34rpx;
    }

    .card-list {
        max-width: 920rpx;
        margin: 0 auto;
        gap: 26rpx;
    }

    .hero {
        max-width: 920rpx;
        margin-left: auto;
        margin-right: auto;
    }
}
</style>
