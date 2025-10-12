<template>
  <view class="question-wrong-container">
    <ThemeLoading v-if="loading" text="正在加载错题..." />
    <!-- 科目筛选 -->
    <SubjectFilter 
      v-model="selectedSubject" 
      :filter-list="subjectList" 
      :show-filter="filteredQuestions.length > 0 && loading === false" />
    <!-- 题目列表 -->
    <view class="question-list">
      <view 
        v-for="(question, index) in filteredQuestions" 
        :key="question.id"
        class="question-item">
        
        <!-- 题目头部信息 -->
        <view class="question-header">
          <view class="subject-tag" :style="{ backgroundColor:'#e74c3c' }">
            {{ question.examName }}
          </view>
          <view class="question-type type-all" >
            {{ formatInfo.getQuestionTypeText(question.questionData.Type) }}
          </view>
          <view class="wrong-status">
            <text class="wrong-icon">❌</text>
          </view>
        </view>
        
        <!-- 题目内容 -->
        <view class="question-content">
          <view class="question-number">第{{ index + 1 }}题</view>
           <view class="question-stem">
            <rich-text :nodes="question.questionData.stem"></rich-text>
          </view>
          <!-- 选择题选项 -->
          <view v-if="question.questionData.Type === 1 && question.questionData.options" class="options-container">
            <view 
              v-for="(option, optIndex) in question.questionData.options" 
              :key="optIndex"
              class="option-item">
              <text class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</text>
              <text class="option-text">{{ option.content}}</text>
            </view>
          </view>
        </view>
        
        <!-- 错题时间和操作 -->
        <view class="question-footer">
          <view class="wrong-time">
            <image src="/static/other/time.png" class="info-icon"></image>
            <text>错题记录于 {{ formatTime.getTime2(question.createTime) }}</text>
          </view>
          <view class="question-actions">
            <button class="action-btn practice-btn" @click="startPractice(question)">
              开始练习
            </button>
            <button class="action-btn remove-btn" @click="removeWrong(question.questionData)">
              移除错题
            </button>
          </view>
        </view>
      </view>
    </view>

    <BackToTop
      ref="backToTopRef" 
      position="bottom-right"/>
      
    <!-- 空状态 -->
    <view v-if="filteredQuestions.length === 0 && loading ===false" class="empty-state" >
      <view class="empty-icon">📝</view>
      <text class="empty-text">暂无错题记录</text>
      <text class="empty-subtext">继续努力，减少错题吧~</text>
    </view>
    
    <!-- 底部立即练习按钮 -->
    <view 
      v-if="filteredQuestions.length > 0 && loading === false" 
      class="bottom-practice-container">
      <button 
        class="bottom-practice-btn" 
        @click="handleOpenSetting">
        练习所有({{ filteredQuestions.length }})
      </button>
    </view>
    <!-- 弹出层 -->
    <view>
      <uviewPopup
        v-model:show="settingpopupShow" 
        title="练习设置">
        <template #popupcontent>
          <PracticeSettings 
            v-if="settingpopupShow"
            v-model:questionCount="questionCount"
            :maxQuestions="filteredQuestions.length"
            v-model:isRandom="isRandom"
            v-model:isOptionRandom="isOptionRandom"
            v-model:isShowAnswer="isShowAnswer"
            v-model:isShowAIHelp="isShowAIHelp"/>
          <view>
            <button class="practice-btn-popup" @click="startAllPractice">
              <uni-icons type="arrow-right" size="20" color="#4d94ff"></uni-icons>
              <text class="btn-text" >开始练习</text>
            </button>
          </view>
        </template>
      </uviewPopup>
    </view>
  </view>
</template>
<script setup>
import { ref,onMounted,computed,watch} from 'vue';
import { getUserWrongQuestionListAPI,deleteWrongQuestionAPI,practiceQuestionAPI} from '../../API/Exam/QuestionAPI';
import formatInfo from '../../util/formatInfo';
import formatTime from '../../util/formatTime';
import ThemeLoading from '../../components/core/ThemeLoading.vue';
import SubjectFilter from '../../components/core/Filter.vue';
import { useQuestionStore } from '../../stores/modules/QuestionStore';
import { onPageScroll } from '@dcloudio/uni-app';
import BackToTop from "../../components/core/BackToTop.vue";
import { useObjectiveAnswerStore } from '../../stores/modules/ObjectiveAnswerStore';
import { useSubjectiveAnswerStore } from '../../stores/modules/SubjectiveAnswerStore';
import uviewPopup from '../../components/core/uviewPopup.vue';
import PracticeSettings from '../../components/modules/exam/PracticeSettings.vue';

