<template>
  <view class="container">
    <view class="question-list">
      <!-- Loading -->
      <ThemeLoading v-if="isLoading" text="正在加载笔记内容..." />
      <!-- 笔记列表 -->
      <view 
        v-for="(question, index) in noteList" 
        :key="question.questionId" 
        class="question-item">

        <!-- 题目头部信息 -->
        <view class="question-header">
          <view class="question-type type-all">
            {{ formatInfo.getQuestionTypeText(question.questionType) }}
          </view>
          <view class="favorite-status">
            <text class="favorite-icon">🗒</text>
          </view>
        </view>

        <!-- 题目内容 -->
        <view class="question-content">
          <view class="question-number">第{{ index + 1 }}题</view>
          <view class="question-stem">
            <rich-text :nodes="question.stem"></rich-text>
          </view>
          <!-- 选择题选项 -->
          <view 
            v-if="question.questionType === 1 && question.options" class="options-container">
            <view 
              v-for="(option, optIndex) in question.options" 
              :key="optIndex" class="option-item">
              <text class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</text>
              <text class="option-text">{{ option.content }}</text>
            </view>
          </view>
        </view>

        <!-- 笔记内容 -->
        <view class="note-content">
          <view class="note-header">
            <view class="note-title">
              <text class="note-icon">📝</text>
              <text>笔记内容</text>
            </view>
          </view>
          <view class="note-body">
            <rich-text :nodes="question.note.content" class="note-text"></rich-text>
          </view>
        </view>

        <!-- 笔记时间和操作 -->
        <view class="question-footer">
          <view class="favorite-time">
            <image src="/static/other/time.png" class="info-icon"></image>
            <text>更新时间 {{ formatTime.getTime2(question.note.updateTime) }}</text>
          </view>
          <view class="question-actions">
            <button class="action-btn edit-btn" @click="handleEditNote(question)">
              <text>修改笔记</text>
            </button>
            <button class="action-btn practice-btn" @click="startPractice(question)">
              查看题目
            </button>
          </view>
        </view>
      </view>
      <!-- 笔记弹窗 -->
      <uviewPopup 
        v-model:show="iSopenNotePopupShow" 
        :closeable="false" 
        :round="30" 
        :closeOnClickOverlay="true"
        title="修改题目笔记">
        <template #popupcontent>
          <view class="note-popup-container">
            <view class="note-editor-wrapper">
              <sp-editor 
                :placeholder="'请在此处输入笔记内容...'" 
                :toolbar-config="toolbarConfig"
                @input="handleEditorInput"
                @init="handleEditorInit"
                :editor-id="'noteEditor'"
              />
            </view>
            <view class="note-info" 
              v-if="currentQuestionId
              && getCurrentQuestion().note
              && getCurrentQuestion().note.updateTime">
              <text class="note-info-text">上次保存: {{ formatTime.getTime2(getCurrentQuestion().note.updateTime) }}</text>
            </view>
            <view class="note-button-container">
              <up-button 
                :plain="true" 
                :hairline="true" 
                type="info" 
                @click="handleCancelNote" 
                size="small"
                shape="circle">
                取消
              </up-button>
              <up-button 
                :loading="isSavingNote" 
                :disabled="!noteContent.trim()" 
                type="primary" 
                @click="handleSaveNote"
                size="small" shape="circle">
                保存
              </up-button>
            </view>
          </view>
        </template>
      </uviewPopup>
      <BackToTop ref="backToTopRef" position="bottom-right" />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import uviewPopup from '../../components/core/uviewPopup.vue';
import { onLoad } from '@dcloudio/uni-app';
import { getNoteListByExamIdAPI } from '../../API/My/UserNoteAPI'
import { 
    savePracticeNoteAPI, 
    practiceQuestionAPI,
    getPracticeNoteAPI 
  } from '../../API/Exam/QuestionAPI'
import formatInfo from '../../util/formatInfo';
import formatTime from '../../util/formatTime';
import BackToTop from "../../components/core/BackToTop.vue";
import { onPageScroll } from '@dcloudio/uni-app';
import { useQuestionStore } from '../../stores/modules/QuestionStore';
import { useObjectiveAnswerStore } from '../../stores/modules/ObjectiveAnswerStore';
import { useSubjectiveAnswerStore } from '../../stores/modules/SubjectiveAnswerStore';
import ThemeLoading from '../../components/core/ThemeLoading.vue';


