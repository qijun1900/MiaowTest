<template>
  <view class="content">
    <view class="search-container">
      <uniSearch placeholder="搜索考试名称"/>
    </view>
    <view class="card-container">
      <view class="noticbar">
        <uniNoticeBar :noticeData="noticeData"/>
      </view>
      <view class="swiper">
        <uniSwiper :list="swiperList" />
      </view>
      <view class="navigation">
        <uniNavigation />
      </view>
    </view>
    <view class="hot-exam">
      <view class="header-section">
        <view class="hot-exam-title">推荐练习</view>
        <view class="more-section" @click="handleViewMore">
          <text class="more-text">查看更多</text>
          <text class="arrow-icon">›</text>
        </view>
      </view>
      <HotExamContainer />
    </view>
    <view class="my-question-bank">
      <view class="header-section">
        <view class="hot-exam-title">我的题库</view>
        <view class="more-section" @click="handleCreateQuestionBank">
          <text class="more-text">新建题库</text>
          <text class="arrow-icon">›</text>
        </view>
      </view>
      <UserQuestionBank />
    </view>
  </view>
</template>
<script setup>
import { onMounted,ref } from 'vue';
import uniSearch from '../../components/core/uniSearch.vue';
import uniNoticeBar from '../../components/core/uniNoticeBar.vue';
import uniSwiper from '../../components/core/uniSwiper.vue';
import uniNavigation from '../../components/modules/index/Navbar.vue';
import HotExamContainer from '../../components/modules/index/HotExamContainer.vue';
import UserQuestionBank from '../../components/modules/index/UserQuestionBank.vue';
import { getNoticeInfo } from '../../API/Index/AnnouncementAPI';


const  noticeData = ref([])
const swiperList = [
  {
    type: 'image',
    src: 'https://picsum.photos/800/400?random=1',
    mode: 'aspectFill'
  },
  {
    type: 'image',
    src: 'https://picsum.photos/800/400?random=2',
    mode: 'aspectFill'
  },
  {
    type: 'image',
    src: 'https://picsum.photos/800/400?random=3',
    mode: 'aspectFill'
  }
]

const fetchNoticeInfo = async ()=>{
  try{
  const res = await getNoticeInfo()
  noticeData.value = res.data
  console.log(noticeData.value)

  }catch(error){
    console.error('获取通知信息失败:',error)
  }

}

onMounted(() => {
  fetchNoticeInfo()
  
})
const handleViewMore = () => {
  console.log('查看更多推荐练习')
  // 这里可以添加跳转到更多练习页面的逻辑
  // uni.navigateTo({
  //     url: '/pages/exam/more'
  // })
}

const handleCreateQuestionBank = () => {
  console.log('新建题库')
  // 这里可以添加跳转到新建题库页面的逻辑
  // uni.navigateTo({
  //     url: '/pages/questionbank/create'
  // })
}
</script>
<style scoped lang="scss">
.search-container {
  background-color: $uni-bg-color-primary;
  position: sticky;
  top: 0;
  z-index: 100;
}

.card-container {
  margin-top: 20rpx;
  border-radius: 20rpx;
  background-color: #e6eeff;
  overflow: hidden;
}

.noticbar {
  margin-top: 3rpx;
}

.swiper {
  padding-left: 10rpx;
  padding-right: 10rpx;
}

.hot-exam {
  padding: 20rpx;
  background-color: #ffffff;
  border-radius: 12rpx;
  margin: 20rpx 0;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.hot-exam-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  padding-left: 10rpx;
  border-left: 6rpx solid #007AFF;
}

.more-section {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 20rpx;
  transition: background-color 0.2s ease;
}

.more-section:active {
  background-color: #e8e8e8;
}

.more-text {
  font-size: 24rpx;
  color: #666666;
  margin-right: 8rpx;
}

.arrow-icon {
  font-size: 28rpx;
  color: #007AFF;
  font-weight: bold;
}

.my-question-bank {
  padding: 20rpx;

}
</style>
