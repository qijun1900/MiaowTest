<template>
    <view class="container">
        <!-- 固定头部 -->
        <view 
        class="fixed-header" 
        :style="{ top: navBarInfo.totalHeight + 'px' }">
            <!-- 切换按钮 -->
            <view class="switch-container">
                <view 
                    class="switch-button" 
                    :class="{ active: currentType === 'default' }"
                    @click="switchBookType('default')"
                >
                    <text class="switch-text">系统词书</text>
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
        </view>

        <!-- 词书列表 -->
        <view 
        class="books-list" >
            <!-- 加载中 -->
            <ThemeLoading v-if="loading" text="正在加载中..." />
            <view 
                class="book-item" 
                v-for="(book, index) in currentBooks" 
                :key="index" 
                v-else
                >
                <view v-if="book._id === wordBook_id" class="reciting-mark">正在背诵</view>
                <image 
                :src="book.cover ? baseImageUrl + book.cover : 'https://camo.githubusercontent.com/6aee9290f9f24d62fd55c02efbd8e5b36d0cdbce43bce50f6e281b42f41b208a/68747470733a2f2f6e6f732e6e6574656173652e636f6d2f79647363686f6f6c2d6f6e6c696e652f31343936363332373237323030434554346c75616e5f312e6a7067'" class="book-image"></image>
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
        <dragButton
            butColor="#ffffff"
            :show=" isShowdragButton"
            :isDock="true"
            :existTabBar="true" 
            iconType="folder-add-filled"
            iconColor="#ff9800"
            :bottomOffset="100"
            :popMenu="false"
            @btnClick="handleBtnClick"
        />
    </view>
    <!-- 底部弹出框 -->
    <uviewPopup
        v-model:show="popupShow"
        title="创建新词书" 
        :closeable="false">
        <template #popupcontent>
            <view class="popup-content">
                <view class="form-item">
                    <view class="form-item-header">
                        <uni-icons type="compose" size="22" color="#0984e3"></uni-icons>
                        <text class="form-label">词书名称</text>
                    </view>
                    <input
                        v-model="createForm.title"
                        class="form-input"
                        placeholder="例如：高频3500词~"
                        placeholder-class="placeholder-style"
                        :maxlength="20"
                    />
                    <view class="input-counter">
                        <text class="counter-text">{{ createForm.title.length }}/20</text>
                    </view>
                </view>

                <view class="form-item">
                    <view class="form-item-header">
                        <uni-icons type="image" size="22" color="#0984e3"></uni-icons>
                        <text class="form-label">选择封面</text>
                    </view>
                    <scroll-view 
                        class="cover-scroll" 
                        scroll-x="true" 
                        :show-scrollbar="false">
                        <view class="cover-list">
                            <view
                                v-for="item in coverOptions"
                                :key="item._id"
                                class="cover-item"
                                :class="{ active: createForm.coverId === item._id }"
                                @click="selectCover(item._id)"
                            >
                                <image
                                    class="cover-image" 
                                    :src="item.url"
                                    mode="aspectFill"
                                />
                            </view>
                        </view>
                    </scroll-view>
                </view>

                <view class="action-buttons">
                    <view class="action-btn cancel-btn" @click="handleCreateCancel">取消</view>
                    <view class="action-btn save-btn" @click="handleCreateSave">创建词书</view>
                </view>
            </view>
        </template>
    </uviewPopup>
</template>
<script setup>
import { onMounted, ref, computed } from 'vue';
 import { getWordBooksAPI } from '../../../API/Vocabulary/WordBooksAPI';
import ThemeLoading from '../../../components/core/ThemeLoading.vue';
import navBarHeightUtil from '../../../util/navBarHeight';
import dragButton from '../../../components/plug-in/drag-button/drag-button.vue';
import uviewPopup from '../../../components/core/uviewPopup.vue';
import { checkWordRember } from '../../../API/Vocabulary/WordRemberAPI';
import { getResourceList } from '../../../API/Resource/FetchAPI';

const defaultBooks = ref([]);
const currentType = ref('user'); // 'default' 或 'user'
const loading = ref(false);
const UserWordBooks = ref([]);
const navBarInfo = ref({});
const popupShow = ref(false);
const wordBook_id = ref('');
const createForm = ref({
    title: '',
    coverId: ''
});
const coverOptions = ref([]);


// 计算当前显示的词书列表
const currentBooks = computed(() => {
    return currentType.value === 'user' ? UserWordBooks.value: defaultBooks.value ;
});


// 是否显示拖拽按钮
const isShowdragButton = computed(() => {
    return currentType.value === 'user' && !loading.value && !popupShow.value;
});

// 获取词书
const fetchWordBooks = async () => {
    loading.value = true;
    try {
        const response = await getWordBooksAPI();
        if (response.code == 200) {
            defaultBooks.value = response.data.wordBooks;
            loading.value = false;
        }
    } catch (error) {
        console.error("Error fetching word books:", error);
        loading.value = false;
    }
};