const QuestionStore = useQuestionStore();
const objectiveAnswerStore = useObjectiveAnswerStore();
const subjectiveAnswerStore = useSubjectiveAnswerStore();
const backToTopRef = ref();
const examId = ref(null)
const noteList = ref([])
const iSopenNotePopupShow = ref(false)
const noteContent = ref('')
const isSavingNote = ref(false)
const originalNoteContent = ref('');// 原始笔记内容，用于取消操作
const currentQuestionId = ref(null)
const bankInfo = ref(null); // 题库信息
const isLoading = ref(false); // 加载状态
// sp-editor相关配置
const editorCtx = ref(null); // 编辑器上下文
const toolbarConfig = ref({
  keys: ['header', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'strike', 'color', 'backgroundColor', 'align', 'lineHeight', 'letterSpacing', 'listOrdered', 'listBullet', 'listCheck', 'indentInc', 'indentDec', 'divider', 'scriptSub', 'scriptSuper', 'date',  'undo', 'redo', 'removeFormat', 'clear',],
  iconSize: '18px',
  iconColumns: 10
});

const handleEditNote = async (question) => {
  // 打开笔记弹窗
  iSopenNotePopupShow.value = true;
  
  // 设置当前编辑的题目ID
  currentQuestionId.value = question.questionId;
  // 加载笔记内容
  const res = await getPracticeNoteAPI(false,currentQuestionId.value)
  if (res.code === 200) {
    noteContent.value = res.data.note.content; // 加载笔记内容
  }
  
  // 设置内容到编辑器
  setEditorContent(noteContent.value);
  
  // 保存原始内容，用于取消操作
  originalNoteContent.value = noteContent.value;
  
  // 设置内容到编辑器的函数
  function setEditorContent(content) {
    // 如果编辑器已经初始化，立即设置内容
    if (editorCtx.value) {
      editorCtx.value.setContents({
        html: content
      });
    } else {
      // 添加延迟，确保在编辑器初始化后内容能被正确设置
      setTimeout(() => {
        if (editorCtx.value) {
          editorCtx.value.setContents({
            html: content
          });
        }
      }, 300);
    }
  }
}

// 编辑器初始化完成
const handleEditorInit = (ctx) => {
  editorCtx.value = ctx;
  // 确保在编辑器初始化后，如果有笔记内容，立即设置到编辑器中
  // 添加一个小延迟以确保DOM已经完全渲染
  setTimeout(() => {
    if (noteContent.value && editorCtx.value) {
      editorCtx.value.setContents({
        html: noteContent.value
      });
    }
  }, 100);
};

// 编辑器内容变化
const handleEditorInput = ({ html} ) => {
  noteContent.value = html;
};

// 获取当前编辑的题目
const getCurrentQuestion = () => {
  return noteList.value.find(q => q.questionId === currentQuestionId.value) || {};
}

