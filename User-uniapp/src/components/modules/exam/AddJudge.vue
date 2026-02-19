<template>
    <view>
        <!-- 题目题干/描述标题 -->
        <QuestionStemHeader 
            :is-wrong-book-mode="isAddWrongBookQuestion"
            stem-text="题目描述"
            @add-image="stemImages.addImage"
        />
        <!-- 题干编辑器 -->
        <view class="editor-section">
            <uniEditor 
                placeholder="请在此处输入题干内容" 
                v-model="formData.stem" 
                height="200rpx" 
                id="stemEditorId3"/>
            <!-- 题干图片列表 -->
            <ImageList 
                :images="stemImages.imageList.value"
                @remove="stemImages.removeImage"
            />
        </view>
        <ThemeDivider text="题目答案" />
        <view class="options-container">
            <!-- 答案列表 -->
            <view class="judge-options">
                <view class="judge-option" v-for="(option, index) in formData.options" :key="index"
                    :class="{ 'selected': formData.answer === option.value }" @click="setAnswer(option.value)">
                    <!-- 选项图标 -->
                    <view class="option-icon" :class="option.value === 1 ? 'correct-icon' : 'wrong-icon'">
                        <uni-icons 
                            :type="option.value === 1 ? 'checkmarkempty' : 'closeempty'" size="18"
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
    
    <!-- 我的错解部分 (仅在错题本添加模式显示) -->
    <view v-if="props.isAddWrongBookQuestion" class="my-wrong-answer-section">
      <view class="wrong-answer-title">我的错解 (选填)</view>
      
      <!-- 判断题类型的错解 -->
      <view class="wrong-answer-judge">
        <view 
          class="judge-btn"
          :class="{ 'selected': formData.myWrongAnswer === '正确' }"
          @click="selectWrongAnswer('正确')"
        >
          正确
        </view>
        <view 
          class="judge-btn"
          :class="{ 'selected': formData.myWrongAnswer === '错误' }"
          @click="selectWrongAnswer('错误')"
        >
          错误
        </view>
      </view>
    </view>

    <!-- 题目解析/备注标题 -->
        <QuestionAnalysisHeader 
            :is-wrong-book-mode="isAddWrongBookQuestion"
            analysis-text="解析 / 备注 / 笔记"
            @add-image="analysisImages.addImage"
        />
        <!-- 解析编辑器 -->
        <view class="editor-section">
            <uniEditor 
                :placeholder="isAddWrongBookQuestion ? '记录解题思路或知识点...' : '请在此处输入解析内容'" 
                v-model="formData.analysis" 
                height="200rpx" 
                id="analysisEditor3"/>
            <!-- 解析图片列表 -->
            <ImageList 
                :images="analysisImages.imageList.value"
                @remove="analysisImages.removeImage"
            />
        </view>
        
        <!-- 标签组件 -->
        <QuestionTags 
          :show="props.isAddWrongBookQuestion"
          v-model="formData.tags"
        />
        
        <view class="submit-btn">
            <button type="primary" :loading="butLoading" @click="handleSend">
                {{ props.isEdit ? '更新题目' : '添加题目' }}
            </button>
        </view>

    </view>

</template>

<script setup>
import { reactive, ref, onMounted, computed} from 'vue';
import uniEditor from '../../core/uniEditor.vue';
import ThemeDivider from '../../core/ThemeDivider.vue';
import QuestionStemHeader from './QuestionStemHeader.vue';
import QuestionAnalysisHeader from './QuestionAnalysisHeader.vue';
import QuestionTags from './QuestionTags.vue';
import ImageList from '../../common/ImageList.vue';
import { saveQuestion } from '../../../API/Exam/QuestionAPI';
import { useImageUpload } from '../../../composables/useImageUpload.js';

const butLoading = ref(false)

// 使用图片上传 composable（限制 5MB）
const stemImages = useImageUpload({ maxSize: 5 * 1024 * 1024 }); // 题干图片
const analysisImages = useImageUpload({ maxSize: 5 * 1024 * 1024 }); // 解析图片
const props = defineProps({
  currentBankId: { 
    default: null
  },
  isEdit: { 
    default: false
  },
  editData: { 
    default: null
  },
  isAddWrongBookQuestion: { 
    default: false
  }
})

const emit = defineEmits(['submit'])

const isAddWrongBookQuestion = computed(() => props.isAddWrongBookQuestion)

// 使用 reactive 集合所有数据
const formData = reactive({
    Type: 3, // 题目类型，默认为3（判断题）
    stem: '', // 题干
    analysis: '', // 解析
    answer: null,//0:错误，1：正确
    myWrongAnswer: '', // 我的错解
    tags: [], // 标签
    // 选项数据
    options: [
        { text: '正确', value: 1},
        { text: '错误', value: 0 }
    ]
})

