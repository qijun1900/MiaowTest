<template>
 <view class="container">
   <view class="content">
     <!-- 题型选择器 -->
     <SliderSelector 
       v-model="selectedQuestionTypeValue"
       :options="questionTypes"
       @change="handleTypeChange"
     />
      <!-- 不同组件 -->
      <view class="question-type-component">
         <!-- 根据 selectedQuestionTypeValue 的值来决定显示哪个组件 -->
        <transition name="fade-slide" mode="out-in">
          <view v-if="selectedQuestionTypeValue === 1" key="select" class="component-wrapper">
            <AddSelect :currentBankId="questionbankId" :isEdit="isEditMode" :editData="editQuestionData" />
          </view>
          <view v-else-if="selectedQuestionTypeValue === 2" key="blank" class="component-wrapper">
            <AddBlank :currentBankId="questionbankId" :isEdit="isEditMode" :editData="editQuestionData" />
          </view>
          <view v-else-if="selectedQuestionTypeValue === 3" key="judge" class="component-wrapper">
            <AddJudge :currentBankId="questionbankId" :isEdit="isEditMode" :editData="editQuestionData" />
          </view>
          <view v-else-if="selectedQuestionTypeValue === 4" key="short" class="component-wrapper">
            <AddShort :currentBankId="questionbankId" :isEdit="isEditMode" :editData="editQuestionData" />  
          </view>
        </transition>
      </view>
   </view>
 </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import SliderSelector from '../../components/core/SliderSelector.vue';
import AddSelect from '../../components/modules/exam/AddSelect.vue';// 选择题1
import AddBlank from '../../components/modules/exam/AddBlank.vue';// 填空题2
import AddJudge from '../../components/modules/exam/AddJudge.vue';// 判断题3
import AddShort from '../../components/modules/exam/AddShort.vue';// 简答题4

const questionbankId = ref(null)
const selectedQuestionTypeValue = ref(1) // 默认选择题
const isEditMode = ref(false)
const editQuestionData = ref(null)

// 题型数据
const questionTypes = ref([
  { label: '选择题', value: 1 },
  { label: '填空题', value: 2 },
  { label: '判断题', value: 3 },
  { label: '简答题', value: 4 }
])

// 题型变化事件
const handleTypeChange = ({ value}) => {
  selectedQuestionTypeValue.value = value
}

onLoad((option) => {
  if(option.bankName&&option.isNewCreate==='true'){
   uni.showToast({
    title: `${option.bankName}题库创建成功`,
    icon: 'success',
   })
  }
  if(option.bankName&&option.isNewCreate==='false'){
   uni.showToast({
    title: `为${option.bankName}题库添加题目`,
    icon: 'none',
   })
  }
  if(option.isEdit==='true'&& option.data){
    const data = JSON.parse(decodeURIComponent(option.data))//解码数据
    isEditMode.value = true
    editQuestionData.value = data
    
    // 根据编辑数据的题型设置初始显示的组件
    if(data.Type) {
      selectedQuestionTypeValue.value = data.Type
    }
  }
  
  if(option.bankId){
    questionbankId.value = option.bankId
  }
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #fbfbfb;
}

.content {
  padding: 10rpx;
  padding-top: 10rpx;
}

.question-type-component {
  margin-top: 20rpx;
  position: relative;
}

.component-wrapper {
  width: 100%;
}

/* 淡入淡出 + 滑动动画 */
.fade-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30rpx);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30rpx);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>