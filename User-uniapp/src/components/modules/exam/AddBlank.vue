<template>
    <view >
         <ThemDivider text="题目题干"/>
        <!-- 题干编辑器 -->
        <view class="editor-section">
            <uniEditor 
                placeholder="请在此处输入题干内容"
                v-model="stem"
                height="200rpx"/>
        </view>
        <ThemDivider text="题目答案"/>
        <view class="options-container">
            <!-- 答案列表 -->
            <view class="option-item" v-for="(answer, index) in answers" :key="index">
                <!-- 删除答案图标 -->
                <view class="minus-btn" @click="removeAnswer(index)" v-if="answers.length > 1">
                    <uni-icons type="close" size="16" color="#ffffff"></uni-icons>
                </view>
                
                <!-- 答案编号 -->
                <view class="option-letter">空{{ index + 1 }}</view>
                
                <!-- 答案内容输入框 -->
                <input 
                    class="option-input" 
                    type="text" 
                    v-model="answer.content" 
                    placeholder="请输入答案内容"
                />
            </view>
            
            <!-- 添加答案按钮 -->
            <view class="add-option-btn" @click="addAnswer">
                <uni-icons type="plus" size="20" color="#1890ff"></uni-icons>
                <text>添加答案</text>
            </view>
        </view>
        <ThemDivider text="题目解析(可选)"/>
        <!-- 解析编辑器 -->
        <view class="editor-section">
            <uniEditor
                placeholder="请在此处输入解析内容"
                v-model="anlysis"
                height="200rpx"/>
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

// 答案数据
const answers = ref([
    { content: '' },
])

// 添加答案
const addAnswer = () => {
    answers.value.push({
        content: ''
    })
}

// 移除答案
const removeAnswer = (index) => {
    if (answers.value.length > 1) {
        answers.value.splice(index, 1)
    }
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

.option-item {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
}

.minus-btn {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background-color: #ff4d4f;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
}

.minus-icon {
    color: #ffffff;
    font-size: 32rpx;
    font-weight: bold;
}

.option-letter {
    width: 80rpx;
    height: 40rpx;
    border-radius: 20rpx;
    background-color: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    font-weight: bold;
}

.option-input {
    flex: 1;
    height: 80rpx;
    border: 1rpx solid #d9d9d9;
    border-radius: 8rpx;
    padding: 0 20rpx;
    margin-right: 20rpx;
}

.add-option-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20rpx;
    border: 1rpx dashed #d9d9d9;
    border-radius: 8rpx;
    margin-top: 20rpx;
    background-color: #f9f9f9;
}

.add-icon {
    margin-right: 10rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #1890ff;
}
</style>