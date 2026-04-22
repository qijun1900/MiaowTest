const mongoose = require("mongoose");
const UserActivityEventModel = require("../../models/UserActivityEventModel");
const UserActivityDailyModel = require("../../models/UserActivityDailyModel");

/**
 * 用户活动服务（用户端）
 *
 * 职责说明：
 * 1. 写入业务活动明细（event 表）
 * 2. 维护按天聚合统计（daily 表）
 * 3. 提供热力图区间数据
 * 4. 提供按天活动详情
 *
 * 说明：
 * - 统一以北京时间（UTC+8）做“自然日”划分。
 * - 对入参进行边界收敛，避免脏数据导致写库失败或单条文档膨胀。
 */
const MAX_HEATMAP_MONTHS = 18;
const MAX_DAY_DETAIL_LIMIT = 80;
const CHINA_TIMEZONE_OFFSET_MS = 8 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 统一截断字符串，避免活动记录里塞入过长文本。
 * @param {*} value 任意输入值
 * @param {number} maxLength 最大长度
 * @returns {string} 安全字符串（永不返回 null/undefined）
 */
function toSafeString(value, maxLength = 120) {
  if (value === null || value === undefined) return "";
  return String(value).slice(0, maxLength);
}

/**
 * 将数值输入规范化，任何非法值都会回退到默认值。
 * @param {*} value 任意输入值
 * @param {number} fallback 非法值时的回退值
 * @returns {number}
 */
function toSafeNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

/**
 * 业务活动只接受合法 ObjectId，非法值直接忽略，避免写库报错。
 * @param {*} value 可能是字符串或 ObjectId
 * @returns {mongoose.Types.ObjectId|null}
 */
function toObjectIdOrNull(value) {
  if (!value) return null;
  if (mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }
  return null;
}

/**
 * 对 metadata 做有限深度裁剪，防止单条活动事件过大。
 *
 * 控制策略：
 * - 递归深度最多 3 层
 * - 数组最多保留 20 项
 * - 对象最多保留 50 个键
 * - 字符串最长 500 字符
 *
 * @param {*} payload 原始 metadata
 * @param {number} depth 当前递归深度
 * @returns {*} 裁剪后的 metadata
 */
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

/**
 * 从请求中抽取客户端来源信息，供活动详情展示和后续排查使用。
 * @param {object} req Express Request
 * @returns {{sourceClient: string, platform: string}}
 */
function getClientContext(req) {
  return {
    sourceClient:
      req?.clientInfo?.sourceClient ||
      req?.headers?.["source-client"] ||
      "unknown",
    platform: req?.clientInfo?.platform || req?.headers?.platform || "unknown",
  };
}

/**
 * 统一把时间转换成北京时间日期键，热力图以此作为日粒度主键。
 * @param {Date|string|number} dateInput 可被 Date 解析的输入
 * @returns {string} YYYY-MM-DD，非法输入返回空串
 */
