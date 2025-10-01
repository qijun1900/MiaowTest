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
            <view class="question-number">第{{index+1}}题</view>
            <view class="question-content">
              <view class="question-type">{{ item.typeName }}</view>
              <div class="question-title" v-html="item.stem"></div>
            </view>
            <view class="question-action">
             <uni-icons type="compose" size="23"></uni-icons>
            </view>
          </view>
        </view>
        
        <!-- 题目为空时候 -->
        <Empty description="暂无题目数据" class="empty" v-else />
        <!-- 底部提示 -->
        <ThemDivider textPosition="center" text="已经到底部了" v-if="QuestionData.length>0"/>
      </scroll-view>
    </view>
    
    <!-- 底部按钮 -->
    <view class="bottom-button">
      <button class="add-question-btn" @click="handleAddQuestion">
        <uni-icons type="plus" size="20" color="#fff"></uni-icons>
        <text class="btn-text">添加题目</text>
      </button>
      <button class="practice-btn">
        <uni-icons type="arrow-right" size="20" color="#4d94ff"></uni-icons>
        <text class="btn-text"  @click="handlePracticeQuestion">练习题目</text>
      </button>
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

const bankData  =ref([]);// 题库信息数据
const QuestionData = ref([]);//题库题目数据
const isLoading = ref(false); // 加载状态

// 添加题目
 const handleAddQuestion = () => {
   uni.navigateTo({
    url: `/pages/exam/ManualImportView?bankName=${bankData.value.bankName}&bankId=${bankData.value.bankId}&isNewCreate=false`
  })
 }
 // 练习题目
// const handlePracticeQuestion = () => {
//    uni.navigateTo({
//     url: `/pages/exam/PracticeView?bankName=${bankData.value.bankName}&bankId=${bankData.value.bankId}`
//   })
// }


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
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #e6f2ff;
}

.list-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1a5fb4;
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
  padding: 20rpx 30rpx 20rpx 20rpx;
  border-bottom: 1rpx solid #f0f7ff;
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
  width: 60rpx;
  display: flex;
  justify-content: center;
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