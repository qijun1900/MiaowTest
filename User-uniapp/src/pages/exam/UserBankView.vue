<template>
  <view class="UserBankView">
    <!-- 题库信息头部 -->
    <view class="bank-header">
      <view class="bank-icon">
        <image src="/static/other/my-questionbank.png" mode="aspectFit" class="icon-image"></image>
      </view>
      <view class="bank-info">
        <view class="bank-name">{{ bankData.bankName }}</view>
        <view class="bank-meta">
          <view class="meta-item">
            <image src="/static/other/count.png" class="info-icon"></image>
            <text class="meta-text">{{bankData.questionCount}}题</text>
          </view>
          <view class="meta-item">
           <image src="/static/other/open-time.png" class="info-icon"></image>
            <text class="meta-text">{{ formatTime.getTime2(bankData.createTime) }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 题目列表 -->
    <view class="question-list-container">
      <view class="list-header">
        <text class="list-title">题目列表</text>
        <button class="refresh-btn" @click="handleRefresh">
          <uni-icons type="refreshempty" size="22" color="#4d94ff"></uni-icons>
        </button>
      </view>
      <scroll-view 
        scroll-y="true" 
        class="question-scroll" 
        :scroll-with-animation="false" 
        :enable-back-to-top="false">
        <!-- 加载中状态 -->
        <ThemeLoading v-if="isLoading" text="正在加载题目..." />
        
        <!-- 题目列表 -->
        <view class="question-list" v-else-if="QuestionData.length > 0">
          <!-- 题目项 -->
          <view class="question-item" v-for="(item,index) in QuestionData" :key="item._id">
            <view class="question-number">第{{ (index + 1) }}题</view>
            <view class="question-content">
              <view class="question-type">{{ item.typeName }}</view>
              <div class="question-title" v-html="item.stem"></div>
            </view>
            <view class="question-action">
              <button class="edit-btn" @click="handleEditQuestion(item, index)">
                <uni-icons type="compose" size="20" color="#4d94ff"></uni-icons>
              </button>
            </view>
          </view>
        </view>
        
        <!-- 题目为空时候 -->
        <Empty description="暂无题目数据" class="empty" v-else />
        <!-- 底部提示 -->
        <ThemDivider textPosition="center" text="已经到底部了" v-if="QuestionData.length>0 && !isLoading"/>
      </scroll-view>
    </view>
    
    <!-- 底部按钮 -->
    <view class="bottom-button">
      <button class="add-question-btn" @click="handleAddQuestion">
        <uni-icons type="plus" size="20" color="#fff"></uni-icons>
        <text class="btn-text">添加题目</text>
      </button>
      <button class="practice-btn"  @click="handleOpenSetting">
        <uni-icons type="arrow-right" size="20" color="#4d94ff"></uni-icons>
        <text class="btn-text" >练习题目</text>
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
            :maxQuestions="QuestionData.length"
            v-model:isRandom="isRandom"
            v-model:isOptionRandom="isOptionRandom"
            v-model:isShowAnswer="isShowAnswer"
            v-model:isShowAIHelp="isShowAIHelp"/>
          <view>
            <button class="practice-btn" @click="handleStart">
              <uni-icons type="arrow-right" size="20" color="#4d94ff"></uni-icons>
              <text class="btn-text" >开始练习</text>
            </button>
          </view>
        </template>
      </uviewPopup>
    </view>
  </view>
</template>

<script  setup>
import { onLoad } from '@dcloudio/uni-app';
import { ref,onMounted } from 'vue';
import ThemDivider from '../../components/core/ThemeDivider.vue';
import formatTime from '../../util/formatTime'
import { getUserBankQuestionList } from '../../API/Exam/QuestionAPI';
import Empty from '../../components/core/Empty.vue';
import ThemeLoading from '../../components/core/ThemeLoading.vue';
import { useQuestionStore } from '../../stores/modules/QuestionStore';
import uviewPopup from '../../components/core/uviewPopup.vue';
import PracticeSettings from '../../components/modules/exam/PracticeSettings.vue';

const bankData  =ref([]);// 题库信息数据
const QuestionData = ref([]);//题库题目数据
const isLoading = ref(false); // 加载状态
const QuestionStore = useQuestionStore()
const settingpopupShow = ref(false); // 弹出层状态
// 练习设置
const questionCount = ref(1) 
const isRandom = ref(false) // 默认不乱序
const isOptionRandom = ref(false) // 默认选项不乱序
const isShowAnswer = ref(false) //是否立即显示答案
const isShowAIHelp = ref(false)//是否开启AI解析

// 添加题目
 const handleAddQuestion = () => {
   uni.navigateTo({
    url: `/pages/exam/ManualImportView?bankName=${bankData.value.bankName}&bankId=${bankData.value.bankId}&isNewCreate=false`
  })
 }

//练习题目设置
const handleOpenSetting = ()=>{
    if(QuestionData.value.length==0){
      uni.showToast({
        title: '题库暂无题目请添加题目后练习',
        icon: 'none'
      })
      return;
    }
    settingpopupShow.value = true;
    // 先设置题目数据到Store，确保有数据可供选择
    QuestionStore.SetUserBlankquestions(QuestionData.value);
}

// 开始练习
const handleStart = ()=>{
  settingpopupShow.value = false;
  // 再进行题目选择和设置
  QuestionStore.setSelectedQuestions(questionCount.value, isRandom.value, isOptionRandom.value);// 设置选择的题目
  QuestionStore.setUserShowSettings({ // 设置用户显示设置
    showAnswer: isShowAnswer.value,
    showAIHelp: isShowAIHelp.value,
    OptionRandom: isOptionRandom.value,
  });
  uni.navigateTo({
    url: `/pages/exam/PracticeView`
  })
}
// 编辑题目
const handleEditQuestion = (questionData) => {
  uni.navigateTo({
    url: `/pages/exam/ManualImportView?bankId=${bankData.value.bankId}&isEdit=true&data=${encodeURIComponent(JSON.stringify(questionData))}`
  })

}

// 刷新题目列表
const handleRefresh = () => {
  fetchUserQuestion();
}

const fetchUserQuestion = async()=>{
  try{
    isLoading.value = true;
    const res = await getUserBankQuestionList(bankData.value.bankId);
    QuestionData.value = res.data;
    
  }catch(e){
    console.log(e)
    uni.showToast({
      title: '获取题目失败，请稍后再试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false;
  }
};
onLoad((option)=>{
  if(option.data){
    const data = JSON.parse(decodeURIComponent(option.data));
    bankData.value = data;
    questionCount.value = bankData.value.questionCount;// 设置默认题目数量
  };
})

onMounted(()=>{
  fetchUserQuestion()
})

</script>

<style scoped>
.UserBankView {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f9ff;
  padding-bottom: 20rpx;
}

/* 题库信息头部 */
.bank-header {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: #e6f2ff;
  border-radius: 0 0 20rpx 20rpx;
  margin-bottom: 20rpx;
}

.bank-icon {
  width: 120rpx;
  height: 120rpx;
  margin-right: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #b3d9ff;
  border-radius: 20rpx;
}

.icon-image {
  width: 80rpx;
  height: 80rpx;
}

.bank-info {
  flex: 1;
}

.bank-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #1a5fb4;
  margin-bottom: 15rpx;
}

.bank-meta {
  display: flex;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-right: 30rpx;
  margin-bottom: 10rpx;
}

.info-icon {
  width: 33rpx;
  height: 33rpx;
  margin-right: 10rpx;
  flex-shrink: 0;
}

.meta-text {
  font-size: 26rpx;
  color: #666;
}

/* 题目列表 */
.question-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0 25rpx;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #e6f2ff;
}

.list-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1a5fb4;
}