const objectiveAnswerStore = useObjectiveAnswerStore();
const subjectiveAnswerStore = useSubjectiveAnswerStore();
const wrongQuestions = ref([]);
const loading = ref(false);
const selectedSubject = ref('全部'); // 当前选中的科目，默认为"全部"
const QuestionStore = useQuestionStore();
const backToTopRef = ref();// 回到顶部组件引用
const settingpopupShow = ref(false); // 弹出层状态
// 练习设置
const questionCount = ref(1) 
const isRandom = ref(false) // 默认不乱序
const isOptionRandom = ref(false) // 默认选项不乱序
const isShowAnswer = ref(false) //是否立即显示答案
const isShowAIHelp = ref(false)//是否开启AI解析

// 获取科目列表
const subjectList = computed(() => {
  // 从错题中提取所有不重复的科目
  const subjects = [...new Set(wrongQuestions.value.map(q => q.examName))];//使用Set去重,[... ] - 使用扩展运算符将 Set 对象转换回数组,
  return subjects;
});

// 根据选中的科目筛选题目
const filteredQuestions = computed(() => {
  if (selectedSubject.value === '全部') {
    return wrongQuestions.value;
  }
  return wrongQuestions.value.filter(question => question.examName === selectedSubject.value);//返回符合条件的题目
});
// 监听错题列表变化，自动更新题目数量为最大值
watch(filteredQuestions, (newVal) => {
  if (newVal.length > 0) {
    questionCount.value = newVal.length;
  }
}, { immediate: true });

