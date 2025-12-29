const escconfig = {
  serverHost: import.meta.env.VITE_SERVER_HOST , // 服务器地址
  serverPort: Number(import.meta.env.VITE_SERVER_PORT) ,// 服务器端口
  tunnelUrl: import.meta.env.VITE_TUNNEL_URL, // 内网穿透地址
  useTunnel: import.meta.env.VITE_USE_TUNNEL === 'true', // 是否使用内网穿透地址
  ossDomain: import.meta.env.VITE_OSS_DOMAIN, // OSS地址
  //#ifdef MP-WEIXIN
    useCloudContainer: import.meta.env.VITE_USE_CLOUD_CONTAINER === 'true', // 是否启用微信云托管
    cloudEnv: import.meta.env.VITE_CLOUD_ENV , // 云托管环境ID
    cloudService: import.meta.env.VITE_CLOUD_SERVICE // 云托管服务名
  //#endif
};
// 使用 ES6 标准导出语法
export default escconfig;