<template>
    <view class="guide-container">
        <!-- 步骤一：词书选择 -->
        <transition name="fade">
            <view v-if="currentStep === 1" class="step-container step-one">
                <!-- 标题区域 -->
                <view class="header-section">
                    <text class="main-title">选择你想要挑战的词书</text>
                    <text class="sub-title">开启你的词汇进阶之旅</text>
                </view>

                <!-- 词书列表 -->
                <scroll-view class="book-list" scroll-y>
                    <view 
                        v-for="(book, index) in wordBooks" 
                        :key="book._id" 
                        class="book-card"
                        :class="{ 'selected': selectedBook?._id === book._id }"
                        :style="{ animationDelay: `${index * 0.1}s` }" 
                        @click="selectBook(book)">
                        <view class="card-content">
                            <image class="book-cover" 
                            :src="book.cover ? baseImageUrl + book.cover : 'https://camo.githubusercontent.com/6aee9290f9f24d62fd55c02efbd8e5b36d0cdbce43bce50f6e281b42f41b208a/68747470733a2f2f6e6f732e6e6574656173652e636f6d2f79647363686f6f6c2d6f6e6c696e652f31343936363332373237323030434554346c75616e5f312e6a7067'" ></image>
                            <view class="book-info">
                                <text class="book-name">{{ book.title }}</text>
                                <view class="book-tags">                            
                                    <up-tag 
                                    v-for="(tag, tagIndex) in book.tags" 
                                    :key="tagIndex" 
                                    :text="tag" 
                                    plain 
                                    size="mini" 
                                    type="warning" 
                                    plainFill 
                                    style="margin-right: 12rpx;">
                                    </up-tag>
                                </view>
                                <view class="book-count">
                                    <uni-icons type="medal" size="21" color="#f0be0a"></uni-icons>
                                    <text class="count-text">{{ book.words }} 单词</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </scroll-view>
            </view>
        </transition>

        <!-- 步骤二：每日目标设置 -->
        <transition name="slide">
            <view v-if="currentStep === 2" class="step-container step-two">
                <!-- 顶部标题区域 -->
                <view class="header-section">
                    <text class="main-title">设置学习目标</text>
                    <text class="sub-title">量力而行，贵在坚持</text>
                </view>

                <!-- 圆形进度显示 -->
                <view class="goal-display">
                    <view class="circle-wrapper">
                        <view class="circle-bg"></view>
                        <view class="circle-progress" :style="{ transform: `rotate(${progressRotation}deg)` }"></view>
                        <view class="circle-content">
                            <text class="goal-label">每日新词</text>
                            <text class="goal-number">{{ dailyGoal }}</text>
                            <text class="estimate-text">预计 {{ estimatedDays }} 天完成此书</text>
                        </view>
                    </view>
                </view>

                <!-- 预设目标选项 -->
                <view class="preset-options">
                    <view v-for="option in presetOptions" :key="option" class="option-item"
                        :class="{ 'active': dailyGoal === option }" @click="selectGoal(option)">
                        <text class="option-text">{{ option }}词/天</text>
                    </view>
                </view>

                <!-- 滑块调节 -->
                <view class="slider-section">
                    <view class="slider-labels">
                        <text class="label-text">较慢</text>
                        <text class="label-text">较快</text>
                    </view>
                    <slider class="goal-slider" 
                        :value="dailyGoal" 
                        :min="10" 
                        :max="200" 
                        :step="5" 
                        activeColor="#2196F3"
                        backgroundColor="#E0E0E0" 
                        block-size="24" 
                        @change="onSliderChange" />
                    <view class="slider-range">
                        <text class="range-text">10词/日</text>
                        <text class="range-text">200词/日</text>
                    </view>
                </view>

                <!-- 提示信息 -->
                <view class="tip-box">
                    <text class="tip-text">根据您的词书总量，当前计划是一个非常科学的选择。保持每天稳定的学习节奏比偶尔的高强度更有助于长期记忆。您可以随时更改目标。</text>
                </view>
            </view>
        </transition>

        <view class='bottom'>
            <up-button @click="goToStep2" v-if="currentStep === 1" type="primary" :disabled="selectedBook === null"
                :plain="selectedBook === null ? true : false" :icon="selectedBook === null ? '' : 'checkmark'">
                {{ '下一步' }}
            </up-button>
            <view v-if="currentStep === 2" class="step2-buttons">
                <up-button @click="goToStep1" type="primary">
                    {{ ' 上一步' }}
                </up-button>
                <up-button @click="confirmSettings" type="primary">
                    {{ '确认设置' }}
                </up-button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed,onMounted } from 'vue';
