const mongoose = require("mongoose");
const UserActivityEventModel = require("../../models/UserActivityEventModel");
const UserActivityDailyModel = require("../../models/UserActivityDailyModel");

const MAX_HEATMAP_MONTHS = 18;
const MAX_DAY_DETAIL_LIMIT = 80;
const CHINA_TIMEZONE_OFFSET_MS = 8 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// 统一截断字符串，避免活动记录里塞入过长文本。
function toSafeString(value, maxLength = 120) {
  if (value === null || value === undefined) return "";
  return String(value).slice(0, maxLength);
}

// 将数值输入规范化，任何非法值都会回退到默认值。
function toSafeNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

// 业务活动只接受合法 ObjectId，非法值直接忽略，避免写库报错。
function toObjectIdOrNull(value) {
  if (!value) return null;
  if (mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }
  return null;
}

// 对 metadata 做有限深度裁剪，防止单条活动事件过大。
function sanitizePayload(payload, depth = 0) {
  if (payload === null || payload === undefined) return payload;
  if (depth > 3) return "[TruncatedDepth]";

  if (Array.isArray(payload)) {
    return payload.slice(0, 20).map((item) => sanitizePayload(item, depth + 1));
  }

  if (typeof payload !== "object") {
    if (typeof payload === "string") return payload.slice(0, 500);
    return payload;
  }

  const output = {};
  const entries = Object.entries(payload).slice(0, 50);
  for (const [key, value] of entries) {
    output[key] = sanitizePayload(value, depth + 1);
  }
  return output;
}

// 从请求中抽取客户端来源信息，供活动详情展示和后续排查使用。
function getClientContext(req) {
  return {
    sourceClient:
      req?.clientInfo?.sourceClient ||
      req?.headers?.["source-client"] ||
      "unknown",
    platform: req?.clientInfo?.platform || req?.headers?.platform || "unknown",
  };
}

