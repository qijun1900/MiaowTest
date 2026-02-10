<template>
  <view class="container">
    <!-- 加载中状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner">
        <view class="spinner-circle"></view>
      </view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 错题本列表 -->
    <view class="book-list" v-else>
      <view 
        class="book-card" 
        v-for="book in wrongBooks" 
        :key="book.id"
        :style="{ backgroundColor: book.color }"
        @click="handleOpenQuestionList(book)"
      >
        <!-- 顶部菜单 -->
        <view class="card-header" >
          <view class="menu-icon" @click.stop="handleOpenEdit(book)">
            <uni-icons type="more-filled" size="20" color="#fff"></uni-icons>
          </view>
        </view>

        <!-- 科目名称 -->
        <view class="subject-name">{{ book.title }}</view>

        <!-- 年份 -->
        <view class="year">
          <uni-icons type="calendar" size="16" color="rgba(255, 255, 255, 0.9)"></uni-icons>
          <text>{{ formatTime.getTime2(book.updatedAt) }}</text>
        </view>

        <!-- 底部统计信息 -->
        <view class="card-footer">
          <view class="stats-item">
            <uni-icons type="list" size="16" color="rgba(255, 255, 255, 0.9)"></uni-icons>
            <text class="stats-text">{{ book.count }} 题</text>
          </view>
        </view>
      </view>

      <!-- 新建错题本卡片 -->
      <view 
        class="book-card create-card" 
        @click="handleCreateBook">
        <view class="create-content">
          <view class="create-icon-wrapper">
            <view class="create-icon">
              <uni-icons type="plus" size="40" color="#999"></uni-icons>
            </view>
          </view>
          <view class="create-text">新建错题本</view>
        </view>
      </view>
    </view>
    <!-- 弹窗 -->
    <uviewPopup
      v-model:show="popupShow"
      title="创建错题本"  
      :closeable="true"
      @close="handleClosePopup">
      <template #popupcontent>
        <view class="form-container">
          <!-- 错题本名称 -->
          <view class="form-item">
            <view class="form-label">
              错题本名称
              <text class="required">*</text>
            </view>
            <view class="input-wrapper" :class="{ 'has-error': validationErrors.title }">
              <uni-icons 
                type="compose" 
                size="18" 
                :color="validationErrors.title ? '#f44336' : '#999'"
              ></uni-icons>
              <input 
                class="form-input" 
                :class="{ 'is-error': validationErrors.title }"
                v-model="formData.title" 
                placeholder="请输入错题本名称（最多20个字）"
                maxlength="20"
                @input="handleTitleInput"
              />
              <text class="char-count">{{ formData.title.length }}/20</text>
            </view>
            <view v-if="validationErrors.title" class="form-error">
              <uni-icons type="info-filled" size="14" color="#f44336"></uni-icons>
              <text>{{ validationErrors.title }}</text>
            </view>
          </view>

          <!-- 颜色选择 -->
          <view class="form-item">
            <view class="form-label">
              选择颜色
              <text class="required">*</text>
            </view>
            <view class="color-picker-wrapper">
              <scroll-view class="color-scroll" scroll-x>
                <view class="color-list">
                  <view 
                    class="color-item" 
                    v-for="color in displayColorOptions" 
                    :key="color"
                    :style="{ backgroundColor: color }"
                    :class="{ active: formData.color === color }"
                    @click="selectColor(color)"
                  >
                    <view class="color-check" v-if="formData.color === color">
                      <uni-icons type="checkmarkempty" size="16" color="#fff"></uni-icons>
                    </view>
                  </view>
                </view>
              </scroll-view>
            </view>
          </view>

          <!-- 按钮组 -->
          <view class="form-actions">
            <button class="btn btn-cancel" :disabled="submitting" @click="handleClosePopup">
              <uni-icons type="closeempty" size="16" color="#666"></uni-icons>
              取消
            </button>
            <button class="btn btn-submit" :disabled="submitting" :class="{ 'btn-loading': submitting }" @click="handleSubmit">
              <view v-if="submitting" class="btn-spinner">
                <view class="spinner-circle-small"></view>
              </view>
              <uni-icons v-else type="checkmarkempty" size="16" color="#fff"></uni-icons>
              {{ submitting ? '创建中...' : '创建' }}
            </button>
          </view>
        </view>
      </template>
    </uviewPopup>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import uviewPopup from '../../components/core/uviewPopup.vue';
import { createWrongBookAPI ,getWrongBooksAPI } from '../../API/Tools/WrongBookAPI';
import formatTime from '../../util/formatTime';
import { wrongBookColors, generateDisplayColorList } from '../../util/wrongBookColors';

const popupShow = ref(false);

// 表单数据
const formData = ref({
  title: '',
  color: '#4CAF50'
});

const validationErrors = ref({
  title: ''
});

const wrongBooks = ref([])

// loading 状态
const loading = ref(false)
const submitting = ref(false)

// 显示的颜色选项（会在第一个位置放随机颜色）
const displayColorOptions = ref([...wrongBookColors])

// 创建新错题本
const handleCreateBook = () => {
  const { randomColor, displayColors } = generateDisplayColorList()
  // 设置显示的颜色列表（随机颜色在最前面）
  displayColorOptions.value = displayColors
  // 设置表单默认颜色为随机颜色
  formData.value.color = randomColor
  popupShow.value = true;
}

// 选择颜色
const selectColor = (color) => {
  formData.value.color = color;
}

const handleTitleInput = () => {
  if (validationErrors.value.title) {
    validationErrors.value.title = '';
  }
}

