const escconfig = {
  serverHost: "localhost", // 服务器地址
  serverPort: 3000,// 服务器端口(运行环境下的端口)
  oss: {
    enabled: true, // 是否启用 OSS
    domain: "https://miaowtest-test.oss-cn-beijing.aliyuncs.com", // OSS 访问域名，例如：https://your-bucket.oss-cn-hangzhou.aliyuncs.com
    bucket: "miaowtest-test", // OSS bucket 名称
    region: "oss-cn-beijing", // OSS 区域，例如：oss-cn-hangzhou
  }
};
// 使用 ES6 标准导出语法
export default escconfig;