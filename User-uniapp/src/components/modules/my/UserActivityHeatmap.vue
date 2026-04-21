<template>
  <view class="activity-card">
    <view class="card-header">
      <view>
        <text class="title">学习活跃热力</text>
        <text class="subtitle">按业务动作累计（如添加笔记、添加错题）</text>
      </view>
      <view class="month-switch">
        <text
          v-for="month in monthOptions"
          :key="month.value"
          class="month-pill"
          :class="{ 'month-pill-active': selectedMonths === month.value }"
          @click="handleMonthChange(month.value)"
        >
          {{ month.label }}
        </text>
      </view>
    </view>

    <view class="palette-bar">
      <text class="palette-title">配色</text>
      <view class="palette-list">
        <view
          v-for="palette in paletteOptions"
          :key="palette.key"
          class="palette-item"
          :class="{ 'palette-item-active': selectedPalette === palette.key }"
          @click="selectedPalette = palette.key"
        >
          <view class="palette-preview">
            <view
              v-for="(color, colorIndex) in palette.colors"
              :key="`${palette.key}_${colorIndex}`"
              class="palette-dot"
              :style="{ backgroundColor: color }"
            />
          </view>
          <text class="palette-name">{{ palette.label }}</text>
        </view>
      </view>
    </view>

    <view v-if="!isLoggedIn" class="empty-state">
      <text>登录后可查看你的活动热力图，并支持点击查看每日明细。</text>
    </view>

    <view v-else>
      <view class="summary-grid">
        <view class="summary-item">
          <text class="summary-value">{{ heatmap.totalActiveDays || 0 }}</text>
          <text class="summary-label">活跃天数</text>
        </view>
        <view class="summary-item">
          <text class="summary-value">{{ heatmap.totals?.totalScore || 0 }}</text>
          <text class="summary-label">总热度</text>
        </view>
        <view class="summary-item">
          <text class="summary-value">{{ heatmap.streak?.currentStreak || 0 }}</text>
          <text class="summary-label">当前连续</text>
        </view>
        <view class="summary-item">
          <text class="summary-value">{{ heatmap.streak?.longestStreak || 0 }}</text>
          <text class="summary-label">最长连续</text>
        </view>
      </view>

      <view class="heatmap-shell" v-if="weekColumns.length > 0">
        <view class="weekday-axis">
          <text
            v-for="(label, index) in weekdayLabels"
            :key="`${label}_${index}`"
            class="weekday-label"
          >
            {{ label }}
          </text>
        </view>

        <scroll-view class="heatmap-scroll" scroll-x :show-scrollbar="false">
          <view class="heatmap-content">
            <view class="month-marker-layer">
              <text
                v-for="marker in monthMarkers"
                :key="`${marker.label}_${marker.column}`"
                class="month-marker"
                :style="{ left: `${marker.leftRpx}rpx` }"
              >
                {{ marker.label }}
              </text>
            </view>

            <view class="heatmap-grid">
              <view
                v-for="(week, weekIndex) in weekColumns"
                :key="`week_${weekIndex}`"
                class="week-column"
              >
                <view
                  v-for="day in week"
                  :key="day.date"
                  class="day-cell"
                  :class="{
                    'day-cell-outside': !day.isInRange,
                    'day-cell-selected': day.isInRange && selectedDate === day.date,
                  }"
                  :style="{ backgroundColor: getCellColor(day) }"
                  @click="handleDayClick(day)"
                />
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="heatmap-legend" v-if="isLoggedIn">
        <text class="legend-text">更少</text>
        <view class="legend-colors">
          <view
            v-for="(color, idx) in selectedPaletteColors"
            :key="`legend_${idx}`"
            class="legend-dot"
            :style="{ backgroundColor: color }"
          />
        </view>
        <text class="legend-text">更多</text>
      </view>

      <view class="detail-panel" v-if="selectedDate">
        <view class="detail-header">
          <text class="detail-title">{{ selectedDate }} 活动详情</text>
          <text class="detail-loading" v-if="detailLoading">加载中...</text>
        </view>

        <view class="detail-stats">
          <view class="detail-chip">热度 {{ selectedSummary.totalScore }}</view>
          <view class="detail-chip">业务 {{ selectedSummary.actionEventCount }}</view>
          <view class="detail-chip">记录 {{ selectedSummary.manualEventCount }}</view>
        </view>

        <view class="detail-section">
          <text class="section-title">行为事件</text>
          <view v-if="(dayDetail.actionLogs || []).length === 0" class="section-empty">
            暂无行为数据
          </view>
          <view
            v-for="(item, index) in (dayDetail.actionLogs || []).slice(0, 6)"
            :key="`action_${index}_${item.traceId}`"
            class="detail-row"
          >
            <text class="detail-time">{{ formatClock(item.actionAt) }}</text>
            <text class="detail-main">{{ item.eventName }}</text>
            <text class="detail-module">{{ item.module || "general" }}</text>
          </view>
        </view>
      </view>

      <view class="loading-tip" v-if="loading">热力图加载中...</view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import {
  getUserActivityByDate,
  getUserActivityHeatmap,
} from "../../../API/My/UserActivityAPI";
import { UserInfoStore } from "../../../stores/modules/UserinfoStore";

