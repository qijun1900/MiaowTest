<template>
  <view class="container">
    <view class="calendar-section">
      <lxCalendar 
        :value="initialDate"
        :dot_lists="dotDates"
        @change="handleChange"
      />
    </view>
    <!-- 添加按钮 -->
    <dragButton
      :isDock="true"
      :existTabBar="true"
      iconType="plusempty"
      :bottomOffset="100"
      :popMenu="false"
      @btnClick="handleBtnClick"
    />
  <!-- 弹窗 -->
    <uviewPopup
      :closeable="false"
      v-model:show="popupShow"
      :title="'新建' + selectedDate + '-TODO'">
      <template #popupcontent>
        <view class="popup-container">
          <!-- 表单内容区域 -->
          <view class="form-content">
            <!-- 代办标题输入 -->
            <view class="form-item">
              <view class="head-title-container">
                <up-icon name="edit-pen" color="#007aff" size="25"></up-icon>
                <text class="form-label">代办标题</text>
              </view>
              
              <input 
                v-model="todoForm.title"
                class="form-input"
                placeholder="请输入代办事项标题"
                placeholder-class="placeholder-style"
                @focus="handleInputFocus('title')"
                @blur="handleInputBlur('title')"
              />
              <text v-if="errors.title" class="error-text">{{ errors.title }}</text>
            </view>

            <!-- 代办描述 -->
            <view class="form-item">
              <view class="head-title-container">
                <up-icon name="order" color="#007aff" size="25"></up-icon>
                <text class="form-label"> 详细描述</text>
              </view>
              <textarea 
                v-model="todoForm.description"
                class="form-textarea"
                placeholder="请输入详细的代办描述（可选）"
                placeholder-class="placeholder-style"
                :maxlength="200"
                @focus="handleInputFocus('description')"
                @blur="handleInputBlur('description')"
              />
              <view class="textarea-counter">
                <text class="counter-text">{{ todoForm.description.length }}/200</text>
              </view>
            </view>

          <!-- 操作按钮区域 -->
          <view class="action-buttons">
            <up-button 
              class="action-btn cancel-btn"
              :plain="true"
              @click="handleCancel"
            >
              取消
            </up-button>
            <up-button 
              class="action-btn save-btn"
              type="primary"
              :loading="isSaving"
              @click="handleSave"
            >
              {{ isSaving ? '保存中...' : '保存' }}
            </up-button>
          </view>
          </view>
        </view>
      </template>
    </uviewPopup>
  </view>
</template>

<script setup>
import lxCalendar from '../../components/lx-calendar/lx-calendar.vue';
import { ref, onMounted } from 'vue';
import getTodayDate from '../../util/getTodayDate';
import dragButton from '../../components/plug-in/drag-button/drag-button.vue';
import uviewPopup from '../../components/core/uviewPopup.vue';

// 初始日期设置为今天
const initialDate = ref(getTodayDate());
const dotDates = ref([getTodayDate()]);// 下方显示圆点的日期
const popupShow = ref(false);
// 选中的日期
const selectedDate = ref('');
// 表单数据
const todoForm = ref({
  title: '',
  description: ''
});
// 表单验证错误
const errors = ref({
  title: ''
});
// 保存状态
const isSaving = ref(false);
// 输入框焦点状态
const inputFocus = ref({
  title: false,
  description: false
});

const handleChange = (e) => {
  console.log('日期改变:', e);
  selectedDate.value = e.fulldate;
  console.log('选中日期:', selectedDate.value);
}

const handleBtnClick = () => {
  popupShow.value = true;
}

// 表单事件处理
const handleInputFocus = (field) => {
  inputFocus.value[field] = true;
};

const handleInputBlur = (field) => {
  inputFocus.value[field] = false;
  // 移除对应字段的错误
  if (errors.value[field]) {
    errors.value[field] = '';
  }
};

// 表单验证
const validateForm = () => {
  errors.value = { title: '' };
  let isValid = true;

  if (!todoForm.value.title.trim()) {
    errors.value.title = '请输入代办标题';
    isValid = false;
  } else if (todoForm.value.title.trim().length > 50) {
    errors.value.title = '标题不能超过50个字符';
    isValid = false;
  }

  return isValid;
};

