<template>
  <view class="custom-nav-grid" :style="{ backgroundColor: backgroundColor, borderRadius: borderRadius + 'rpx' }">
    <view class="nav-container">
      <view 
        class="nav-item"
        v-for="(item, index) in items" 
        :key="index" 
        @click="handleNavClick(item)">
        <view class="icon-wrapper" :style="{ backgroundColor: iconBgColor }">
          <image 
            class="nav-icon"
            :src="item.icon" 
            mode="aspectFit"
          />
        </view>
        <text class="nav-title" :style="{ color: textColor, fontSize: fontSize + 'rpx' }">{{ item.title }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import {  computed } from 'vue'

// 组件属性定义
const props = defineProps({
  // 导航项数据
  items: {
    type: Array,
    default: () => []
  },
  // 每行显示的导航项数量
  columns: {
    type: Number,
    default: 4
  },
  // 背景颜色
  backgroundColor: {
    type: String,
    default: '#fff'
  },
  // 圆角大小
  borderRadius: {
    type: Number,
    default: 16
  },
  // 图标背景颜色
  iconBgColor: {
    type: String,
    default: '#f5f5f5'
  },
  // 文字颜色
  textColor: {
    type: String,
    default: '#333'
  },
  // 文字大小
  fontSize: {
    type: Number,
    default: 24
  },
  // 是否自动处理导航
  autoNavigate: {
    type: Boolean,
    default: true
  }
})

// 自定义事件
const emit = defineEmits(['navClick'])


// 导航点击处理
const handleNavClick = (item) => {
  // 触发自定义事件
  emit('navClick', item)
}

// 计算每个导航项的宽度
const itemWidth = computed(() => {
  return 100 / props.columns + '%'
})
</script>

<style scoped>
.custom-nav-grid {
  padding: 20rpx;
  background-color: v-bind(backgroundColor);
  border-radius: v-bind(borderRadius + 'rpx');
}

.nav-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.nav-item {
  width: v-bind(itemWidth);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  transition: all 0.3s ease;
}

.nav-item:active {
  transform: scale(0.95);
  opacity: 0.8;
}

.icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10rpx;
  background-color: v-bind(iconBgColor);
  border-radius: 50%;
}

.nav-icon {
  width: 50rpx;
  height: 50rpx;
}

.nav-title {
  font-size: v-bind(fontSize + 'rpx');
  color: v-bind(textColor);
  text-align: center;
}
</style>