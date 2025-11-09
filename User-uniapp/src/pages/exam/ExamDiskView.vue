<template>
  <view class="view">
    <view class="container">
      <view class="head">
        <view class="head-title">
          <view class="title">
            通过 <text class="platform-name">{{ type === 1 ? "夸克网盘":"百度网盘" }} </text>获取
          </view>
        </view>
      </view>
      
      <view class="content">
        <view class="content-card">
          <view class="content-title">
            <view class="title-item">
              <text class="label">文件名称:</text>
              <text class="value">{{ title || "未知文件" }}</text>
            </view>
            <view class="title-item">
              <text class="label">更新时间:</text>
              <text class="value">{{ formatTime.getTime2(updateTime) || "未知时间" }}</text>
            </view>
          </view>
          
          <view class="content-img">
            <image 
              v-if="type === 1"
              src="/static/other/quark.png" 
              class="net-image"
              mode="aspectFit"/>
            <image
              v-if="type === 2"
              src="/static/other/baidu.png"
              class="net-image"
              mode="aspectFit"/>
          </view>
          
          <view class="content-action">
            <button 
              class="action-btn primary"
              :class="{ 'loading': copyLoading, 'success': copySuccess }"
              @click="copyLink"
              :loading="copyLoading"
              :disabled="copyLoading">
              <view class="btn-content">
                <view class="btn-icon" v-if="copySuccess">
                  <uni-icons type="checkmarkempty" size="20" color="#fff"></uni-icons>
                </view>
                <view class="btn-icon loading-icon" v-else-if="copyLoading">
                  <uni-icons type="spinner-cycle" size="20" color="#fff"></uni-icons>
                </view>
                <view class="btn-icon" v-else>
                  <uni-icons type="copy" size="20" color="#fff"></uni-icons>
                </view>
                <text class="btn-text">{{ copySuccess ? "复制成功" : (copyLoading ? "复制中..." : "复制链接") }}</text>
              </view>
            </button>
          </view>
        </view>
      </view>
      
      <view class="footer">
        <view class="tips">
          <view class="tip-item">
            <uni-icons type="info" size="18" color="#666"></uni-icons>
            <text class="tip-text">点击"复制链接"按钮可复制网盘链接到剪贴板</text>
          </view>
           <view class="tip-item">
            <uni-icons type="help" size="18" color="#666"></uni-icons>
            <text class="tip-text">打开对应网页或者应用即可获取</text>
          </view>
          <view class="tip-item">
            <uni-icons type="help" size="18" color="#666"></uni-icons>
            <text class="tip-text">如链接失效，请联系客服更新</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import formatTime from '../../util/formatTime';
import {getExamTitleNetUrlAPI}  from '../../API/Exam/ExamAPI';
import copy from '../../util/copy';

const title = ref('');
const titleid = ref(null);
const type = ref(1);
const updateTime = ref('');
const copyLoading = ref(false);
const copySuccess = ref(false);
const examId = ref(null);

onLoad((option) => {
  console.log('ExamDiskView onLoad',option); // 输出 titleid 和 type 1-夸克网盘 2-百度网盘
  if(!option.titleid && !option.type){
    uni.showToast({
      title: '参数错误',
      icon: 'none',
      duration: 2000,
    })
    uni.navigateBack({
      delta: 1,
    })
  }else{
    titleid.value = option.titleid;
    type.value = Number(option.type);
    title.value = option.title || '';
    updateTime.value = option.time || '';
    examId.value = option.examId || null;
    
  }
})

// 复制链接功能
const copyLink = async() => {
  if (copyLoading.value) return; // 防止重复点击
  
  copyLoading.value = true;
  copySuccess.value = false;
  try {
    const res = await getExamTitleNetUrlAPI({
      titleid: titleid.value,
      examId: examId.value
    })
    if(res.code === 200){
      const link = res.data[0];
      if(link){
        // 直接调用复制函数，它会处理成功/失败的提示
        copy(link);
        // 设置成功状态
        copySuccess.value = true;
      } else {
        uni.showToast({
          title: '未获取到链接',
          icon: 'none'
        });
      }
    } else {
      uni.showToast({
        title: res.message || '获取链接失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('复制失败:', error);
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    });
  } finally {
    copyLoading.value = false;
    // 5秒后重置成功状态，让按钮恢复到初始状态
    if (copySuccess.value) {
      setTimeout(() => {
        copySuccess.value = false;
      }, 5000);
    }
  }
}
</script>

<style scoped>
.view {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20rpx;
}

.container {
  max-width: 750rpx;
  margin: 0 auto;
}

.head {
  padding: 40rpx 0 30rpx;
  text-align: center;
}

.head-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.platform-name {
  color: #007AFF;
  font-weight: bold;
  margin-left: 2rpx;
  margin-right: 5rpx;
}

.content {
  margin-bottom: 40rpx;
}

.content-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.content-title {
  margin-bottom: 40rpx;
}

.title-item {
  display: flex;
  margin-bottom: 20rpx;
  font-size: 28rpx;
}

.label {
  color: #666;
  width: 160rpx;
  flex-shrink: 0;
}

.value {
  color: #333;
  flex: 1;
  word-break: break-all;
}

.content-img {
  display: flex;
  justify-content: center;
  margin: 40rpx 0;
}

.net-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 20rpx;
}

.content-action {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 40rpx;
}

.action-btn {
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  text-align: center;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
}

.primary {
  background-color: #007AFF;
  color: #fff;
}

.primary:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 122, 255, 0.2);
}

.primary.loading {
  background-color: #5AC8FA;
  box-shadow: 0 4rpx 12rpx rgba(90, 200, 250, 0.3);
}

.primary.success {
  background-color: #4CD964;
  box-shadow: 0 4rpx 12rpx rgba(76, 217, 100, 0.3);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.btn-icon {
  margin-right: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-text {
  font-weight: 500;
  letter-spacing: 1rpx;
}

.secondary {
  background-color: #fff;
  color: #007AFF;
  border: 2rpx solid #007AFF;
}

.footer {
  margin-top: 20rpx;
}

.tips {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.tip-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
  font-size: 26rpx;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-text {
  margin-left: 16rpx;
  color: #666;
  line-height: 1.5;
}

.tip-text.success {
  color: #4CAF50;
}

/* 响应式调整 */
@media screen and (max-width: 480px) {
  .content-card {
    padding: 30rpx;
  }
  
  .title-item {
    font-size: 26rpx;
  }
  
  .action-btn {
    height: 80rpx;
    line-height: 80rpx;
    font-size: 30rpx;
  }
}
</style>