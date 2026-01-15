<template>
<view class="container">
    <view>
        <!-- 切换按钮 -->
        <view class="switch-container">
            <view 
                class="switch-button" 
                :class="{ active: currentType === 'default' }"
                @click="switchBookType('default')"
            >
                <text class="switch-text">默认词书</text>
                <view v-if="currentType === 'default'" class="active-indicator"></view>
            </view>
            <view 
                class="switch-button" 
                :class="{ active: currentType === 'user' }"
                @click="switchBookType('user')"
            >
                <text class="switch-text">我的词书</text>
                <view v-if="currentType === 'user'" class="active-indicator"></view>
            </view>
        </view>

        <!-- 词书头部信息 -->
        <view class="books-header">
            <text class="books-title">{{ currentType === 'default' ? '默认词书' : '我的词书' }}</text>
            <text class="books-count">
                <text class="count-number">{{ currentBooks.length }}</text> 本
            </text>
        </view>

        <!-- 词书列表 -->
        <view class="books-list">
            <!-- 加载中 -->
            <ThemeLoading v-if="loading" text="正在加载中..." />
            <view 
                class="book-item" 
                v-for="(book, index) in currentBooks" 
                :key="index" 
                v-else
                >
                <image :src="book.cover || 'https://camo.githubusercontent.com/6aee9290f9f24d62fd55c02efbd8e5b36d0cdbce43bce50f6e281b42f41b208a/68747470733a2f2f6e6f732e6e6574656173652e636f6d2f79647363686f6f6c2d6f6e6c696e652f31343936363332373237323030434554346c75616e5f312e6a7067'" class="book-image"></image>
                <view class="book-content">
                    <view class="book-info">
                        <text class="book-title">{{ book.title }}</text>
                        <view class="book-words">
                            <uni-icons type="medal" size="21" color="#f0be0a"></uni-icons>
                            <text>{{ book.words }}词</text>
                        </view>
                        <view class="book-tags">
                            <up-tag 
                                v-for="(tag, tagIndex) in book.tags" 
                                :key="tagIndex" 
                                :text="tag" 
                                plain size="mini" 
                                type="warning" plainFill 
                                style="margin-right: 12rpx;">
                            </up-tag>
                        </view>
                    </view>
                    <view class="book-action">
                        <view class="view-words-btn" @click="viewAllWords(book)">
                            <up-icon name="eye" size="32rpx" color="#ffffff"></up-icon>
                            <text class="btn-text">查看单词</text>
                        </view>
                    </view>
                </view>
            </view>
            
            <!-- 空状态 -->
            <view v-if="currentBooks.length === 0 && !loading" class="empty-state">
                <image
                    class="empty-image"
                    src="/static/other/empty.png"
                    mode="aspectFit"
                />
                <text class="empty-text">{{ currentType === 'default' ? '暂无默认词书' : '暂无自定义词书' }}</text>
                <text class="empty-hint">{{ currentType === 'user' ? '快去创建你的第一本词书吧~' : '' }}</text>
            </view>
        </view>
    </view>
</view>
</template>
<script setup>
import { onMounted, ref, computed } from 'vue';
import { getWordBooksAPI } from '../../../API/Vocabulary/WordBooksAPI';
import ThemeLoading from '../../core/ThemeLoading.vue';

const defaultBooks = ref([]);
const userBooks = ref([]);
const currentType = ref('default'); // 'default' 或 'user'
const loading = ref(false);

// 用户词书假数据
const mockUserBooks = [];

// 计算当前显示的词书列表
const currentBooks = computed(() => {
    return currentType.value === 'default' ? defaultBooks.value : userBooks.value;
});

// 获取词书
const fetchWordBooks = async () => {
    loading.value = true;
    try {
        const response = await getWordBooksAPI();
        if (response.code == 200) {
            defaultBooks.value = response.data.wordBooks;
            console.log("Fetched default word books:", defaultBooks.value);
            loading.value = false;
        }

    } catch (error) {
        console.error("Error fetching word books:", error);
    }
};

// 切换词书类型
const switchBookType = (type) => {
    if (currentType.value === type) return;
    
    currentType.value = type;
    // 保存用户偏好到本地存储
    uni.setStorageSync('wordBookType', type);
    
    // 触发反馈
    uni.vibrateShort({
        type: 'medium'
    });
};

// 查看所有单词
const viewAllWords = (book) => {
    console.log('查看词书所有单词:', book);
    
    // 触发触觉反馈
    uni.vibrateShort({
        type: 'medium'
    });
    
    // TODO: 跳转到单词列表页面或显示单词列表
    uni.showToast({
        title: `正在加载《${book.title}》`,
        icon: 'loading',
        duration: 1500
    });

};