// 开始练习
const startPractice = async (question) => { 
  try {
    const res = await practiceQuestionAPI(question.questionData.Type,question.questionData._id);

    if(res.code === 200){
      // 将当前错题设置为练习题目
      QuestionStore.setCurrentQuestionIds([question.questionData._id]);
      
      // 直接设置题目数据
      QuestionStore.SetUserBlankquestions([res.data]);
      
      // 设置用户选择的题目，并获取返回的题目数组
      const selectedQuestions = QuestionStore.setSelectedQuestions(1, false, false);
      
      // 确保题目数据已正确设置
      if (selectedQuestions && selectedQuestions.length > 0) {
        // 清空之前的答案记录
        objectiveAnswerStore.clearAllAnswers();
        subjectiveAnswerStore.clearAllAnswers();
        
        // 导航到练习页面
        uni.navigateTo({
          url: `/pages/exam/PracticeView`
        });
      } else {
        uni.showToast({
          title: '题目数据设置失败',
          icon: 'none'
        });
      }
    } else {
      uni.showToast({
        title: '请求失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('开始练习失败:', error);
    uni.showToast({
      title: '请求失败',
      icon: 'none'
    });
  }
};
// 打开设置弹出层
const handleOpenSetting = ()=>{
    if (filteredQuestions.value.length === 0) {
    uni.showToast({
      title: '暂无错题可练习',
      icon: 'none'
    });
    return;
  }
  settingpopupShow.value = true;
}
// 开始练习所有错题
const startAllPractice = async () => {
  try {
    settingpopupShow.value = false;
    // 获取所有错题ID
    const questionIds = filteredQuestions.value.map(q => {
      return {
        _id: q.questionData._id,
        category: q.questionData.Type
      }
    });
    // 设置错题ID列表
    QuestionStore.setCurrentQuestionIds(questionIds);
    await QuestionStore.FetchQuestionData();// 数据请求获取题目详细信息
    // 再进行题目选择和设置
    QuestionStore.setSelectedQuestions(questionCount.value, isRandom.value, isOptionRandom.value);// 设置选择的题目
    QuestionStore.setUserShowSettings({ // 设置用户显示设置
      showAnswer: isShowAnswer.value,
      showAIHelp: isShowAIHelp.value,
      OptionRandom: isOptionRandom.value,
    });
    // 导航到练习页面
    uni.navigateTo({
      url: `/pages/exam/PracticeView`
    });
  } catch (error) {
    console.error('开始练习所有错题失败:', error);
    uni.showToast({
      title: '请求失败',
      icon: 'none'
    });
  }
};

// 移除错题
const removeWrong = (question) => {
  uni.showModal({
    title: '移除错题',
    content: '确定要移除这道错题吗？',
    showCancel: true,
    cancelText: '取消',
    confirmText: '确定',
    confirmColor: '#FF4500',
    cancelColor: '#666666',
    success: (res) => {
      if (res.confirm) {
        // 从列表中移除
        deleteWrongQuestionAPI(question._id);
        wrongQuestions.value = wrongQuestions.value.filter(q => q.questionData._id !== question._id); 
        // 显示移除成功提示
        uni.showToast({
          title: '已移除错题',
          icon: 'success'
        });
      }
    }
  });
};
// 页面加载时加载错题列表
const loadWrongQuestions = async () => {
  loading.value = true;
  try {
    const res = await getUserWrongQuestionListAPI(); 
    if (res.code === 200) {
      wrongQuestions.value = res.data;
    }
  } catch (error) {
    console.error('加载错题列表失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'error'
    });
  }finally {
    loading.value = false;
  }
};
// 页面滚动事件
onPageScroll((e) => {
  // 调用BackToTop组件的滚动处理方法
  if (backToTopRef.value) {
    backToTopRef.value.handlePageScroll(e);
  }
});

onMounted(() => {
  loadWrongQuestions();
});
</script>
<style scoped>
.question-wrong-container {
  padding: 8rpx;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx; /* 卡片之间的间距 */
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.question-item {
  padding: 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.question-item:active {
  background-color: #f8f9fa;
}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
  gap: 12rpx;
}

.subject-tag {
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 500;
  min-width: 100rpx;
  text-align: center;
}

.question-type {
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 500;
  border: 2rpx solid;
}

.type-all {
  color: #e74c3c;
  border-color: #e74c3c;
  background-color: #fdf2f2;
}


.type-unknown {
  color: #64748b;
  border-color: #64748b;
  background-color: #f1f5f9;
}

.wrong-status {
  margin-left: auto;
}

.wrong-icon {
  font-size: 32rpx;
  color: #e74c3c;
}

.question-content {
  margin-bottom: 24rpx;
}

.question-number {
  font-size: 26rpx;
  color: #4A90E2;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.question-stem {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
  line-height: 1.6;
  margin-bottom: 30rpx;
}

.options-container {
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 12rpx 0;
}

.option-item:last-child {
  border-bottom: none;
}

.option-label {
  font-size: 28rpx;
  color: #4A90E2;
  font-weight: 600;
  margin-right: 16rpx;
  min-width: 40rpx;
}

.option-text {
  font-size: 28rpx;
  color: #34495e;
  line-height: 1.5;
  flex: 1;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx dashed #f0f0f0;
}

.wrong-time {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #95a5a6;
}

.info-icon {
    width: 33rpx;
    height: 33rpx;
    margin-right: 10rpx;
    flex-shrink: 0;
}


.question-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 10rpx 20rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  border: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.practice-btn {
  background: linear-gradient(135deg, #61abff, #49a4ff);
  color: #ffffff;
}

.practice-btn:active {
  background: linear-gradient(135deg, #357ABD, #5b9cff);
  transform: scale(0.95);
}

.remove-btn {
  background-color: #ffffff;
  color: #e74c3c;
  border: 2rpx solid #e74c3c;
}

.remove-btn:active {
  background-color: #e74c3c;
  color: #ffffff;
  transform: scale(0.95);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 32rpx;
  color: #7f8c8d;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.empty-subtext {
  font-size: 28rpx;
  color: #95a5a6;
}

/* 底部练习按钮样式 */
.bottom-practice-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.92));
  backdrop-filter: blur(8rpx);
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
  border-top: 1rpx solid rgba(230, 240, 255, 0.5);
}

.bottom-practice-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #6BB6FF, #4A9FE8);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 40rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4rpx 15rpx rgba(107, 182, 255, 0.4);
  position: relative;
  overflow: hidden;
}

.bottom-practice-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transition: left 0.6s;
}

.bottom-practice-btn:active {
  background: linear-gradient(135deg, #4A9FE8, #3A8FD8);
  transform: scale(0.97);
  box-shadow: 0 2rpx 10rpx rgba(74, 159, 232, 0.5);
}

.bottom-practice-btn:active::before {
  left: 100%;
}
/* 弹出层练习题目按钮 */
.practice-btn-popup {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  color: #4d94ff;
  font-size: 28rpx;
  border-radius: 40rpx;
  border: 2rpx solid #4d94ff;
  box-shadow: 0 4rpx 12rpx rgba(77, 148, 255, 0.15);
  transition: all 0.3s ease;
}

.practice-btn:active {
  background-color: #f0f7ff;
  opacity: 0.8;
}

/* 按钮文字 */
.btn-text {
  margin-left: 8rpx;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .question-item {
    padding: 24rpx;
  }
  
  .question-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 20rpx;
  }
  
  .question-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .question-title {
    font-size: 28rpx;
  }
  
  .option-text {
    font-size: 26rpx;
  }
}
</style>