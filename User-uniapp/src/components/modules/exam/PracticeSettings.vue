<template>
    <view class="card">
        <view class="setting-item">
            <text class="label">练习数量：</text>
            <view class="slider-container">
                <view class="slider-wrapper">
                    <up-slider v-if="maxQuestions > 0" v-model="localQuestionCount" :min="1" :max="maxQuestions"></up-slider>
                </view>
                <text class="slider-value">{{ localQuestionCount }}题</text>
            </view>
        </view>
        <view class="setting-item">
            <text class="label">题目乱序：</text>
            <view class="switch-wrapper">
                <up-switch v-model="localIsRandom" size="20"></up-switch>
            </view>
        </view>
        <view class="setting-item">
            <text class="label">选项乱序(选择题有效)：</text>
            <view class="switch-wrapper">
                <up-switch v-model="localIsOptionRandom" size="20"></up-switch>
            </view>
        </view>
        <view class="setting-item">
            <text class="label">立即显示答案：</text>
            <view class="switch-wrapper">
                <up-switch v-model="localIsShowAnswer" size="20"></up-switch>
            </view>
        </view>
        <view class="setting-item">
            <text class="label">开启刷题助手：</text>
            <view class="switch-wrapper">
                <up-switch v-model="localIsShowHelper" size="20" :disabled="disableHelper"></up-switch>
            </view>
            <text v-if="disableHelper" class="helper-tip">{{ helpertip }}</text>
        </view>
    </view>
</template>

<script setup>
import { ref, watch } from 'vue'

// 定义 props
const props = defineProps({
    // 练习数量
    questionCount: {
        type: Number,
    },
    // 最大题目数量
    maxQuestions: {
        type: Number,
    },
    // 题目乱序
    isRandom: {
        type: Boolean,
        default: false
    },
    // 选项乱序
    isOptionRandom: {
        type: Boolean,
        default: false
    },
    // 立即显示答案
    isShowAnswer: {
        type: Boolean,
        default: true
    },
    // 开启AI解析
    isShowHelper: {
        type: Boolean,
        default: true
    },
    // 是否禁用刷题助手
    disableHelper: {
        type: Boolean,
        default: false
    },
    helpertip:{
        type: String,
        default: '个人题库不支持此功能'
    }
})

// 定义 emits 
const emit = defineEmits([
    'update:questionCount',
    'update:isRandom', 
    'update:isOptionRandom',
    'update:isShowAnswer',
    'update:isShowAIHelp'
])

// 本地响应式数据
const localQuestionCount = ref(props.questionCount)
const localIsRandom = ref(props.isRandom)
const localIsOptionRandom = ref(props.isOptionRandom)
const localIsShowAnswer = ref(props.isShowAnswer)
const localIsShowHelper = ref(props.isShowHelper)



// 监听本地数据变化，向父组件发送更新事件
watch(localQuestionCount, (newVal) => {
    emit('update:questionCount', newVal)
})

watch(localIsRandom, (newVal) => {
    emit('update:isRandom', newVal)
})

watch(localIsOptionRandom, (newVal) => {
    emit('update:isOptionRandom', newVal)
})

watch(localIsShowAnswer, (newVal) => {
    emit('update:isShowAnswer', newVal)
})

watch(localIsShowHelper, (newVal) => {
    emit('update:isShowHelper', newVal)
})

// 监听 props 变化，更新本地数据
watch(() => props.questionCount, (newVal) => {
    localQuestionCount.value = newVal
})

watch(() => props.isRandom, (newVal) => {
    localIsRandom.value = newVal
})

watch(() => props.isOptionRandom, (newVal) => {
    localIsOptionRandom.value = newVal
})

watch(() => props.isShowAnswer, (newVal) => {
    localIsShowAnswer.value = newVal
})

watch(() => props.isShowHelper, (newVal) => {
    localIsShowHelper.value = newVal
})
</script>

<style scoped>
.card {
    background-color: #ffffff;
    border-radius: 10rpx;
    padding: 20rpx;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 20rpx;
}

.setting-item {
    display: flex;
    margin-bottom: 12rpx;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 25rpx;
    border-bottom: 1px dashed #e0e0e0;
}

.setting-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.label {
    width: 90px;
    color: #666;
    font-size: 30rpx;
    position: relative;
    padding-left: 10rpx;
    white-space: nowrap;
}

.label::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8rpx;
    height: 29rpx;
    background-color: #007AFF;
    border-radius: 2px;
}

.slider-container {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.slider-wrapper {
    flex: 1;
    margin-right: 10rpx;
}

.slider-value {
    text-align: right;
    font-size: 28rpx;
    color: #007AFF;
    min-width: 50rpx;
    white-space: nowrap;
    flex-shrink: 0;
}

.helper-tip {
    font-size: 24rpx;
    color: #999;
    margin-left: 20rpx;
    white-space: nowrap;
}

.switch-wrapper {
    margin-right: 10rpx;
    flex-shrink: 0;
}

/* H5端原生滑块样式 */
.native-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #e1e5e9;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
}

.native-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #007AFF;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 122, 255, 0.3);
}

.native-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #007AFF;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(0, 122, 255, 0.3);
}

.native-slider::-webkit-slider-track {
    height: 6px;
    border-radius: 3px;
    background: #e1e5e9;
}

.native-slider::-moz-range-track {
    height: 6px;
    border-radius: 3px;
    background: #e1e5e9;
    border: none;
}
</style>