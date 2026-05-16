const mongoose = require("mongoose");

const AppVersionSchema = new mongoose.Schema({
  versionCode: { type: Number, required: true },    // 整数版本号，如 150
  versionName: { type: String, required: true },     // 显示版本名，如 "1.5.0"
  platform: { type: String, enum: ["android", "ios", "all"], default: "android" },
  forceUpdate: { type: Boolean, default: false },    // true=强制更新
  changelog: { type: String, default: "" },          // 更新日志
  downloadUrl: { type: String, default: "" },        // 下载地址（OSS路径或完整URL）
  fileSize: { type: Number, default: 0 },            // 文件大小（字节）
  status: { type: Number, default: 1 },              // 0=禁用, 1=启用
  createTime: { type: Date, default: Date.now },
  editTime: { type: Date, default: Date.now },
});

// versionCode + platform 联合唯一索引
AppVersionSchema.index({ versionCode: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model("appversion", AppVersionSchema);
