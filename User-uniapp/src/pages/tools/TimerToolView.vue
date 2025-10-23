<template>
    <view class="timer-container">
        <!-- 圆环进度条和倒计时显示 -->
        <view class="timer-display">
            <view class="progress-ring">
                <!-- 倒计时显示 -->
                <view class="timer-text">
                    <text class="time-display">{{ formattedTime }}</text>
                    <text v-if="isTimeUp" class="time-up-text">时间到!</text>
                    <text v-if="isTimeUp && overtimeSeconds > 0" class="overtime-text">已超时 {{ overtimeMinutes }}分{{ overtimeSeconds % 60 }}秒</text>
                </view>
            </view>
        </view>

        <!-- 控制面板 -->
        <view class="control-panel">
            <!-- 预设时间选项 -->
            <view class="preset-times-container" v-if="!isRunning">
                <text class="section-title">快速选择</text>
                <view class="preset-times">
                    <view v-for="preset in presetTimes" :key="preset.label" @click="setPresetTime(preset)"
                        :class="['preset-time-card', { active: currentPreset === preset.label }]">
                        <text class="preset-time-value">{{ preset.minutes }}</text>
                        <text class="preset-time-unit">分钟</text>
                    </view>
                </view>
            </view>

            <!-- 自定义时间输入 -->
            <view class="custom-time-container" v-if="!isRunning">
                <text class="section-title">自定义时间</text>
                <view class="custom-time-input">
                    <input v-model="customMinutes" type="number" placeholder="输入分钟数" min="1" max="180"
                        @input="handleCustomTimeChange" class="custom-input" />
                    <button @click="setCustomTime" class="custom-btn">设置</button>
                </view>
            </view>

            <!-- 控制按钮 -->
            <view class="control-buttons">
                <view 
                    class="control-btn start-btn" 
                    @click="startTimer" 
                    :class="{ disabled: isRunning || totalSeconds <= 0 }"
                    v-if="!isRunning">
                     <uni-icons type="checkmarkempty" size="26" color="#ffffff"></uni-icons>
                    <text class="but-text">开始</text>
                </view>
                <view 
                    class="control-btn pause-btn" 
                    @click="pauseTimer" 
                    :class="{ disabled: !isRunning }">
                    <uni-icons type="circle-filled" size="25" color="#ffffff"></uni-icons>
                    <text class="but-text">暂停</text>
                </view>
                <view 
                    class="control-btn reset-btn" 
                    @click="resetTimer"
                    v-if="!isRunning">
                    <uni-icons type="reload" size="25" color="#ffffff"></uni-icons>
                    <text class="but-text">重置</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
// 预设时间选项
const presetTimes = [
    { label: '25分钟', minutes: 25 },
    { label: '45分钟', minutes: 45 },
    { label: '1小时', minutes: 60 },
    { label: '2小时', minutes: 120 }
]
// 状态变量
const totalSeconds = ref(0) // 总秒数
const remainingSeconds = ref(0) // 剩余秒数
const isRunning = ref(false) // 是否正在运行
const isTimeUp = ref(false) // 是否时间到
const currentPreset = ref('') // 当前选中的预设
const customMinutes = ref('') // 自定义分钟数
const overtimeSeconds = ref(0) // 超时秒数
let timer = null // 定时器ID


// 格式化时间显示
const formattedTime = computed(() => {
    const minutes = Math.floor(remainingSeconds.value / 60)
    const seconds = remainingSeconds.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// 计算超时分钟数
const overtimeMinutes = computed(() => {
    return Math.floor(overtimeSeconds.value / 60)
})


// 设置预设时间
const setPresetTime = (preset) => {
    if (isRunning.value) return

    totalSeconds.value = preset.minutes * 60
    remainingSeconds.value = totalSeconds.value
    currentPreset.value = preset.label
    customMinutes.value = ''
    isTimeUp.value = false
    overtimeSeconds.value = 0
}

// 设置自定义时间
const setCustomTime = () => {
    if (isRunning.value) return

    const minutes = parseInt(customMinutes.value)
    if (isNaN(minutes) || minutes <= 0) {
        uni.showToast({
            title: '请输入有效分钟数',
            icon: 'none'
        })
        return
    }

    totalSeconds.value = minutes * 60
    remainingSeconds.value = totalSeconds.value
    currentPreset.value = ''
    isTimeUp.value = false
    overtimeSeconds.value = 0
}

// 处理自定义时间输入变化
const handleCustomTimeChange = () => {
    currentPreset.value = ''
}

// 开始计时
const startTimer = () => {
    if (remainingSeconds.value <= 0 && !isTimeUp.value) return

    isRunning.value = true

    timer = setInterval(() => {
        if (!isTimeUp.value) {
            remainingSeconds.value--

            if (remainingSeconds.value <= 0) {
                isTimeUp.value = true
                // 播放提示音或震动
                //   uni.vibrateShort()
                uni.showToast({
                    title: '计时结束',
                    icon: 'success'
                })
            }
        } else {
            // 超时后继续计时
            overtimeSeconds.value++
        }
    }, 1000)
}

// 暂停计时
const pauseTimer = () => {
    isRunning.value = false
    if (timer) {
        clearInterval(timer)
        timer = null
    }
}

// 重置计时器
const resetTimer = () => {
    pauseTimer()
    remainingSeconds.value = totalSeconds.value
    isTimeUp.value = false
    overtimeSeconds.value = 0
}


// 组件挂载时设置默认时间和初始化Canvas
onMounted(() => {
    setPresetTime(presetTimes[0]) // 默认选择25分钟
})

// 组件卸载时清除定时器
onUnmounted(() => {
    if (timer) {
        clearInterval(timer)
    }
})
</script>

<style scoped>
/* 现代简约风格 */
.timer-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx 30rpx;
    background-color: #f8f9fa;
    min-height: 100vh;
    box-sizing: border-box;
}

.timer-display {
    margin-bottom: 60rpx;
    position: relative;
}

.progress-ring {
    position: relative;
    width: 480rpx;
    height: 480rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ffffff;
    border-radius: 50%;
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
}

.timer-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1;
}