function toChinaDateKey(dateInput = new Date()) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";

  const chinaDate = new Date(date.getTime() + CHINA_TIMEZONE_OFFSET_MS);
  const year = chinaDate.getUTCFullYear();
  const month = String(chinaDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(chinaDate.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 把 YYYY-MM-DD 解析成“北京时间当天”对应的 UTC 区间。
 *
 * 例如：
 * - 输入 2026-04-22（北京时间）
 * - 输出 start/end 为 UTC 时间，满足 [start, end) 正好覆盖该自然日
 *
 * @param {string} dateKey YYYY-MM-DD
 * @returns {{dateKey: string, start: Date, end: Date}|null}
 */
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

  // 将北京时间 00:00:00 转换为 UTC 起点时间戳。
  const startUtcMs =
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

/**
 * 把任意值收敛为整型区间，常用于请求参数防御。
 * @param {*} value 原始输入
 * @param {number} fallback 默认值
 * @param {number} min 下限
 * @param {number} max 上限
 * @returns {number}
 */
function clampInt(value, fallback = 12, min = 1, max = MAX_HEATMAP_MONTHS) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

/**
 * 根据前端请求的月份数，计算热力图查询范围。
 *
 * 规则：
 * - 结束日期为“北京时间今天”
 * - 起始日期为“往前 N 个月的当月 1 号”
 * - 对外暴露 dateKey，同时提供 UTC start/end 供 Mongo 查询
 *
 * @param {*} months 前端传入月份窗口
 * @returns {{months:number,start:Date,end:Date,startDateKey:string,endDateKey:string}}
 */
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

/**
 * 生成热力图要显示的完整日期序列，缺失日期也要补零。
 * @param {string} startDateKey 起始日期 YYYY-MM-DD
 * @param {string} endDateKey 结束日期 YYYY-MM-DD
 * @returns {string[]} 完整日期键列表（闭区间）
 */
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

/**
 * 把总分映射到 0-4 的颜色层级，供前端渲染热力色块。
 * @param {number} score 当天分数
 * @param {number} maxScore 当前窗口内最大分数
 * @returns {number} 0-4 级别
 */
function toHeatLevel(score, maxScore) {
  const safeScore = Math.max(0, toSafeNumber(score));
  const safeMaxScore = Math.max(0, toSafeNumber(maxScore));

  if (safeScore <= 0 || safeMaxScore <= 0) return 0;
  if (safeMaxScore <= 4) return Math.min(4, safeScore);

  const level = Math.ceil((safeScore / safeMaxScore) * 4);
  return Math.max(1, Math.min(4, level));
}

/**
 * 日聚合的统一摘要结构，便于热力图和详情页复用。
 * @param {object|null} doc daily 聚合文档
 * @returns {{
 *   totalScore:number,
 *   eventCount:number,
 *   actionEventCount:number,
 *   manualEventCount:number,
 *   apiRequestCount:number,
 *   successRequestCount:number,
 *   failRequestCount:number
 * }}
 */
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

/**
 * 计算连续活跃天数，用于前端展示当前连续和最长连续。
 * - longestStreak：区间内任意位置最长连续活跃
 * - currentStreak：从区间末尾向前的连续活跃
 * @param {Array<{totalScore:number}>} days
 * @returns {{longestStreak:number,currentStreak:number}}
 */
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

/**
 * 按 key 统计 Top N，主要用于活动详情的事件分布展示。
 * @param {Array<any>} items 原始数据
 * @param {(item:any)=>string} keyGetter 键提取函数
 * @param {number} limit 返回条数
 * @returns {Array<{name:string,count:number}>}
 */
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

/**
 * 将一天内的热度增量写入聚合表，必要时自动创建记录。
 *
 * 设计目的：
 * - 写明细后立刻增量更新日聚合，避免热力图查询时做大范围聚合计算
 * - 使用 upsert 保证“当天首条事件”也能自动建档
 *
 * @param {string|mongoose.Types.ObjectId} uid 用户 id
 * @param {Date|string} dateInput 日期或日期键
 * @param {Record<string, number>} increments 需要累加的字段
 * @returns {Promise<object|null>} 更新后的 daily 文档
 */
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
  /**
   * 业务层推荐入口：只统计业务动作。
   *
   * 约定：
   * - 强制 activitySource=business
   * - module 默认为 business
   * - 实际写入委托给 addUserActivity，保持单一入库路径
   */
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

  /**
   * 写入一条用户活动明细，并同步更新日聚合。
   * @param {object} req Express Request，要求挂载 req.user.uid
   * @param {object} payload 活动负载
   * @returns {Promise<{success:boolean,message?:string,date?:string,addedScore?:number,summary?:object}>}
   */
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

    // 先写明细，保证活动可回溯。
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

    // 再增量更新当日聚合，供热力图和详情页快速读取。
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

  /**
   * 查询用户热力图数据。
   *
   * 返回结构特点：
   * - days 是完整日期序列（即便某天无活动也会补零）
   * - level 已经在后端计算好，前端可直接映射颜色
   * - totals / streak 为区间聚合结果
   */
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

    // 只查询区间内已有聚合记录，缺失日期后续通过 dateKeys 补齐。
    const dailyDocs = await UserActivityDailyModel.find({
      uid: objectUid,
      activityDateAt: {
        $gte: range.start,
        $lt: range.end,
      },
    }).lean();

    const dayMap = new Map(dailyDocs.map((item) => [item.activityDate, item]));

    // 构建完整日期序列，保证热力图连续渲染。
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

    // 输出区间总览指标，供卡片统计区展示。
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

  /**
   * 按日期查询用户活动详情。
   *
   * 查询策略：
   * - 并发拉取：daily 聚合、总数、活动明细
   * - 如果 daily 缺失，使用明细实时兜底汇总
   *
   * @param {object} req Express Request
   * @param {string} dateKey YYYY-MM-DD
   * @returns {Promise<object>}
   */
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

    // 三路并发，降低接口响应时延。
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

    // 对外输出前再次做字段收敛，避免脏数据直接透传给前端。
    const actionItems = actionLogs.map((item) => ({
      traceId: toSafeString(item.traceId, 80),
      eventName: toSafeString(item.eventName, 80),
      module: toSafeString(item.module, 50),
      actionAt: item.activityAt,
      bizId: toSafeString(item.bizId, 120),
      score: toSafeNumber(item.score, 1),
    }));

    // 聚合表缺失时的兜底摘要：基于当天明细即时计算。
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
