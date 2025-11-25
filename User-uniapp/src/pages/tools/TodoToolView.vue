<template>
  <view class="container">
    <view class="calendar-section">
      <lxCalendar 
        :value="initialDate"
        :dot_lists="dotDates"
        @change="handleChange"
      />
    </view>
    <view class="todos-list">
      <!-- Loading 状态 -->
      <view v-if="loading" class="loading-container">
       <ThemeLoading text="正在加载数据..."/>
      </view>
      
      <!-- 空状态 -->
      <view v-else-if="TodayTODOList.length === 0" class="empty-container">
        <up-icon name="calendar" size="80" color="#007aff"></up-icon>
        <text class="empty-title">暂无待办事项</text>
        <text class="empty-desc">点击下方 + 按钮创建新的待办事项</text>
      </view>
      
      <!-- 待办事项列表头部 -->
      <view v-else class="todos-container">
        <view class="todos-header">
          <text class="todos-title">{{ selectedDate }} 待办事项</text>
          <view class="header-actions">
            <view class="progress-info">
              <text class="progress-text">{{ completedCount }}/{{ TodayTODOList.length }}</text>
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: progressPercentage + '%' }"></view>
              </view>
            </view>
            <up-icon name="reload" size="24" color="#007aff" @click="refreshTodos"></up-icon>
          </view>
        </view>
        
        <!-- 完成祝贺提示 -->
        <view 
          v-if="progressPercentage === 100 
          && TodayTODOList.length > 0" 
          class="congratulations">
          <up-icon name="checkmark-circle-fill" size="40" color="#4CAF50"></up-icon>
          <text class="congratulations-text">🎉 恭喜！今日待办事项全部完成！</text>
        </view>
        
        <view class="todo-item" 
          v-for="(todo) in TodayTODOList" 
          :key="todo._id"
          :class="{ 'completed': todo.isCompleted }">
          <view class="todo-checkbox" @click="toggleTodo(todo)">
            <up-icon v-if="todo.isCompleted" name="checkmark-circle-fill" size="28" color="#4CAF50"></up-icon>
             <view v-else class="todo-checkbox-circle"></view>
          </view>
          
          <view class="todo-content">
            <text 
              class="todo-title" 
              :class="{ 'completed-text': todo.isCompleted }">
              {{ todo.title }}
            </text>
            <text v-if="todo.description" class="todo-desc">
              {{ todo.description }}
            </text>
          </view>
          
          <view class="todo-actions">
            <up-icon 
              name="edit-pen" 
              size="20" 
              color="#007aff" 
              @click="editTodo(todo)">
            </up-icon>
            <up-icon 
              name="trash" 
              size="20" 
              color="#ff4757" 
              @click="deleteTodo(todo)">
            </up-icon>
          </view>
        </view>
      </view>
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
      :title="(isEditing ? '编辑' : '新建') + selectedDate + '-TODO'">
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
              {{ isSaving ? '保存中...' : (isEditing ? '更新' : '保存') }}
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
import { ref, onMounted, watch, computed } from 'vue';
import getTodayDate from '../../util/getTodayDate';
import dragButton from '../../components/plug-in/drag-button/drag-button.vue';
import uviewPopup from '../../components/core/uviewPopup.vue';
import { 
  setTodayTodosAPI,
  getDotDatesAPI,
  getTodayTodosAPI,
  toggleTodoStatusAPI,
  deleteTodoAPI,
  editTodoAPI,
} from '../../API/Tools/TodosAPI';
import ThemeLoading from '../../components/core/ThemeLoading.vue';

const initialDate = ref(getTodayDate());// 初始日期设置为今天
const dotDates = ref([]); // 下方显示圆点的日期，挂载时候获取
const popupShow = ref(false);
const selectedDate = ref('');// 选中的日期
const TodayTODOList = ref([]);// 代办列表
const todoForm = ref({
  title: '',
  description: ''
});
const errors = ref({// 表单验证错误
  title: ''
});
const isSaving = ref(false);// 保存状态
const inputFocus = ref({// 输入框焦点状态
  title: false,
  description: false
});
const loading = ref(false);// 加载状态
const isEditing = ref(false);// 编辑模式状态
const editingTodoId = ref(null);// 正在编辑的待办事项ID

// 计算属性：完成的待办事项数量
const completedCount = computed(() => {
  return TodayTODOList.value.filter(todo => todo.isCompleted).length;
});

// 计算属性：完成百分比
const progressPercentage = computed(() => {
  if (TodayTODOList.value.length === 0) return 0;
  return Math.round((completedCount.value / TodayTODOList.value.length) * 100);
});