// 加载用户偏好
const loadUserPreference = () => {
    try {
        const savedType = uni.getStorageSync('wordBookType');
        if (savedType) {
            currentType.value = savedType;
        }
    } catch (error) {
        console.error("Error loading user preference:", error);
    }
};

onMounted(() => {
    // 加载用户偏好
    loadUserPreference();
    
    // 获取默认词书
    fetchWordBooks();
    
    // 加载用户词书（使用假数据）
    userBooks.value = mockUserBooks;
});
</script>
<style scoped>
.container {
    padding: 32rpx;
    background-color: #f0f8ff;
    min-height: 100vh;
}

/* 切换按钮容器 */
.switch-container {
    display: flex;
    background-color: #ffffff;
    border-radius: 24rpx;
    padding: 8rpx;
    margin-bottom: 32rpx;
    border: 4rpx solid #74b9ff;
    box-shadow: 0 6rpx 0 #0984e3;
}

.switch-button {
    flex: 1;
    padding: 20rpx 0;
    text-align: center;
    border-radius: 20rpx;
    position: relative;
    transition: all 0.3s ease;
}

.switch-button.active {
    background-color: #0984e3;
}

.switch-text {
    font-size: 30rpx;
    font-weight: 700;
    color: #636e72;
    transition: color 0.3s ease;
}

.switch-button.active .switch-text {
    color: #ffffff;
}

.active-indicator {
    position: absolute;
    bottom: 8rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 60rpx;
    height: 6rpx;
    background-color: #ffffff;
    border-radius: 3rpx;
}

/* 词书头部 */
.books-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;
    padding: 24rpx 32rpx;
    background-color: #ffffff;
    border-radius: 24rpx;
    border: 4rpx solid #74b9ff;
    box-shadow: 0 6rpx 0 #0984e3;
}

.books-title {
    font-size: 36rpx;
    font-weight: 900;
    color: #0984e3;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    text-shadow: 2rpx 2rpx 0 #74b9ff;
}

.books-count {
    font-size: 28rpx;
    color: #ffffff;
    background-color: #0984e3;
    padding: 12rpx 28rpx;
    border-radius: 30rpx;
    font-weight: bold;
    box-shadow: 0 4rpx 0 #0652DD;
}

.count-number {
    color: #ffffff;
    font-weight: 900;
    text-shadow: 1rpx 1rpx 0 rgba(0,0,0,0.2);
}

/* 词书列表 */
.books-list {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20rpx);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.book-item {
    display: flex;
    background-color: #ffffff;
    border-radius: 28rpx;
    padding: 32rpx;
    border: 4rpx solid #81c8ec;
    box-shadow: 8rpx 8rpx 0 #00a1ce;
    align-items: flex-start;
    gap: 32rpx;
    margin-bottom: 32rpx;
    position: relative;
}

.book-image {
    width: 180rpx;
    height: 250rpx;
    border-radius: 20rpx;
    object-fit: cover;
    border: 4rpx solid #ffeb69;
    box-shadow: 0 6rpx 0 #e1e1e1;
    flex-shrink: 0;
}

.book-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 250rpx;
}

.book-info {
    flex: 1; 
    display: flex; 
    flex-direction: column;
    gap: 16rpx;
}

.book-title {
    font-size: 30rpx;
    font-weight: 800;
    color: #2d3436;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    letter-spacing: 1rpx;
}

.book-words {
    font-size: 28rpx;
    color: #636e72;
    display: flex;
    align-items: center;
    gap: 8rpx;
    background-color: #e8f4fd;
    padding: 8rpx 16rpx;
    border-radius: 16rpx;
    width: fit-content;
}

.book-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
}

.book-action {
    margin-top: 16rpx;
}

.view-words-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    background: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%);
    padding: 20rpx 32rpx;
    border-radius: 20rpx;
    border: 4rpx solid #0652DD;
    box-shadow: 0 6rpx 0 #0652DD;
    transition: all 0.2s ease;
}

.view-words-btn:active {
    transform: translateY(4rpx);
    box-shadow: 0 2rpx 0 #0652DD;
}


.btn-text {
    font-size: 28rpx;
    font-weight: 700;
    color: #ffffff;
    text-shadow: 1rpx 1rpx 2rpx rgba(0, 0, 0, 0.2);
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 32rpx;
    background-color: #ffffff;
    border-radius: 28rpx;
    border: 4rpx dashed #b2bec3;
}

.empty-icon {
    margin-bottom: 24rpx;
    opacity: 0.5;
}

.empty-text {
    font-size: 32rpx;
    color: #636e72;
    font-weight: 600;
    margin-bottom: 12rpx;
}
.empty-image{
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
}

.empty-hint {
    font-size: 26rpx;
    color: #b2bec3;
}
</style>