import { getWordBooksAPI } from '../../../API/Vocabulary/WordBooksAPI';
import escconfig from '../../../config/esc.config';

// 定义 emit
const emit = defineEmits(['complete']);
// 当前步骤
const currentStep = ref(1);
// 选中的词书
const selectedBook = ref(null);
// 每日目标
const dailyGoal = ref(30);
// 预设选项
const presetOptions = [10, 20, 30, 50];
// 词书列表数据
const wordBooks = ref([]);

const baseImageUrl = computed(() => {
    return escconfig.ossDomain 
})

// 计算预计完成天数
const estimatedDays = computed(() => {
    if (!selectedBook.value ||  !dailyGoal.value) return 0;
    return Math.ceil(selectedBook.value.words / dailyGoal.value);
});

// 计算进度条旋转角度
const progressRotation = computed(() => {
    const percentage = (dailyGoal.value - 5) / (100 - 5);
    return percentage * 270 - 135; // -135度到135度的范围
});

// 获取词书
const fetchWordBooks = async () => {
    try {
        const response = await getWordBooksAPI();
        console.log('获取词书成功:', response);
        wordBooks.value = response.data.wordBooks;
    } catch (error) {
        console.error('获取词书失败:', error);
    } 
};

// 选择词书
const selectBook = (book) => {
    selectedBook.value = book;
    // 添加触觉反馈
    uni.vibrateShort({
        type: 'light'
    });
};

// 前往步骤2
const goToStep2 = () => {
    if (selectedBook.value) {
        currentStep.value = 2;
        // 添加触觉反馈
        uni.vibrateShort({
            type: 'medium'
        });
    }
};

// 返回步骤1
const goToStep1 = () => {
    currentStep.value = 1;
};

// 选择目标
const selectGoal = (goal) => {
    dailyGoal.value = goal;
    // 添加触觉反馈
    uni.vibrateShort({
        type: 'light'
    });
};

// 滑块变化
const onSliderChange = (e) => {
    dailyGoal.value = e.detail.value;
};

// 确认设置
const confirmSettings = () => {
    const settings = {
        book: selectedBook.value,
        goal: dailyGoal.value,
        estimatedDays: estimatedDays.value
    };

    // 触发完成事件
    emit('complete', settings);

    // 显示成功提示
    uni.showToast({
        title: '设置成功',
        icon: 'success',
        duration: 2000
    });

    // 添加触觉反馈
    uni.vibrateShort({
        type: 'heavy'
    });
};
onMounted(() => {
    fetchWordBooks();
});
</script>

<style scoped>
.guide-container {
    min-height: 100vh;
}

/* ========== 过渡动画 ========== */
.fade-enter-active,
.fade-leave-active {
    transition: all 0.4s ease;
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(20rpx);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(-20rpx);
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.slide-leave-to {
    opacity: 0;
    transform: translateX(-100%);
}

.step-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* ========== 步骤一样式 ========== */
.step-one {
    padding: 40rpx 30rpx 0;
}

.header-section {
    text-align: center;
    margin-bottom: 50rpx;
}

.main-title {
    display: block;
    font-size: 48rpx;
    font-weight: 700;
    color: #1A202C;
    margin-bottom: 20rpx;
    line-height: 1.3;
}

.sub-title {
    display: block;
    font-size: 28rpx;
    color: #718096;
    line-height: 1.5;
}

/* 词书列表 */
.book-list {
    flex: 1;
    margin-bottom: 100rpx;
}

.book-card {
    background: #FFFFFF;
    border-radius: 24rpx;
    margin-bottom: 24rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    border: 3rpx solid transparent;
    margin-top: 5rpx;
    margin-left: 10rpx;
    margin-right: 10rpx;
}

.book-card.selected {
    border-color: #2196F3;
    box-shadow: 0 8rpx 24rpx rgba(33, 150, 243, 0.25);
    transform: scale(1.02);
}

.card-content {
    display: flex;
    align-items: center;
    position: relative;
}

.book-cover {
    width: 120rpx;
    height: 160rpx;
    border-radius: 12rpx;
    margin-right: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-size: 48rpx;
    font-weight: bold;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
}

.book-cover::before {
    position: absolute;
    opacity: 0.9;
}

.book-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.book-name {
    font-size: 30rpx;
    font-weight: 600;
    color: #1A202C;
    margin-bottom: 12rpx;
}

.book-tags {
    margin-bottom: 20rpx;
}

.book-count {
    display: flex;
    align-items: center;
}

.count-text {
    font-size: 28rpx;
    color: #2196F3;
    font-weight: 600;
}




/* ========== 步骤二样式 ========== */
.step-two {
    padding: 0;
}

.step-two .header-section {
    margin-top: 20rpx;
    margin-bottom: 60rpx;
}

/* 圆形进度显示 */
.goal-display {
    display: flex;
    justify-content: center;
    margin-bottom: 80rpx;
}

.circle-wrapper {
    position: relative;
    width: 400rpx;
    height: 400rpx;
}

.circle-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #F7FAFC;
    box-shadow:
        inset 0 0 0 20rpx #E2E8F0;
}

