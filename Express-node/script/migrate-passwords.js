/**
 * @file migrate-passwords.js
 * @description 一次性迁移脚本：将数据库中所有明文密码哈希加密
 * @script node script/migrate-passwords.js
 *
 * @example 执行输出：
 * 🚀 开始密码迁移...
 * 🔍 数据库提供商: local
 * 🏠 使用本地数据库配置
 * 💾 正在连接数据库... (提供商: local)
 * ✅ 数据库连接成功
 * 📋 共找到 3 个用户需要迁移
 * ✅ [1/3] 用户 admin 密码迁移成功
 * ✅ [2/3] 用户 editor1 密码迁移成功
 * ✅ [3/3] 用户 editor2 密码迁移成功
 * 🎉 密码迁移完成！成功: 3，跳过: 0，失败: 0
 */

const dbManager = require("../db/db.enhanced").dbManager;
const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");

// bcrypt 盐值轮数，与业务代码保持一致
const SALT_ROUNDS = 10;

/**
 * 判断一个字符串是否已经是 bcrypt 哈希值
 * bcrypt 哈希值固定以 $2a$、$2b$ 或 $2y$ 开头，长度为 60 字符
 */
function isBcryptHash(str) {
  if (!str || typeof str !== "string") return false;
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(str);
}

/**
 * 迁移所有用户的明文密码为 bcrypt 哈希
 */
async function migratePasswords() {
  console.log("🚀 开始密码迁移...");

  // 连接数据库
  await dbManager.connect();

  // 查询所有用户
  const users = await UserModel.find({}, ["_id", "username", "password"]);

  if (users.length === 0) {
    console.log("📭 数据库中没有用户，无需迁移");
    return;
  }

  // 过滤出需要迁移的用户（密码不是 bcrypt 哈希的）
  const toMigrate = users.filter((u) => !isBcryptHash(u.password));
  const alreadyHashed = users.length - toMigrate.length;

  console.log(`📋 共找到 ${users.length} 个用户`);
  if (alreadyHashed > 0) {
    console.log(`⏭️  其中 ${alreadyHashed} 个用户密码已是哈希格式，跳过`);
  }
  if (toMigrate.length === 0) {
    console.log("✅ 所有用户密码均已加密，无需迁移");
    return;
  }
  console.log(`🔐 需要迁移的用户数: ${toMigrate.length}`);

  let successCount = 0;
  let skipCount = alreadyHashed;
  let failCount = 0;

  for (let i = 0; i < toMigrate.length; i++) {
    const user = toMigrate[i];
    const index = i + 1;

    try {
      if (!user.password) {
        // 密码为空，设置一个随机密码并提示管理员
        const randomPassword = Math.random().toString(36).slice(-10);
        const hashed = await bcrypt.hash(randomPassword, SALT_ROUNDS);
        await UserModel.updateOne({ _id: user._id }, { password: hashed });
        console.warn(
          `⚠️  [${index}/${toMigrate.length}] 用户 "${user.username}" 原密码为空，已设置随机密码: ${randomPassword}（请通知用户修改）`,
        );
        successCount++;
        continue;
      }

      const hashed = await bcrypt.hash(user.password, SALT_ROUNDS);
      await UserModel.updateOne({ _id: user._id }, { password: hashed });
      console.log(
        `✅ [${index}/${toMigrate.length}] 用户 "${user.username}" 密码迁移成功`,
      );
      successCount++;
    } catch (err) {
      console.error(
        `❌ [${index}/${toMigrate.length}] 用户 "${user.username}" 迁移失败:`,
        err.message,
      );
      failCount++;
    }
  }

  console.log("");
  console.log(
    `🎉 密码迁移完成！成功: ${successCount}，跳过: ${skipCount}，失败: ${failCount}`,
  );

  if (failCount > 0) {
    console.warn("⚠️  存在迁移失败的用户，请检查日志后手动处理");
  }
}

// 执行迁移
migratePasswords()
  .then(() => {
    console.log("🎯 脚本执行完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 脚本执行失败:", error);
    process.exit(1);
  });