// 统一把时间转换成北京时间日期键，热力图以此作为日粒度主键。
function toChinaDateKey(dateInput = new Date()) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";

  const chinaDate = new Date(date.getTime() + CHINA_TIMEZONE_OFFSET_MS);
  const year = chinaDate.getUTCFullYear();
  const month = String(chinaDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(chinaDate.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 把 YYYY-MM-DD 解析成北京时间对应的 UTC 区间。
function parseDateKey(dateKey) {
  const safeDateKey = toSafeString(dateKey, 20);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(safeDateKey);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const startUtcMs =
// 根据前端请求的月份数，计算热力图查询范围。
    Date.UTC(year, month - 1, day, 0, 0, 0, 0) - CHINA_TIMEZONE_OFFSET_MS;

  if (!Number.isFinite(startUtcMs)) {
    return null;
  }

  const start = new Date(startUtcMs);
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const normalizedDateKey = toChinaDateKey(start);
  if (normalizedDateKey !== safeDateKey) {
    return null;
  }

  return {
    dateKey: normalizedDateKey,
    start,
    end: new Date(startUtcMs + ONE_DAY_MS),
  };
}

function getChinaDayRange(dateInput = new Date()) {
  return parseDateKey(toChinaDateKey(dateInput));
}

function clampInt(value, fallback = 12, min = 1, max = MAX_HEATMAP_MONTHS) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function getHeatmapRangeByMonths(months) {
  const safeMonths = clampInt(months, 12, 1, MAX_HEATMAP_MONTHS);

  const chinaToday = new Date(Date.now() + CHINA_TIMEZONE_OFFSET_MS);
  chinaToday.setUTCHours(0, 0, 0, 0);

  const endChina = new Date(chinaToday);
  const startChina = new Date(chinaToday);

  startChina.setUTCDate(1);
  startChina.setUTCMonth(startChina.getUTCMonth() - (safeMonths - 1));

  const start = new Date(startChina.getTime() - CHINA_TIMEZONE_OFFSET_MS);
  const end = new Date(
    endChina.getTime() - CHINA_TIMEZONE_OFFSET_MS + ONE_DAY_MS,
  );

  return {
    months: safeMonths,
    start,
    end,
    startDateKey: toChinaDateKey(start),
    endDateKey: toChinaDateKey(new Date(end.getTime() - 1)),
  };
}

// 生成热力图要显示的完整日期序列，缺失日期也要补零。
function buildDateKeyList(startDateKey, endDateKey) {
  const startRange = parseDateKey(startDateKey);
  const endRange = parseDateKey(endDateKey);

  if (!startRange || !endRange) return [];

  const result = [];
  for (
    let cursor = startRange.start.getTime();
    cursor <= endRange.start.getTime();
    cursor += ONE_DAY_MS
  ) {
    result.push(toChinaDateKey(new Date(cursor)));
  }

  return result;
}

// 把总分映射到 0-4 的颜色层级，供前端渲染热力色块。
function toHeatLevel(score, maxScore) {
  const safeScore = Math.max(0, toSafeNumber(score));
  const safeMaxScore = Math.max(0, toSafeNumber(maxScore));

  if (safeScore <= 0 || safeMaxScore <= 0) return 0;
  if (safeMaxScore <= 4) return Math.min(4, safeScore);

  const level = Math.ceil((safeScore / safeMaxScore) * 4);
  return Math.max(1, Math.min(4, level));
}

// 日聚合的统一摘要结构，便于热力图和详情页复用。
function getDailySummary(doc) {
  if (!doc) {
    return {
      totalScore: 0,
      eventCount: 0,
      actionEventCount: 0,
      manualEventCount: 0,
      apiRequestCount: 0,
      successRequestCount: 0,
      failRequestCount: 0,
    };
  }

  return {
    totalScore: toSafeNumber(doc.totalScore),
    eventCount: toSafeNumber(doc.eventCount),
    actionEventCount: toSafeNumber(doc.actionEventCount),
    manualEventCount: toSafeNumber(doc.manualEventCount),
    apiRequestCount: toSafeNumber(doc.apiRequestCount),
    successRequestCount: toSafeNumber(doc.successRequestCount),
    failRequestCount: toSafeNumber(doc.failRequestCount),
  };
}

// 计算连续活跃天数，用于前端展示当前连续和最长连续。
function computeHeatStreak(days) {
  let longest = 0;
  let current = 0;

  for (const day of days) {
    if (toSafeNumber(day.totalScore) > 0) {
      current += 1;
      if (current > longest) longest = current;
    } else {
      current = 0;
    }
  }

  let currentStreak = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (toSafeNumber(days[index].totalScore) > 0) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return {
    longestStreak: longest,
    currentStreak,
  };
}

// 按 key 统计 Top N，主要用于活动详情的事件分布展示。
function buildTopCounter(items, keyGetter, limit = 6) {
  const counterMap = new Map();

  for (const item of items) {
    const rawKey = keyGetter(item);
    const key = toSafeString(rawKey, 200) || "unknown";
    counterMap.set(key, (counterMap.get(key) || 0) + 1);
  }

  return [...counterMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, limit);
}

// 将一天内的热度增量写入聚合表，必要时自动创建记录。
async function upsertDailyActivity(uid, dateInput, increments = {}) {
  const objectUid = toObjectIdOrNull(uid);
  if (!objectUid) return null;

  const dayRange =
    typeof dateInput === "string"
      ? parseDateKey(dateInput)
      : getChinaDayRange(dateInput);
  if (!dayRange) return null;

  const safeIncrements = {};
  for (const [key, value] of Object.entries(increments)) {
    const numberValue = toSafeNumber(value);
    if (numberValue !== 0) {
      safeIncrements[key] = numberValue;
    }
  }

  if (Object.keys(safeIncrements).length === 0) {
    return null;
  }

  return UserActivityDailyModel.findOneAndUpdate(
    {
      uid: objectUid,
      activityDate: dayRange.dateKey,
    },
    {
      $inc: safeIncrements,
      $set: {
        activityDateAt: dayRange.start,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        uid: objectUid,
        activityDate: dayRange.dateKey,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
}

const ActivityService = {
  // 业务层推荐入口：只统计业务动作。
  async recordBusinessActivity(req, payload = {}) {
    try {
      const mergedMetadata = {
        ...(payload.metadata && typeof payload.metadata === "object"
          ? payload.metadata
          : {}),
        activitySource: "business",
      };

      return await this.addUserActivity(req, {
        ...payload,
        module: toSafeString(payload.module || "business", 50),
        metadata: mergedMetadata,
      });
    } catch (error) {
      console.error(
        "[ActivityService.recordBusinessActivity] 记录失败:",
        error,
      );
      return {
        success: false,
        message: "记录业务活动失败",
      };
    }
  },

  async addUserActivity(req, payload = {}) {
    const uid = req?.user?.uid || null;
    const objectUid = toObjectIdOrNull(uid);

    if (!objectUid) {
      return {
        success: false,
        message: "用户未登录",
      };
    }

    const { sourceClient, platform } = getClientContext(req);
    const eventName = toSafeString(
      payload.eventName || "BUSINESS_ACTIVITY",
      80,
    );
    const moduleName = toSafeString(payload.module || "business", 50);
    const score = Math.max(
      1,
      Math.min(20, Math.round(toSafeNumber(payload.score, 1))),
    );
    const activityAt = payload.clientTime
      ? new Date(payload.clientTime)
      : new Date();
    const safeActivityAt = Number.isNaN(activityAt.getTime())
      ? new Date()
      : activityAt;
    const safeMetadata = {
      ...(payload.metadata && typeof payload.metadata === "object"
        ? payload.metadata
        : {}),
      activitySource:
        payload?.metadata?.activitySource ||
        payload.activitySource ||
        "business",
    };

    await UserActivityEventModel.create({
      traceId: toSafeString(req.traceId, 80),
      uid: objectUid,
      sourceClient,
      platform,
      eventName,
      module: moduleName,
      bizId: toSafeString(payload.bizId || "", 120),
      score,
      metadata: sanitizePayload(safeMetadata),
      activityAt: safeActivityAt,
    });

    const dailyDoc = await upsertDailyActivity(objectUid, safeActivityAt, {
      totalScore: score,
      eventCount: 1,
      actionEventCount: 1,
      manualEventCount: 1,
    });

    return {
      success: true,
      date: toChinaDateKey(safeActivityAt),
      addedScore: score,
      summary: getDailySummary(dailyDoc),
    };
  },

  async getUserActivityHeatmap(req, query = {}) {
    const uid = req?.user?.uid || null;
    const objectUid = toObjectIdOrNull(uid);

    if (!objectUid) {
      return {
        startDate: "",
        endDate: "",
        months: 0,
        maxScore: 0,
        totalActiveDays: 0,
        streak: {
          currentStreak: 0,
          longestStreak: 0,
        },
        totals: getDailySummary(null),
        days: [],
      };
    }

    const range = getHeatmapRangeByMonths(query.months);
    const dateKeys = buildDateKeyList(range.startDateKey, range.endDateKey);

    const dailyDocs = await UserActivityDailyModel.find({
      uid: objectUid,
      activityDateAt: {
        $gte: range.start,
        $lt: range.end,
      },
    }).lean();

    const dayMap = new Map(dailyDocs.map((item) => [item.activityDate, item]));

    const baseDays = dateKeys.map((dateKey) => {
      const summary = getDailySummary(dayMap.get(dateKey));
      return {
        date: dateKey,
        ...summary,
      };
    });

    const maxScore = baseDays.reduce(
      (acc, item) => Math.max(acc, toSafeNumber(item.totalScore)),
      0,
    );

    const days = baseDays.map((item) => ({
      ...item,
      level: toHeatLevel(item.totalScore, maxScore),
    }));

    const totals = days.reduce(
      (acc, item) => ({
        totalScore: acc.totalScore + toSafeNumber(item.totalScore),
        eventCount: acc.eventCount + toSafeNumber(item.eventCount),
        actionEventCount:
          acc.actionEventCount + toSafeNumber(item.actionEventCount),
        manualEventCount:
          acc.manualEventCount + toSafeNumber(item.manualEventCount),
        apiRequestCount: 0,
        successRequestCount: 0,
        failRequestCount: 0,
      }),
      getDailySummary(null),
    );

    const totalActiveDays = days.filter((item) => item.totalScore > 0).length;

    return {
      startDate: range.startDateKey,
      endDate: range.endDateKey,
      months: range.months,
      maxScore,
      totalActiveDays,
      streak: computeHeatStreak(days),
      totals,
      days,
    };
  },

  async getUserActivityByDate(req, dateKey) {
    const uid = req?.user?.uid || null;
    const objectUid = toObjectIdOrNull(uid);

    if (!objectUid) {
      return {
        date: "",
        summary: getDailySummary(null),
        requestTotal: 0,
        actionTotal: 0,
        requestLogs: [],
        actionLogs: [],
        topRoutes: [],
        topEvents: [],
      };
    }

    const dayRange = parseDateKey(dateKey) || getChinaDayRange(new Date());
    const activityFilter = {
      uid: objectUid,
      activityAt: {
        $gte: dayRange.start,
        $lt: dayRange.end,
      },
    };

    const [dailyDoc, actionTotal, actionLogs] = await Promise.all([
      UserActivityDailyModel.findOne({
        uid: objectUid,
        activityDate: dayRange.dateKey,
      }).lean(),
      UserActivityEventModel.countDocuments(activityFilter),
      UserActivityEventModel.find(activityFilter)
        .sort({ activityAt: -1 })
        .limit(MAX_DAY_DETAIL_LIMIT)
        .lean(),
    ]);

    const actionItems = actionLogs.map((item) => ({
      traceId: toSafeString(item.traceId, 80),
      eventName: toSafeString(item.eventName, 80),
      module: toSafeString(item.module, 50),
      actionAt: item.activityAt,
      bizId: toSafeString(item.bizId, 120),
      score: toSafeNumber(item.score, 1),
    }));

    const fallbackSummary = {
      totalScore: actionItems.reduce(
        (sum, item) => sum + toSafeNumber(item.score),
        0,
      ),
      eventCount: actionTotal,
      actionEventCount: actionTotal,
      manualEventCount: actionTotal,
      apiRequestCount: 0,
      successRequestCount: 0,
      failRequestCount: 0,
    };

    return {
      date: dayRange.dateKey,
      summary: dailyDoc ? getDailySummary(dailyDoc) : fallbackSummary,
      requestTotal: 0,
      actionTotal,
      requestLogs: [],
      actionLogs: actionItems,
      topRoutes: [],
      topEvents: buildTopCounter(actionItems, (item) => item.eventName),
    };
  },
};

module.exports = ActivityService;