const DAY_MS = 24 * 60 * 60 * 1000;
const CELL_STEP_RPX = 38;

const userInfoStore = UserInfoStore();

const loading = ref(false);
const detailLoading = ref(false);
const selectedMonths = ref(12);
const selectedPalette = ref("green");
const selectedDate = ref("");

const heatmap = ref({
  startDate: "",
  endDate: "",
  maxScore: 0,
  totalActiveDays: 0,
  streak: {
    currentStreak: 0,
    longestStreak: 0,
  },
  totals: {
    totalScore: 0,
    apiRequestCount: 0,
    successRequestCount: 0,
    failRequestCount: 0,
    actionEventCount: 0,
    manualEventCount: 0,
  },
  days: [],
});

const dayDetail = ref({
  summary: {
    totalScore: 0,
    actionEventCount: 0,
    manualEventCount: 0,
  },
  actionLogs: [],
});

const monthOptions = [
  { label: "3个月", value: 3 },
  { label: "6个月", value: 6 },
  { label: "12个月", value: 12 },
];

const paletteOptions = [
  {
    key: "green",
    label: "默认绿",
    colors: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
  },
  {
    key: "blue",
    label: "清新蓝",
    colors: ["#ebedf0", "#b7d8ff", "#6caeff", "#397ddf", "#2053a3"],
  },
  {
    key: "orange",
    label: "暖日橙",
    colors: ["#ebedf0", "#ffdca8", "#ffb65b", "#f58a24", "#b95a05"],
  },
  {
    key: "teal",
    label: "湖水青",
    colors: ["#ebedf0", "#b2efe4", "#6edac7", "#36ac95", "#1f6d5f"],
  },
  {
    key: "rose",
    label: "玫瑰粉",
    colors: ["#ebedf0", "#f5c8dc", "#ec92b8", "#d96091", "#a63864"],
  },
];

const weekdayLabels = ["周一", "", "周三", "", "周五", "", "周日"];

const isLoggedIn = computed(() => Boolean(userInfoStore.isLoggedIn));

const selectedPaletteColors = computed(() => {
  const target = paletteOptions.find((item) => item.key === selectedPalette.value);
  return target ? target.colors : paletteOptions[0].colors;
});

const selectedSummary = computed(() => {
  const summary = dayDetail.value?.summary || {};
  return {
    totalScore: summary.totalScore || 0,
    actionEventCount: summary.actionEventCount || 0,
    manualEventCount: summary.manualEventCount || 0,
  };
});

const dayMap = computed(() => {
  const map = new Map();
  for (const day of heatmap.value.days || []) {
    map.set(day.date, day);
  }
  return map;
});

const weekColumns = computed(() => {
  if (!heatmap.value.startDate || !heatmap.value.endDate) return [];

  const startDate = parseDateKey(heatmap.value.startDate);
  const endDate = parseDateKey(heatmap.value.endDate);

  if (!startDate || !endDate) return [];

  const alignedStart = alignToMonday(startDate);
  const alignedEnd = alignToSunday(endDate);

  const weeks = [];
  for (
    let weekStart = new Date(alignedStart);
    weekStart <= alignedEnd;
    weekStart = new Date(weekStart.getTime() + 7 * DAY_MS)
  ) {
    const week = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const currentDate = new Date(weekStart.getTime() + dayIndex * DAY_MS);
      const dateKey = formatDateKey(currentDate);
      const inRange = dayMap.value.has(dateKey);
      const sourceDay = inRange
        ? dayMap.value.get(dateKey)
        : {
            date: dateKey,
            level: 0,
            totalScore: 0,
            apiRequestCount: 0,
            actionEventCount: 0,
            manualEventCount: 0,
          };

      week.push({
        ...sourceDay,
        date: dateKey,
        isInRange: inRange,
      });
    }

    weeks.push(week);
  }

  return weeks;
});

