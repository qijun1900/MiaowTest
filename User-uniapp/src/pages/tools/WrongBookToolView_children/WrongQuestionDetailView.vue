<template>
  <view class="container">
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
        <AddSelect :isAddWrongBookQuestion="true" />
      </view>
      <view v-if="selectedQuestionTypeValue === 2" :key="2" class="form-item fade-slide">
        <AddBlank :isAddWrongBookQuestion="true" />
      </view>
      <view v-if="selectedQuestionTypeValue === 3" :key="3" class="form-item fade-slide">
        <AddJudge :isAddWrongBookQuestion="true" />
      </view>
      <view v-if="selectedQuestionTypeValue === 4" :key="4" class="form-item fade-slide">
        <AddShort :isAddWrongBookQuestion="true" />
      </view>
    </view>
  </view>
</template>

<script setup>
import SliderSelector from '../../../components/core/SliderSelector.vue';
import AddSelect from '../../../components/modules/exam/AddSelect.vue';//1
import AddBlank from '../../../components/modules/exam/AddBlank.vue';//2
import AddJudge from '../../../components/modules/exam/AddJudge.vue';//3
import AddShort from '../../../components/modules/exam/AddShort.vue';//4
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const selectedQuestionTypeValue = ref(1)
const WrongbookTitle = ref('')
const WrongbookId  = ref('')

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

onLoad((options) => {
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
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #fff9f2;
  padding: 15rpx 15rpx;
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