.circle-progress {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(from 0deg at 50% 50%,
            #2196F3 0deg,
            #2196F3 135deg,
            transparent 135deg);
    mask: radial-gradient(circle at center,
            transparent 160rpx,
            black 160rpx,
            black 180rpx,
            transparent 180rpx);
    -webkit-mask: radial-gradient(circle at center,
            transparent 160rpx,
            black 160rpx,
            black 180rpx,
            transparent 180rpx);
    transition: transform 0.3s ease;
}

.circle-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.goal-label {
    font-size: 28rpx;
    color: #2196F3;
    margin-bottom: 16rpx;
    font-weight: 500;
}

.goal-number {
    font-size: 120rpx;
    font-weight: 900;
    color: #1A202C;
    line-height: 1;
    margin-bottom: 16rpx;
}

.estimate-text {
    font-size: 26rpx;
    color: #2196F3;
    font-weight: 500;
}

/* 预设选项 */
.preset-options {
    display: flex;
    justify-content: space-between;
    padding: 0 30rpx;
    margin-bottom: 60rpx;
}

.option-item {
    flex: 1;
    margin: 0 8rpx;
    padding: 20rpx 0;
    background: #FFFFFF;
    border-radius: 40rpx;
    text-align: center;
    border: 3rpx solid #E2E8F0;
    transition: all 0.3s ease;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.option-item.active {
    background: linear-gradient(135deg, #FF9800 0%, #FF6F00 100%);
    border-color: #FF9800;
    box-shadow: 0 6rpx 20rpx rgba(255, 152, 0, 0.4);
    transform: scale(1.05);
}

.option-text {
    font-size: 28rpx;
    color: #4A5568;
    font-weight: 600;
}

.option-item.active .option-text {
    color: #FFFFFF;
}

/* 滑块区域 */
.slider-section {
    padding: 0 50rpx;
    margin-bottom: 50rpx;
}

.slider-labels {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
}

.label-text {
    font-size: 26rpx;
    color: #718096;
}

.goal-slider {
    width: 100%;
    margin-bottom: 16rpx;
}

.slider-range {
    display: flex;
    justify-content: space-between;
}

.range-text {
    font-size: 24rpx;
    color: #A0AEC0;
}

/* 提示框 */
.tip-box {
    margin: 0 30rpx 40rpx;
    padding: 30rpx;
    background: rgba(33, 150, 243, 0.08);
    border-radius: 20rpx;
    display: flex;
    align-items: flex-start;
}

.tip-text {
    flex: 1;
    font-size: 26rpx;
    color: #4A5568;
    line-height: 1.6;
}

/* 底部按钮样式 */
.bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 110rpx;
    background-color: #ffffff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30rpx;
    z-index: 100;
    animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.step2-buttons {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20rpx;
    animation: fadeIn 0.6s ease 0.2s backwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.step2-buttons .up-button {
    flex: 1;
    margin: 0 10rpx;
    transition: all 0.3s ease;
}

.step2-buttons .up-button:active {
    transform: scale(0.95);
}

.bottom .up-button {
    transition: all 0.3s ease;
}

.bottom .up-button:active {
    transform: scale(0.95);
}
</style>