// 设置答案
const setAnswer = (value) => {
    formData.answer = value
}

// 选择错误答案
const selectWrongAnswer = (answer) => {
  if (formData.myWrongAnswer === answer) {
    formData.myWrongAnswer = '' // 取消选择
  } else {
    formData.myWrongAnswer = answer
  }
}

// 提交表单
const handleSend = async () => {
    try {
        // 验证题目是否为空（题干文本或图片至少有一个）
        if (!formData.stem.trim() && stemImages.imageList.value.length === 0) {
            uni.showToast({
                title: '请输入题目内容或上传题干图片',
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

        // 如果是错题本模式，emit 数据给父组件
        if (props.isAddWrongBookQuestion) {
            // 上传所有图片到服务器
            const [stemImageUrls, analysisImageUrls] = await Promise.all([
                stemImages.uploadAllImages(),
                analysisImages.uploadAllImages()
            ]);

            // 构建符合 WrongQuestionModel 的数据结构
            const wrongQuestionData = {
                Type: formData.Type,
                questionSource: 'user',
                
                // 题干（支持富文本和图片）
                stem: {
                    text: formData.stem,
                    images: stemImageUrls || []
                },
                
                // 选项（判断题的选项）
                options: formData.options,
                
                // 正确答案
                correctAnswer: {
                    text: formData.answer === 1 ? '正确' : '错误',
                    images: []
                },
                
                // 用户的错误答案
                wrongAnswer: {
                    text: formData.myWrongAnswer,
                    images: []
                },
                
                // 解析/备注
                analysis: {
                    text: formData.analysis,
                    images: analysisImageUrls || []
                },
                
                // 标签
                tags: formData.tags,
                
                // 其他字段由父组件补充（wrongBookId, difficulty 等）
            };

            emit('submit', wrongQuestionData);
            butLoading.value = false;
            return;
        }

        // 原有的题库模式提交逻辑
        const submitData = {
            Type: formData.Type,
            stem: formData.stem,
            answer: formData.answer,
            analysis: formData.analysis
        };
        
        // 如果是编辑模式，添加题目ID
        if (props.isEdit && props.editData && props.editData._id) {
            submitData._id = props.editData._id;
        }
        
        // 如果有题库ID，添加到提交数据中
        if (props.currentBankId) {
            submitData.questionbankId = props.currentBankId;
        }

        // 调用API提交数据
        const res = await saveQuestion(submitData)
        if (res.code === 200) {
            // 只有在非编辑模式下才重置表单
            if (!props.isEdit) {
                resetForm()
            }
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
    formData.myWrongAnswer = '';
    formData.tags = [];
    stemImages.clearImages();
    analysisImages.clearImages();
}

// 编辑模式下的数据初始化
onMounted(() => {
    if (props.isEdit && props.editData) {
        // stem 可能是对象 { text, images } 或字符串
        const stemData = props.editData.stem;
        formData.stem = stemData?.text || stemData || '';
        if (stemData?.images && stemData.images.length > 0) {
            stemImages.setImages(stemData.images);
        }
        
        // analysis 可能是对象 { text, images } 或字符串
        const analysisData = props.editData.analysis;
        formData.analysis = analysisData?.text || analysisData || '';
        if (analysisData?.images && analysisData.images.length > 0) {
            analysisImages.setImages(analysisData.images);
        }
        
        // 正确答案
        const correctAnswerData = props.editData.correctAnswer;
        formData.answer = correctAnswerData?.text || 'A';
        
        // 初始化我的错解
        const wrongAnswerData = props.editData.wrongAnswer;
        if (wrongAnswerData?.text) {
            formData.myWrongAnswer = wrongAnswerData.text;
        }
        
        // 初始化标签
        if (props.editData.tags && Array.isArray(props.editData.tags)) {
            formData.tags = props.editData.tags;
        }
    }
})

// 暴露方法给父组件调用
defineExpose({
  resetForm
})
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
    padding: 28rpx 32rpx;
    border-radius: 16rpx;
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

.my-wrong-answer-section {
  margin: 30rpx 0;
}

.wrong-answer-title {
  font-size: 28rpx;
  color: #ff4d4f;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.wrong-answer-judge {
  display: flex;
  gap: 20rpx;
}

.judge-btn {
  flex: 1;
  height: 80rpx;
  border: 2rpx solid #d9d9d9;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #999;
  background-color: #ffffff;
  transition: all 0.3s;
}

.judge-btn.selected {
  border-color: #ff4d4f;
  background-color: #fff1f0;
  color: #ff4d4f;
}
</style>