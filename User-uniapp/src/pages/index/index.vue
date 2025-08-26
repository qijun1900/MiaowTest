<template>
  <view class="content">
    <view class="search-container">
      <uniSearch />
    </view>
    <view class="card-container">
      <view class="noticbar">
        <uniNoticeBar />
      </view>
      <view class="swiper">
        <uniSwiper :list="swiperList" />
      </view>
      <view class="navigation">
        <uniNavigation />
      </view>
    </view>
  </view>
</template>
<script setup>
import uniSearch from '../../components/core/uniSearch.vue';
import uniNoticeBar from '../../components/core/uniNoticeBar.vue';
import uniSwiper from '../../components/core/uniSwiper.vue';
import uniNavigation from '../../components/modules/index/Navbar.vue';

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


</script>
<style scoped lang="scss">
.search-container {
  background-color: $uni-bg-color-primary;
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



</style>