const monthMarkers = computed(() => {
  const markers = [];
  let previousMonthKey = "";

  weekColumns.value.forEach((week, column) => {
    const firstInRange = week.find((item) => item.isInRange);
    if (!firstInRange) return;

    const monthKey = firstInRange.date.slice(0, 7);
    if (monthKey === previousMonthKey) return;

    previousMonthKey = monthKey;
    markers.push({
      label: `${Number(firstInRange.date.slice(5, 7))}月`,
      column,
      leftRpx: column * CELL_STEP_RPX,
    });
  });

  return markers;
});

function parseDateKey(dateKey) {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMondayBasedWeekday(date) {
  return (date.getDay() + 6) % 7;
}

function alignToMonday(date) {
  const aligned = new Date(date);
  aligned.setDate(aligned.getDate() - getMondayBasedWeekday(aligned));
  return aligned;
}

function alignToSunday(date) {
  const aligned = new Date(date);
  aligned.setDate(aligned.getDate() + (6 - getMondayBasedWeekday(aligned)));
  return aligned;
}

function getCellColor(day) {
  if (!day.isInRange) {
    return "#f6f7fb";
  }

  const level = Math.max(0, Math.min(4, Number(day.level) || 0));
  return selectedPaletteColors.value[level];
}

function formatClock(value) {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function handleMonthChange(monthValue) {
  if (selectedMonths.value === monthValue) return;
  selectedMonths.value = monthValue;
  loadHeatmap();
}

async function loadHeatmap() {
  if (!isLoggedIn.value) return;

  loading.value = true;
  try {
    const result = await getUserActivityHeatmap({
      months: selectedMonths.value,
    });

    if (result?.code !== 200 || !result.data) {
      uni.showToast({
        title: result?.message || "热力图加载失败",
        icon: "none",
      });
      return;
    }

    heatmap.value = {
      ...heatmap.value,
      ...result.data,
      days: Array.isArray(result.data.days) ? result.data.days : [],
    };

    const activeDay =
      [...heatmap.value.days].reverse().find((item) => item.totalScore > 0) ||
      heatmap.value.days[heatmap.value.days.length - 1];

    if (activeDay?.date) {
      selectedDate.value = activeDay.date;
      await loadDayDetail(activeDay.date);
    }
  } catch (error) {
    console.error("loadHeatmap 失败", error);
  } finally {
    loading.value = false;
  }
}

async function loadDayDetail(date) {
  if (!date || !isLoggedIn.value) return;

  detailLoading.value = true;
  try {
    const result = await getUserActivityByDate(date);
    if (result?.code === 200 && result.data) {
      dayDetail.value = result.data;
      return;
    }

    uni.showToast({
      title: result?.message || "活动详情加载失败",
      icon: "none",
    });
  } catch (error) {
    console.error("loadDayDetail 失败", error);
  } finally {
    detailLoading.value = false;
  }
}

async function handleDayClick(day) {
  if (!day.isInRange) return;
  selectedDate.value = day.date;
  await loadDayDetail(day.date);
}

watch(
  () => isLoggedIn.value,
  async (loggedIn) => {
    if (!loggedIn) {
      selectedDate.value = "";
      heatmap.value.days = [];
      dayDetail.value = {
        summary: {
          totalScore: 0,
          actionEventCount: 0,
          manualEventCount: 0,
        },
        actionLogs: [],
      };
      return;
    }

    await loadHeatmap();
  },
  { immediate: true },
);
</script>

<style scoped>
.activity-card {
  margin: 24rpx 0;
  padding: 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(140deg, #ffffff 0%, #f7fbff 55%, #f2f9ff 100%);
  border: 1px solid rgba(176, 208, 255, 0.25);
  box-shadow:
    0 12rpx 32rpx rgba(58, 92, 132, 0.08),
    0 4rpx 12rpx rgba(58, 92, 132, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.title {
  display: block;
  font-size: 32rpx;
  color: #1f2a3d;
  font-weight: 700;
}

.subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #72829c;
}

.month-switch {
  display: flex;
  gap: 12rpx;
  align-items: center;
}

.month-pill {
  font-size: 22rpx;
  color: #5c6b84;
  background: #f2f5fb;
  border: 1px solid #dce5f2;
  border-radius: 999rpx;
  padding: 6rpx 18rpx;
}

.month-pill-active {
  color: #1f67d2;
  background: #e8f1ff;
  border-color: #9ac1ff;
}

.palette-bar {
  margin-top: 22rpx;
}

.palette-title {
  font-size: 24rpx;
  color: #5f6d86;
}

.palette-list {
  margin-top: 12rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 12rpx;
  border-radius: 14rpx;
  border: 1px solid #e4e9f4;
  background: #ffffff;
}

.palette-item-active {
  border-color: #89b4ff;
  box-shadow: 0 0 0 2rpx rgba(68, 132, 240, 0.12);
}

.palette-preview {
  display: flex;
  gap: 4rpx;
}

.palette-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
}

.palette-name {
  font-size: 22rpx;
  color: #465675;
}

.empty-state {
  margin-top: 24rpx;
  border-radius: 16rpx;
  padding: 20rpx;
  background: #f5f8ff;
  color: #6a7a97;
  font-size: 24rpx;
  line-height: 1.6;
}

.summary-grid {
  margin-top: 20rpx;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12rpx;
}

.summary-item {
  background: #f4f8ff;
  border: 1px solid #e0e9fb;
  border-radius: 14rpx;
  padding: 14rpx 10rpx;
  text-align: center;
}

.summary-value {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #194da6;
}

.summary-label {
  display: block;
  margin-top: 6rpx;
  color: #6a7a97;
  font-size: 22rpx;
}

.heatmap-shell {
  margin-top: 24rpx;
  display: flex;
}

.weekday-axis {
  width: 54rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 48rpx;
  gap: 8rpx;
}

.weekday-label {
  height: 30rpx;
  line-height: 30rpx;
  font-size: 20rpx;
  color: #94a2ba;
}

.heatmap-scroll {
  flex: 1;
  white-space: nowrap;
}

.heatmap-content {
  position: relative;
  padding-top: 38rpx;
  min-width: 640rpx;
}

.month-marker-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 30rpx;
}

.month-marker {
  position: absolute;
  font-size: 20rpx;
  color: #6f7f98;
}

.heatmap-grid {
  display: flex;
  gap: 8rpx;
}

.week-column {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.day-cell {
  width: 30rpx;
  height: 30rpx;
  border-radius: 7rpx;
  border: 1px solid rgba(162, 180, 210, 0.22);
}

.day-cell-outside {
  border-style: dashed;
  border-color: rgba(181, 195, 219, 0.35);
}

.day-cell-selected {
  border-color: #265ece;
  box-shadow: 0 0 0 2rpx rgba(39, 95, 207, 0.22);
}

.heatmap-legend {
  margin-top: 16rpx;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8rpx;
}

.legend-text {
  color: #73839f;
  font-size: 20rpx;
}

.legend-colors {
  display: flex;
  gap: 6rpx;
}

.legend-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 5rpx;
  border: 1px solid rgba(145, 165, 196, 0.22);
}

.detail-panel {
  margin-top: 20rpx;
  padding: 18rpx;
  border-radius: 16rpx;
  background: #f6f9ff;
  border: 1px solid #e2ebfb;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-title {
  font-size: 26rpx;
  color: #1f2d46;
  font-weight: 600;
}

.detail-loading {
  font-size: 22rpx;
  color: #7092cc;
}

.detail-stats {
  margin-top: 12rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.detail-chip {
  font-size: 22rpx;
  color: #355a96;
  border: 1px solid #cfe0fb;
  border-radius: 999rpx;
  padding: 6rpx 16rpx;
  background: #edf4ff;
}

.detail-section {
  margin-top: 16rpx;
}

.section-title {
  display: block;
  font-size: 24rpx;
  color: #3a4f77;
  margin-bottom: 8rpx;
}

.section-empty {
  font-size: 22rpx;
  color: #8a9ab6;
}

.detail-row {
  display: grid;
  grid-template-columns: 84rpx 1fr 90rpx;
  gap: 10rpx;
  align-items: center;
  min-height: 42rpx;
  padding: 4rpx 0;
}

.detail-time {
  font-size: 21rpx;
  color: #6d7f9f;
}

.detail-main {
  font-size: 22rpx;
  color: #2a3d61;
}

.detail-status {
  font-size: 22rpx;
  text-align: right;
  color: #60728f;
}

.detail-status-ok {
  color: #24864b;
}

.detail-status-bad {
  color: #c74646;
}

.detail-module {
  font-size: 22rpx;
  text-align: right;
  color: #5d7397;
}

.loading-tip {
  margin-top: 14rpx;
  color: #6f83a5;
  font-size: 22rpx;
}

@media (max-width: 640px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .month-switch {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>
