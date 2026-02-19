<template>
  <view class="container">
    <!-- 固定头部区域 -->
    <view class="fixed-header">
      <!-- 搜索栏 -->
      <view class="search-section">
        <view class="search-box">
          <uni-icons type="search" size="20" color="#ff9555" class="search-icon"></uni-icons>
          <input 
            class="search-input" 
            v-model="searchKeyword"
            placeholder="搜索题目内容..."
            placeholder-class="search-placeholder"
            :hold-fast="true"
            @input="handleSearch"
          />
          <uni-icons 
            v-if="searchKeyword" 
            type="clear" 
            size="18" 
            color="#999999" 
            class="clear-icon" 
            hover-class="none"
            @click="clearSearch"
          ></uni-icons>
        </view>
      </view>
      
      <!-- 分类标签栏 -->
      <view class="category-tabs">
        <scroll-view class="tabs-scroll" scroll-x :show-scrollbar="false">
          <view class="tabs-wrapper">
            <view 
              v-for="(tab, index) in tabs" 
              :key="index"
              class="tab-item"
              :class="{ 'tab-active': activeTab === tab.value }"
              hover-class="none"
              @click="switchTab(tab.value)"
            >
              <text class="tab-text">{{ tab.label }}</text>
              <view v-if="tab.count !== undefined" class="tab-badge">{{ tab.count }}</view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 错题列表 -->
    <view class="question-list">
      <!-- Loading 加载状态 -->
      <view v-if="loading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态提示 -->
      <view v-else-if="questionList.length === 0" class="empty-state">
        <view class="empty-icon">
          <uni-icons type="folder-add" size="120" color="#ffd4a3"></uni-icons>
        </view>
        <view class="empty-title">暂无错题</view>
        <view class="empty-desc">{{ getEmptyMessage() }}</view>
        <view 
          v-if="activeTab === 'all' && searchKeyword === ''" 
          class="empty-action" 
          @click="handleAddQuestion" 
          hover-class="none">
          <uni-icons type="plus" size="18" color="#ffffff"></uni-icons>
          <text class="empty-action-text">添加第一道错题</text>
        </view>
      </view>

      <!-- 错题卡片列表 -->
      <view 
        v-for="(item, index) in questionList" 
        :key="index"
        class="question-card"
      >
        <!-- 状态标签 - 卡片右上角 -->
        <view class="status-badge" :class="`status-${item.status}`">
          {{ item.statusText }}
        </view>

        <!-- 卡片头部 -->
        <view class="card-header">
          <scroll-view 
            class="tags-scroll-view" 
            scroll-x 
            :show-scrollbar="false">
            <view class="tags-row">
              <view 
                v-for="(tag, tagIndex) in item.tags" 
                :key="tagIndex"
                class="tag"
                :class="`tag-${tag.type}`"
              >
                {{ tag.text }}
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 题目内容 -->
        <view class="question-content">
          <QuestionContentDisplay :content="item._raw.stem" />
        </view>

        <!-- 日期和复习次数 -->
        <view class="question-meta">
          <text class="meta-text">{{formatTime.getTime2(item._raw.updatedAt) }} · 复习 {{ item.reviewCount }} 次</text>
          <view class="answer-status" hover-class="none" @click="toggleAnswer(index)">
            <text :class="item.showAnswer ? 'status-show' : 'status-hide'">
              {{ item.showAnswer ? '收起答案' : '查看答案' }}
            </text>
            <uni-icons 
              :type="item.showAnswer ? 'up' : 'down'" 
              size="14" 
              :color="item.showAnswer ? '#67c23a' : '#909399'"
            ></uni-icons>
          </view>
        </view>

        <!-- 答案区域（可展开） -->
        <view class="answer-wrapper" :class="{ 'answer-expanded': item.showAnswer }">
          <view class="answer-section">
            <!-- 选择题选项预览 -->
            <SelectOptionsPreview 
              v-if="item._raw.Type === 1 && item._raw.options && item._raw.options.length > 0"
              :options="item._raw.options"
              :userWrongAnswer="item._raw.wrongAnswer?.text || ''"
            />

            <!-- 判断题选项预览 -->
            <JudgeOptionsPreview 
              v-if="item._raw.Type === 3"
              :correctAnswer="item._raw.correctAnswer?.text || 'A'"
              :userWrongAnswer="item._raw.wrongAnswer?.text || ''"
            />

            <!-- 我的错误答案 -->
            <view class="answer-title">我的错解</view>
            <view class="answer-block wrong-answer">
              <!-- 选择题/判断题：纯文本简洁显示 -->
              <view v-if="(item._raw.Type === 1 || item._raw.Type === 3) && !item._raw.wrongAnswer?.images?.length" class="simple-answer">
                <text class="answer-text">{{ item._raw.wrongAnswer?.text || '' }}</text>
              </view>
              <!-- 其他题型：使用完整组件 -->
              <QuestionContentDisplay v-else :content="item._raw.wrongAnswer" />
            </view>

            <!-- 正确答案 -->
            <view class="answer-title">正确答案</view>
            <view class="answer-block correct-answer">
              <!-- 选择题/判断题：纯文本简洁显示 -->
              <view v-if="(item._raw.Type === 1 || item._raw.Type === 3) && !item._raw.correctAnswer?.images?.length" class="simple-answer">
                <text class="answer-text">{{ item._raw.correctAnswer?.text || '' }}</text>
              </view>
              <!-- 其他题型：使用完整组件 -->
              <QuestionContentDisplay v-else :content="item._raw.correctAnswer" />
            </view>

            <!-- 解析/笔记 -->
            <view v-if="item._raw.analysis?.text || (item._raw.analysis?.images && item._raw.analysis.images.length > 0)" class="note-wrapper">
              <view class="answer-title">解析 / 笔记 /备注</view>
              <view class="note-block">
                <QuestionContentDisplay :content="item._raw.analysis" />
              </view>
            </view>

            <!-- 答案区域底部操作按钮 -->
            <view class="answer-actions">
              <view 
                class="answer-btn"
                hover-class="none" 
                @click="editQuestion(item)">
                <uni-icons type="compose" size="16" color="#ff9555"></uni-icons>
                <text class="answer-btn-text">修改题目</text>
              </view>
              <view class="answer-btn" hover-class="none" @click="markNeedReview(item)">
                <uni-icons type="loop" size="16" color="#2196f3"></uni-icons>
                <text class="answer-btn-text">需要复习</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部操作栏 -->
        <view class="card-footer">
          <view class="footer-left" hover-class="none" @click="handleDelete(item)">
            <uni-icons type="trash" size="18" color="#909399"></uni-icons>
            <text class="footer-text">删除</text>
          </view>
          <view class="footer-right">
            <!-- <view class="footer-btn" hover-class="none" @click="reviewQuestion(item)">
              <text class="btn-text">查看习题</text>
            </view> -->
            <view 
              class="footer-btn primary" 
              :class="{ 'disabled': item.status === 'mastered' }"
              hover-class="none"
              @click="markAsMastered(item)"
            >
              <text class="btn-text">{{ item.status === 'mastered' ? '已掌握' : '标记为掌握' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!--悬浮按钮 -->
    <dragButton
      v-if="questionList.length > 0"
      butColor="#ffffff"
      v-model:show="isShowdragButton "
      :isDock="true"
      :existTabBar="true" 
      iconType="folder-add-filled"
      iconColor="#ff9800"
      :bottomOffset="100"
      :popMenu="false"
      @btnClick="handleAddQuestion"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import dragButton from '../../../components/plug-in/drag-button/drag-button.vue';
import SelectOptionsPreview from '../../../components/modules/exam/SelectOptionsPreview.vue';
import JudgeOptionsPreview from '../../../components/modules/exam/JudgeOptionsPreview.vue';
import QuestionContentDisplay from '../../../components/modules/exam/QuestionContentDisplay.vue';
import { 
  getWrongQuestionsAPI ,
  deleteWrongQuestionAPI,
  markAsMasteredAPI,
  markAsNeedReviewAPI

} from '../../../API/Tools/wrongQuestionAPI';
import formatTime from '../../../util/formatTime';

const WrongbookId = ref('');
const WrongbookTitle = ref('');
const searchKeyword = ref('');
const activeTab = ref('all');
const isShowdragButton = ref(true);
const loading = ref(false); // 加载状态

// 原始完整数据列表
const allQuestions = ref([]);
// 错题列表数据（筛选后）
const questionList = ref([]);
// 动态标签列表（从用户数据中提取）
const tabs = ref([
  { label: '全部', value: 'all', count: 0 }
]);

const handleSearch = () => {
  filterQuestions();
};

const clearSearch = () => {
  searchKeyword.value = '';
  filterQuestions();
};

const switchTab = (value) => {
  activeTab.value = value;
  filterQuestions();
};

// 筛选问题列表
const filterQuestions = () => {
  let filtered = [...allQuestions.value];
  
  // 按标签筛选
  if (activeTab.value !== 'all') {
    filtered = filtered.filter(q => {
      // 检查原始数据中的 tags 数组
      return q._raw?.tags && q._raw.tags.includes(activeTab.value);
    });
  }
  
  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase();
    filtered = filtered.filter(q => {
      // 安全地检查每个字段是否存在
      const questionMatch = q.question ? q.question.toLowerCase().includes(keyword) : false;
      const wrongAnswerMatch = q.wrongAnswer ? q.wrongAnswer.toLowerCase().includes(keyword) : false;
      const correctAnswerMatch = q.correctAnswer ? q.correctAnswer.toLowerCase().includes(keyword) : false;
      const noteMatch = q.note ? q.note.toLowerCase().includes(keyword) : false;
      const tagsMatch = q.tags ? q.tags.some(tag => tag.text && tag.text.toLowerCase().includes(keyword)) : false;
      
      return questionMatch || wrongAnswerMatch || correctAnswerMatch || noteMatch || tagsMatch;
    });
  }
  
  questionList.value = filtered;
};

// 切换答案显示状态
const toggleAnswer = (index) => {
  questionList.value[index].showAnswer = !questionList.value[index].showAnswer;
};

// 删除错题
const handleDelete = async (item) => {
  const confirm = await uni.showModal({
    title: '删除确认',
    content: '确定要删除这道错题吗？',
    confirmText: '删除',
    cancelText: '取消',
    confirmColor: '#ff4d4f',
    cancelColor: '#909399'
  });
  if (confirm.confirm) {
    try {
      const res = await deleteWrongQuestionAPI(item.id);
      if (res.code === 200) {
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
        // 从 allQuestions 中移除被删除的题目
        allQuestions.value = allQuestions.value.filter(q => q.id !== item.id);
        // 更新标签栏
        updateTabCounts();
        // 重新应用筛选
        filterQuestions();
      } else {
        uni.showToast({
          title: res.message || '删除失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('删除错题失败:', error);
      uni.showToast({ 
        title: '网络错误，请稍后重试',
        icon: 'none'
      });
    }
  }
};

//标记为已掌握
const markAsMastered = async (item) => {
  if (item.status === 'mastered') return;
  try {
    const res = await markAsMasteredAPI(item.id);
    if (res.code === 200) {
      item.status = 'mastered';
      item.statusText = '已掌握';
      uni.showToast({
        title: '修改成功',
        icon: 'none'
      });
    } else {
      uni.showToast({
        title: res.message || '标记失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('标记为已掌握失败:', error);
    uni.showToast({
      title: '网络错误，请稍后重试',
      icon: 'none'
    });
  }
};

// TODO: 跳转到编辑页面或打开编辑弹窗
const editQuestion = (item) => {
  uni.navigateTo({
    url: `/pages/tools/WrongBookToolView_children/WrongQuestionDetailView?id=${WrongbookId.value}&title=${encodeURIComponent(WrongbookTitle.value)}&questionId=${item.id}`
  });
};

//TODO 标记需要复习
const markNeedReview = async (item) => {
  try {
    const res = await markAsNeedReviewAPI(item.id);
    if (res.code === 200) {
      item.status = 'reviewing';
      item.statusText = '复习中';
      uni.showToast({
        title: '修改成功',
        icon: 'none'
      });
    } else {
      uni.showToast({
        title: res.message || '标记失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('标记为需要复习失败:', error);
    uni.showToast({
      title: '网络错误，请稍后重试',
      icon: 'none'
    });
}};
//跳转到添加题目页面
const handleAddQuestion = () => {
  uni.navigateTo({  
    url: `/pages/tools/WrongBookToolView_children/WrongQuestionDetailView?id=${WrongbookId.value}&title=${encodeURIComponent(WrongbookTitle.value)}`
  });
};

// 获取空状态提示消息
const getEmptyMessage = () => {
  if (searchKeyword.value.trim()) {
    return `没有找到包含"${searchKeyword.value}"的错题`;
  }
  if (activeTab.value !== 'all') {
    return `暂无"${activeTab.value}"标签的错题`;
  }
  return '点击右下角按钮开始添加错题吧';
};

// 获取错题列表数据
const fetchWrongQuestions = async () => {
  if (loading.value) return; // 防止重复请求
  
  try {
    loading.value = true;
    const res = await getWrongQuestionsAPI(WrongbookId.value);
    if (res.code === 200) {
      // 将后端数据转换为前端需要的格式
      allQuestions.value = (res.data || []).map(q => {
        // 题型映射
        const typeMap = {
          1: { text: '选择题', color: 'blue' },
          2: { text: '填空题', color: 'purple' },
          3: { text: '判断题', color: 'red' },
          4: { text: '简答题', color: 'orange' }
        };
        
        // 难度映射
        const difficultyMap = {
          'easy': { text: '简单', color: 'green' },
          'medium': { text: '中等', color: 'yellow' },
          'hard': { text: '困难', color: 'red' }
        };
        
        // 状态映射
        const statusMap = {
          0: { status: 'new', text: '新题' },
          1: { status: 'reviewing', text: '复习中' },
          2: { status: 'mastered', text: '已掌握' }
        };
        
        
        // 构建标签数组
        const tags = [
          { text: typeMap[q.Type]?.text || '未知', type: typeMap[q.Type]?.color || 'gray' },
          { text: difficultyMap[q.difficulty]?.text || '中等', type: difficultyMap[q.difficulty]?.color || 'yellow' }
        ];
        
        // 添加用户自定义标签
        if (q.tags && Array.isArray(q.tags)) {
          q.tags.forEach(tag => {
            tags.push({ text: `#${tag}`, type: 'gray' });
          });
        }
        
        return {
          id: q._id,
          tags: tags,
          status: statusMap[q.status]?.status || 'new',
          statusText: statusMap[q.status]?.text || '新题',
          reviewCount: q.reviewCount || 0,
          showAnswer: false,
          // 保留原始数据以便后续使用
          _raw: q
        };
      });
      
      // 更新标签栏
      updateTabCounts();
      
      // 应用筛选
      filterQuestions();
      
    } else {
      uni.showToast({
        title: res.message || '获取数据失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取错题列表失败:', error);
    uni.showToast({
      title: '网络错误，请稍后重试',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
}

// 更新标签栏（从用户数据中提取所有标签）
const updateTabCounts = () => {
  // 统计所有标签及其出现次数
  const tagCounts = {};
  
  allQuestions.value.forEach(q => {
    if (q._raw?.tags && Array.isArray(q._raw.tags)) {
      q._raw.tags.forEach(tag => {
        if (tag) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    }
  });
  
  // 构建标签列表（按出现次数降序排序）
  const tagList = Object.entries(tagCounts)
    .map(([tag, count]) => ({
      label: tag,
      value: tag,
      count: count
    }))
    .sort((a, b) => b.count - a.count); // 按数量降序排序
  
  // 更新 tabs，保留"全部"标签在最前面
  tabs.value = [
    { label: '全部', value: 'all', count: allQuestions.value.length },
    ...tagList
  ];
}

onLoad(async (options) => {
  if (options.id) {
    WrongbookId.value = options.id;
  } else {
    uni.showToast({
      title: '参数错误',
      icon: 'error'
    });
    setTimeout(() => uni.navigateBack(), 1000);
  }
  if (options.title) {
    WrongbookTitle.value = decodeURIComponent(options.title);
  }
});

onShow(() => {
  // 页面显示时刷新列表（从添加页面返回时会触发）
  if (WrongbookId.value) {
    fetchWrongQuestions();
  }
});
</script>
<style scoped>
.container {
  min-height: 100vh;
  background: #fff9f2;
  padding-top: 0;
}

.fixed-header {
  position: sticky;
  top: 0;
  background: #fff9f2;
  z-index: 100;
  padding-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(255, 149, 85, 0.05);
}

/* 搜索栏样式 */
.search-section {
  padding: 24rpx 32rpx 16rpx;
}

.search-box {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 48rpx;
  padding: 20rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 149, 85, 0.08);
  border: 2rpx solid #ffe8d6;
}

.search-icon {
  margin-right: 16rpx;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  height: 40rpx;
  line-height: 40rpx;
}

.search-placeholder {
  color: #cccccc;
}

.clear-icon {
  padding: 8rpx;
  margin-right: -8rpx;
  display: flex;
  align-items: center;
  cursor: pointer;
}

/* 分类标签栏样式 */
.category-tabs {
  padding: 0 32rpx;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-wrapper {
  display: inline-flex;
  gap: 16rpx;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  padding: 16rpx 32rpx;
  background: #ffffff;
  border-radius: 40rpx;
  border: 2rpx solid #ffe8d6;
  transition: all 0.3s ease;
  position: relative;
}

.tab-item.tab-active {
  background: #ff9555;
  border-color: #ff9555;
  box-shadow: 0 4rpx 12rpx rgba(255, 149, 85, 0.25);
}

.tab-text {
  font-size: 28rpx;
  color: #666666;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.tab-active .tab-text {
  color: #ffffff;
  font-weight: 500;
}

.tab-badge {
  margin-left: 8rpx;
  background: #ffe8d6;
  color: #ff9555;
  font-size: 22rpx;
  padding: 2rpx 12rpx;
  border-radius: 20rpx;
  min-width: 32rpx;
  text-align: center;
  font-weight: 500;
}

.tab-active .tab-badge {
  background: rgba(255, 255, 255, 0.3);
  color: #ffffff;
}

/* 错题列表样式 */
.question-list {
  padding: 24rpx 32rpx;
  min-height: 60vh;
}

/* Loading 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid #ffe8d6;
  border-top-color: #ff9555;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 32rpx;
  font-size: 28rpx;
  color: #ff9555;
  font-weight: 500;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
  text-align: center;
}

.empty-icon {
  margin-bottom: 40rpx;
  opacity: 0.6;
}

.empty-title {
  font-size: 36rpx;
  color: #ff9555;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999999;
  line-height: 1.6;
  margin-bottom: 48rpx;
  max-width: 500rpx;
}

.empty-action {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 48rpx;
  background: linear-gradient(135deg, #ff9555 0%, #ffb380 100%);
  border-radius: 48rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 149, 85, 0.3);
  transition: all 0.3s ease;
}

.empty-action:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 12rpx rgba(255, 149, 85, 0.2);
}

.empty-action-text {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 500;
}

.question-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  padding-top: 56rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(255, 149, 85, 0.06);
  border: 2rpx solid #ffe8d6;
  position: relative;
}

/* 状态标签 - 卡片右上角贴纸样式 */
.status-badge {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
  z-index: 10;
  white-space: nowrap;
}

.status-badge.status-new {
  background: #fff3e0;
  color: #ff9800;
  border: 2rpx solid #ffe8d6;
}

.status-badge.status-reviewing {
  background: #e3f2fd;
  color: #2196f3;
  border: 2rpx solid #bbdefb;
}

.status-badge.status-mastered {
  background: #e8f5e9;
  color: #4caf50;
  border: 2rpx solid #c8e6c9;
}

/* 卡片头部 */
.card-header {
  margin-bottom: 20rpx;
  padding-right: 120rpx;
}

.tags-scroll-view {
  white-space: nowrap;
  width: 100%;
}

.tags-row {
  display: inline-flex;
  gap: 12rpx;
  align-items: center;
}

.tag {
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.tag-blue {
  background: #e3f2fd;
  color: #2196f3;
}

.tag-green {
  background: #e8f5e9;
  color: #4caf50;
}

.tag-yellow {
  background: #fff8e1;
  color: #ffa726;
}

.tag-red {
  background: #ffebee;
  color: #f44336;
}

.tag-purple {
  background: #f3e5f5;
  color: #9c27b0;
}

.tag-orange {
  background: #fff3e0;
  color: #ff9800;
}

.tag-gray {
  background: #f5f5f5;
  color: #757575;
}

/* 题目内容 */
.question-content {
  margin-bottom: 20rpx;
}

/* 元信息 */
.question-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.meta-text {
  font-size: 24rpx;
  color: #999999;
}

.answer-status {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.answer-status:active {
  transform: scale(0.95);
  background: #eeeeee;
}

.status-show {
  font-size: 24rpx;
  color: #67c23a;
}

.status-hide {
  font-size: 24rpx;
  color: #909399;
}

/* 答案区域包装器 - 使用高度过渡 */
.answer-wrapper {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  opacity: 0;
}

.answer-wrapper.answer-expanded {
  max-height: 2000rpx;
  opacity: 1;
}

/* 答案区域 */
.answer-section {
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #f5f5f5;
}

.answer-title {
  font-size: 28rpx;
  color: #333333;
  font-weight: 600;
  margin-bottom: 16rpx;
  margin-top: 28rpx;
}

.answer-title:first-child {
  margin-top: 0;
}

.answer-block {
  padding: 24rpx 32rpx;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
  position: relative;
  padding-left: 40rpx;
}

.answer-block::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8rpx;
  border-radius: 12rpx 0 0 12rpx;
}

.wrong-answer {
  background: #fef0f0;
}


.correct-answer {
  background: #f0f9ff;
}

/* 简洁答案样式（用于选择题/判断题） */
.simple-answer {
  padding: 0;
}

.answer-text {
  font-size: 32rpx;
  line-height: 1.5;
  color: #333333;
  font-weight: 500;
}

/* 笔记区域 */
.note-wrapper {
  margin-top: 28rpx;
}

.note-block {
  padding: 20rpx 28rpx;
  background: #fafafa;
  border-radius: 12rpx;
}

/* 答案区域底部操作按钮 */
.answer-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 32rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #f5f5f5;
}

.answer-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.answer-btn:active {
  transform: scale(0.95);
  background: #eeeeee;
}

.answer-btn:first-child {
  background: #fff8f0;
  border: 2rpx solid #ffe8d6;
}

.answer-btn:first-child:active {
  background: #ffedd9;
}

.answer-btn:last-child {
  background: #f0f7ff;
  border: 2rpx solid #d6ebff;
}

.answer-btn:last-child:active {
  background: #e3f2fd;
}

.answer-btn-text {
  font-size: 26rpx;
  color: #666666;
  font-weight: 500;
}

.answer-btn:first-child .answer-btn-text {
  color: #ff9555;
}

.answer-btn:last-child .answer-btn-text {
  color: #2196f3;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #f5f5f5;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
  cursor: pointer;
}

.footer-text {
  font-size: 24rpx;
  color: #909399;
}

.footer-right {
  display: flex;
  gap: 16rpx;
}

.footer-btn {
  padding: 12rpx 28rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
  cursor: pointer;
}

.footer-btn.primary {
  background: #ff9555;
}

.footer-btn.primary.disabled {
  background: #e8f5e9;
}

.footer-btn .btn-text {
  font-size: 24rpx;
  color: #666666;
}

.footer-btn.primary .btn-text {
  color: #ffffff;
}

.footer-btn.primary.disabled .btn-text {
  color: #4caf50;
}

</style>