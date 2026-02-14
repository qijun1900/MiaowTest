<template>
  <view>
    <!-- 题目题干/描述标题 -->
    <QuestionStemHeader 
      :is-wrong-book-mode="props.isAddWrongBookQuestion"
      stem-text="题目描述"
      @add-image="handleAddImage"
    />
    
    <!-- 题干编辑器 -->
    <view class="editor-section">
      <uniEditor 
        placeholder="请在此处输入题干内容" 
        v-model="formData.stem" 
        height="200rpx" 
        id="stemEditorId1"
        />
    </view>
    <ThemeDivider text="题目选项" v-show="!isAddWrongBookQuestion"/>
    <view class="options-container">
      <!-- 选项列表 -->
      <view class="option-item" v-for="(option, index) in formData.options" :key="index">
        <!-- 删除选项图标 -->
        <view class="minus-btn" @click="removeOption(index)" v-if="formData.options.length > 1">
          <uni-icons type="close" size="16" color="#ffffff"></uni-icons>
        </view>

        <!-- 选项字母 - 使用ASCII码生成 -->
        <view class="option-letter">{{ String.fromCharCode(65 + index) }}</view>

        <!-- 选项内容输入框 -->
        <input class="option-input" type="text" v-model="option.content" placeholder="请输入选项内容" />

        <!-- 正确答案选择圆圈 -->
        <view class="radio-btn" @click="setCorrectAnswer(index)">
          <view class="radio-circle" :class="{ 'selected': option.isCorrect }"></view>
        </view>
      </view>

      <!-- 添加选项按钮 -->
      <view class="add-option-btn" @click="addOption">
        <uni-icons type="plus" size="20" color="#1890ff"></uni-icons>
        <text>添加选项</text>
      </view>
    </view>
    
    <!-- 我的错解部分 (仅在错题本添加模式显示) -->
    <view v-if="props.isAddWrongBookQuestion" class="my-wrong-answer-section">
      <view class="wrong-answer-title">我的错解 (选填)</view>
      <!-- 选择题类型的错解 -->
      <view v-if="formData.Type === 1" class="wrong-answer-options">
        <view 
          v-for="(option, index) in formData.options" 
          :key="index"
          class="wrong-answer-option-btn"
          :class="{ 'selected': formData.myWrongAnswer.includes(String.fromCharCode(65 + index)) }"
          @click="selectWrongAnswer(String.fromCharCode(65 + index))"
        >
          {{ String.fromCharCode(65 + index) }}
        </view>
      </view>
    </view>
    
    <!-- 题目解析/备注标题 -->
    <QuestionAnalysisHeader 
      :is-wrong-book-mode="props.isAddWrongBookQuestion"
      analysis-text="解析 / 备注 / 笔记"
      @add-image="handleAddAnalysisImage"
    />
    
    <!-- 解析编辑器 -->
    <view class="editor-section">
      <uniEditor 
        :placeholder="props.isAddWrongBookQuestion ? '记录解题思路或知识点...' : '请在此处输入解析内容'" 
        v-model="formData.analysis" 
        height="200rpx" 
        id="analysisEditorId2"/>
    </view>
    
    <!-- 标签组件 -->
    <QuestionTags 
      :show="props.isAddWrongBookQuestion"
      v-model="formData.tags"
    />
    
    <view class="submit-btn">
      <button type="primary" :loading="butLoading" @click="handleSend">
        {{ props.isEdit ? '更新题目' : '添加题目' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import uniEditor from '../../core/uniEditor.vue';
import ThemeDivider from '../../core/ThemeDivider.vue';
import QuestionStemHeader from './QuestionStemHeader.vue';
import QuestionAnalysisHeader from './QuestionAnalysisHeader.vue';
import QuestionTags from './QuestionTags.vue';
import { saveQuestion } from '../../../API/Exam/QuestionAPI';

const props = defineProps({
  currentBankId: { // 接收题库ID
    default: null
  },
  isEdit: { // 接收是否编辑模式
    default: false
  },
  editData: { // 接收编辑数据
    default: null
  },
  isAddWrongBookQuestion: { // 是否来自错题本添加
    default: false
  }
})

const isAddWrongBookQuestion = computed(() => props.isAddWrongBookQuestion)


const butLoading = ref(false) // 按钮加载中
// 使用 reactive 集合所有数据
const formData = reactive({
  Type: 1, // 题目类型
  stem: '', // 题干
  analysis: '', // 解析
  isMultiple: null, // 是否多选
  myWrongAnswer: [], // 我的错解（改为数组支持多选）
  tags: [], // 标签
  // 选项数据
  options: [
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false }
  ]
})

// 添加选项
const addOption = () => {
  formData.options.push({
    content: '',
    isCorrect: false
  })
}

// 移除选项
const removeOption = (index) => {
  if (formData.options.length > 1) {
    formData.options.splice(index, 1)
  }
}

// 设置正确答案
const setCorrectAnswer = (index) => {
  // 切换当前选项的正确状态
  formData.options[index].isCorrect = !formData.options[index].isCorrect

  // 计算已选择的答案数量
  const correctCount = formData.options.filter(option => option.isCorrect).length

  // 根据选择的答案数量设置是否多选
  formData.isMultiple = correctCount > 1 ? 1 : 0
}

// 添加图片处理
const handleAddImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      console.log('选择的图片:', res.tempFilePaths[0])
      // 这里可以添加图片上传逻辑
      uni.showToast({
        title: '图片选择成功',
        icon: 'success'
      })
    }
  })
}

// 添加解析图片处理
const handleAddAnalysisImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      console.log('选择的解析图片:', res.tempFilePaths[0])
      // 这里可以添加图片上传逻辑
      uni.showToast({
        title: '图片选择成功',
        icon: 'success'
      })
    }
  })
}