// 保存代办
const handleSave = async () => {
  if (!validateForm()) {
    return;
  }

  isSaving.value = true;
  
  try {
    // TODO: 这里后续添加API调用
    console.log('保存代办数据:', {
      date: selectedDate.value,
      ...todoForm.value
    });
    
    // 模拟保存延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 保存成功后关闭弹窗
    popupShow.value = false;
    resetForm();
    
    uni.showToast({
      title: '代办事项已保存',
      icon: 'success'
    });
  } catch (error) {
    console.error('保存失败:', error);
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'error'
    });
  } finally {
    isSaving.value = false;
  }
};

// 取消操作
const handleCancel = () => {
  popupShow.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  todoForm.value = {
    title: '',
    description: ''
  };
  errors.value = { title: '' };
};
onMounted(() => {
  // 初始化时也设置选中日期为今天
  selectedDate.value = initialDate.value;
  console.log('初始化日期:', initialDate.value);
})
</script>

<style scoped>
.container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.calendar-section {
  margin-bottom: 40rpx;
}

/* 弹窗样式 */
.popup-container {
  padding: 40rpx 30rpx 10rpx 30rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%);
  border-radius: 24rpx 24rpx 0 0;
  position: relative;
}

/* 表单内容区域 */
.form-content {
  margin-bottom: 20rpx;
}

.form-item {
  margin-bottom: 20rpx;
  position: relative;
}
.head-title-container{
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 13rpx;
}

.form-label {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
}

/* 输入框样式 */
.form-input {
  width: 100%;
  height: 96rpx;
  background: #ffffff;
  border: 2rpx solid #e1e5e9;
  border-radius: 16rpx;
  padding: 0 10rpx;
  font-size: 30rpx;
  color: #1a1a1a;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.form-input:focus {
  border-color: #007aff;
  background: #f8f9ff;
  box-shadow: 0 4rpx 20rpx rgba(0, 122, 255, 0.15);
  transform: translateY(-2rpx);
}

.placeholder-style {
  color: #959595;
  font-weight: normal;
}

/* 文本域样式 */
.form-textarea {
  width: 100%;
  height: 180rpx;
  background: #ffffff;
  border: 2rpx solid #e1e5e9;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 30rpx;
  color: #1a1a1a;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  resize: none;
}

.form-textarea:focus {
  border-color: #007aff;
  background: #f8f9ff;
  box-shadow: 0 4rpx 20rpx rgba(0, 122, 255, 0.15);
}

.textarea-counter {
  text-align: right;
  margin-top: 10rpx;
}

.counter-text {
  font-size: 24rpx;
  color: #8a8a8a;
}

/* 错误提示 */
.error-text {
  display: block;
  color: #ff4757;
  font-size: 24rpx;
  margin-top: 12rpx;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8rpx); }
  75% { transform: translateX(8rpx); }
}

/* 操作按钮区域 */
.action-buttons {
  display: flex;
  gap: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  flex: 1;
  height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transition: all 0.3s ease;
  transform: translate(-50%, -50%);
}

.action-btn:active::before {
  width: 300rpx;
  height: 300rpx;
}

.cancel-btn {
  background: #f8f9fa !important;
  color: #666 !important;
  border: 2rpx solid #e1e5e9 !important;
}

.cancel-btn:hover {
  background: #e9ecef !important;
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.save-btn {
  background: linear-gradient(135deg, #007aff, #0056d3) !important;
  border: none !important;
  box-shadow: 0 4rpx 20rpx rgba(0, 122, 255, 0.3);
}

.save-btn:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 32rpx rgba(0, 122, 255, 0.4);
}

.save-btn:active {
  transform: translateY(0);
  box-shadow: 0 2rpx 12rpx rgba(0, 122, 255, 0.3);
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .popup-container {
    padding: 30rpx 20rpx 20rpx;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 16rpx;
  }
  
  .action-btn {
    height: 88rpx;
  }
}

/* 微交互动画 */
.form-item {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-item:nth-child(1) { animation-delay: 0.1s; }
.form-item:nth-child(2) { animation-delay: 0.2s; }

</style>