/**
 * @file init-database.js
 * @description 初始化数据库，包括创建必要的集合和初始数据
 * @script node script/init-database.js
 * @example
🚀 开始初始化数据库...
🔍 数据库提供商: local
🏠 使用本地数据库配置
💾 正在连接数据库... (提供商: local)
✅ 数据库连接成功
✅ 数据库连接成功
✅ 管理员账户创建成功:
   用户名: admin
   密码: admin123
   角色: 管理员
🎉 数据库初始化完成!
🎯 脚本执行完成
 */
const dbManager = require("../db/db.enhanced").dbManager; // 数据库连接管理
const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");

// 管理员账户信息
const ADMIN_DEFAULT_PASSWORD = "admin123"; // 建议首次登录后立即修改密码

const buildAdminUser = async () => {
  const hashedPassword = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, 10);
  return {
    username: "admin",
    password: hashedPassword,
    role: 1, // 1表示管理员角色
    gender: 0, // 0表示保密
    introduction: "系统初始管理员",
    avatar: "", // 可选，默认无头像
    state: 1, // 1表示正常状态
    createTime: new Date(),
  };
};

/**
 * 初始化数据库
 */
async function initDatabase() {
  try {
    console.log("🚀 开始初始化数据库...");

    // 连接数据库
    await dbManager.connect();
    console.log("✅ 数据库连接成功");

    // 检查并创建管理员账户
    await createAdminUser();

    console.log("🎉 数据库初始化完成!");
  } catch (error) {
    console.error("❌ 数据库初始化失败:", error.message);
    throw error;
  }
}

/**
 * 创建管理员账户
 */
async function createAdminUser() {
  try {
    // 检查是否已存在管理员账户
    const existingAdmin = await UserModel.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("⚠️ 管理员账户已存在，跳过创建");
      return;
    }

    // 构建并加密管理员信息
    const adminUser = await buildAdminUser();

    // 创建新管理员
    const newAdmin = await UserModel.create(adminUser);
    console.log("✅ 管理员账户创建成功:");
    console.log(`   用户名: ${newAdmin.username}`);
    console.log(
      `   密码: ${ADMIN_DEFAULT_PASSWORD}  （密码已加密存储，请登录后尽快修改）`,
    );
    console.log(`   角色: ${newAdmin.role === 1 ? "管理员" : "其他"}`);
  } catch (error) {
    console.error("❌ 创建管理员账户失败:", error.message);
    throw error;
  }
}

// 如果直接运行此脚本，则执行初始化
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log("🎯 脚本执行完成");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 脚本执行失败:", error);
      process.exit(1);
    });
}

module.exports = {
  initDatabase,
  createAdminUser,
};