const handleChange = (e) => {
  selectedDate.value = e.fulldate;
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
  isEditing.value = false;
  editingTodoId.value = null;
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
    let res;
    if (isEditing.value) {
      // 编辑模式
      res = await editTodoAPI({
        fulldate: selectedDate.value,
        todoId: editingTodoId.value,
        todoForm: {
          title: todoForm.value.title,
          description: todoForm.value.description,
        }
      });
    } else {
      // 新增模式
      res = await setTodayTodosAPI({
        fulldate: selectedDate.value,
        todoForm: {
          title: todoForm.value.title,
          description: todoForm.value.description,
        }
      });
    }
   
   if(res.code === 200){
    uni.showToast({
      title: res.message,
      icon:'success'
    });
    console.log('保存成功:', res);
    popupShow.value = false;
    resetForm();
    // 刷新列表
    getTodayTodos();
   }
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

//获取dotDates
const getDotDates = async () => {
  try {
    const res = await getDotDatesAPI();
    if(res.code === 200){
      dotDates.value = res.data;
    }
  }catch (error) {
    console.error('获取dotDates失败:', error);
  }
}

//获取今日所有todos列表
const getTodayTodos = async () => {
  loading.value = true;
  try {
    const res = await getTodayTodosAPI(selectedDate.value);
    if(res.code === 200){
      TodayTODOList.value = res.data;
    }
  }catch (error) {
    console.error('获取今日todos失败:', error);
  } finally {
    loading.value = false;
  }
}

// 切换待办事项完成状态
const toggleTodo = async (todo) => {
  if(todo.isCompleted){
    todo.isCompleted = false;
  }else{
    todo.isCompleted = true;
  }
  const res = await toggleTodoStatusAPI({
    fulldate: selectedDate.value,
    todoId: todo._id,
  })
  if(res.code === 200){
    uni.showToast({
      title: res.message,
      icon:'success'
    });
  }
}

// 编辑待办事项
const editTodo = async(todo) => {
  // 设置编辑模式
  isEditing.value = true;
  editingTodoId.value = todo._id;
  // 填充表单数据
  todoForm.value = {
    title: todo.title,
    description: todo.description
  };
  popupShow.value = true;
}

// 删除待办事项
const deleteTodo = (todo) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${todo.title}"吗？`,
    success: (res) => {
      if (res.confirm) {
        // 从列表中移除
        const index = TodayTODOList.value.findIndex(item => item._id === todo._id);
        if (index !== -1) {
          TodayTODOList.value.splice(index, 1);
        }
        deleteTodoAPI({
          fulldate: selectedDate.value,
          todoId: todo._id,
        }).then(res => {
          if(res.code === 200){
            uni.showToast({
              title: res.message,
              icon:'success'
            });
            // 刷新dotDates
            getDotDates();
          }
        })
      }
    }
  });
}

// 刷新待办事项列表
const refreshTodos = () => {
  getTodayTodos();
}

// 监听 selectedDate 的变化获取后端数据
watch(selectedDate, (newVal, oldVal) => {
  if (newVal && oldVal && newVal !== oldVal) { // 检查日期是否有变化且不为空
    getTodayTodos(); // 调用获取今日 getTodayTodos 的方法
  }
})

onMounted(() => {
  selectedDate.value = initialDate.value;  // 初始化时也设置选中日期为今天
  getDotDates();

  // #ifdef H5 
    getTodayTodos();//h5端首次进入页面获取今日todos列表 
  // #endif

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

/* 待办事项列表样式 */
.todos-list {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  min-height: 400rpx;
}

/* Loading 状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-text {
  margin-top: 20rpx;
  color: #666;
  font-size: 28rpx;
}

/* 空状态样式 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-title {
  margin-top: 30rpx;
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
}

.empty-desc {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #999;
}

/* 待办事项容器 */
.todos-container {
  animation: fadeInUp 0.5s ease-out;
}

.todos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.header-actions .u-icon {
  cursor: pointer;
  transition: all 0.3s ease;
}

.header-actions .u-icon:hover {
  transform: rotate(180deg);
}

/* 进度信息样式 */
.progress-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.progress-text {
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
}

.progress-bar {
  width: 100rpx;
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

/* 祝贺提示样式 */
.congratulations {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  animation: celebrate 0.6s ease-in-out;
}

.congratulations-text {
  margin-left: 16rpx;
  font-size: 28rpx;
  color: #4CAF50;
  font-weight: 600;
}

.todos-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.todos-count {
  font-size: 26rpx;
  color: #999;
}

/* 单个待办事项 */
.todo-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  transition: all 0.3s ease;
  animation: slideInLeft 0.4s ease-out;
  animation-fill-mode: both;
}

.todo-item:nth-child(1) { animation-delay: 0.1s; }
.todo-item:nth-child(2) { animation-delay: 0.2s; }
.todo-item:nth-child(3) { animation-delay: 0.3s; }
.todo-item:nth-child(4) { animation-delay: 0.4s; }
.todo-item:nth-child(5) { animation-delay: 0.5s; }

.todo-item:last-child {
  border-bottom: none;
}

.todo-item:hover {
  background: #fafafa;
  border-radius: 12rpx;
  padding-left: 20rpx;
  padding-right: 20rpx;
  margin: 0 -20rpx;
}

.todo-item.completed {
  opacity: 0.7;
}

.todo-checkbox {
  margin-right: 20rpx;
  cursor: pointer;
}

.todo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.todo-title {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 8rpx;
  transition: all 0.3s ease;
}

.todo-title.completed-text {
  text-decoration: line-through;
  color: #999;
}

.todo-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
}

.todo-actions {
  display: flex;
  gap: 20rpx;
  margin-left: 20rpx;
}

.todo-actions .u-icon {
  cursor: pointer;
  transition: all 0.3s ease;
}

.todo-actions .u-icon:hover {
  transform: scale(1.1);
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
.todo-checkbox-circle {
  width: 38rpx;
  height: 38rpx;
  border: 2rpx solid #c0c4cc;
  border-radius: 50%;
  background-color: #ffffff;
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

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes celebrate {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.form-item:nth-child(1) { animation-delay: 0.1s; }
.form-item:nth-child(2) { animation-delay: 0.2s; }

</style>