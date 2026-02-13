<template>
  <view>
    <!-- 题目题干/描述标题 -->
    <QuestionStemHeader 
      :is-wrong-book-mode="isAddWrongBookQuestion"
      stem-text="题目描述"
    />
    <!-- 题干编辑器 -->
    <view class="editor-section">
      <uniEditor 
        placeholder="请在此处输入题干内容" 
        v-model="formData.stem" 
        height="200rpx" 
        id="stemEditor2"/>
    </view>
    <ThemeDivider text="题目答案" />
    <view class="options-container">
      <!-- 答案列表 -->
      <view class="option-item" v-for="(answer, index) in formData.options" :key="index">
        <!-- 删除答案图标 -->
        <view class="minus-btn" @click="removeAnswer(index)" v-if="formData.options.length > 1">
          <uni-icons type="close" size="16" color="#ffffff"></uni-icons>
        </view>

        <!-- 答案编号 -->
        <view class="option-letter">空{{ (index + 1) }}</view>

        <!-- 答案内容输入框 -->
        <input class="option-input" type="text" v-model="answer.content" placeholder="请输入答案内容" />
      </view>

      <!-- 添加答案按钮 -->
      <view class="add-option-btn" @click="addAnswer">
        <uni-icons type="plus" size="20" color="#1890ff"></uni-icons>
        <text>添加答案</text>
      </view>
    </view>
    
    <!-- 我的错解部分 (仅在错题本添加模式显示) -->
    <MyWrongAnswerEditor 
      :show="props.isAddWrongBookQuestion"
      v-model="formData.myWrongAnswer"
      editor-id="wrongAnswerEditorBlank"
      @update:images="handleWrongAnswerImages"
    />
    
    <!-- 题目解析/备注标题 -->
    <QuestionAnalysisHeader 
      :is-wrong-book-mode="isAddWrongBookQuestion"
      analysis-text="解析 / 备注 / 笔记"
    />
    <!-- 解析编辑器 -->
    <view class="editor-section">
      <uniEditor 
        :placeholder="isAddWrongBookQuestion ? '记录解题思路或知识点...' : '请在此处输入解析内容'" 
        v-model="formData.analysis" 
        height="200rpx" 
        id="analysisEditor2"/>
    </view>
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
import MyWrongAnswerEditor from './MyWrongAnswerEditor.vue';
import { saveQuestion } from '../../../API/Exam/QuestionAPI';

const butLoading = ref(false)
const props = defineProps({
  currentBankId: { 
    default: null
  },
  isEdit: { 
    default: false
  },
  editData: { 
    default: null
  },
  isAddWrongBookQuestion: { 
    default: false
  }
})

const isAddWrongBookQuestion = computed(() => props.isAddWrongBookQuestion)

// 使用 reactive 集合所有数据
const formData = reactive({
  Type: 2, // 题目类型，默认为2（填空题）
  stem: '', // 题干
  analysis: '', // 解析
  myWrongAnswer: '', // 我的错解
  myWrongAnswerImages: [], // 我的错解图片
  // 答案数据
  options: [
    { content: '' }
  ]
})

// 处理错解图片
const handleWrongAnswerImages = (images) => {
  formData.myWrongAnswerImages = images;
}

// 添加答案
const addAnswer = () => {
  formData.options.push({
    content: ''
  })
}

// 移除答案
const removeAnswer = (index) => {
  if (formData.options.length > 1) {
    formData.options.splice(index, 1)
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

    // 验证答案内容是否为空
    const hasEmptyAnswer = formData.options.some(options => !options.content.trim());
    if (hasEmptyAnswer) {
      uni.showToast({
        title: '请填写所有答案内容',
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
      options: formData.options,
      analysis: formData.analysis
    };
    
    // 如果是编辑模式，添加题目ID
    if (props.isEdit && props.editData && props.editData._id) {
      submitData._id = props.editData._id;
    }
    
    // 如果有题库ID，添加到提交数据中
    if (props.currentBankId) {
      submitData.questionbankId = props.currentBankId;
    }

    // 调用API提交数据
    const res = await saveQuestion(submitData)
    if (res.code === 200) {
      // 只有在非编辑模式下才重置表单
      if (!props.isEdit) {
        resetForm()
      }
      butLoading.value = false;
      // 提示提交成功
      uni.showToast({
        title:  res.message,
        icon: 'none'
      });
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
  formData.analysis = '';
  formData.myWrongAnswer = '';
  formData.myWrongAnswerImages = [];
  formData.options = [
    { content: '' }
  ];
}

// 编辑模式下的数据初始化
onMounted(() => {
  if (props.isEdit && props.editData) {
    // 编辑模式下初始化表单数据
    formData.stem = props.editData.stem || '';
    formData.analysis = props.editData.analysis || '';
    
    // 初始化答案数据
    if (props.editData.options && props.editData.options.length > 0) {
      formData.options = props.editData.options.map(option => ({
        content: option.content || ''
      }));
    }
  }
})
</script>

<style scoped>
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
  width: 80rpx;
  height: 40rpx;
  border-radius: 20rpx;
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
</style>