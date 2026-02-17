<template>
  <view class="container">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载题目数据...</text>
    </view>
    
    <template v-else>
    <!-- 题型选择器 -->
    <SliderSelector 
      v-model="selectedQuestionTypeValue"
      :options="questionTypes"
      @change="handleTypeChange"
    />
    
    <!-- 科目和难度选择器 -->
    <view class="selector-row">
      <view class="selector-item">
        <view class="selector-label">科目</view>
        <view class="picker-display">
          <text>{{ WrongbookTitle }}</text>
        </view>
      </view>
      
      <view class="selector-item">
        <view class="selector-label">难度</view>
        <picker mode="selector" :range="difficulties" range-key="label" @change="handleDifficultyChange">
          <view class="picker-display">
            <text>{{ selectedDifficulty.label }}</text>
            <uni-icons type="down" size="16" color="#999"></uni-icons>
          </view>
        </picker>
      </view>
    </view>
    
    <!-- 题型组件 -->
    <view class="question-form">
      <view v-if="selectedQuestionTypeValue === 1" :key="1" class="form-item fade-slide">
        <AddSelect 
          ref="addSelectRef"
          :isAddWrongBookQuestion="true" 
          :isEdit="isEditMode"
          :editData="editQuestionData"
          @submit="handleQuestionSubmit"
        />
      </view>
      <view v-if="selectedQuestionTypeValue === 2" :key="2" class="form-item fade-slide">
        <AddBlank 
          ref="addBlankRef"
          :isAddWrongBookQuestion="true" 
          :isEdit="isEditMode"
          :editData="editQuestionData"
          @submit="handleQuestionSubmit"
        />
      </view>
      <view v-if="selectedQuestionTypeValue === 3" :key="3" class="form-item fade-slide">
        <AddJudge 
          ref="addJudgeRef"
          :isAddWrongBookQuestion="true" 
          :isEdit="isEditMode"
          :editData="editQuestionData"
          @submit="handleQuestionSubmit"
        />
      </view>
      <view v-if="selectedQuestionTypeValue === 4" :key="4" class="form-item fade-slide">
        <AddShort 
          ref="addShortRef"
          :isAddWrongBookQuestion="true" 
          :isEdit="isEditMode"
          :editData="editQuestionData"
          @submit="handleQuestionSubmit"
        />
      </view>
    </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import SliderSelector from '../../../components/core/SliderSelector.vue';
import AddSelect from '../../../components/modules/exam/AddSelect.vue';//1
import AddBlank from '../../../components/modules/exam/AddBlank.vue';//2
import AddJudge from '../../../components/modules/exam/AddJudge.vue';//3
import AddShort from '../../../components/modules/exam/AddShort.vue';//4
import { addWrongQuestionAPI, getWrongQuestionDetailAPI, updateWrongQuestionAPI } from '../../../API/Tools/wrongQuestionAPI';

const selectedQuestionTypeValue = ref(1)
const WrongbookTitle = ref('')
const WrongbookId  = ref('')
const questionId = ref('')
const isEditMode = ref(false)
const editQuestionData = ref(null)
const loading = ref(false)

// 子组件 ref
const addSelectRef = ref(null)
const addBlankRef = ref(null)
const addJudgeRef = ref(null)
const addShortRef = ref(null)

const questionTypes = ref([
  { label: '选择题', value: 1 },
  { label: '填空题', value: 2 },
  { label: '判断题', value: 3 },
  { label: '简答题', value: 4 }
])

// 难度选项
const difficulties = ref([
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
])

// 选中的难度
const selectedDifficulty = ref({ label: '简单', value: 'easy' })

const handleTypeChange = ({ value }) => {
  selectedQuestionTypeValue.value = value
}

const handleDifficultyChange = (e) => {
  const index = e.detail.value
  selectedDifficulty.value = difficulties.value[index]
}

// 加载题目数据（编辑模式）
const loadQuestionData = async () => {
  try {
    loading.value = true;
    const res = await getWrongQuestionDetailAPI(questionId.value);
    if (res.code === 200 && res.data) {
      const data = res.data;
      editQuestionData.value = data;
      
      // 设置题型
      selectedQuestionTypeValue.value = data.Type || 1;
      
      // 设置难度
      const difficultyMap = {
        'easy': { label: '简单', value: 'easy' },
        'medium': { label: '中等', value: 'medium' },
        'hard': { label: '困难', value: 'hard' }
      };
      selectedDifficulty.value = difficultyMap[data.difficulty] || difficultyMap.medium;
    } else {
      uni.showToast({
        title: res.message || '获取题目失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取题目详情失败:', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 处理题目提交
const handleQuestionSubmit = async (questionData) => {
  try {
    // 补充错题本相关信息
    const wrongQuestionData = {
      ...questionData,
      wrongBookId: WrongbookId.value,
      difficulty: selectedDifficulty.value.value,
    };

    let res;
    if (isEditMode.value) {
      // 编辑模式：调用更新API
      res = await updateWrongQuestionAPI({
        id: questionId.value,
        ...wrongQuestionData
      });
    } else {
      // 添加模式：调用添加API
      res = await addWrongQuestionAPI(wrongQuestionData);
    }
    
    if (res.code === 200) {
      uni.showToast({
        title: isEditMode.value ? '更新成功' : '添加成功',
        icon: 'success'
      });
      resetCurrentForm();
      // 编辑模式下返回上一页并刷新列表 
      setTimeout(() => {
        if (isEditMode.value) {
          uni.navigateBack({
            delta: 1,
          });
        }
      }, 1000);

    } else {
      uni.showToast({
        title: res.message || (isEditMode.value ? '更新失败' : '添加失败'),
        icon: 'none'
      });
    }

  } catch (error) {
    console.error(isEditMode.value ? '更新错题失败:' : '提交错题失败:', error);
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    });
  }
}

// 重置当前激活的表单
const resetCurrentForm = () => {
  switch (selectedQuestionTypeValue.value) {
    case 1:
      addSelectRef.value?.resetForm();
      break;
    case 2:
      addBlankRef.value?.resetForm();
      break;
    case 3:
      addJudgeRef.value?.resetForm();
      break;
    case 4:
      addShortRef.value?.resetForm();
      break;
  }
}

onLoad(async (options) => {
  if (options.id) {
    WrongbookId.value = options.id;
  } else {
    uni.showToast({
      title: '缺少错题本ID',
      icon: 'error'
    })
    uni.navigateBack();
    return;
  }
  if (options.title) {
    WrongbookTitle.value = decodeURIComponent(options.title)
  } else {
    console.warn('未接收到错题本名称')
  }
  
  // 编辑模式：加载题目数据
  if (options.questionId) {
    questionId.value = options.questionId;
    isEditMode.value = true;
    await loadQuestionData();
  }
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #fff9f2;
  padding: 15rpx 15rpx;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid #ffe8d6;
  border-top-color: #ff9555;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 32rpx;
  font-size: 28rpx;
  color: #ff9555;
  font-weight: 500;
}

.selector-row {
  display: flex;
  gap: 20rpx;
  margin: 20rpx 0;
}

.selector-item {
  flex: 1;
}

.selector-label {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.picker-display {
  background: #ffffff;
  border-radius: 12rpx;
  padding: 24rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1rpx solid #e0e0e0;
}

.picker-display text {
  font-size: 30rpx;
  color: #333;
}

.question-form {
  position: relative;
}

.form-item {
  width: 100%;
}

.fade-slide {
  animation: fadeSlideIn 0.3s ease-out;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>