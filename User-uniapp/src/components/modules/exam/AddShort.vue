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
        id="stemEditor4"/>
    </view>
    <view class="answer-container">
      <view class="answer-header">
        <view class="answer-header-left">
          <view class="answer-icon">
            <uni-icons type="compose" size="20" color="#1890ff"></uni-icons>
          </view>
          <text class="answer-title">题目答案</text>
        </view>
        <view 
          v-if="props.isAddWrongBookQuestion" 
          class="add-image-btn" 
          @click="handleAddAnswerImage">
          <uni-icons type="image" size="18" color="#07c160"></uni-icons>
          <text class="add-image-text">添加图片</text>
        </view>
      </view>
      <uniEditor 
        placeholder="请在此处输入参考答案" 
        v-model="formData.content" 
        height="220rpx" 
        id="answerEditor4"/>
      
      <!-- 已上传的答案图片列表 -->
      <view v-if="answerImageList.length > 0" class="image-list">
        <view 
          v-for="(img, index) in answerImageList" 
          :key="index"
          class="image-item"
        >
          <image :src="img" mode="aspectFill" class="preview-image" />
          <view class="delete-image-btn" @click="removeAnswerImage(index)">
            <uni-icons type="close" size="14" color="#ffffff"></uni-icons>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 我的错解部分 (仅在错题本添加模式显示) -->
    <MyWrongAnswerEditor 
      :show="props.isAddWrongBookQuestion"
      v-model="formData.myWrongAnswer"
      editor-id="wrongAnswerEditorShort"
      @update:images="handleWrongAnswerImages"
      height="200rpx"
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
        id="analysisEditor4"/>
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
import QuestionStemHeader from './QuestionStemHeader.vue';
import QuestionAnalysisHeader from './QuestionAnalysisHeader.vue';
import MyWrongAnswerEditor from './MyWrongAnswerEditor.vue';
import QuestionTags from './QuestionTags.vue';
import { saveQuestion } from '../../../API/Exam/QuestionAPI';

const butLoading = ref(false)
const answerImageList = ref([])

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
  Type: 4, // 题目类型
  stem: '', // 题干
  content: '', // 答案
  analysis: '', // 解析
  myWrongAnswer: '', // 我的错解
  myWrongAnswerImages: [], // 我的错解图片
  tags: [] // 标签
})

// 处理错解图片
const handleWrongAnswerImages = (images) => {
  formData.myWrongAnswerImages = images;
}

// 添加答案图片
const handleAddAnswerImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      answerImageList.value.push(tempFilePath);
      
      uni.showToast({
        title: '图片添加成功',
        icon: 'success'
      });
    },
    fail: (err) => {
      console.error('选择图片失败:', err);
      uni.showToast({
        title: '图片选择失败',
        icon: 'none'
      });
    }
  });
}

// 删除答案图片
const removeAnswerImage = (index) => {
  answerImageList.value.splice(index, 1);
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
  formData.myWrongAnswer = '';
  formData.myWrongAnswerImages = [];
  formData.tags = [];
  answerImageList.value = [];
}

// 编辑模式下的数据初始化
onMounted(() => {
  if (props.isEdit && props.editData) {
    // 编辑模式下初始化表单数据
    formData.stem = props.editData.stem || '';
    formData.content = props.editData.content || '';
    formData.analysis = props.editData.analysis || '';
  }
})
</script>

<style scoped>
.editor-section {
  margin-bottom: 20rpx;
}

.answer-container {
  margin-top: 20rpx;
  background: white;
  padding: 24rpx;
  border-radius: 16rpx;
  border: 1rpx solid #e0e0e0;
  overflow: hidden;
}

.answer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.answer-header-left {
  display: flex;
  align-items: center;
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

.add-image-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  cursor: pointer;
}

.add-image-text {
  font-size: 28rpx;
  color: #07c160;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 20rpx;
}

.image-item {
  position: relative;
  width: 150rpx;
  height: 150rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.delete-image-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>