// 取消笔记编辑
const handleCancelNote = () => {
  // 如果内容有变化，提示用户
  if (noteContent.value !== originalNoteContent.value) {
    uni.showModal({
      title: '提示',
      content: '您有未保存的更改，确定要关闭吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 恢复原始内容
          noteContent.value = originalNoteContent.value;
          iSopenNotePopupShow.value = false;
        }
      }
    });
  } else {
    // 直接关闭
    iSopenNotePopupShow.value = false;
  }
}
const handleSaveNote = async () => {
  // 保存前先从编辑器获取最新内容，确保内容是最新的
  if (editorCtx.value) {
    editorCtx.value.getContents({
      success: (res) => {
        noteContent.value = res.html;
      }
    });
  }
  
  // 保存笔记
  if (!currentQuestionId.value || !noteContent.value.trim()) {
    uni.showToast({
      title: '请输入笔记内容',
      icon: 'none'
    });
    return;
  }

  // 设置保存状态
  isSavingNote.value = true;

  try {
    // 获取当前题目信息
    const currentQuestion = noteList.value.find(q => q.questionId === currentQuestionId.value);

    // 调用API保存笔记
    const res = await savePracticeNoteAPI({
      questionId: currentQuestionId.value, // 问题ID
      questionType: currentQuestion.questionType, // 问题类型
      examId: examId.value, // 考试ID
      content: noteContent.value, // 笔记内容
    });

    if (res.code === 200) {
      // 更新原始内容
      originalNoteContent.value = noteContent.value;
      
      // 更新noteList中对应题目的笔记内容和更新时间
      const currentEditQuestion = noteList.value.find(q => q.questionId === currentQuestionId.value);
      if (currentEditQuestion) {
        currentQuestion.note.content = noteContent.value;
        currentQuestion.note.updateTime = new Date().toISOString();
      }
      
      uni.showToast({
        title: res.message || '笔记保存成功',
        icon: 'success'
      });

      // 延迟关闭弹窗，让用户看到保存成功的提示
      setTimeout(() => {
        iSopenNotePopupShow.value = false; // 关闭笔记弹窗
      }, 800);
    } else {
      uni.showToast({
        title: res.message || '保存失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('保存笔记失败:', error);
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'none'
    });
  } finally {
    isSavingNote.value = false;
  }
}

const fetchNoteList = async () => {
  try {
    isLoading.value = true;
    const response = await getNoteListByExamIdAPI(examId.value)
    if (response.code === 200) {
      isLoading.value = false;
      noteList.value = response.data
    }
  } catch (error) {
    console.error('获取笔记列表失败', error)
  }finally {
    isLoading.value = false;
  }
}

// 开始练习
const startPractice = async (question) => {
  try {
    //构建bankInfo
    bankInfo.value = {
      bankId: examId.value,
      bankName: "系统题库",
      isUserBank: false // 标识这是系统题库
    }
    // 调用API获取题目
    const res = await practiceQuestionAPI(question.questionType, question.questionId);
    if (res.code === 200) {
      console.log(res.data)
      // 将当前收藏的题目设置为练习题目
      QuestionStore.setCurrentQuestionIds([question.questionId]);

      // 直接设置题目数据，
      QuestionStore.SetUserBlankquestions([res.data]);
      
      // 设置用户选择的题目，并获取返回的题目数组
      const selectedQuestions = QuestionStore.setSelectedQuestions(1, false, false);

      // 确保题目数据已正确设置
      if (selectedQuestions && selectedQuestions.length > 0) {
        // 清空之前的答案记录
        objectiveAnswerStore.clearAllAnswers();
        subjectiveAnswerStore.clearAllAnswers();

        // 添加延迟，确保状态更新完成
        setTimeout(() => {
          // 构建URL，传递题库信息
          let url = '/pages/exam/PracticeView';
          if (bankInfo.value) {
            url += `?bankInfo=${encodeURIComponent(JSON.stringify(bankInfo.value))}`;
          }
          uni.navigateTo({
            url: url
          });
        }, 300);
      } else {
        uni.showToast({
          title: '题目数据设置失败',
          icon: 'none'
        });
      }
    } else {
      uni.showToast({
        title: '请求失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('开始练习失败:', error);
    uni.showToast({
      title: '请求失败',
      icon: 'none'
    });
  }
};

// 页面滚动事件
onPageScroll((e) => {
  // 调用BackToTop组件的滚动处理方法
  if (backToTopRef.value) {
    backToTopRef.value.handlePageScroll(e);
  }
});

onLoad((option) => {
  if (!option.examId) {
    uni.showToast({
      title: '未获取到考试ID',
      icon: 'none'
    })
    uni.navigateBack()
    return;
  }
  examId.value = option.examId
})

onMounted(() => {
  fetchNoteList()
})
</script>

<style scoped>
.container {
  padding: 8rpx;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 20rpx;
}

.question-item {
  padding: 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.question-item:active {
  background-color: #f8f9fa;
}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
  gap: 12rpx;
}

.question-type {
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 500;
  border: 2rpx solid;
}

.type-all {
  color: #1e6bff;
  border-color: #1e6bff;
  background-color: #eaf2ff;
}

.favorite-status {
  margin-left: auto;
}

.favorite-icon {
  font-size: 32rpx;
  color: #FFD700;
}

.question-content {
  margin-bottom: 24rpx;
}

.question-number {
  font-size: 26rpx;
  color: #4A90E2;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.question-stem {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
  line-height: 1.6;
  margin-bottom: 30rpx;
}

.options-container {
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 12rpx 0;
}

.option-item:last-child {
  border-bottom: none;
}

.option-label {
  font-size: 28rpx;
  color: #4A90E2;
  font-weight: 600;
  margin-right: 16rpx;
  min-width: 40rpx;
}

.option-text {
  font-size: 28rpx;
  color: #34495e;
  line-height: 1.5;
  flex: 1;
}

/* 笔记内容样式 */
.note-content {
  margin: 24rpx 0;
  border-radius: 16rpx;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.note-header {
  background: linear-gradient(135deg, #f0f7ff, #e6f0ff);
  padding: 16rpx 24rpx;
}

.note-title {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #2c3e50;
}

.note-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.note-body {
  padding: 24rpx;
  background-color: #fafbfc;
  border-radius: 0 0 16rpx 16rpx;
}

.note-text {
  font-size: 28rpx;
  line-height: 1.8;
  color: #34495e;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx dashed #f0f0f0;
}

.favorite-time {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #95a5a6;
}

.info-icon {
  width: 33rpx;
  height: 33rpx;
  margin-right: 10rpx;
  flex-shrink: 0;
}

.question-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 18rpx;
  font-size: 24rpx;
  border: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.btn-icon {
  margin-right: 8rpx;
  font-size: 26rpx;
}

/* 编辑按钮样式 */
.edit-btn {
  background: linear-gradient(135deg, #ff9a56, #ff7e3d);
  color: #ffffff;
  animation: pulse 3s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 2rpx 8rpx rgba(255, 126, 61, 0.2);
  }
  50% {
    box-shadow: 0 2rpx 12rpx rgba(255, 126, 61, 0.3);
  }
  100% {
    box-shadow: 0 2rpx 8rpx rgba(255, 126, 61, 0.2);
  }
}

.edit-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.edit-btn:active::before {
  left: 100%;
}

.edit-btn:active {
  background: linear-gradient(135deg, #e8823d, #d56a2b);
  transform: scale(0.95);
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.15);
}

/* 练习按钮样式 */
.practice-btn {
  background: linear-gradient(135deg, #61abff, #49a4ff);
  color: #ffffff;
}

.practice-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.practice-btn:active::before {
  left: 100%;
}

.practice-btn:active {
  background: linear-gradient(135deg, #357ABD, #5b9cff);
  transform: scale(0.95);
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.15);
}

/* 焦点状态 */
.action-btn:focus {
  outline: none;
  box-shadow: 0 0 0 4rpx rgba(73, 164, 255, 0.3);
}

.edit-btn:focus {
  box-shadow: 0 0 0 4rpx rgba(255, 126, 61, 0.3);
}

/* 按钮脉冲动画 */
.action-btn {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.15);
  }
  100% {
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }
}

.popup-container {
  padding: 0px 5rpx;
}

.note-editor-wrapper {
  border-radius: 12rpx;
  overflow: hidden;
  border: 1px solid #eee;
  height: 600rpx;
}

/* sp-editor 样式调整 */
.note-editor-wrapper :deep(.sp-editor) {
  height: 100%;
}

.note-editor-wrapper :deep(.sp-editor-wrapper) {
  height: calc(100% - 60rpx);
}

.note-info {
  display: flex;
  justify-content: flex-end;
  padding: 0 10rpx;
}

.note-info-text {
  font-size: 24rpx;
  color: #999;
}

.note-button-container {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .question-item {
    padding: 24rpx;
  }

  .question-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 20rpx;
  }

  .question-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .action-btn {
    padding: 10rpx 20rpx;
    font-size: 22rpx;
  }

  .question-title {
    font-size: 28rpx;
  }

  .option-text {
    font-size: 26rpx;
  }

  .note-header {
    padding: 14rpx 20rpx;
  }

  .note-title {
    font-size: 26rpx;
  }

  .note-icon {
    font-size: 28rpx;
    margin-right: 10rpx;
  }

  .note-body {
    padding: 20rpx;
  }

  .note-text {
    font-size: 26rpx;
    line-height: 1.7;
  }
}
</style>