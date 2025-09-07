<template>
  <up-popup 
    :show="show" 
    @update:show="emit('update:show', $event)"
    :mode="props.mode" 
    :closeable="closeable"
    :closeOnClickOverlay="closeOnClickOverlay"
    @close="handleClose"
    :overlay="overlay">
    <view class="answer-sheet-popup">
      <!-- 标题区域 -->
      <view class="popup-header" v-if="title">
        <text class="popup-title">{{ title }}</text>
      </view>
      
      <!-- 内容区域 -->
      <view class="popup-content">
        <slot name="popupcontent"></slot>
      </view>
      
    </view>
  </up-popup>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// 定义组件属性
const props = defineProps({
  // 控制弹窗显示
  show: {
    type: Boolean,
    default: false
  },
  // 弹窗模式
  mode: {
    type: String,
    default: 'bottom'
  },
  // 圆角大小
  round: {
    type: Number,
    default: 10
  },
  // 是否显示关闭按钮
  closeable: {
    type: Boolean,
    default: true
  },
  // 点击遮罩是否关闭
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  },
  // 标题
  title: {
    type: String,
    default: ''
  },
  //是否显示遮罩
  overlay:
  {
    type: Boolean,
    default: true,
  }
});

// 定义事件
const emit = defineEmits(['update:show',  'close']);

// 处理关闭事件
const handleClose = () => {
  emit('update:show', false);
  emit('close');
};

</script>

<style scoped>
.answer-sheet-popup {
  padding: 20rpx;
  min-height: 200rpx;
  display: flex;
  flex-direction: column;
  background-color: #f3f3f3;
  border-radius: 20rpx 20rpx 0 0;
}

.popup-header {
  padding: 10rpx 0;
  text-align: center;
  border-bottom: 1px solid #c6c6c6;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.popup-content {
  flex: 1;
  padding: 40rpx 0;
  overflow-y: auto;
}



</style>