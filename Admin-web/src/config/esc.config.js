const escconfig = {
  // 环境标识
  env: import.meta.env.VITE_APP_ENV || "development",
  // 服务器地址
  serverHost: import.meta.env.VITE_SERVER_HOST || "localhost",
  // 服务器端口(运行环境下的端口)
  serverPort: import.meta.env.VITE_SERVER_PORT || "3000",
  oss: {
    // 是否启用 OSS
    enabled: import.meta.env.VITE_OSS_ENABLED === "true",
    // OSS 访问域名，例如：https://your-bucket.oss-cn-hangzhou.aliyuncs.com
    domain: import.meta.env.VITE_OSS_DOMAIN || "",
    // OSS bucket 名称
    bucket: import.meta.env.VITE_OSS_BUCKET || "",
    // OSS 区域，例如：oss-cn-hangzhou
    region: import.meta.env.VITE_OSS_REGION || "",
  },
};
// 使用 ES6 标准导出语法
export default escconfig;
