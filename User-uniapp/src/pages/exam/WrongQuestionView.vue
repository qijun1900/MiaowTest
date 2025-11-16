<template>
  <view class="wrong-question-container">
    <!-- 页面头部统计信息 -->
    <view class="header-stats">
      <view class="stats-card">
        <view class="stats-item">
          <text class="stats-number">{{ wrongQuestions.length }}</text>
          <text class="stats-label">错题总数</text>
        </view>
        <view class="stats-item">
          <text class="stats-number">{{ collectedCount }}</text>
          <text class="stats-label">已收藏</text>
        </view>
        <view class="stats-item">
          <text class="stats-number">{{ addedToBookCount }}</text>
          <text class="stats-label">已加入错题本</text>
        </view>
      </view>
    </view>

    <!-- 筛选区域 -->
    <view class="filter-section">
      <view class="filter-item">
        <text class="filter-label">题目类型：</text>
        <uviewSubsection 
          :list="questionTypeList" 
          :current="currentTypeIndex" 
          @updateCurrent="handleTypeChange"
          activeColor="#007aff" 
          inactiveColor="#999" 
          bgColor="#f8f9fa"
          style="flex:1; min-width:0; width:100%;"/>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-container" v-if="isLoading">
      <up-loading-icon mode="spinner" color="#007aff" size="40rpx">
      </up-loading-icon>
      <text class="loading-text">正在加载错题...</text>
    </view>

    <!-- 错题列表 -->
    <view class="question-list" v-else-if="filteredQuestions.length > 0">
      <view 
        v-for="(question, index) in filteredQuestions" 
        :key="question._id" 
        class="question-card">

        <!-- 题目头部 -->
        <view class="question-header">
          <view class="question-info">
            <text class="question-index">第{{ (index + 1) }}题</text>
            <text class="question-type">{{ formatInfo.getQuestionTypeText(question.Type) }}</text>
          </view>
          <view class="question-actions">
            <up-button 
              :icon="isCollected(question._id) ? 'star-fill' : 'star'"
              :type="isCollected(question._id) ? 'warning' : 'info'" 
              :plain="!isCollected(question._id)" 
              size="mini"
              shape="circle" 
              @click="toggleCollect(question)" 
              :loading="collectLoading[question._id]">
              {{ isCollected(question._id) ? '已收藏' : '收藏' }}
            </up-button>
            <up-button 
              :icon="isInWrongBook(question._id) ? 'checkmark-circle-fill' : 'plus-circle'"
              :type="isInWrongBook(question._id) ? 'success' : 'primary'" 
              :plain="!isInWrongBook(question._id)"
              size="mini" 
              shape="circle" 
              @click="toggleWrongBook(question)"
              :loading="wrongBookLoading[question._id]">
              {{ isInWrongBook(question._id) ? '已加入' : '错题本' }}
            </up-button>
          </view>
        </view>

        <!-- 题目内容 -->
        <view class="question-content">
          <!-- 题干 -->
          <view class="question-stem">
            <rich-text :nodes="question.stem"></rich-text>
          </view>

          <!-- 选择题选项显示 -->
          <view v-if="question.Type === 1" class="select-options-section">
            <view class="section-title">
              <uni-icons type="list" color="#007aff" size="18"></uni-icons>
              <text class="title-text">{{ question.isMultiple === 1 ? '多选题' : '单选题' }}</text>
            </view>
            <view 
              v-for="(option, optionIndex) in question.options" 
              :key="optionIndex" class="option-item" 
              :class="{
                'correct-option': option.isCorrect,
                }">
              <view class="option-wrapper">
                <text class="option-tag">{{ String.fromCharCode(65 + optionIndex) }}.</text>
                <text class="option-content">{{ option.content }}</text>
                <view class="option-status">
                  <uni-icons v-if="option.isCorrect" type="checkmarkempty" color="#4caf50" size="18">
                  </uni-icons>
                </view>
              </view>
            </view>
          </view>

          <!-- 判断题选项显示 -->
          <view v-if="question.Type === 3" class="judge-options-section">
            <view 
              v-for="(option, index) in judgeOptions" 
              :key="index" class="judge-option-item" 
              :class="{
                'correct-option': (question.answer === 1 && index === 0) || (question.answer === 0 && index === 1),
              }">
              <view class="judge-option-wrapper">
                <text class="option-tag">{{ String.fromCharCode(65 + index) }}.</text>
                <text class="option-content">{{ option }}</text>
                <view class="option-status">
                  <uni-icons v-if="(question.answer === 1 && index === 0) || (question.answer === 0 && index === 1)"
                    type="checkmarkempty" color="#4caf50" size="18">
                  </uni-icons>
                </view>
              </view>
            </view>
          </view>

          <!-- 填空题用户答案 -->
          <view v-if="question.Type === 2" class="blank-answers-section">
            <view class="user-answer-section">
              <text class="answer-label">您的答案：</text>
              <view class="answer-content">
                <view v-for="(answer, answerIndex) in getUserSubjectiveAnswer(question._id)" :key="answerIndex"
                  class="blank-answer-item">
                  <text class="blank-index">空{{ (answerIndex + 1) }}：</text>
                  <text class="blank-answer">{{ answer || '未填写' }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 简答题用户答案 -->
          <view v-if="question.Type === 4" class="essay-answers-section">
            <view class="user-answer-section">
              <text class="answer-label">您的答案：</text>
              <view class="answer-content ">
                <view v-for="(answer, answerIndex) in getUserSubjectiveAnswer(question._id)" :key="answerIndex"
                  class="essay-answer-item">
                  <text class="essay-answer">{{ answer || '未填写' }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="correct-answer-section">
            <!-- 您的答案(选择题判断题使用) -->
            <view v-if="question.Type === 1 || question.Type === 3">
              <text class="answer-label">您的答案：</text>
              <view class="answer-content error-answer">
                <text>{{ getUserObjectiveAnswerText(question._id) }}</text>
              </view>
            </view>

            <!-- 正确答案显示 -->
            <text class="answer-label">正确答案：</text>
            <view class="answer-content correct-answer">
              <!-- 选择题正确答案 -->
              <view v-if="question.Type === 1">
                <text v-for="(option, index) in question.options" :key="index">
                  <text v-if="option.isCorrect">{{ String.fromCharCode(65 + index) }}</text>
                </text>
              </view>
              <!-- 判断题正确答案 -->
              <view v-else-if="question.Type === 3">
                <text>
                  {{ question.answer === 0 ? 'B' : 'A' }}
                </text>
              </view>
              <!-- 填空题正确答案 -->
              <view v-if="question.Type === 2 || question.Type === 4">
                <view v-for="(option, index) in question.options" :key="index" class="answer-item">
                  <text v-if="question.Type === 2">空{{ (index + 1) }}：{{ option.content }}</text>
                  <text v-else>{{ option.content }}</text>
                </view>
              </view>
              <!-- 简答题正确答案 -->
              <view v-if="question.Type === 4">
                <view class="answer-item"><rich-text :nodes="question.content"></rich-text></view>
              </view>
            </view>
          </view>

          <!-- 解析部分 -->
          <view class="analysis-section">
            <view class="analysis-header">
              <text class="analysis-label">题目解析：</text>
              <uni-icons type="help" size="20" color="#007aff">
              </uni-icons>
            </view>
            <view class="analysis-content">
              <up-markdown 
                :content="question.analysis" 
                v-if="question.analysis && question.analysis !== ''">
              </up-markdown>
              <text v-else class="no-analysis">暂无解析</text>
            </view>
            <view class="ai-warning" v-if="question.isAIanswer === 1">
              <up-icon name="error" color="#f4ae2c" size="15px"></up-icon>
              <text class="ai-warning-text">本解析由 AI 生成，内容仅供参考，请仔细甄别！</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!isLoading">
      <view class="empty-icon">
        <uni-icons type="checkmarkempty" color="#4caf50" size="60"></uni-icons>
      </view>
      <text class="empty-title">暂无错题</text>
      <text class="empty-description">继续练习，提升答题水平吧！</text>
      <up-button type="primary" shape="circle" @click="goToPractice" style="margin-top: 40rpx;">
        去练习
      </up-button>
    </view>
    <BackToTop
      ref="backToTopRef" 
      position="bottom-right"/>
  </view> 
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { onPageScroll } from '@dcloudio/uni-app';
import { useQuestionStore } from '../../stores/modules/QuestionStore'
import { useObjectiveAnswerStore } from '../../stores/modules/ObjectiveAnswerStore'
import { useSubjectiveAnswerStore } from '../../stores/modules/SubjectiveAnswerStore'
import uviewSubsection from '../../components/core/uviewSubsection.vue'
import BackToTop from '../../components/core/BackToTop.vue'
import { 
  addWrongQuestionAPI,
  deleteWrongQuestionAPI ,
  addFavoriteQuestionAPI,
  deleteFavoriteQuestionAPI
} from '../../API/Exam/QuestionAPI';
import formatInfo from '../../util/formatInfo';

// Store 实例
const questionStore = useQuestionStore() // 获取问题数据
const objectiveAnswerStore = useObjectiveAnswerStore() // 获取客观题答案数据
const subjectiveAnswerStore = useSubjectiveAnswerStore() // 获取主观题答案数据

// 响应式数据
const isLoading = ref(true)
const wrongQuestions = ref([])// 错题列表
const currentTypeIndex = ref(0)// 当前选中的题目类型索引
const collectedQuestions = ref(new Set())// 收藏的题目ID集合
const wrongBookQuestions = ref(new Set())// 错题本的题目ID集合
const collectLoading = reactive({})// 收藏加载状态
const wrongBookLoading = reactive({})// 错题本加载状态
const backToTopRef = ref();// 回到顶部组件引用

// 题目类型列表
const questionTypeList = ref([
  { name: '全部' },
  { name: '选择题' },
  { name: '填空题' },
  { name: '判断题' },
  { name: '简答题' }
])
const judgeOptions = ['正确', '错误'];// 判断题选项，A代表正确，B代表错误

// 计算属性, 过滤后的错题列表
const filteredQuestions = computed(() => { // 过滤后的错题列表
  if (currentTypeIndex.value === 0) {
    return wrongQuestions.value
  }
  return wrongQuestions.value.filter(question => question.Type === currentTypeIndex.value)
})

const collectedCount = computed(() => {// 收藏的题目数量
  return collectedQuestions.value.size
})

const addedToBookCount = computed(() => {// 加入错题本的题目数量
  return wrongBookQuestions.value.size
})

/**
 * 切换题目类型筛选
 */
const handleTypeChange = (index) => {
  currentTypeIndex.value = index
}

// 页面加载时获取错题数据
onMounted(() => {
  loadWrongQuestions()

})

// 方法定义

/**
 * 加载错题数据
 *
 */
const loadWrongQuestions = async () => {
  try {
    isLoading.value = true
   
    const currentQuestions = questionStore.UserChooseQuestion  // 获取当前选择的题目列表
    const wrongQuestionsData = [] // 存储错题数据
    
    currentQuestions.forEach(question => {
      const isObjectiveWrong = objectiveAnswerStore.getIsAnswerCorrect(question._id) === false
      const isSubjectiveWrong = subjectiveAnswerStore.getUserSelfEvaluation(question._id) === false
      
      if (isObjectiveWrong || isSubjectiveWrong) { // 客观题或主观题有错误
        wrongQuestionsData.push({
          ...question,
          userAnswer: objectiveAnswerStore.getUserAnswer(question._id) || subjectiveAnswerStore.getUserAnswer(question._id),
          isCorrect: false,
          wrongType: isObjectiveWrong ? 'objective' : 'subjective'
        })
      }
    })
    wrongQuestions.value = wrongQuestionsData
  } catch (error) {
    console.error('加载错题失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

/**
 * 切换收藏状态
 * TODO: 实现API调用
 */
const toggleCollect = async (question) => {
  collectLoading[question] = true
  try {
    const isCurrentlyCollected = isCollected(question._id)
    
    if (isCurrentlyCollected) {
      //调用取消收藏API
      const res = await deleteFavoriteQuestionAPI(question._id)
      if(res.code == 200){
        collectedQuestions.value.delete(question._id)
      }
      collectedQuestions.value.delete(question._id)
      uni.showToast({
        title: '已取消收藏',
        icon: res.code === 200 ? 'success' : 'none'
      })
    } else {
      //调用添加收藏API
      const res = await addFavoriteQuestionAPI(question._id,question.examId,question.Type)
      if(res.code == 200){
        collectedQuestions.value.add(question._id)
      }
      uni.showToast({
        title: res.message,
        icon: res.code === 200 ? 'success' : 'none'
      })
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  } finally {
    collectLoading[question] = false
  }
}

/**
 * 切换错题本状态
 */
const toggleWrongBook = async (question) => {
  wrongBookLoading[question] = true

  try {
    const isCurrentlyInBook = isInWrongBook(question._id)
    
    if (isCurrentlyInBook) {
      //调用从错题本移除API
      const res = await deleteWrongQuestionAPI(question._id)
      if(res.code == 200){
        wrongBookQuestions.value.delete(question._id)
      }
      uni.showToast({
        title: res.message,
        icon: res.code === 200 ? 'success' : 'none'
      })
    } else {
      // 调用加入错题本API
      const res = await addWrongQuestionAPI(question._id,question.examId,question.Type)
      if(res.code === 200){
        wrongBookQuestions.value.add(question._id)
      }
      uni.showToast({
        title:res.message,
        icon: res.code === 200 ? 'success' : 'none'
      })
    }
  }catch (error) {
    console.error('错题本操作失败:', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  } finally {
    wrongBookLoading[question] = false
  }
}

/**
 * 判断题目是否已收藏
 */
const isCollected = (questionId) => {
  return collectedQuestions.value.has(questionId)
}

/**
 * 判断题目是否在错题本中
 */
const isInWrongBook = (questionId) => {
  return wrongBookQuestions.value.has(questionId)
}

/**
 * 获取客观题用户答案文本（用于显示）
 */
const getUserObjectiveAnswerText = (questionId) => {
  const userAnswer = objectiveAnswerStore.getUserAnswer(questionId)
  if (!userAnswer && userAnswer !== 0) return ''
  
  if (Array.isArray(userAnswer)) {
    // 多选题：返回所有选中选项的字母
    return userAnswer.map(index => String.fromCharCode(65 + index)).join('')
  } else {
    // 单选题/判断题：返回选中选项的字母
    return String.fromCharCode(65 + userAnswer)
  }
}

/**
 * 获取主观题用户答案（用于显示）
 */
const getUserSubjectiveAnswer = (questionId) => {
  const answer = subjectiveAnswerStore.getUserAnswer(questionId)
  return Array.isArray(answer) ? answer : [answer || '']
}

/**
 * 跳转到练习页面
 */
const goToPractice = () => {
  uni.switchTab({
    url: '/pages/exam/exam'
  })
}
// 页面滚动事件
onPageScroll((e) => {
  // 调用BackToTop组件的滚动处理方法
  if (backToTopRef.value) {
    backToTopRef.value.handlePageScroll(e);
  }
});
</script>

<style scoped lang="scss">
.wrong-question-container {
  padding: 20rpx;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* 头部统计信息 */
.header-stats {
  margin-bottom: 30rpx;
}

.stats-card {
  display: flex;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.stats-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 20%;
    height: 60%;
    width: 1rpx;
    background-color: #e9ecef;
  }
}

.stats-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #007aff;
  margin-bottom: 10rpx;
}

.stats-label {
  font-size: 26rpx;
  color: #666666;
}

/* 筛选区域 */
.filter-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.filter-label {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;

}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999999;
}

/* 题目卡片 */
.question-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.question-info {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.question-index {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.question-type {
  background-color: #007aff;
  color: #ffffff;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.question-actions {
  display: flex;
  gap: 15rpx;
}

/* 题目内容 */
.question-content {
  padding: 30rpx;
}

.question-stem {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
  line-height: 1.6;
  margin-bottom: 30rpx;
}

/* 选项区域 */
.select-options-section,
.judge-options-section,
.blank-answers-section,
.essay-answers-section {
  margin-bottom: 30rpx;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 20rpx;
  padding: 15rpx 0;
}

.title-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

/* 选择题选项样式 */
.option-item {
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
  
  &.correct-option {
    background-color: #e8f5e9;
    border: 2rpx solid #4caf50;
    box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.2);
  }
  
  
}

.option-wrapper {
  display: flex;
  align-items: center;
  padding: 25rpx 30rpx;
  gap: 15rpx;
}

.option-tag {
  font-size: 28rpx;
  font-weight: bold;
  color: #007aff;
  min-width: 40rpx;
}

.option-content {
  flex: 1;
  font-size: 30rpx;
  color: #333333;
  line-height: 1.5;
}



/* 判断题特殊样式 */
.judge-option-item {
  margin-bottom: 15rpx;
  border-radius: 16rpx;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
  background-color: #f8f9fa;
  
  &.correct-option {
    background-color: #e8f5e9;
    border: 2rpx solid #4caf50;
    box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.2);
  }
  
  &.user-wrong-option {
    background-color: #ffeaea;
    border: 2rpx solid #ff4d4f;
    box-shadow: 0 2rpx 8rpx rgba(255, 77, 79, 0.2);
  }
}

.judge-option-wrapper {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  gap: 15rpx;
  justify-content: space-between;
}

.judge-option-text {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.option-tag {
  font-size: 28rpx;
  font-weight: bold;
  color: #007aff;
  min-width: 40rpx;
}

.option-content {
  font-size: 30rpx;
  color: #333333;
  line-height: 1.5;
}

.option-status {
  display: flex;
  align-items: center;
  gap: 5rpx;
}

/* 填空题答案样式 */
.blank-answer-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15rpx;
  padding: 20rpx 10rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
}

.blank-index {
  font-size: 26rpx;
  font-weight: bold;
  color: #007aff;
  min-width: 80rpx;
  margin-right: 15rpx;
}

.blank-answer {
  flex: 1;
  font-size: 30rpx;
  color: #333333;
  line-height: 1.6;
  word-break: break-all;
}

/* 简答题答案样式 */
.essay-answer-item {
  margin-bottom: 15rpx;
  padding: 25rpx 10rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
}

.essay-answer {
  font-size: 30rpx;
  color: #333333;
  line-height: 1.8;
  word-break: break-all;
  white-space: pre-wrap;
}

/* 主观题答案区域 */
.subjective-answers,
.blank-answers-section,
.essay-answers-section {
  margin-bottom: 30rpx;
}

.user-answer-section {
  margin-bottom: 20rpx;
}

.answer-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 15rpx;
  display: block;
}

.answer-content {
  border-radius: 12rpx;
  padding: 20rpx 5rpx;
  font-size: 30rpx;
  color: #333333;
  line-height: 1.6;
  
  &.error-answer {
    background-color: #ffeaea;
    border: 1rpx solid #ffcdd2;
    color: #d32f2f;
    font-weight: 500;
  }
  
  &.correct-answer {
    background-color: #e8f5e9;
    border: 1rpx solid #c8e6c9;
    color: #2e7d32;
    font-weight: 500;
  }
}

.answer-item {
  font-size: 30rpx;
  color: #333333;
  line-height: 1.6;
  margin-bottom: 10rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

/* 正确答案区域 */
.correct-answer-section {
  margin-bottom: 30rpx;
}

/* 解析区域 */
.analysis-section {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 30rpx;
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.analysis-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.analysis-content {
  font-size: 28rpx;
  color: #555555;
  line-height: 1.7;
  margin-bottom: 15rpx;
}

.no-analysis {
  color: #999999;
  font-style: italic;
}

.no-answer {
  color: #999999;
  font-style: italic;
  font-size: 28rpx;
}

.ai-warning {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 15rpx;
  background-color: #fff8e1;
  border-radius: 8rpx;
  margin-top: 15rpx;
}

.ai-warning-text {
  font-size: 24rpx;
  color: #f57c00;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
  text-align: center;
}

.empty-icon {
  margin-bottom: 30rpx;
  opacity: 0.6;
}

.empty-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 15rpx;
}

.empty-description {
  font-size: 28rpx;
  color: #999999;
  line-height: 1.5;
}
</style>