const escconfig = {
  serverHost: "localhost", // 服务器地址
  serverPort: 3000,// 服务器端口
  tunnelUrl: "https://1142zt884zj05.vicp.fun", // 内网穿透地址
  useTunnel:false, // 是否使用内网穿透地址
  //#ifdef MP-WEIXIN
  useCloudContainer: true, // 是否启用微信云托管
  cloudEnv: "prod-4gx4oupb178049a1", // 云托管环境ID
  cloudService: "miaowtest" // 云托管服务名
  //#endif
  
};
// 使用 ES6 标准导出语法
export default escconfig;