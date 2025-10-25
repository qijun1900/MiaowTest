<template>
  <swiper
    class="uni-swiper"
    :indicator-dots="props.indicatorDots"
    :autoplay="props.autoplay"
    :interval="props.interval"
    :duration="props.duration"
    :circular="props.circular"
    @change="onChange"
  >
    <swiper-item v-for="(item, index) in list" :key="index">
      <view class="swiper-item">
        <image
          v-if="item.type === 'image'"
          :src="item.src"
          :mode="item.mode || 'aspectFill'"
          class="swiper-image"
          @click="onItemClick(item, index)"
        />
        <view
          v-else
          class="swiper-content"
          @click="onItemClick(item, index)"
        >
          {{ item.content || '' }}
        </view>
      </view>
    </swiper-item>
  </swiper>
</template>

<script setup>


const props = defineProps({
  list: {// 轮播图列表
    type: Array,
    default: () => []
  },
  indicatorDots: {// 是否显示指示器
    type: Boolean,
    default: false
  },
  autoplay: {// 是否自动播放
    type: Boolean,
    default: true
  },
  interval: {// 自动切换时间间隔（毫秒）
    type: Number,
    default: 3000
  },
  duration: {// 滑动动画时长（毫秒）
    type: Number,
    default: 500
  },
  circular: {// 是否采用衔接滑动
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['change', 'itemClick'])

const onChange = (e) => {
  emit('change', e)
}

const onItemClick = (item, index) => {
  emit('itemClick', { item, index })
}
</script>

<style scoped>
.uni-swiper {
  width: 100%;
  height: 300rpx;
}

.swiper-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swiper-image {
  width: 100%;
  height: 100%;
  display: block;
}

.swiper-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #333;
}
</style>