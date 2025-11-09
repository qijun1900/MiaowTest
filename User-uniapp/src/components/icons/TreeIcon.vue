<template>
  <!-- 树形图标组件，支持微信小程序平台 -->
  <view class="container" :style="{ width: baseSize + 'rpx', height: baseSize + 'rpx' }">
    <view class="tree" :style="{ 
      width: baseSize + 'rpx', 
      height: baseSize + 'rpx',
      transform: 'rotateX(-20deg) rotateY(' + rotation + 'deg)'
    }">
      <!-- 树枝层 -->
      <view v-for="branchIndex in 4" :key="'branch-' + branchIndex" 
            class="branch" 
            :style="{ 
              top: (-baseSize * 0.5) + 'rpx',
              transform: 'translateY(' + (branchIndex * branchSpacing) + 'rpx) translateZ(0rpx)'
            }">
        <view v-for="leafIndex in 4" :key="'leaf-' + leafIndex" 
              class="leaf" 
              :style="{ 
                transform: 'rotateY(' + (leafIndex * 90) + 'deg) rotateX(30deg) translateZ(' + leafDepth + 'rpx)'
              }"></view>
      </view>
      
      <!-- 树干 -->
      <view class="stem">
        <view v-for="sideIndex in 4" :key="'side-' + sideIndex" 
              class="stem-side" 
              :style="{ 
                transform: 'rotateY(' + (sideIndex * 90) + 'deg) translateZ(' + stemDepth + 'rpx)'
              }"></view>
      </view>
      
      <!-- 阴影 -->
      <view class="shadow" :style="{ 
        transform: 'rotateX(90deg) translateZ(' + (-shadowDepth) + 'rpx)',
        filter: 'blur(' + shadowBlur + 'rpx)'
      }"></view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  size: {
    type: Number,
    default: 1
  }
})

// 计算基础尺寸
const baseSize = computed(() => 100 * props.size)

// 计算相关尺寸
const branchSpacing = computed(() => baseSize.value * 0.25)
const leafDepth = computed(() => baseSize.value * 0.285)
const stemDepth = computed(() => baseSize.value * 0.075)
const shadowDepth = computed(() => baseSize.value * 0.65)
const shadowBlur = computed(() => baseSize.value * 0.4)

// 旋转动画
const rotation = ref(30)
let animationId = null

const animateTree = () => {
  const animate = () => {
    rotation.value -= 1
    if (rotation.value <= -330) {
      rotation.value = 30
    }
    animationId = requestAnimationFrame(animate)
  }
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  animateTree()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.tree {
  position: relative;
  transform-style: preserve-3d;
}

.branch {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.leaf {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #69c069, #77dd77);
  /* 微信小程序兼容的三角形实现 */
  border-left: 50% solid transparent;
  border-right: 50% solid transparent;
  border-bottom: 100% solid #69c069;
  border-bottom: 100% solid linear-gradient(90deg, #69c069, #77dd77);
  transform-origin: bottom;
}

.stem {
  position: absolute;
  top: 110%;
  left: 50%;
  width: 15%;
  height: 50%;
  transform-style: preserve-3d;
  transform: translateX(-50%);
}

.stem-side {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #bb4622, #df7214);
  transform-origin: bottom;
}

.shadow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  transform-style: preserve-3d;
}

/* 微信小程序平台特定样式 */
/* #ifdef MP-WEIXIN */
.leaf {
  /* 微信小程序不支持clip-path，使用border实现三角形 */
  width: 0;
  height: 0;
  border-left: 50rpx solid transparent;
  border-right: 50rpx solid transparent;
  border-bottom: 100rpx solid #69c069;
  background: none;
}

.stem-side {
  border-radius: 4rpx;
}

.shadow {
  border-radius: 50%;
}
/* #endif */

/* H5平台样式 */
/* #ifdef H5 */
.leaf {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}
/* #endif */
</style>
