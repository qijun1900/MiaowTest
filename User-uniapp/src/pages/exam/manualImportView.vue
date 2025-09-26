<template>
 <view class="container">
   <view class="content">
     <!-- 题型选择器 -->
     <view class="question-type-selector">
       <view class="selector-row">
         <text class="selector-label">题型：</text>
         <view class="picker-display">
           <text class="selected-type">{{ selectedQuestionTypeLabel || '选择题' }}</text>
           <picker 
             class="type-picker"
             :range="questionTypeLabels" 
             :value="pickerValue"
             @change="onTypeChange">
           </picker>
         </view>
       </view>
     </view>
      <!-- 不同组件 -->
      <view class="question-type-component">
         <!-- 根据 selectedQuestionTypeValue 的值来决定显示哪个组件 -->
        <view v-if="selectedQuestionTypeValue === 1">
          <AddSelect />
        </view>
        <view v-else-if="selectedQuestionTypeValue === 2">
          <AddBlank />
        </view>
        <view v-else-if="selectedQuestionTypeValue === 3">
          <AddJudge />
        </view>
        <view v-else-if="selectedQuestionTypeValue === 4">
          <AddShort />  
        </view>
      </view>
   </view>
 </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app';
import { ref, computed } from 'vue';
import AddSelect from '../../components/modules/exam/AddSelect.vue';// 选择题1
import AddBlank from '../../components/modules/exam/AddBlank.vue';// 填空题2
import AddJudge from '../../components/modules/exam/AddJudge.vue';// 判断题3
import AddShort from '../../components/modules/exam/AddShort.vue';// 简答题4

const bankName = ref('')
// 选择器相关
const pickerValue = ref(0)
const selectedQuestionTypeValue = ref(1) // 默认选择题
const selectedQuestionTypeLabel = ref('选择题') // 默认显示选择题

// 题型数据
const questionTypes = ref([
  { label: '选择题', value: 1 },
  { label: '填空题', value: 2 },
  { label: '判断题', value: 3 },
  { label: '简答题', value: 4 }
])

// 计算题型标签数组 显示在选择器中
const questionTypeLabels = computed(() => {
  return questionTypes.value.map(item => item.label)
})

// 题型变化事件
const onTypeChange = (e) => {
  const index = e.detail.value
  pickerValue.value = index
  selectedQuestionTypeValue.value = questionTypes.value[index].value
  selectedQuestionTypeLabel.value = questionTypes.value[index].label
}

onLoad((option) => {
  if(option.bankName){
    bankName.value = option.bankName
  }
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.content {
  padding: 10rpx;
  padding-top: 10rpx;
}

.question-type-selector {
  background: white;
  padding: 20rpx;
  border-radius: 15rpx;
  border: 1rpx solid #e0e0e0;
}

.selector-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.selector-label {
  font-size: 28rpx;
  color: #333;
  white-space: nowrap;
}

.picker-display {
  position: relative;
  display: flex;
  align-items: center;
  padding: 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  background-color: #fafafa;
  min-width: 200rpx;
  flex: 1;
}

.selected-type {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.picker-display::after {
  content: '▼';
  font-size: 20rpx;
  color: #666;
  margin-left: 10rpx;
}

.type-picker {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}
.question-type-component{
  margin-top: 20rpx;
  
}
</style>