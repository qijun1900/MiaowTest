// node/config/cloud.mongo.config.js
require('dotenv').config(); 

module.exports = {
    username: process.env.MONGO_CLOUD_USERNAME, // 云服务器MongoDB用户名
    password: process.env.MONGO_CLOUD_PASSWORD, // 云服务器MongoDB密码
    host: process.env.MONGO_CLOUD_HOST,         // 云服务器IP地址
    port: process.env.MONGO_CLOUD_PORT || '27017', // MongoDB端口
    databasename: process.env.MONGO_CLOUD_DATABASE || 'examinationsystem', // 数据库名称
    // 额外的云服务器配置
    authSource: process.env.MONGO_CLOUD_AUTH_SOURCE || 'admin', // 认证数据库名称
    ssl: process.env.MONGO_CLOUD_SSL === 'true' || false, // 是否启用SSL
}