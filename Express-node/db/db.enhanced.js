/**
 * 增强型数据库管理器
 * 支持多种环境配置和智能数据库连接
 */

const mongoose = require("mongoose");
require("dotenv").config();

const DB_PROVIDER_LABELS = {
  local: "本地MongoDB",
  cloud: "云数据库",
  "1panel": "1Panel MongoDB",
};

function getProviderDisplay(provider) {
  return `${provider} (${DB_PROVIDER_LABELS[provider] || provider})`;
}

function toConfigState(value) {
  return value ? "已设置" : "未设置";
}

// 导入配置文件
const localConfig = require("../config/db.config");
const panelConfig = require("../config/1panelmongo.config");

class DatabaseManager {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5秒
  }

  /**
   * 获取数据库连接字符串
   */
  getConnectionString() {
    const provider = process.env.MONGO_PROVIDER || "local";

    console.log(`🧭 数据库提供商: ${getProviderDisplay(provider)}`);

    switch (provider) {
      case "cloud":
        // 云数据库配置 - 支持云服务器MongoDB ，数据库为cloud如果没有MONGO_CLOUD_URI则使用cloud.mongo.config.js配置文件
        if (process.env.MONGO_CLOUD_URI) {
          console.log("🌩️ 配置来源: MONGO_CLOUD_URI");
          return process.env.MONGO_CLOUD_URI;
        }

        // 检查环境变量配置
        const cloudHost = process.env.MONGO_CLOUD_HOST;
        const cloudPort = process.env.MONGO_CLOUD_PORT || "27017";
        const cloudUsername = process.env.MONGO_CLOUD_USERNAME;
        const cloudPassword = process.env.MONGO_CLOUD_PASSWORD;
        const cloudDatabase =
          process.env.MONGO_CLOUD_DATABASE || "examinationsystem";
        const cloudAuthSource = process.env.MONGO_CLOUD_AUTH_SOURCE || "admin";

        if (!cloudHost || !cloudUsername || !cloudPassword) {
          console.error("❌ 云数据库环境变量缺失：");
          console.error(`   MONGO_CLOUD_HOST: ${toConfigState(cloudHost)}`);
          console.error(
            `   MONGO_CLOUD_USERNAME: ${toConfigState(cloudUsername)}`,
          );
          console.error(
            `   MONGO_CLOUD_PASSWORD: ${toConfigState(cloudPassword)}`,
          );

          // 尝试使用配置文件作为降级方案
          try {
            const cloudConfig = require("../config/cloud.mongo.config");
            const { username, password, host, port, databasename, authSource } =
              cloudConfig;

            if (!username || !password || !host) {
              throw new Error("云数据库配置文件参数也不完整");
            }

            console.log("⚠️ 配置来源: cloud.mongo.config.js (降级)");
            return `mongodb://${username}:${password}@${host}:${port || "27017"}/${databasename || "examinationsystem"}${authSource ? `?authSource=${authSource}` : "?authSource=admin"}`;
          } catch (configError) {
            throw new Error(`云数据库配置错误: ${configError.message}`);
          }
        }

        console.log("🌩️ 配置来源: 云环境变量");
        return `mongodb://${cloudUsername}:${cloudPassword}@${cloudHost}:${cloudPort}/${cloudDatabase}?authSource=${cloudAuthSource}`;

      case "1panel":
        // 1Panel部署环境 ,直接导入配置文件，不使用环境变量
        const {
          username: panelUser,
          password: panelPass,
          host: panelHost,
          sport,
          databasename: panelDb,
        } = panelConfig;
        if (!panelUser || !panelPass || !panelHost || !sport || !panelDb) {
          throw new Error("1Panel数据库配置参数不完整，请检查环境变量");
        }
        console.log("🔧 配置来源: 1Panel 配置文件");
        return `mongodb://${panelUser}:${panelPass}@${panelHost}:${sport}/${panelDb}?authSource=admin`;

      case "local":
      default:
        // 本地开发环境，使用本地配置文件，不使用环境变量
        const { DBHOST, DBPORT, DBNAME } = localConfig;
        console.log("🏠 配置来源: 本地配置文件");
        return `mongodb://${DBHOST}:${DBPORT}/${DBNAME}`;
    }
  }

  /**
   * 获取连接选项
   */
  getConnectionOptions() {
    const provider = process.env.MONGO_PROVIDER || "local";

    const baseOptions = {
      // 移除已弃用的选项: useNewUrlParser, useUnifiedTopology, bufferMaxEntries
      serverSelectionTimeoutMS: 30000, // 30秒
      socketTimeoutMS: 45000, // 45秒
      maxPoolSize: 10, // 连接池大小
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      bufferCommands: false, // 禁用缓冲，替代已弃用的bufferMaxEntries
    };

    if (provider === "1panel" || provider === "cloud") {
      return {
        ...baseOptions,
        authSource: "admin",
      };
    }

    return baseOptions;
  }

  /**
   * 连接数据库
   */
  async connect() {
    try {
      const provider = process.env.MONGO_PROVIDER || "local";
      const connectionString = this.getConnectionString();
      const options = this.getConnectionOptions();

      console.log("💾 正在建立数据库连接...");
      console.log(`   提供商: ${getProviderDisplay(provider)}`);

      this.connection = await mongoose.connect(connectionString, options);
      this.isConnected = true;
      this.retryCount = 0;

      console.log("✅ 数据库连接成功，连接已就绪");

      // 设置事件监听器
      this.setupEventListeners();

      return this.connection;
    } catch (error) {
      console.error("❌ 数据库连接失败:", error.message);

      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(
          `⏳ ${this.retryDelay / 1000}秒后进行第${this.retryCount}次重试...`,
        );

        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this.connect();
      } else {
        throw new Error(
          `数据库连接失败，已超过${this.maxRetries}次: ${error.message}`,
        );
      }
    }
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("✅ Mongoose 连接已建立");
      this.isConnected = true;
    });

    connection.on("error", (error) => {
      console.error("❌ Mongoose 连接错误:", error);
      this.isConnected = false;
    });

    connection.on("disconnected", () => {
      console.log("⚠️ Mongoose 连接已断开");
      this.isConnected = false;
    });

    // 优雅关闭处理
    process.on("SIGINT", async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * 断开数据库连接
   */
  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.isConnected = false;
        console.log("✅ 数据库连接已关闭");
      }
    } catch (error) {
      console.error("❌ 关闭数据库连接时出错:", error);
      throw error;
    }
  }

  /**
   * 检查数据库健康状态
   */
  isHealthy() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * 获取连接状态信息
   */
  getStatus() {
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      status: states[mongoose.connection.readyState] || "unknown",
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    };
  }
}

// 创建单例实例
const dbManager = new DatabaseManager();

// 兼容旧版本的调用方式
const legacyConnect = (success, error) => {
  dbManager
    .connect()
    .then(() => {
      if (success) success();
    })
    .catch((err) => {
      if (error) error(err);
      else throw err;
    });
};

module.exports = legacyConnect;
module.exports.dbManager = dbManager;
