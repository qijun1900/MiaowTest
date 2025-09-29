<template>
  <view>
    <ThemeDivider text="题目题干" />
    <!-- 题干编辑器 -->
    <view class="editor-section">
      <uniEditor placeholder="请在此处输入题干内容" v-model="formData.stem" height="200rpx" />
    </view>
    <view class="answer-container">
      <view class="answer-header">
        <view class="answer-icon">
          <uni-icons type="compose" size="20" color="#1890ff"></uni-icons>
        </view>
        <text class="answer-title">题目答案</text>
      </view>
      <uniEditor placeholder="请在此处输入参考答案" v-model="formData.content" height="300rpx" />
    </view>
    <ThemeDivider text="题目解析(可选)" />
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
import ThemeDivider from '../../core/ThemeDivider.vue';
import { addQuestion } from '../../../API/Exam/QuestionAPI';

const butLoading = ref(false) // 按钮加载中
const props = defineProps({
  currentBankId: { // 接收题库ID
    default: null
  }
})

// 使用 reactive 集合所有数据
const formData = reactive({
  Type: 4, // 题目类型
  stem: '', // 题干
  content: '', // 答案
  analysis: '' // 解析
})

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

    // 验证答案是否为空
    if (!formData.content.trim()) {
      uni.showToast({
        title: '请输入参考答案',
        icon: 'none'
      });
      return;
    }

    // 设置按钮加载状态
    butLoading.value = true;

    // 准备提交的数据
    const submitData = {
      Type: formData.Type,
      stem: formData.stem,
      content: formData.content,
      analysis: formData.analysis
    };
    // 如果有题库ID，添加到提交数据中
    if (props.currentBankId) {
      submitData.questionbankId = props.currentBankId;
    }
    // 调用API提交数据
    const res = await addQuestion(submitData)
    if (res.code === 200) {
      // 重置表单
      resetForm()
      butLoading.value = false;
      // 提示提交成功
      uni.showToast({
        title:  res.message,
        icon: 'none'
      })
    }
  } catch (e) {
    console.log(e)
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
  formData.content = '';
  formData.analysis = '';
}
</script>

<style scoped>
.editor-section {
  margin-bottom: 20rpx;
}

.answer-container {
  margin-top: 20rpx;
  background: white;
  padding: 20rpx;
  border-radius: 15rpx;
  border: 1rpx solid #e0e0e0;
}

.answer-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.answer-icon {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background-color: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15rpx;
}

.answer-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}
</style>