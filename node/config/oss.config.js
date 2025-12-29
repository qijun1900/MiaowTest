// 阿里云 OSS 配置文件，从环境变量中读取配置
require('dotenv').config(); 
module.exports = {
    region: process.env.OSS_REGION || '', // OSS 区域
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || '', // 阿里云访问密钥 ID
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '', // 阿里云访问密钥 Secret
    bucket: process.env.OSS_BUCKET || '', // OSS 存储桶名称
    internal: process.env.OSS_INTERNAL === 'true', // 是否使用阿里云内部网络
    secure: process.env.OSS_SECURE === 'true', // 是否使用 HTTPS
    cdnDomain: process.env.OSS_CDN_DOMAIN || '', // CDN 域名（可选）
    prefix: process.env.OSS_PREFIX || '' // 文件存储前缀
};