/* 刷新按钮 */
.refresh-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: 2rpx solid #4d94ff;
  border-radius: 50%;
  padding: 0;
  margin: 0;
  transition: all 0.3s ease;
}

.refresh-btn:active {
  background-color: #f0f7ff;
  transform: rotate(360deg);
}

.question-scroll {
  flex: 1;
  height: 0;
  -webkit-overflow-scrolling: touch;
}

.question-list {
  padding: 10rpx 0;
}

.question-item {
  display: flex;
  align-items: center;
  padding: 25rpx 20rpx;
  border-bottom: 1rpx solid #f0f7ff;
  transition: background-color 0.2s ease;
}

.question-item:hover {
  background-color: #fafcff;
}

.question-number {
  width: 100rpx;
  font-size: 28rpx;
  color: #666;
  text-align: center;
}

.question-content {
  flex: 1;
}

.question-type {
  font-size: 22rpx;
  color: #4d94ff;
  margin-bottom: 8rpx;

}

.question-title {
  font-size: 31rpx;
  color: #333;
  line-height: 1.5;
}

.question-action {
  width: 120rpx;
  display: flex;
  justify-content: center;
}

/* 编辑按钮 */
.edit-btn {
  width: 100rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f7ff;
  border: 2rpx solid #4d94ff;
  border-radius: 28rpx;
  padding: 0 8rpx;
  margin: 0;
  font-size: 22rpx;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(77, 148, 255, 0.15);
}

.edit-btn:active {
  background-color: #e6f2ff;
  transform: scale(0.98);
  box-shadow: 0 1rpx 4rpx rgba(77, 148, 255, 0.2);
}




/* 底部按钮 */
.bottom-button {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  margin-top: 10rpx;
}

/* 添加题目按钮 */
.add-question-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4d94ff;
  color: #fff;
  font-size: 28rpx;
  border-radius: 40rpx;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(77, 148, 255, 0.3);
  transition: all 0.3s ease;
}

.add-question-btn:active {
  background-color: #3d7fd9;
  opacity: 0.8;
}

/* 练习题目按钮 */
.practice-btn {
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
.empty {
    margin-top: 150rpx;
}


</style>