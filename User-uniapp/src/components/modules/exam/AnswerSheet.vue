<template>
  <view class="answer-sheet-container">
    <view class="answer-sheet-grid">
      <view 
        v-for="(question, index) in props.questions" 
        :key="index"
        class="answer-item"
        @click="handleQuestionClick(index)">
        <view 
          class="answer-circle" 
          :class="{
            'correct': isAnsweredCorrectly(question._id),
            'incorrect': isAnsweredIncorrectly(question._id),
            'unanswered': !isAnswered(question._id),
            'current': currentIndex === index
          }">
          {{ index + 1 }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useObjectiveAnswerStore } from '../../../stores/modules/ObjectiveAnswerStore';
import { useSubjectiveAnswerStore } from '../../../stores/modules/SubjectiveAnswerStore';

// 定义组件属性
const props = defineProps({
  questions: {
    type: Array,
    required: true
  },
  currentIndex: {
    type: Number,
    default: 0
  }
});

// 定义事件
const emit = defineEmits(['question-click']);

// 获取Store实例
const ObjectiveAnswerStore = useObjectiveAnswerStore();
const SubjectiveAnswerStore = useSubjectiveAnswerStore();

// 处理题目点击事件
const handleQuestionClick = (index) => {
  emit('question-click', index);
};

// 判断题目是否已回答
const isAnswered = (questionId) => {
  // 先检查客观题
  const objectiveAnswer = ObjectiveAnswerStore.getUserAnswer(questionId);
  if (objectiveAnswer !== undefined) {
    return true;
  }
  
  // 再检查主观题
  const subjectiveAnswer = SubjectiveAnswerStore.getUserAnswer(questionId);
  return subjectiveAnswer !== undefined;
};

// 判断客观题是否正确
const isObjectiveCorrect = (questionId) => {
  return ObjectiveAnswerStore.getIsAnswerCorrect(questionId) === true;
};

// 判断主观题是否正确（基于用户自评）
const isSubjectiveCorrect = (questionId) => {
  return SubjectiveAnswerStore.getUserSelfEvaluation(questionId) === true; 
};

// 判断题目是否回答正确
const isAnsweredCorrectly = (questionId) => {
  // 客观题正确
  if (isObjectiveCorrect(questionId)) {
    return true;
  }
  
  // 主观题且用户自评正确
  if (isSubjectiveCorrect(questionId)) {
    return true;
  }
  
  return false;
};

// 判断题目是否回答错误
const isAnsweredIncorrectly = (questionId) => {
  // 已回答但客观题错误
  if (isAnswered(questionId) && ObjectiveAnswerStore.getIsAnswerCorrect(questionId) === false) {
    return true;
  }
  
  // 主观题已回答且用户自评错误
  if (isAnswered(questionId) && SubjectiveAnswerStore.getUserSelfEvaluation(questionId) === false) {
    return true;
  }
  
  return false;
};
</script>

<style scoped>
.answer-sheet-container {
  padding: 20rpx;
}

.answer-sheet-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 20rpx;
}

.answer-item {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20rpx;
}

.answer-circle {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  background-color: #f5f5f5; /* 未答题默认浅灰色 */
  border: 2rpx solid #dcdfe6;
}

.answer-circle.correct {
  background-color: #4caf50; /* 答对绿色 */
  border-color: #4caf50;
  color: #ffffff; /* 答对时文字为白色 */
}

.answer-circle.incorrect {
  background-color: #f56c6c; /* 答错红色 */
  border-color: #f56c6c;
  color: #ffffff; /* 答错时文字为白色 */
}

.answer-circle.unanswered {
  background-color: #f5f5f5; /* 未答题浅灰色 */
  border-color: #dcdfe6;
  color: #333333; /* 未答题时文字为深色 */
}

.answer-circle.current {
  background-color: #e6f7ff; /* 当前题目淡蓝色背景 */
  border-color: #1890ff;
  color: #1890ff; /* 当前题目文字为蓝色 */
}

/* 当题目既是当前又是已答对/答错时的样式优先级 */
.answer-circle.current.correct {
  background-color: #e6f7ff; /* 当前题目优先显示淡蓝色背景 */
  border-color: #1890ff;
  color: #1890ff; /* 当前题目优先显示蓝色文字 */
}

.answer-circle.current.incorrect {
  background-color: #e6f7ff; /* 当前题目优先显示淡蓝色背景 */
  border-color: #1890ff;
  color: #1890ff; /* 当前题目优先显示蓝色文字 */
}
</style>