<template>
  <view class="container">
    <view class="calendar-section">
      <lxCalendar 
        :value="initialDate"
        :dot_lists="dotDates"
        @change="handleChange"
      />
    </view>
  </view>
</template>

<script setup>
import lxCalendar from '../../components/lx-calendar/lx-calendar.vue';
import { ref, onMounted } from 'vue';
import getTodayDate from '../../util/getTodayDate';

// 初始日期设置为今天
const initialDate = ref(getTodayDate());
const dotDates = ref([getTodayDate()]);// 下方显示圆点的日期

// 选中的日期
const selectedDate = ref('');

const handleChange = (e) => {
  console.log('日期改变:', e);
  selectedDate.value = e;
  console.log('选中日期:', selectedDate.value);
}

onMounted(() => {
  // 初始化时也设置选中日期为今天
  selectedDate.value = initialDate.value;
  console.log('初始化日期:', initialDate.value);
})
</script>

<style scoped>
.container {
  padding: 20rpx;
}

.calendar-section {
  margin-bottom: 40rpx;
}

</style>