// 选择错误答案（支持多选）
const selectWrongAnswer = (answer) => {
  const index = formData.myWrongAnswer.indexOf(answer);
  if (index > -1) {
    // 如果已选中，则取消选择
    formData.myWrongAnswer.splice(index, 1);
  } else {
    // 如果未选中，则添加
    formData.myWrongAnswer.push(answer);
  }
}


// 提交表单
const handleSend = async () => {
  try {
    // 验证题目是否为空
    if (!formData.stem.trim()) {
      uni.showToast({
        title: '请输入题目内容',
        icon: 'none'
      });
      return;
    }

    // 验证选项内容是否为空
    const hasEmptyOption = formData.options.some(option => !option.content.trim());
    if (hasEmptyOption) {
      uni.showToast({
        title: '请填写所有选项内容',
        icon: 'none'
      });
      return;
    }

    // 验证是否选择了至少一个正确答案
    const hasCorrectAnswer = formData.options.some(option => option.isCorrect);
    if (!hasCorrectAnswer) {
      uni.showToast({
        title: '请至少选择一个正确答案',
        icon: 'none'
      });
      return;
    }

    //设置按钮加载状态
    butLoading.value = true;

    // 准备提交的数据
    const submitData = {
      Type: formData.Type,
      stem: formData.stem,
      options: formData.options,
      analysis: formData.analysis,
      isMultiple: formData.isMultiple
    };
    
    // 如果是编辑模式，添加题目ID
    if (props.isEdit && props.editData && props.editData._id) {
      submitData._id = props.editData._id;
    }
    
    // 如果有题库ID，添加到提交数据中
    if (props.currentBankId) {
      submitData.questionbankId = props.currentBankId;
    }
    //发送请求
    const res = await saveQuestion(submitData)
    if (res.code === 200) {
      // 只有在非编辑模式下才重置表单
      if (!props.isEdit) {
        resetForm()
      }
      butLoading.value = false;
      // 提示提交成功
      uni.showToast({
        title: res.message,
        icon: 'none',
      })
    }
  } catch (error) {
    console.log(error)
    uni.showToast({
      title: '提交失败',
      icon: 'none'
    })
  } finally {
    butLoading.value = false;
  }

}

// 重置表单
const resetForm = () => {
  formData.stem = '';
  formData.analysis = '';
  formData.isMultiple = null;
  formData.myWrongAnswer = [];
  formData.tags = [];
  formData.options = [
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false }
  ];
}
onMounted(() => {
  if (props.isEdit && props.editData) {
    // 编辑模式下初始化表单数据
    formData.stem = props.editData.stem || '';
    formData.analysis = props.editData.analysis || '';
    formData.isMultiple = props.editData.isMultiple;
    
    // 初始化选项数据
    if (props.editData.options && props.editData.options.length > 0) {
      formData.options = props.editData.options.map(option => ({
        content: option.content || '',
        isCorrect: option.isCorrect || false
      }));
    }
  }
})
</script>
<style scoped>
.custom-divider {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20rpx 0;
}

.divider-text {
  font-size: 28rpx;
  color: #999;
}

.add-image-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.add-image-text {
  font-size: 28rpx;
  color: #07c160;
}

.editor-section {
  margin-bottom: 20rpx;
}

.options-container {
  margin-top: 20rpx;
  background: white;
  padding: 24rpx;
  border-radius: 16rpx;
  border: 1rpx solid #e0e0e0;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.minus-btn {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: #ff4d4f;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.minus-icon {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
}

.option-letter {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  font-weight: bold;
}

.option-input {
  flex: 1;
  height: 80rpx;
  border: 1rpx solid #d9d9d9;
  border-radius: 16rpx;
  padding: 0 24rpx;
  margin-right: 20rpx;
  background: #fafafa;
  transition: all 0.3s ease;
}

.option-input:focus {
  border-color: #1890ff;
  background: #fff;
  box-shadow: 0 0 0 4rpx rgba(24, 144, 255, 0.1);
}

.radio-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-circle {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 2rpx solid #d9d9d9;
}

.radio-circle.selected {
  background-color: #1890ff;
  border-color: #1890ff;
  position: relative;
}

.radio-circle.selected::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: #ffffff;
}

.add-option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  border: 1rpx dashed #d9d9d9;
  border-radius: 16rpx;
  margin-top: 20rpx;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
}

.add-option-btn:active {
  background-color: #f0f0f0;
  border-color: #1890ff;
}

.add-icon {
  margin-right: 10rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #1890ff;
}

.debug-info {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.my-wrong-answer-section {
  margin: 30rpx 0;
}

.wrong-answer-title {
  font-size: 28rpx;
  color: #ff4d4f;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.wrong-answer-options {
  display: flex;
  gap: 20rpx;
  flex-wrap: wrap;
}

.wrong-answer-option-btn {
  width: 160rpx;
  height: 80rpx;
  border: 2rpx solid #d9d9d9;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #999;
  background-color: #ffffff;
  transition: all 0.3s;
}

.wrong-answer-option-btn.selected {
  border-color: #ff4d4f;
  background-color: #fff1f0;
  color: #ff4d4f;
}

.wrong-answer-judge {
  display: flex;
  gap: 20rpx;
}

.judge-btn {
  flex: 1;
  height: 80rpx;
  border: 2rpx solid #d9d9d9;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #999;
  background-color: #ffffff;
  transition: all 0.3s;
}

.judge-btn.selected {
  border-color: #ff4d4f;
  background-color: #fff1f0;
  color: #ff4d4f;
}

.wrong-answer-input-wrapper {
  width: 100%;
  background-color: #fff9f9;
  border-radius: 12rpx;
  border: 2rpx solid #d9d9d9;
  overflow: hidden;
}
</style>