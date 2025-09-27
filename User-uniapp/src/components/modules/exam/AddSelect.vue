<template>
  <view>
    <ThemDivider text="题目题干" />
    <!-- 题干编辑器 -->
    <view class="editor-section">
      <uniEditor placeholder="请在此处输入题干内容" v-model="formData.stem" height="200rpx" />
    </view>
    <ThemDivider text="题目选项" />
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
    <ThemDivider text="题目解析(可选)" />
    <!-- 解析编辑器 -->
    <view class="editor-section">
      <uniEditor placeholder="请在此处输入解析内容" v-model="formData.analysis" height="200rpx" />
    </view>
    <view class="submit-btn">
      <button type="primary" :loading="butLoading" @click="handleSend">添加题目</button>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue';
import uniEditor from '../../core/uniEditor.vue';
import ThemDivider from '../../core/ThemDivider.vue';
import { addQuestion } from '../../../API/Exam/QuestionAPI';

const butLoading = ref(false) // 按钮加载中
// 使用 reactive 集合所有数据
const formData = reactive({
  Type: 1, // 题目类型
  stem: '', // 题干
  analysis: '', // 解析
  isMultiple: null, // 是否多选
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

    const res = await addQuestion(submitData)
    if (res.code === 200) {
      // 重置表单
      resetForm()
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
  formData.options = [
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
    { content: '', isCorrect: false }
  ];
}
</script>
<style scoped>
.editor-section {
  margin-bottom: 20rpx;
}

.options-container {
  margin-top: 20rpx;
  background: white;
  padding: 20rpx;
  border-radius: 15rpx;
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
  border-radius: 8rpx;
  padding: 0 20rpx;
  margin-right: 20rpx;
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
  padding: 20rpx;
  border: 1rpx dashed #d9d9d9;
  border-radius: 8rpx;
  margin-top: 20rpx;
  background-color: #f9f9f9;
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
</style>