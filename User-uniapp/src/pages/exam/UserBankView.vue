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
      <scroll-view scroll-y="true" class="question-scroll">
        <view class="question-list">
          <!-- 题目项 -->
          <view class="question-item" v-for="i in 30" :key="i">
            <view class="question-number">第{{i}}题</view>
            <view class="question-content">
              <view class="question-type">选择题</view>
              <view class="question-title">下列关于函数极限的说法，正确的是？</view>
            </view>
            <view class="question-action">
             <uni-icons type="compose" size="23"></uni-icons>
            </view>
          </view>
        </view>
        <ThemDivider textPosition="center" text="已经到底部了"/>
      </scroll-view>
    </view>
    
    <!-- 底部按钮 -->
    <view class="bottom-button">
      <button class="add-more-btn">添加更多题目</button>
    </view>
  </view>
</template>

<script  setup>
import { onLoad } from '@dcloudio/uni-app';
import { ref,onMounted } from 'vue';
import ThemDivider from '../../components/core/ThemeDivider.vue';
import formatTime from '../../util/formatTime'

const bankData  =ref([])
onLoad((option)=>{
  if(option.data){
    const data = JSON.parse(decodeURIComponent(option.data))
    bankData.value = data
    console.log(data)
  }

})
onMounted(()=>{

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
  font-size: 30rpx;
  color: #333;
  line-height: 1.4;
}

.question-action {
  width: 60rpx;
  display: flex;
  justify-content: center;
}


/* 底部按钮 */
.bottom-button {
  padding: 20rpx 30rpx;
  margin-top: 10rpx;
}

.add-more-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #4d94ff;
  color: #fff;
  font-size: 30rpx;
  border-radius: 40rpx;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(77, 148, 255, 0.3);
}
</style>