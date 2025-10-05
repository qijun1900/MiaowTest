// node/config/cloud.mongo.config.js
require('dotenv').config(); 

module.exports = {
    username: process.env.MONGO_CLOUD_USERNAME, // �Ʒ�����MongoDB�û���
    password: process.env.MONGO_CLOUD_PASSWORD, // �Ʒ�����MongoDB����
    host: process.env.MONGO_CLOUD_HOST,         // �Ʒ�����IP��ַ
    port: process.env.MONGO_CLOUD_PORT || '27017', // MongoDB�˿�
    databasename: process.env.MONGO_CLOUD_DATABASE || 'examinationsystem', // ���ݿ�����
    // ������Ʒ���������
    authSource: process.env.MONGO_CLOUD_AUTH_SOURCE || 'admin', // ��֤���ݿ�����
    ssl: process.env.MONGO_CLOUD_SSL === 'true' || false, // �Ƿ�����SSL
}