<template>
  <view 
    class="tools-container" 
    :class="{ 'sorting-mode': isDragging }"
    :style="{ paddingTop: paddingTop }">
    <!-- 循环渲染工具卡片 -->
    <view 
      v-for="(tool, index) in localToolsList"
      :key="tool.path || index"
      class="tool-card" 
      :class="{ 'tool-card-dragging': isDragging && draggingIndex === index }"
      @tap="handleToolClick(tool)"
      @longpress="startDrag(index, $event)"
      @touchmove.stop.prevent="onDragMove($event)"
      @touchend="endDrag"
      @touchcancel="endDrag">
      <view class="tool-info">
        <view class="tool-title">{{ tool.title }}</view>
        <view class="tool-desc">{{ tool.desc }}</view>
      </view>
      <view class="tool-icon">
        <image
          :src="tool.icon"
          mode="aspectFit"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, nextTick, getCurrentInstance } from 'vue';

// 定义 props
const props = defineProps({
  // 工具列表数据
  toolsList: {
    type: Array,
    default: () => []
  },
  // 顶部内边距
  paddingTop: {
    type: String,
    default: '0px'
  }
});

// 定义 emits
const emit = defineEmits(['toolClick', 'orderChange']);

const localToolsList = ref([]);
const isDragging = ref(false);
const draggingIndex = ref(-1);
const dragTouchY = ref(0);
const ignoreTapOnce = ref(false);
const itemRects = ref([]);
const instance = getCurrentInstance();

const syncLocalTools = (list) => {
  localToolsList.value = Array.isArray(list) ? [...list] : [];
};

watch(
  () => props.toolsList,
  (newList) => {
    if (!isDragging.value) {
      syncLocalTools(newList);
    }
  },
  { immediate: true, deep: true }
);

const getTouchClientY = (event) => {
  if (event?.changedTouches?.length) return event.changedTouches[0].clientY;
  if (event?.touches?.length) return event.touches[0].clientY;
  return 0;
};

const collectItemRects = async () => {
  await nextTick();
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery();
    if (instance?.proxy) {
      query.in(instance.proxy);
    }
    query
      .selectAll('.tool-card')
      .boundingClientRect((rects) => {
        itemRects.value = Array.isArray(rects) ? rects : [];
        resolve(itemRects.value);
      })
      .exec();
  });
};

const findTargetIndexByY = (clientY) => {
  if (!itemRects.value.length) return -1;

  for (let i = 0; i < itemRects.value.length; i += 1) {
    const rect = itemRects.value[i];
    if (clientY >= rect.top && clientY <= rect.bottom) {
      return i;
    }
  }

  if (clientY < itemRects.value[0].top) return 0;
  return itemRects.value.length - 1;
};

const moveTool = async (from, to) => {
  if (from === to || from < 0 || to < 0) return;
  const list = [...localToolsList.value];
  const [moved] = list.splice(from, 1);
  if (!moved) return;
  list.splice(to, 0, moved);
  localToolsList.value = list;
  draggingIndex.value = to;
  await collectItemRects();
};

const startDrag = async (index, event) => {
  if (index < 0 || index >= localToolsList.value.length) return;
  isDragging.value = true;
  draggingIndex.value = index;
  dragTouchY.value = getTouchClientY(event);
  await collectItemRects();
  if (typeof uni.vibrateShort === 'function') {
    uni.vibrateShort({ type: 'light' });
  }
};

const onDragMove = async (event) => {
  if (!isDragging.value) return;
  const currentY = getTouchClientY(event);
  if (!currentY && currentY !== 0) return;
  dragTouchY.value = currentY;

  const targetIndex = findTargetIndexByY(currentY);
  if (targetIndex !== -1 && targetIndex !== draggingIndex.value) {
    await moveTool(draggingIndex.value, targetIndex);
  }
};

const endDrag = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  draggingIndex.value = -1;
  itemRects.value = [];
  ignoreTapOnce.value = true;
  emit('orderChange', [...localToolsList.value]);
  setTimeout(() => {
    ignoreTapOnce.value = false;
  }, 200);
};

// 工具点击处理
const handleToolClick = (tool) => {
  if (isDragging.value || ignoreTapOnce.value) return;
  emit('toolClick', tool);
};
</script>

<style scoped>
.tools-container {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 0 30rpx 30rpx 30rpx;
  width: 100%;
  box-sizing: border-box;
}

.tools-container.sorting-mode {
  user-select: none;
}

/* 工具卡片样式 */
.tool-card {
  background-color: #ffffff;
  border-radius: 8rpx;
  padding: 25rpx 40rpx 25rpx 25rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 12rpx 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  min-height: 120rpx;
  border: 2px solid #ebeef5;
}

.tool-card-dragging {
  opacity: 0.85;
  border-color: #5c8dff;
  box-shadow: 0 8rpx 22rpx rgba(92, 141, 255, 0.2);
}

.tool-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

/* 确保容器在小程序和H5环境下都能正常显示 */
/* #ifdef MP-WEIXIN */
.tools-container {
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
}
/* #endif */

/* #ifdef H5 */
.tools-container {
  padding-bottom: 30rpx;
}
/* #endif */

.tool-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: #ffffff;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-left: 10rpx;
}

.tool-icon image {
  width: 100%;
  height: 100%;
}

.tool-info {
  flex: 1;
}

.tool-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8rpx;
}

.tool-desc {
  font-size: 25rpx;
  color: #a0a5a5;
}

/* 响应式设计 - 小屏幕设备 */
@media screen and (max-width: 750rpx) {
  .tool-card {
    padding: 20rpx;
    min-height: 100rpx;
  }
  
  .tool-icon {
    width: 60rpx;
    height: 60rpx;
    margin-left: 15rpx;
  }
  
  .tool-title {
    font-size: 30rpx;
  }
  
  .tool-desc {
    font-size: 24rpx;
  }
}

/* 响应式设计 - 大屏幕设备 */
@media screen and (min-width: 1200rpx) {
  .tools-container {
    max-width: 900rpx;
    margin-left: auto;
    margin-right: auto;
  }
  
  .tool-card {
    padding: 30rpx;
    min-height: 140rpx;
  }
  
  .tool-icon {
    width: 100rpx;
    height: 100rpx;
    margin-left: 25rpx;
  }
  
  .tool-title {
    font-size: 36rpx;
  }
  
  .tool-desc {
    font-size: 28rpx;
  }
}
</style>
