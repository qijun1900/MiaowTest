/**
 * SM-2 间隔重复算法 - 前端辅助工具
 *
 * 用于在前端预览复习间隔，以及在离线场景下计算复习时间。
 * 实际复习数据以服务端计算为准。
 *
 * quality 评分标准：
 *   5 = 完美回忆，毫不犹豫
 *   4 = 正确回忆，稍有犹豫
 *   3 = 正确回忆，但很困难
 *   2 = 错误回忆，看到答案后觉得"啊对"
 *   1 = 错误回忆，看到答案后有点印象
 *   0 = 完全不记得
 *
 * 前端三按钮映射：
 *   ❌ 不认识 → quality=1
 *   😐 模糊   → quality=3
 *   ✅ 认识   → quality=5
 */

/**
 * 掌握等级常量
 */
export const MASTERY_LEVELS = {
  NEW: 0,       // 新词
  LEARNING: 1,  // 学习中
  FAMILIAR: 2,  // 熟悉
  MASTERED: 3,  // 已掌握
};

export const MASTERY_LABELS = {
  [MASTERY_LEVELS.NEW]: "新词",
  [MASTERY_LEVELS.LEARNING]: "学习中",
  [MASTERY_LEVELS.FAMILIAR]: "熟悉",
  [MASTERY_LEVELS.MASTERED]: "已掌握",
};

export const MASTERY_COLORS = {
  [MASTERY_LEVELS.NEW]: "var(--app-text-placeholder)",
  [MASTERY_LEVELS.LEARNING]: "var(--app-warning)",
  [MASTERY_LEVELS.FAMILIAR]: "var(--app-brand)",
  [MASTERY_LEVELS.MASTERED]: "var(--app-success)",
};

/**
 * 用户评价选项
 */
export const REVIEW_RATINGS = {
  UNKNOWN: { quality: 1, label: "不认识", icon: "❌", color: "var(--app-danger)" },
  FUZZY: { quality: 3, label: "模糊", icon: "😐", color: "var(--app-warning)" },
  KNOWN: { quality: 5, label: "认识", icon: "✅", color: "var(--app-success)" },
};

/**
 * 计算 SM-2 算法结果（前端预览用）
 * @param {number} currentEF - 当前 EF 值
 * @param {number} currentInterval - 当前间隔（天）
 * @param {number} reviewCount - 已复习次数
 * @param {number} quality - 评分 (0-5)
 * @returns {{ newEF: number, newInterval: number, masteryLevel: number }}
 */
export function calculateSM2(currentEF, currentInterval, reviewCount, quality) {
  let newEF = currentEF;
  let newInterval = currentInterval;

  const q = quality;
  const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  newEF = Math.max(1.3, currentEF + delta);

  if (quality >= 3) {
    if (reviewCount === 0) {
      newInterval = 1;
    } else if (reviewCount === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * newEF);
    }
  } else {
    newInterval = 1;
  }

  let masteryLevel;
  if (newInterval >= 30) {
    masteryLevel = MASTERY_LEVELS.MASTERED;
  } else if (newInterval >= 7) {
    masteryLevel = MASTERY_LEVELS.FAMILIAR;
  } else if (newInterval >= 1) {
    masteryLevel = MASTERY_LEVELS.LEARNING;
  } else {
    masteryLevel = MASTERY_LEVELS.NEW;
  }

  return { newEF, newInterval, masteryLevel };
}

/**
 * 格式化复习间隔为人类可读文本
 * @param {number} days - 间隔天数
 * @returns {string}
 */
export function formatInterval(days) {
  if (!days || days <= 0) return "立即";
  if (days === 1) return "1天后";
  if (days < 7) return `${days}天后`;
  if (days < 30) return `${Math.round(days / 7)}周后`;
  if (days < 365) return `${Math.round(days / 30)}个月后`;
  return `${Math.round(days / 365)}年后`;
}
