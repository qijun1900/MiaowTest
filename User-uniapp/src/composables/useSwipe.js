import { ref } from 'vue';

export default function useSwipe() {
  const swipeIndex = ref(-1);// 滑动的索引 -1表示没有滑动
  const startX = ref(0);// 触摸开始的X坐标
  const currentX = ref(0);// 当前的X坐标
  const isSwiping = ref(false);// 是否正在滑动

  // 触摸开始
  function handleTouchStart(e, index) {
    if (swipeIndex.value !== -1 && swipeIndex.value !== index) { // 确保只有一个item在滑动
      swipeIndex.value = -1;
    }
    startX.value = e.touches[0].clientX; // 记录触摸开始的X坐标 
    currentX.value = startX.value; // 当前X坐标初始化为触摸开始的X坐标
    isSwiping.value = false; // 重置滑动状态
  }

  // 触摸移动
  function handleTouchMove(e, index) {
    if (!e.touches[0]) return; // 确保有触摸点
    currentX.value = e.touches[0].clientX;  // 更新当前X坐标 
    const deltaX = currentX.value - startX.value; // 计算X轴偏移量
    if (deltaX < -10) {  // 左滑阈值
      isSwiping.value = true;
      if (deltaX <= -80) {  // 左滑距离阈值
        swipeIndex.value = index;
      }
    } else if (deltaX > 10) {  // 右滑阈值，重置滑动状态
      isSwiping.value = true;
      swipeIndex.value = -1;
    }
  }

  // 触摸结束
  function handleTouchEnd(e, index) {
    if (!isSwiping.value) return;  // 如果没有滑动则不处理
    const deltaX = currentX.value - startX.value; // 计算X轴偏移量
    if (deltaX <= -80) {  
      swipeIndex.value = index; 
    } else {
      swipeIndex.value = -1;
    }
    isSwiping.value = false;
  }

  // 重置滑动状态
  function resetSwipe() {
    swipeIndex.value = -1;
    isSwiping.value = false;
  }

  return {
    swipeIndex,  
    handleTouchStart, 
    handleTouchMove,
    handleTouchEnd,
    resetSwipe
  };
}
