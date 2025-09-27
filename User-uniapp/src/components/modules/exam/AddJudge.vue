<template>
    <view>
        <ThemDivider text="题目题干" />
        <!-- 题干编辑器 -->
        <view class="editor-section">
            <uniEditor placeholder="请在此处输入题干内容" v-model="formData.stem" height="200rpx" />
        </view>
        <ThemDivider text="题目答案" />
        <view class="options-container">
            <!-- 答案列表 -->
            <view class="judge-options">
                <view class="judge-option" v-for="(option, index) in formData.options" :key="index"
                    :class="{ 'selected': formData.answer === option.value }" @click="setAnswer(option.value)">
                    <!-- 选项图标 -->
                    <view class="option-icon" :class="option.value === 1 ? 'correct-icon' : 'wrong-icon'">
                        <uni-icons :type="option.value === 1 ? 'checkmarkempty' : 'closeempty'" size="18"
                            :color="formData.answer === option.value ? '#ffffff' : (option.value === 1 ? '#52c41a' : '#ff4d4f')">
                        </uni-icons>
                    </view>

                    <!-- 选项文本 -->
                    <view class="option-text">{{ option.text }}</view>

                    <!-- 答案选择圆圈 -->
                    <view class="radio-btn">
                        <view class="radio-circle" :class="{ 'selected': formData.answer === option.value }"></view>
                    </view>
                </view>
            </view>
        </view>

        <ThemDivider text="题目解析(可选)" />
        <!-- 解析编辑器 -->
        <view class="editor-section">
            <uniEditor placeholder="请在此处输入解析内容" v-model="formData.analysis" height="200rpx" />
        </view>
        <view class="submit-btn">
            <button type="primary" :loading="butLoading" @click="handleSend">添加题目</button>
        </view>

    </view>

</template>

<script setup>
import { reactive, ref} from 'vue';
import uniEditor from '../../core/uniEditor.vue';
import ThemDivider from '../../core/ThemDivider.vue';
import { addQuestion } from '../../../API/Exam/QuestionAPI';

const butLoading = ref(false) // 按钮加载中
const props = defineProps({
  currentBankId: { // 接收题库ID
    default: null
  }
})

// 使用 reactive 集合所有数据
const formData = reactive({
    Type: 3, // 题目类型，默认为3（判断题）
    stem: '', // 题干
    analysis: '', // 解析
    answer: null, // 答案，1为正确，2为错误
    // 选项数据
    options: [
        { text: '正确', value: 1 },
        { text: '错误', value: 2 }
    ]
})

// 设置答案
const setAnswer = (value) => {
    formData.answer = value
}

// 提交表单
const handleSend = async () => {
    try {
        // 验证题目是否为空
        if (!formData.stem.trim()) {
            uni.showToast({
                title: '请输入题目内容',
                icon: 'none'
            });
            return;
        }

        // 验证是否选择了答案
        if (formData.answer === null) {
            uni.showToast({
                title: '请选择正确答案',
                icon: 'none'
            });
            return;
        }

        // 设置按钮加载状态
        butLoading.value = true;

        // 准备提交的数据
        const submitData = {
            Type: formData.Type,
            stem: formData.stem,
            answer: formData.answer,
            analysis: formData.analysis
        };
        // 如果有题库ID，添加到提交数据中
        if (props.currentBankId) {
        submitData.questionbankId = props.currentBankId;
        }

        // 调用API提交数据
        const res = await addQuestion(submitData)
        if (res.code === 200) {
            // 重置表单
            resetForm()
            butLoading.value = false;
            // 提示提交成功 
            uni.showToast({
                title: res.message,
                icon: 'none'
            })
        }
    } catch (e) {
        console.log(e)
        uni.showToast({
            title: '提交失败',
            icon: 'none'
        })
    } finally {
        butLoading.value = false;
    }
}

// 重置表单
const resetForm = () => {
    formData.stem = '';
    formData.analysis = '';
    formData.answer = null;
}

</script>

<style scoped>
.editor-section {
    margin-bottom: 20rpx;
}

.options-container {
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