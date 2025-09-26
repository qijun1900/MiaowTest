<template>
    <view>
        <ThemDivider text="题目题干"/>
        <!-- 题干编辑器 -->
        <view class="editor-section">
            <uniEditor 
                placeholder="请在此处输入题干内容" 
                v-model="stem" 
                height="200rpx" />
        </view>
        <view class="answer-container">
            <view class="answer-header">
                <view class="answer-icon">
                    <uni-icons type="compose" size="20" color="#1890ff"></uni-icons>
                </view>
                <text class="answer-title">题目答案</text>
            </view>
                <uniEditor 
                    placeholder="请在此处输入参考答案" 
                    v-model="content" 
                    height="300rpx"/>
        </view>
        <ThemDivider text="题目解析(可选)"/>
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
const content = ref('') // 答案
const anlysis = ref('') // 解析
const butLoading = ref(false) // 按钮加载中


</script>
<style scoped>
.editor-section {
    margin-bottom: 20rpx;
}

.answer-container {
    margin-top: 20rpx;
    background: white;
    padding: 20rpx;
    border-radius: 15rpx;
    border: 1rpx solid #e0e0e0;
}

.answer-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 15rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.answer-icon {
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
    background-color: #e6f7ff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15rpx;
}

.answer-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
}

</style>