//检查当前选择的词书
const checkCurrentWordBook = async () => {
    try {
        const response = await checkWordRember();
        if (response.code === 200) {
           const {currentBook_id} = response.data;
           wordBook_id.value = currentBook_id;
        }
    } catch (error) {
        console.error("Error checking current word book:", error);
    }
}

//切换词书类型 
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

const handleBtnClick = () => {
  popupShow.value = true;
    //获取图片资源
    getResourceList({ tag: 'bookcover' }).then(res => {
        if (res.code === 200) {
            coverOptions.value = res.data;
        }
    }).catch(err => {
        console.error("Error fetching resource list:", err);
    });
}

const selectCover = (coverId) => {
    createForm.value.coverId = coverId;
}

const handleCreateCancel = () => {
    popupShow.value = false;
}

const handleCreateSave = () => {
    const title = createForm.value.title.trim();
    if (!title) {
        uni.showToast({
            title: '请输入词书名称',
            icon: 'none'
        });
        return;
    }
    uni.showToast({
        title: '已保存创建信息',
        icon: 'success'
    });
    popupShow.value = false;
}

// 查看所有单词
const viewAllWords = (book) => {
    // 触发触觉反馈
    uni.vibrateShort({
        type: 'medium'
    });
    
    uni.navigateTo({
        url: `/pages/tools/WordsToolView_children/wordListView?bookId=${book.bookId}`
    });
};

// 加载用户偏好
const loadUserPreference = () => {
    try {
        // 将本地存储的 wordBookType 设置为 ' default' 或 'user'
        uni.setStorageSync('wordBookType', 'user');
        currentType.value = 'user';
    } catch (error) {
        console.error("Error loading user preference:", error);
    }
};

onMounted(() => {
    // 获取导航栏高度信息
    navBarInfo.value = navBarHeightUtil.getNavBarInfo();
    
    // 加载用户偏好
    loadUserPreference();
    
    // 获取默认词书
    fetchWordBooks();


    //检查当前选择的词书
    checkCurrentWordBook();
});
</script>
<style scoped>
.container {
    padding: 0;
    background-color: #f0f8ff;
    min-height: 100vh;
}
/* ========== 固定头部区域 ========== */
.fixed-header {
  position: sticky;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: #f0f8ff;
  padding: 24rpx 32rpx;
}

/* 切换按钮容器 */
.switch-container {
    display: flex;
    background-color: #ffffff;
    border-radius: 24rpx;
    padding: 8rpx;
    margin-bottom: 0;
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
    margin-top: 24rpx;
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
    padding: 0 32rpx 32rpx 40rpx;
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
    overflow: hidden;
}

.reciting-mark {
    position: absolute;
    top: 0;
    right: 0;
    background-color: #f0be0a;
    color: #ffffff;
    font-size: 24rpx;
    padding: 8rpx 16rpx;
    border-bottom-left-radius: 20rpx;
    font-weight: bold;
    z-index: 10;
    box-shadow: -2rpx 2rpx 4rpx rgba(0,0,0,0.1);
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

/* 创建词书弹窗 */
.popup-content {
    padding: 8rpx 8rpx 20rpx;
}

.form-item {
    background-color: #ffffff;
    border-radius: 20rpx;
    padding: 24rpx;
    border: 2rpx solid #dfe6e9;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 0 #dfe6e9;
    overflow: hidden;
}

.cover-scroll {
    width: 100%;
    overflow: hidden;
}

.form-item-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 16rpx;
}

.form-label {
    font-size: 28rpx;
    font-weight: 700;
    color: #2d3436;
}

.form-input {
    background-color: #f7fbff;
    border-radius: 16rpx;
    padding: 18rpx 20rpx;
    font-size: 28rpx;
    color: #2d3436;
    border: 2rpx solid #dfe6e9;
}

.placeholder-style {
    color: #b2bec3;
}

.input-counter {
    text-align: right;
    margin-top: 10rpx;
}

.counter-text {
    font-size: 24rpx;
    color: #b2bec3;
}


.cover-list {
    display: inline-flex;
    flex-direction: row;
    gap: 16rpx;
    width: auto;
    padding: 6rpx 4rpx 10rpx;
}

.cover-item {
    flex: 0 0 auto;
    width: 180rpx;
    background-color: #f7fbff;
    border-radius: 18rpx;
    padding: 10rpx;
    border: 2rpx solid #dfe6e9;
    transition: all 0.2s ease;
}

.cover-item.active {
    border-color: #0984e3;
    box-shadow: 0 6rpx 0 #74b9ff;
    transform: translateY(-2rpx);
}

.cover-image {
    width: 100%;
    height: 240rpx;
    border-radius: 12rpx;
    object-fit: cover;
    display: block;
}

.action-buttons {
    display: flex;
    gap: 16rpx;
    margin-top: 12rpx;
}

.action-btn {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    border-radius: 18rpx;
    font-size: 28rpx;
    font-weight: 700;
}

.cancel-btn {
    background-color: #ffffff;
    color: #636e72;
    border: 2rpx solid #dfe6e9;
}

.save-btn {
    background: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%);
    color: #ffffff;
    border: 2rpx solid #0652DD;
    box-shadow: 0 6rpx 0 #0652DD;
}
</style>
