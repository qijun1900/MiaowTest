<template>
    <view>
        <ThemDivider text="题目题干" />
        <!-- 题干编辑器 -->
        <view class="editor-section">
            <uniEditor 
            placeholder="请在此处输入题干内容" 
            v-model="stem" 
            height="200rpx" />
        </view>
        <ThemDivider text="题目答案" />
        <view class="options-container">
            <!-- 答案列表 -->
            <view class="judge-options">
                <view class="judge-option" 
                      v-for="(option, index) in options" 
                      :key="index" 
                      :class="{ 'selected': answer === option.value }"
                      @click="setAnswer(option.value)">
                    <!-- 选项图标 -->
                    <view class="option-icon" :class="option.value === 1 ? 'correct-icon' : 'wrong-icon'">
                        <uni-icons 
                            :type="option.value === 1 ? 'checkmarkempty' : 'closeempty'" 
                            size="18" 
                            :color="answer === option.value ? '#ffffff' : (option.value === 1 ? '#52c41a' : '#ff4d4f')">
                        </uni-icons>
                    </view>
                    
                    <!-- 选项文本 -->
                    <view class="option-text">{{ option.text }}</view>
                    
                    <!-- 答案选择圆圈 -->
                    <view class="radio-btn">
                        <view class="radio-circle" :class="{ 'selected': answer === option.value }"></view>
                    </view>
                </view>
            </view>
        </view>

        <ThemDivider text="题目解析(可选)" />
        <!-- 解析编辑器 -->
        <view class="editor-section">
            <uniEditor 
                placeholder="请在此处输入解析内容" 
                v-model="anlysis" 
                height="200rpx" />
        </view>
        <view class="submit-btn">
            <button type="primary" :loading="butLoading">添加题目</button>
        </view>

    </view>

</template>
<script setup>
import { ref } from 'vue';
import uniEditor from '../../core/uniEditor.vue';
import ThemDivider from '../../core/ThemDivider.vue';

const stem = ref('') // 题干
const anlysis = ref('') // 解析
const butLoading = ref(false) // 按钮加载中
const answer = ref(null) // 答案，1为正确，2为错误

// 选项数据
const options = ref([
    { text: '正确', value: 1 },
    { text: '错误', value: 2 }
])

// 设置答案
const setAnswer = (value) => {
    answer.value = value
}

</script>
<style scoped>
.editor-section {
    margin-bottom: 20rpx;
}

.options-container{
    margin-top: 20rpx;
    background: white;
    padding: 20rpx;
    border-radius: 15rpx;
    border: 1rpx solid #e0e0e0;
}

.judge-options {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.judge-option {
    display: flex;
    align-items: center;
    padding: 24rpx 30rpx;
    border-radius: 12rpx;
    background-color: #f9f9f9;
    border: 2rpx solid #e8e8e8;
    transition: all 0.3s ease;
}

.judge-option.selected {
    background-color: #e6f7ff;
    border-color: #1890ff;
    box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.2);
}

.option-icon {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
}

.correct-icon {
    background-color: #f6ffed;
    border: 2rpx solid #b7eb8f;
}

.wrong-icon {
    background-color: #fff2f0;
    border: 2rpx solid #ffccc7;
}

.judge-option.selected .correct-icon {
    background-color: #52c41a;
    border-color: #52c41a;
}

.judge-option.selected .wrong-icon {
    background-color: #ff4d4f;
    border-color: #ff4d4f;
}

.option-text {
    font-size: 32rpx;
    color: #333;
    font-weight: 500;
    flex: 1;
}

.judge-option.selected .option-text {
    color: #1890ff;
    font-weight: 600;
}

.radio-btn {
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.radio-circle {
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    border: 2rpx solid #d9d9d9;
}

.radio-circle.selected {
    background-color: #1890ff;
    border-color: #1890ff;
    position: relative;
}

.radio-circle.selected::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background-color: #ffffff;
}
</style>