.time-display {
    font-size: 75rpx;
    font-weight: 460;
    color: #2c3e50;
    letter-spacing: 2rpx;
}

.time-up-text {
    font-size: 32rpx;
    color: #e74c3c;
    margin-top: 16rpx;
    font-weight: 500;
}

.overtime-text {
    font-size: 26rpx;
    color: #e74c3c;
    margin-top: 8rpx;
    opacity: 0.8;
}

.control-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 50rpx;
}

.preset-times-container {
    margin-bottom: 10rpx;
}

.section-title {
    display: block;
    font-size: 30rpx;
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 30rpx;
    text-align: center;
    letter-spacing: 1rpx;
}

.preset-times {
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
}

.preset-time-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx 20rpx;
    border-radius: 16rpx;
    background-color: #ffffff;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.preset-time-card.active {
    background-color: #ffffff;
    transform: translateY(-6rpx);
    box-shadow: 0 8rpx 25rpx rgba(52, 152, 219, 0.15);
    border: 2rpx solid #3498db;
}

.preset-time-value {
    font-size: 44rpx;
    font-weight: 300;
    color: #2c3e50;
    line-height: 1;
}

.preset-time-card.active .preset-time-value {
    color: #3498db;
    font-weight: 500;
}

.preset-time-unit {
    font-size: 24rpx;
    color: #7f8c8d;
    margin-top: 8rpx;
}

.preset-time-card.active .preset-time-unit {
    color: #3498db;
}

.custom-time-container {
    margin-bottom: 10rpx;
}

.custom-time-input {
    display: flex;
    gap: 20rpx;
    justify-content: center;
    align-items: center;
}

.custom-input {
    flex: 1;
    max-width: 300rpx;
    padding: 28rpx 24rpx;
    border: none;
    border-radius: 16rpx;
    font-size: 32rpx;
    text-align: center;
    background-color: #ffffff;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
    color: #2c3e50;
}

.custom-input:focus {
    box-shadow: 0 4rpx 20rpx rgba(52, 152, 219, 0.15);
    border: 2rpx solid #3498db;
}

.custom-btn {
    padding: 28rpx 40rpx;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 16rpx;
    font-size: 30rpx;
    font-weight: 500;
    box-shadow: 0 4rpx 20rpx rgba(52, 152, 219, 0.2);
    transition: all 0.3s ease;
    letter-spacing: 1rpx;
}

.custom-btn:active {
    transform: translateY(2rpx);
    box-shadow: 0 2rpx 15rpx rgba(52, 152, 219, 0.2);
}

.control-buttons {
    display: flex;
    justify-content: center;
    gap: 10rpx;
}

.control-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30rpx 40rpx;
    border-radius: 20rpx;
    font-size: 28rpx;
    color: white;
    min-width: 160rpx;
    height: 160rpx;
    box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.control-btn:active {
    transform: translateY(3rpx);
    box-shadow: 0 3rpx 15rpx rgba(0, 0, 0, 0.1);
}

.start-btn {
    background-color: #2ecc71;
}

.start-btn.disabled {
    background-color: #95a5a6;
    opacity: 0.6;
}

.pause-btn {
    background-color: #f39c12;
}

.pause-btn.disabled {
    background-color: #95a5a6;
    opacity: 0.6;
}

.reset-btn {
    background-color: #e74c3c;
}
.but-text{
    font-size: 31rpx;
    font-weight: 520;
    color: white;
}
</style>