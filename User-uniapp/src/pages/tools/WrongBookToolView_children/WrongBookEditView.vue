<template>
  <view class="container">
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner">
        <view class="spinner-circle"></view>
      </view>
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else class="form-container">
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
        <button class="btn btn-delete" :disabled="submitting" @click="handleDelete">
          <uni-icons type="trash" size="18" color="#f44336"></uni-icons>
          删除错题本
        </button>
        <button class="btn btn-submit" :disabled="submitting" :class="{ 'btn-loading': submitting }" @click="handleSubmit">
          <view v-if="submitting" class="btn-spinner">
            <view class="spinner-circle-small"></view>
          </view>
          <uni-icons v-else type="checkmarkempty" size="18" color="#fff"></uni-icons>
          {{ submitting ? '保存中...' : '保存修改' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getWrongBookDetailAPI, updateWrongBookAPI, deleteWrongBookAPI } from '../../../API/Tools/WrongBookAPI';
import { wrongBookColors } from '../../../util/wrongBookColors';

const bookId = ref('');
const loading = ref(true);
const submitting = ref(false);
const displayColorOptions = ref([...wrongBookColors]);

const formData = ref({
  title: '',
  color: ''
});

const validationErrors = ref({
  title: ''
});

onLoad(async (options) => {
  if (options.id) {
    bookId.value = options.id;
    await fetchBookDetails();
  } else {
    uni.showToast({
      title: '参数错误',
      icon: 'error'
    });
    setTimeout(() => uni.navigateBack(), 1500);
  }
});

const fetchBookDetails = async () => {
  loading.value = true;
  try {
    const res = await getWrongBookDetailAPI(bookId.value);
    if (res.data) {
      formData.value.title = res.data.title;
      formData.value.color = res.data.color;
      
      if (!displayColorOptions.value.includes(res.data.color)) {
         displayColorOptions.value = [res.data.color, ...wrongBookColors];
      }
    }
  } catch (error) {
    uni.showToast({
      title: '获取详情失败',
      icon: 'error'
    });
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const selectColor = (color) => {
  formData.value.color = color;
};

const handleTitleInput = () => {
  if (validationErrors.value.title) {
    validationErrors.value.title = '';
  }
};

const handleSubmit = async () => {
  if (!formData.value.title.trim()) {
    validationErrors.value.title = '请输入错题本名称';
    return;
  }

  submitting.value = true;
  try {
    await updateWrongBookAPI({
      id: bookId.value,
      title: formData.value.title,
      color: formData.value.color
    });
    
    uni.showToast({
      title: '修改成功',
      icon: 'success'
    });
    
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    uni.showToast({
      title: '修改失败',
      icon: 'error'
    });
    console.error(error);
  } finally {
    submitting.value = false;
  }
};

const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除这个错题本吗？',
    confirmColor: '#f44336',
    success: async (res) => {
      if (res.confirm) {
        submitting.value = true;
        try {
          await deleteWrongBookAPI(bookId.value);
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (error) {
          uni.showToast({
            title: '删除失败',
            icon: 'error'
          });
          console.error(error);
          submitting.value = false;
        }
      }
    }
  });
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #fff9f2;
  padding: 30rpx 20rpx;
}

.form-container {
  background: #fff;
  border-radius: 28rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
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
  padding: 10rpx;
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
  flex-direction: column;
  gap: 30rpx;
  margin-top: 80rpx;
}

.btn {
  width: 100%;
  height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.btn-delete {
  background: #fff;
  color: #f44336;
  border: 2rpx solid #f44336;
  background: #fff;
}

.btn-delete:active {
  background: #ffebee;
  transform: scale(0.98);
}
.btn-delete uni-icons {
    color: #f44336 !important;
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
.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  background: linear-gradient(135deg, #81C784 0%, #66BB6A 100%) !important;
}

/* Loading 样式 */
.loading-container {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
</style>
