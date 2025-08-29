<template>
    <view class="top-back" 
        @click="topBack" 
        v-if="showButton"
        :class="[
            `position-${props.position}`,
            showButton ? 'fade-in' : 'fade-out'
        ]"
        :style="{ zIndex: props.zIndex }">
        <button class="back-button">
            <view class="back-icon">
                <uni-icons type="arrow-up" size="24" color="#333333"></uni-icons>
            </view>
        </button>    
    </view>
</template>
<script setup>
import { ref } from 'vue'

const props = defineProps({
    show: {
        type: Boolean,
        default: true
    },
    position: {
        type: String,
        default: 'bottom-right',
        validator: (value) => {
            return ['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(value)
        }
    },
    zIndex: {
        type: Number,
        default: 999
    },
    // 新增：滚动多少距离后显示按钮
    scrollDistance: {
        type: Number,
        default: 300
    }
})

const showButton = ref(false)

const topBack = () => {
    uni.pageScrollTo({
        scrollTop: 0,
        duration: 300
    });
}

// 暴露方法给父组件调用
const handlePageScroll = (e) => {
    if (!props.show) return;
    
    // 获取滚动距离
    const scrollTop = e.scrollTop;
    
    // 当滚动距离超过设定值时显示按钮，否则隐藏
    showButton.value = scrollTop > props.scrollDistance;
}

// 暴露方法给父组件
defineExpose({
    handlePageScroll
})

</script>
<style scoped>
.top-back {
    position: fixed;
    padding: 12px;
    transition: all 0.3s ease;
}

/* 位置控制 */
.position-bottom-right {
    bottom: 100rpx;
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

/* 按钮样式 */
.back-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
    padding: 0;
    margin: 0;
}

.back-button:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.back-button:active {
    transform: scale(0.95);
}

.back-button::after {
    border: none;
}

.back-icon {
    color: #333333;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 2px;
}

.back-text {
    color: #333333;
    font-size: 10px;
    font-weight: 500;
}

/* 动画效果 */
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