// 关闭弹窗
const handleClosePopup = () => {
  popupShow.value = false;
  // 重置表单
  formData.value = {
    title: '',
    color: '#4CAF50'
  };
  // 重置颜色选项
  displayColorOptions.value = [...wrongBookColors]
  validationErrors.value = {
    title: ''
  };
}

// 提交表单
const handleSubmit = async () => {
  // 验证表单
  if (!formData.value.title.trim()) {
    validationErrors.value.title = '请输入错题本名称';
    return;
  }

  submitting.value = true
  try {
    await createWrongBookAPI({
      title: formData.value.title,
      color: formData.value.color
    })
    uni.showToast({
      title: '创建成功',
      icon: 'success'
    });
    await fetchWrongBooks(); // 刷新错题本列表
    handleClosePopup();
  } catch (error) {
    uni.showToast({
      title: '创建失败，请重试',
      icon: 'error'
    });
    console.error('创建错题本失败:', error);
  } finally {
    submitting.value = false
  }
}

// 获取错题本列表
const fetchWrongBooks = async () => {
  loading.value = true
  try {
    const res = await getWrongBooksAPI();
    wrongBooks.value = res.data;
  } catch (error) {
    uni.showToast({
      title: '获取错题本失败',
      icon: 'error'
    });
    console.error('获取错题本失败:', error);
  } finally {
    loading.value = false
  }
}

// 打开编辑页面
const handleOpenEdit = (book) => {
  uni.navigateTo({
    url: `/pages/tools/WrongBookToolView_children/WrongBookEditView?id=${book._id}`
  });
}

// 跳转到错题列表页面
const handleOpenQuestionList = (book) => {
  uni.navigateTo({
    url: `/pages/tools/WrongBookToolView_children/WrongQuestionListView?id=${book._id}`
  });
}

onShow(() => {
  fetchWrongBooks();
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #fff9f2;
  padding: 30rpx 20rpx;
}

.book-list {  
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.book-card {
  border-radius: 28rpx;
  padding: 32rpx 28rpx;
  position: relative;
  height: 390rpx;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
}

.book-card::before {
  position: absolute;
  top: 0;
  right: 0;
  width: 200rpx;
  height: 200rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(50%, -50%);
}

.book-card:active {
  transform: scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 24rpx;
  position: relative;
  z-index: 1;
}

.menu-icon {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10rpx);
  transition: all 0.2s ease;
}

.menu-icon:active {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(0.95);
}

.subject-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 32rpx;
  backdrop-filter: blur(10rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.subject-name {
  color: #fff;
  font-size: 38rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
  line-height: 1.4;
  position: relative;
  z-index: 1;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.year {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: rgba(255, 255, 255, 0.95);
  font-size: 26rpx;
  margin-bottom: auto;
  position: relative;
  z-index: 1;
}

.card-footer {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stats-text {
  color: rgba(255, 255, 255, 0.95);
  font-size: 28rpx;
  font-weight: 500;
}

/* 新建错题本卡片 */
.create-card {
  background:#fff9f2 !important;
  border: 4rpx dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-card::before {
  display: none;
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

/* 表单样式 */
.form-container {
  padding: 50rpx 40rpx;
}

.form-item {
  margin-bottom: 50rpx;
}

.form-label {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.required {
  color: #f44336;
  margin-left: 8rpx;
  font-weight: normal;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 0 20rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  background: #fff;
  border-color: #4CAF50;
  box-shadow: 0 0 0 4rpx rgba(76, 175, 80, 0.1);
}

.input-wrapper.has-error {
  background: #fff;
  border-color: #f44336;
  box-shadow: 0 0 0 4rpx rgba(244, 67, 54, 0.1);
}

.form-input {
  flex: 1;
  height: 88rpx;
  padding: 0 16rpx;
  font-size: 30rpx;
  color: #333;
  box-sizing: border-box;
  border: none;
  background: transparent;
}

.form-input.is-error {
  color: #f44336;
}

.char-count {
  font-size: 24rpx;
  color: #999;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #f44336;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 颜色选择 */
.color-picker-wrapper {
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 10rpx;
}

.color-scroll {
  width: 100%;
  white-space: nowrap;
}

.color-list {
  display: inline-flex;
  gap: 20rpx;
  padding: 10rpx 10rpx;
}

.color-item {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
  border: 4rpx solid transparent;
}

.color-item.active {
  transform: scale(1.1);
  border-color: #fff;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.25);
}

.color-check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36rpx;
  height: 36rpx;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 按钮组 */
.form-actions {
  display: flex;
  gap: 30rpx;
  margin-top: 60rpx;
  padding-top: 40rpx;
  border-top: 2rpx solid #f0f0f0;
}

.btn {
  flex: 1;
  height: 96rpx;
  border-radius: 48rpx;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.btn-cancel {
  background: linear-gradient(135deg, #f5f5f5 0%, #ebebeb 100%);
  color: #666;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.btn-cancel:active {
  background: linear-gradient(135deg, #e8e8e8 0%, #ddd 100%);
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.btn-submit {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(76, 175, 80, 0.35);
}

.btn-submit:active {
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(76, 175, 80, 0.25);
}

.btn-submit:disabled,
.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  background: linear-gradient(135deg, #81C784 0%, #66BB6A 100%) !important;
}

/* Loading 样式 */
.loading-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff9f2;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  position: relative;
}

.spinner-circle {
  width: 100%;
  height: 100%;
  border: 6rpx solid #e0e0e0;
  border-top-color: #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.btn-spinner {
  width: 32rpx;
  height: 32rpx;
  margin-right: 8rpx;
}

.spinner-circle-small {
  width: 100%;
  height: 100%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #666;
}
</style>