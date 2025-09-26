<template>
    <view>
        <!-- 题干编辑器 -->
        <view class="editor-section">
            <text class="section-title">题目题干</text>
            <uniEditor 
                placeholder="请在此处输入题干内容"
                v-model="stem"
            />
        </view>
        
        <!-- 调试信息 -->
        <view class="debug-info">
            <text>当前题干内容：{{ stem }}</text>
            
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue';
import uniEditor from '../../core/uniEditor.vue';

const stem = ref('') // 题干
// const anlysis = ref('') // 解析
</script>

<style scoped>
.editor-section {
    margin-bottom: 20rpx;
}

.section-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
}

.debug-info {
    margin-top: 20rpx;
    padding: 20rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    font-size: 24rpx;
    color: #666;
}
</style>