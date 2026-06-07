const mongoose = require("mongoose");
const ConsumerModel = require("../models/ConsumerModel");

// 用户外键迁移清单：每条 = { Model, fk }
// fk 是该 Model 上指向 consumer._id 的字段名
function loadOwnedDataModels() {
  return [
    { Model: require("../models/WrongBookModel"), fk: "Uid" },
    { Model: require("../models/WrongQuestionModel"), fk: "Uid" },
    { Model: require("../models/NotesBookModel"), fk: "Uid" },
    { Model: require("../models/QuestionNoteModel"), fk: "Uid" },
    { Model: require("../models/UserTodosModel"), fk: "Uid" },
    { Model: require("../models/UserQuestionModel"), fk: "Uid" },
    { Model: require("../models/ConsumerFeedbackModel"), fk: "uid" },
    { Model: require("../models/UserActionLogModel"), fk: "uid" },
    { Model: require("../models/UserActivityEventModel"), fk: "uid" },
    { Model: require("../models/UserActivityDailyModel"), fk: "uid" },
    { Model: require("../models/AgentConversationModel"), fk: "Uid" },
  ];
}

/**
 * 合并主账号上的"内嵌数组"字段（去重）
 * @param {Object} target target consumer doc
 * @param {Object} source source consumer doc
 */
function mergeEmbeddedArrays(target, source) {
  // 简单 ObjectId / 字符串数组：去重合并
  const idArrayFields = ["favoriteExams", "AuthRequiredExams"];
  for (const field of idArrayFields) {
    const src = source[field] || [];
    if (!src.length) continue;
    const merged = new Map();
    for (const item of [...(target[field] || []), ...src]) {
      merged.set(String(item), item);
    }
    target[field] = Array.from(merged.values());
  }

  // 含 _id 的对象数组：按 _id 去重合并
  const objArrayFields = ["questionbanks"];
  for (const field of objArrayFields) {
    const src = source[field] || [];
    if (!src.length) continue;
    const merged = new Map();
    for (const item of [...(target[field] || []), ...src]) {
      const key = item?._id ? String(item._id) : JSON.stringify(item);
      if (!merged.has(key)) merged.set(key, item);
    }
    target[field] = Array.from(merged.values());
  }

  // 含 questionId 的对象数组：按 questionId 去重合并
  const questionArrayFields = ["wrongQuestions", "favoriteQuestions"];
  for (const field of questionArrayFields) {
    const src = source[field] || [];
    if (!src.length) continue;
    const merged = new Map();
    for (const item of [...(target[field] || []), ...src]) {
      const key = item?.questionId
        ? String(item.questionId)
        : JSON.stringify(item);
      if (!merged.has(key)) merged.set(key, item);
    }
    target[field] = Array.from(merged.values());
  }
}

/**
 * 把 source 用户的所有"基础资料"补给 target（仅在 target 缺失时填充，不覆盖）
 */
function fillMissingProfile(target, source) {
  const fillable = ["nickname", "avatar", "openid", "session_key"];
  for (const field of fillable) {
    if (!target[field] && source[field]) {
      target[field] = source[field];
    }
  }
  if (!target.gender && source.gender) {
    target.gender = source.gender;
  }
  // username/email/password 属于身份字段，由调用方按业务语义自行决定，不在此自动覆盖
}

/**
 * 把 source 账号的所有数据合并到 target 账号，最后删除 source。
 * - target 账号 _id / userCount / JWT 不变
 * - target 缺失的 nickname/avatar/openid/session_key/gender 自动从 source 补齐
 * - 内嵌数组字段（收藏、错题等）按 id 去重合并
 * - 13 张外键表的所有记录改键到 target._id
 *
 * @param {string} sourceUid 数据来源账号 _id（合并后会被删除）
 * @param {string} targetUid 主账号 _id（保留）
 * @returns {Promise<{ migratedCounts: Record<string, number> }>}
 */
async function mergeUserData(sourceUid, targetUid) {
  if (!sourceUid || !targetUid) {
    throw new Error("mergeUserData: sourceUid 和 targetUid 都必须提供");
  }
  if (String(sourceUid) === String(targetUid)) {
    return { migratedCounts: {} };
  }

  const targetUser = await ConsumerModel.findById(targetUid);
  const sourceUser = await ConsumerModel.findById(sourceUid);

  if (!targetUser) throw new Error("目标账号不存在");
  if (!sourceUser) {
    // 没有来源账号，直接返回（幂等）
    return { migratedCounts: {} };
  }

  // 1. 迁移外键表
  const migratedCounts = {};
  const sourceObjId = new mongoose.Types.ObjectId(String(sourceUid));
  const targetObjId = new mongoose.Types.ObjectId(String(targetUid));

  for (const { Model, fk } of loadOwnedDataModels()) {
    try {
      // 兼容 fk 字段同时存储 ObjectId 与字符串两种历史写法
      const filter = {
        $or: [{ [fk]: sourceObjId }, { [fk]: String(sourceUid) }],
      };
      const result = await Model.updateMany(filter, {
        $set: { [fk]: targetObjId },
      });
      migratedCounts[Model.modelName] = result.modifiedCount || 0;
    } catch (err) {
      console.error(
        `[accountMerge] 迁移 ${Model.modelName} 失败:`,
        err.message,
      );
      migratedCounts[Model.modelName] = -1;
    }
  }

  // 2. 合并 ConsumerModel 自身的数组字段
  mergeEmbeddedArrays(targetUser, sourceUser);

  // 3. 补齐缺失的基础资料
  fillMissingProfile(targetUser, sourceUser);

  await targetUser.save();

  // 4. 删除来源账号
  await ConsumerModel.deleteOne({ _id: sourceUser._id });

  console.log(
    `[accountMerge] ${sourceUid} → ${targetUid} 完成`,
    migratedCounts,
  );

  return { migratedCounts };
}

module.exports = { mergeUserData };
