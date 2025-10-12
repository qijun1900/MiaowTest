<template>
    <view class="top-back" 
        @click="topBack" 
        v-if="showButton"
        :class="[
            `position-${props.position}`,
            showButton ? 'fade-in' : 'fade-out'
        ]"
        :style="{ zIndex: props.zIndex }">
        <button class="back-button" :disabled="isScrolling">
            <view class="back-icon">
                <uni-icons type="arrow-up" size="24" :color="primaryColor"></uni-icons>
            </view>
        </button>    
    </view>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const props = defineProps({
    // 按钮位置
    position: {
        type: String,
        default: 'bottom-right',
        validator: (value) => {
            return ['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(value)
        }
    },
    // 按钮层级
    zIndex: {
        type: Number,
        default: 999
    },
    // 滚动多少距离后显示按钮
    scrollDistance: {
        type: Number,
        default: 300
    },
    // 防抖延迟时间
    debounceDelay: {
        type: Number,
        default: 100
    },
    // 主要颜色
    primaryColor: {
        type: String,
        default: '#007AFF'
    }
})

const showButton = ref(false)
const isScrolling = ref(false)
let debounceTimer = null

const topBack = () => {
    if (isScrolling.value) return
    
    isScrolling.value = true
    showButton.value = false
    
    uni.pageScrollTo({
        scrollTop: 0,
        duration: 300,
        success: () => {
            setTimeout(() => {
                isScrolling.value = false
                showButton.value = true
            }, 500)
        },
        fail: () => {
            isScrolling.value = false
            showButton.value = true
        }
    });
}

// 暴露方法给父组件调用
const handlePageScroll = (e) => {
    if (isScrolling.value) return;
    
    // 清除之前的定时器
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
    
    // 设置防抖
    debounceTimer = setTimeout(() => {
        const scrollTop = e.scrollTop;
        showButton.value = scrollTop > props.scrollDistance;
    }, props.debounceDelay)
}

// 组件卸载时清理定时器
onUnmounted(() => {
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
})

// 暴露方法给父组件
defineExpose({
    handlePageScroll
})
</script>

<style scoped>
.top-back {
    position: fixed;
    padding: 12rpx;
    transition: all 0.3s ease;
    --back-button-size: 50px;
    --back-button-bg: #ffffff;
    --back-button-border: #e0e0e0;
    --back-button-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.position-bottom-right {
    bottom: 110rpx;
    right: 40rpx;
}

.position-bottom-left {
    bottom: 80rpx;
    left: 20rpx;
}

.position-top-right {
    top: 80rpx;
    right: 20rpx;
}

.position-top-left {
    top: 80rpx;
    left: 20rpx;
}

.back-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: var(--back-button-size);
    height: var(--back-button-size);
    border-radius: 50%;
    background: var(--back-button-bg);
    border: 1px solid var(--back-button-border);
    box-shadow: var(--back-button-shadow);
    transition: all 0.3s ease;
    cursor: pointer;
    padding: 0;
    margin: 0;
}

.back-button:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
}

.back-button:active:not(:disabled) {
    transform: scale(0.95);
}

.back-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.back-button::after {
    border: none;
}

.back-icon {
    color: #333333;
    font-size: 18rpx;
    font-weight: bold;
    margin-bottom: 2rpx;
}

.fade-in {
    animation: fadeIn 0.3s ease-in-out;
}

.fade-out {
    animation: fadeOut 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(20px);
    }
}
</style>