<template>
  <view class="content">
    <view class="search-container">
      <navigator 
        url="/pages/public/searchview" 
        hover-class="navigator-hover" 
        animation-type="pop-in" 
        animation-duration="300">
         <uniSearch placeholder="搜索考试科目~" />
      </navigator>
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
        <view class="hot-exam-title"><uviewSubsection :list="list" @updateCurrent="handleSendMode"/></view>
        <view class="more-section" @click="handleCreateQuestionBank" v-if="currentMode===0">
          <text class="more-text" >新建题库</text>
          <text class="arrow-icon">›</text>
        </view>
        <view class="more-section" @click="handleViewMore" v-if="currentMode===1">
          <text class="more-text" >查看考试</text>
          <text class="arrow-icon">›</text>
        </view>
      </view>
      <UserQuestionBank v-if="currentMode===0"/>
      <view v-if="currentMode===1">收藏考试</view>
    </view>
  </view>
</template>
<script setup>
import { onMounted,ref } from 'vue';
import uniNoticeBar from '../../components/core/uniNoticeBar.vue';
import uniSwiper from '../../components/core/uniSwiper.vue';
import uniNavigation from '../../components/modules/index/Navbar.vue';
import HotExamContainer from '../../components/modules/index/HotExamContainer.vue';
import UserQuestionBank from '../../components/modules/index/UserQuestionBank.vue';
import { getNoticeInfo ,getIndexBanner} from '../../API/Index/AnnouncementAPI';
import escconfig from '../../config/esc.config';
import uniSearch from '../../components/core/uniSearch.vue';
import uviewSubsection from '../../components/core/uviewSubsection.vue';

const  noticeData = ref([])// 添加notice需要的数据
const swiperList = ref([])// 添加swiper需要的数据
const list = ref(['我的题库', '收藏考试']);// 添加subsection需要的数据
const currentMode = ref(0); // 当前选中的模式，默认为0

//选择模式
const handleSendMode =(value)=>{
  currentMode.value = value; // 更新当前选中的模式
  console.log('当前模式:', currentMode.value); // 输出当前模式
}

const fetchNoticeInfo = async ()=>{
  try{
  const res = await getNoticeInfo()
  noticeData.value = res.data

  }catch(error){
    console.error('获取通知信息失败:',error)
  }

}

const fetchBannerInfo = async ()=>{
  try{
  const res = await getIndexBanner()
  if (res.data && Array.isArray(res.data)) {
    swiperList.value = res.data.map(item => ({
      type: 'image',
      src: `http://${escconfig.serverHost}:${escconfig.serverPort}${item.cover}`,
    }))
  }}catch(error){
    console.error('获取轮播图信息失败:',error)
  }
}

onMounted(() => {
  fetchNoticeInfo()
  fetchBannerInfo()
  
})
const handleViewMore = () => {
  uni.switchTab({
	url: '/pages/exam/exam'
});
}

const handleCreateQuestionBank = () => {
  uni.navigateTo({
      url: '/pages/exam/crquestionbankView'
  })
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
  width: 55%;
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
