<template>
  <view class="container">
    <view class="exam-list">

      <ThemeLoading v-if="loading" text="正在加载笔记..." />
      <view v-else-if="NoteExam.length > 0" class="subject-list">
        <view 
          v-for="subject in NoteExam" 
          :key="subject._id" 
          class="subject-item" 
          @click="handleClick(subject)"
          >
          <view class="subject-icon">
            <image
              :src="subject.coverImage || `${escconfig.ossDomain}${subject.cover}`"
              mode="aspectFill" class="subject-image" />
          </view>
          <view class="subject-info">
            <text class="subject-name">{{ subject.name }}</text>
            <text class="note-count" v-if="subject.noteCount">{{ subject.noteCount }} 条笔记记录</text>
          </view>
          <view class="subject-arrow">›</view>
        </view>
      </view>

      <!-- 空状态显示 -->
      <view v-else class="empty-state">
        <Empty description="暂无笔记"/>
        <text class="empty-desc">快去创建你的第一个笔记吧！</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import escconfig from '../../config/esc.config'
import ThemeLoading from '../../components/core/ThemeLoading.vue'
import { getNoteExamListAPI } from '../../API/My/UserNoteAPI'
import Empty from '../../components/core/Empty.vue'

const NoteExam = ref([])
const loading = ref(false)

// 处理点击事件，跳转到笔记详情页
const handleClick = (exam) => {
  uni.navigateTo({
    url: `/pages/my/MyNoteDetailView?examId=${exam._id}`
  })
}

const fetchUserNoteExam = async () => {
  loading.value = true
  try {
    const response = await getNoteExamListAPI()
    if (response.code === 200) {
        NoteExam.value = response.data.map(item => ({
            _id: item._id,
            name: item.name,
            cover: item.cover,
            coverImage: `${escconfig.ossDomain}${item.cover}`,
            noteCount: item.noteCount || 0,
            ...item
        }))
    }
  } catch (error) {
    console.error('获取笔记科目失败:', error)
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  fetchUserNoteExam()
})
</script>

<style scoped lang="scss">
.container {
  padding: 20rpx 20rpx 5rpx 20rpx;
}

.exam-list {
  width: 100%;
}

.subject-list {
  width: 100%;
}

.subject-item {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 29rpx;
  margin-bottom: 15rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.subject-item:active {
  transform: scale(0.98);
}

.subject-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #c0ccff 0%, #6b9fe8 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 30rpx;
  flex-shrink: 0;
  overflow: hidden;
}

.subject-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.subject-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.subject-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.note-count {
  font-size: 24rpx;
  color: #666666;
}

.update-time {
  font-size: 24rpx;
  color: #999999;
}

.subject-arrow {
  font-size: 32rpx;
  color: #007AFF;
  font-weight: bold;
  margin-left: 20rpx;
}

.note-count {
  font-size: 24rpx;
  color: #999999;
  margin-top: 5rpx;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  background-color: #ffffff;
  border-radius: 12rpx;
  margin-top: 50rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999999;
  text-align: center;
}
</style>
